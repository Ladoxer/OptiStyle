const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const ProductOffer = require('../models/productOfferModel');
const Offer = require('../models/offerModel');
const { render } = require('../routes/userRoute');

const loadProductList = async(req,res,next)=>{
  try {
    if(req.session.admin_id){
      const url = req.url;
      const productData = await Product.find({}).populate('category');
      res.render('productList',{products:productData,url});
    }else{
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const loadAddProduct = async(req,res,next)=>{
  try {
    if(req.session.admin_id){
      const categoryData = await Category.find({ status: true });
      res.render('addProduct',{category:categoryData});
    }else{
      res.redirect('/admin');
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const addProduct = async(req,res,next)=>{
  try {
    const image = [];
    for(let i=0;i<req.files.length;i++){
      image[i] = req.files[i].filename;
    }
    const product = new Product({
      productName:req.body.productName,
      price:req.body.price,
      image:image,
      category:req.body.category,
      stockQuantity:req.body.stockQuantity,
      status:req.body.status,
      description:req.body.description
    });
    const categoryData = await Category.find({});
    const productData = await product.save();
    if(productData){
      res.render('addProduct',{category:categoryData,message:"Product added successfully"});
    }else{
      res.render('addProduct',{category:categoryData,message:"Failed adding product"});
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const editProduct = async(req,res,next)=>{
  try {
    if(req.session.admin_id){
      const productData = await Product.findById({_id:req.query.id}).populate('category');
      const catData = await Category.find({ status:true });
      if(productData){
        res.render('editProduct',{productData:productData,category:catData});
      }else{
        res.redirect('/admin/dashboard');
      }
    }else{
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const removeImg = async(req,res,next)=>{
  try {
    const {id,pos} = req.body;
    const delImg = await Product.findById({_id:id});
    console.log(delImg);
    const image = delImg.image[pos];
    const updateImage = await Product.findByIdAndUpdate({_id:id},{$pullAll:{image:[image]}});
    if(updateImage){
      res.json({success:true});
    }else{
      res.redirect('/admin/dashboard');
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const updateProduct = async(req,res,next)=>{
  try {
    if(req.session.admin_id){
      const productData = await Product.findOne({_id:req.query.id});
      if(req.body.productName.trim().length === 0 || req.body.price.trim().length === 0 || req.body.stockQuantity.trim() === 0){
        res.render('editProduct',{message:"Enter valid Text",productData:productData});
      }else{
        const productData = await Product.findByIdAndUpdate({_id:req.query.id},{$set:{productName:req.body.productName,price:req.body.price,category:req.body.category,stockQuantity:req.body.stockQuantity,status:req.body.status,description:req.body.description}});
        for(let i=0;i<req.files.length;i++){
          const imageUpdate = await Product.findByIdAndUpdate({_id:req.query.id},{$push:{image:req.files[i].filename}});
        }
        if(productData || imageUpdate){
          res.redirect('/admin/productList');
        }else{
          res.render('editProduct',{message:"Product edit failed"});
        }
      }
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const loadShowProduct = async(req,res,next)=>{
  try {
    const userName = await User.findOne({_id:req.session.user_id});
    const category = await Category.find();
    const productData = await Product.findOne({_id:req.query.id}).populate('category');
    const productOffer = await ProductOffer.find({ status: 'Active'});
    const categoryOffer = await Offer.find({status:'Active'}).populate('category');

    if(req.session.user_id){
      let customer = true;
      res.render('product-detail',{customer,userName,product:productData,category,productOffer,categoryOffer});
    }else{
      let customer = false;
      res.render('product-detail',{customer,product:productData,category,productOffer,categoryOffer});
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const unblockProduct = async(req,res,next)=>{
  try {
    const proId = req.query.id;
    const updateProduct = await Product.findByIdAndUpdate({_id:proId},{$set:{list:true}});
    const productData = await Product.find({});
    if(updateProduct){
      res.render('productList',{products:productData,message:"Product listed"});
    }else{
      res.render('productList',{products:productData,message:"Product Listing Failed"});
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const blockProduct = async(req,res,next)=>{
  try {
    const proId = req.query.id;
    const updateProduct = await Product.findByIdAndUpdate({_id:proId},{$set:{list:false}});
    const productData = await Product.find({});
    if(updateProduct){
      res.render('productList',{products:productData,message:"Product unlisted"});
    }else{
      res.render('productList',{products:productData,message:"Product Unlisting Failed"});
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

module.exports = {
  loadProductList,
  loadAddProduct,
  addProduct,
  editProduct,
  removeImg,
  updateProduct,
  loadShowProduct,
  unblockProduct,
  blockProduct,
}