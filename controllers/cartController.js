const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Offer = require("../models/offerModel");
const ProductOffer = require("../models/productOfferModel");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");
const mongo = require("mongodb");

const loadCart = async (req,res,next) => {
  try {
    const id = req.session.user_id;
    const userName = await User.findOne({ _id: req.session.user_id });
    const cartData = await Cart.findOne({
      userName: req.session.user_id,
    }).populate("products.productId");
    const categoryOffer = await Offer.find({status:'Active'}).populate('category');
    const productOffer = await ProductOffer.find({status:'Active'}); 
    const category = await Category.find({status:true});

    if (req.session.user_id) {
      if (cartData) {

        if (cartData.products.length > 0) {
          const products = cartData.products;

          let totalPriceUpdate = 0;
          for(const item of products){

            const productId = item.productId._id;
            const proData = await Product.findOne({_id:productId});
            const quantity = item.count;

            const proOfferMatch = productOffer.find((x) => x.productName.equals(productId));
            const offerMatch = categoryOffer.find((x) => x.category._id.equals(proData.category));

            if(proOfferMatch && offerMatch){
              const offerPrice = proData.price - ((proData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage))/100);
              totalPriceUpdate += quantity * offerPrice;
            }else if(proOfferMatch && !offerMatch){
              const offerPrice = proData.price - ((proData.price * proOfferMatch.discountPercentage)/100);
              totalPriceUpdate += quantity * offerPrice;
            }else if(offerMatch && !proOfferMatch){
              const offerPrice = proData.price - ((proData.price * offerMatch.discountPercentage )/100);
              totalPriceUpdate += quantity * offerPrice;
            }else{
              totalPriceUpdate += quantity * proData.price;
            }
          }

          const total = await Cart.aggregate([
            { $match: { user: userName.name } },
            { $unwind: "$products" },
            {
              $project: {
                productPrice: "$products.productPrice",
                cou: "$products.count",
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: { $multiply: ["$productPrice", "$cou"] } },
              },
            },
          ]);
          const Total = total[0].total;
          const userId = userName._id;
          let customer = true;
          res.render("cart", { customer, userName, products, Total, userId ,category, categoryOffer, productOffer, totalPriceUpdate});
        } else {
          let customer = true;
          res.render("cartEmpty", {
            customer,
            userName,
            message: "No products added to cart",
          });
        }
      } else {
        let customer = true;
        res.render("cartEmpty", {
          customer,
          userName,
          message: "No products added to cart",
        });
      }
    } else {
      res.redirect("/signin");
    }
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req,res,next) => {
  try {
    const productId = req.body.query;
    const userData = await User.findOne({ _id: req.session.user_id });
    const productData = await Product.findOne({ _id: productId });
    if (req.session.user_id) {
      const userid = req.session.user_id;
      const cartData = await Cart.findOne({ userName: userid });
      if (cartData) {
        const productExist = await cartData.products.findIndex(
          (product) => product.productId == productId
        );
        if (productExist != -1) {
          await Cart.updateOne(
            { userName: userid, "products.productId": productId },
            { $inc: { "products.$.count": 1 } }
          );
          res.json({ success: true });
        } else {
          await Cart.findOneAndUpdate(
            { userName: req.session.user_id },
            {
              $push: {
                products: {
                  productId: productId,
                  productPrice: productData.price,
                },
              },
            }
          );
          res.json({ success: true });
        }
      } else {
        const cart = new Cart({
          userName: userData._id,
          user: userData.name,
          products: [
            {
              productId: productId,
              productPrice: productData.price,
            },
          ],
        });

        const cartData = await cart.save();
        if (cartData) {
          res.json({ success: true });
        } else {
          res.redirect("/home");
        }
      }
    } else {
      console.log("failed");
      // res.redirect('/signin');
      res.json({ success: false });
    }
  } catch (error) {
    next(error);
  }
};

