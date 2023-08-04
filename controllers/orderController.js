const Order = require('../models/orderModel');
const Address = require('../models/addressModel');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Razorpay = require('razorpay');
const dotenv = require('dotenv');
dotenv.config();

var instance = new Razorpay({
  key_id:'rzp_test_NOvxLkFB5JGvn6',
  key_secret:process.env.RAZORKEY
})



const placeOrder = async(req,res,next)=>{
  try {
    const userName = await User.findOne({_id:req.session.user_id});
    const cartData = await Cart.findOne({userName:req.session.user_id});
    const {address,payment,amount,total} = req.body;
    const paymentMethod = payment;
    const products = cartData.products;
    const Total = parseInt(amount);
    const totalPrice = parseInt(total);
    const discount = parseInt(req.body.discount);
    const wallet = totalPrice - (Total - discount);
    const status = paymentMethod === "COD" ? "placed" : "pending";
    const order = new Order({
      deliveryAddress:address,
      userId:req.session.user_id,
      userName:userName.name,
      paymentMethod,
      products,
      totalAmount:Total,
      Amount:totalPrice,
      date:new Date(),
      status,
      orderWallet:wallet
    });
    const orderData = await order.save();
    const date = orderData.date.toISOString().substring(5,7);
    const orderId = orderData._id;
    if(orderData){
      for(let i=0;i<products.length;i++){
        const pro = products[i].productId;
        const count = products[i].count;
        await Product.findByIdAndUpdate({_id:pro},{$inc:{stockQuantity: -count}});
      }
      if(order.status === "placed"){
        const wal = totalPrice - Total;
        await Order.updateOne({_id:orderId},{$set:{month:date}});
        await User.updateOne({_id:req.session.user_id},{$inc:{wallet:-wal}});
        await Cart.deleteOne({userName:req.session.user_id});
        res.json({codSuccess:true});
      }else{
        const orderId = orderData._id;
        await Order.updateOne({_id:orderId},{$set:{month:date}});
        const totalAmount = orderData.totalAmount;
        var options = {
          amount: totalAmount*100,
          currency: "INR",
          receipt: ""+orderId
        }

        instance.orders.create(options,function(err,order){
          res.json({order});
        })
      }
    }else{
      res.redirect('/checkout');
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const orderSuccess = async(req,res,next)=>{
  try {
    const userName = await User.findOne({_id:req.session.user_id});
    if(req.session.user_id){
      let customer = true;
      res.render('ordersuccess',{userName,customer});
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const showOrder = async(req,res,next)=>{
  try {
    const userName = await User.findOne({_id:req.session.user_id});
    const orderData = await Order.find({userId:req.session.user_id}).populate("products.productId","deliveryAddress");
    // console.log(orderData);
    if(req.session.user_id){
      const customer = true;
      res.render('showOrder',{userName,customer,orderData:orderData});
    }else{
      res.redirect('/');
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const cancelOrder = async(req,res,next)=>{
  try {
    const user = req.session.user_id;
    const orderId = req.body.orderId;
    const orderData = await Order.findOne({_id:orderId});
    const userData = await User.findOne({_id:user});
    const userWallet = userData.wallet;
    if(orderData.status == "placed" || orderData.status == "Delivered"){
      if(orderData.paymentMethod == "onlinePayment"){
        const totalWallet = orderData.Amount+userWallet;
        await User.updateOne({_id:req.session.user_id},{$set:{wallet:totalWallet}});
        await Order.findByIdAndUpdate({_id:orderId},{$set:{status:"Cancelled"}});
        res.json({success:true});
        // online payment?
      }else{
        const totalWallet = userWallet+orderData.orderWallet;
        await Order.findByIdAndUpdate({_id:orderId},{$set:{status:"Cancelled"}});
        await User.updateOne({_id:user},{$set:{wallet:totalWallet}});
        res.json({success:true});
      }
    }else{
      await Order.findByIdAndUpdate({_id:orderId},{$set:{status:"Cancelled"}});
      res.json({success:true});
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const viewOrderProducts = async(req,res,next)=>{
  try {
    const userName = await User.findOne({_id:req.session.user_id});
    const orderId = await Order.findOne({_id:req.query.id}).populate("products.productId");
    const products = orderId.products;
    if(req.session.user_id){
      const customer = true;
      if(products.length>0){
        res.render('viewOrderProducts',{userName,customer,products,orderId});
      }else{
        res.render('viewOrderProducts',{userName,customer,products,orderId,message:"Order Cancelled... No more Order here"});
      }
    }else{
      res.redirect('/signin');
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const adminShowOrder = async(req,res,next)=>{
  try {
    const url = req.url;
    const orderData = await Order.find({});
    res.render('listOrder',{orderData,url});
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const viewProduct = async(req,res,next)=>{
  try {
    const orderId = req.query.id;
    const orderData = await Order.findOne({_id:orderId}).populate("products.productId");
    const productData = orderData.products;
    res.render('viewOrderProduct',{productData});
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const editOrder = async(req,res,next)=>{
  try {
    const orderId = req.query.id;
    const orderData = await Order.findOne({_id:orderId});
    res.render('editOrder',{orderData});
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const postEditOrder = async(req,res,next)=>{
  try {
    const update = await Order.updateOne({_id:req.query.id},{$set:{status:req.body.status}});
    if(update){
      res.redirect('/admin/orders');
    }else{
      res.render('editOrder',{message:"Status not updated"});
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const verifyPayment = async(req,res,next)=>{
  try {
    const totalPrice = req.body.amount2;
    const total = req.body.amount;
    const wal = totalPrice - total;
    const details = req.body;
    const crypto = require('crypto');
    let hmac = crypto.createHmac('sha256', process.env.RAZORKEY);
    hmac.update(details.payment.razorpay_order_id+'|'+details.payment.razorpay_payment_id);
    hmac = hmac.digest('hex');
    if(hmac==details.payment.razorpay_signature){
      await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{status:"placed"}});
      await User.updateOne({_id:req.session.user_id},{$inc:{wallet:-wal}});
      await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{paymentId:details.payment.razorpay_payment_id}});
      await Cart.deleteOne({userName:req.session.user_id});
      res.json({success:true});
    }else{
      await Order.findByIdAndRemove({_id:details.order.receipt});
      res.json({success:false});
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const getSalesReport = async(req,res,next)=>{
  try {
    const {from,to,sortData,sortOrder} = req.query;
    let page = Number(req.query.page);
    if(isNaN(page) || page < 1){
      page = 1;
    }
    const conditions = {}
    if(from && to){
      conditions.date = {
        $gte:from,
        $lte:to
      }
    } else if(from){
      conditions.date = {
        $gte:from
      }
    }else if(to){
      conditions.date = {
        $lte:to
      }
    }
    const sort ={}
    if(sortData){
      if(sortOrder === "Ascending"){
        sort[sortData] = 1;
      }else{
        sort[sortData] = -1;
      }
    }else{
      sort['date'] = -1;
    }
    const orderCount = await Order.count();
    const limit = orderCount;
    const orders = await Order.find(conditions).sort(sort).skip((page - 1) * 10).limit(10);
    res.render('salesReport',{
      orders,
      from,
      to,
      currentPage :page,
      hasNextPage:page * 10 < orderCount,
      hasPrevPage : page > 1,
      nextPage:page+1,
      prevPage:page-1,
      lastPage:Math.ceil(orderCount/10),
      sortData,
      sortOrder
    })

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

module.exports = {
  placeOrder,
  orderSuccess,
  showOrder,
  cancelOrder,
  viewOrderProducts,
  adminShowOrder,
  viewProduct,
  editOrder,
  postEditOrder,
  verifyPayment,
  getSalesReport
}