const changeProductCount = async (req,res,next) => {
  try {
    const { userId, proId } = req.body;
    let count = req.body.count;
    count = parseInt(count);
    const cartData = await Cart.findOne(
      { userName: userId },
      { products: { $elemMatch: { productId: proId } } }
    );
    const [{ count: quantity }] = cartData.products;
    const productData = await Product.findOne({ _id: proId });
    if (productData.stockQuantity < quantity + count) {
      res.json({ check: true });
    } else {
      res.json({ success: true });
      await Cart.updateOne(
        { userName: userId, "products.productId": proId },
        { $inc: { "products.$.count": count } }
      );
      const countCart = await Cart.findOne(
        { userName: userId },
        { products: { $elemMatch: { productId: proId } } }
      );
      const [{ count: count0 }] = countCart.products;
      if (count0 === 0) {
        const user = req.session.user_id;
        await Cart.updateOne(
          { userName: user },
          { $pull: { products: { productId: proId } } }
        );
      }
    }
  } catch (error) {
    next(error);
  }
};

const removeProduct = async (req,res,next) => {
  try {
    const user = req.session.user_id;
    const id = req.query.id;
    await Cart.updateOne(
      { userName: user },
      { $pull: { products: { productId: id } } }
    );
    res.redirect("/cart");
  } catch (error) {
    next(error);
  }
};

const loadCheckout = async (req,res,next) => {
  try {
    const userName = await User.findOne({ _id: req.session.user_id });
    const addressData = await Address.findOne({ userId: req.session.user_id });
    const cartData = await Cart.findOne({
      userName: req.session.user_id,
    }).populate("products.productId");
    const categoryOffer = await Offer.find({status:'Active'}).populate('category');
    const productOffer = await ProductOffer.find({status:'Active'}); 
    const category = await Category.find({status:true});

    if (req.session.user_id) {
      if (addressData) {
        if (addressData.addresses.length > 0) {
          const address = addressData.addresses;


          const products = cartData.products;

          let totalPriceUpdate = 0;
          for(const item of products){
            const productId = item.productId._id;
            const proData = await Product.findOne({_id:productId});
            const quantity = item.count;
            const proOfferMatch = productOffer.find((x) => x.productName.equals(productId));
            const offerMatch = categoryOffer.find((x) => x.category._id.equals(proData.category));
            if(proOfferMatch && offerMatch){
              const offerPrice = proData.price - ((proData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage))/100);
              totalPriceUpdate += quantity * offerPrice;
            }else if(proOfferMatch && !offerMatch){
              const offerPrice = proData.price - ((proData.price * proOfferMatch.discountPercentage)/100);
              totalPriceUpdate += quantity * offerPrice;
            }else if(offerMatch && !proOfferMatch){
              const offerPrice = proData.price - ((proData.price * offerMatch.discountPercentage )/100);
              totalPriceUpdate += quantity * offerPrice;
            }else{
              totalPriceUpdate += quantity * proData.price;
            }
          }
          const total = await Cart.aggregate([
            { $match: { user: userName.name } },
            { $unwind: "$products" },
            {
              $project: {
                productPrice: "$products.productPrice",
                count: "$products.count",
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: { $multiply: ["$productPrice", "$count"] } },
              },
            },
          ]);
          if (total[0].total >= userName.wallet) {
            const Total = total[0].total;
            const grandTotal = total[0].total - userName.wallet;
            let customer = true;
            res.render("checkoutPage", {
              customer,
              userName,
              address,
              Total,
              grandTotal,
              totalPriceUpdate,
            });
          } else {
            const Total = total[0].total;
            const grandTotal = 1;
            let customer = true;
            res.render("checkoutPage", {
              customer,
              userName,
              address,
              Total,
              grandTotal,
              totalPriceUpdate,
            });
          }
        } else {
          let customer = true;
          res.render("emptyCheckoutPage", {
            customer,
            userName,
            message: "Add your delivery address",
          });
        }
      } else {
        let customer = true;
        res.render("emptyCheckoutPage", {
          customer,
          userName,
          message: "Add your delivery address",
        });
      }
    } else {
      res.redirect("/signin");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loadCart,
  addToCart,
  changeProductCount,
  removeProduct,
  loadCheckout,
};
