const User = require('../models/userModel');
const Coupon = require('../models/couponModel');
const { findByIdAndUpdate } = require('../models/orderModel');

const applyCoupon = async(req,res,next)=>{
  try {
    const code = req.body.code;
    const amount = Number(req.body.amount);
    const userExist = await Coupon.findOne({code:code,user:{$in:[req.session.user_id]}});
    if(userExist){
      res.json({user:true});
    }else{
      const couponData = await Coupon.findOne({code:code});
      console.log(couponData);
      if(couponData){
        if(couponData.maxUsers<=0){
          res.json({limit:true});
        }else{
          if(couponData.status === false){
            res.json({status:true});
          }else{
            if(couponData.expiryDate<=new Date()){
              res.json({date:true});
            }else{
              if(couponData.maxCartAmount >= amount){
                res.json({cartAmount:true});
              }else{
                await Coupon.findByIdAndUpdate({_id:couponData._id},{$push:{user:req.session.user_id}});
                await Coupon.findByIdAndUpdate({_id:couponData._id},{$inc:{maxUsers:-1}});
                if(couponData.discountType == "Fixed"){
                  const disAmount = couponData.discountAmount;
                  const disTotal = Math.round(amount - disAmount);
                  return res.json({amountOkey:true,disAmount,disTotal});
                }else if(couponData.discountType == "Percentage Type"){
                  const perAmount = (amount * couponData.discountAmount)/100;
                  if(perAmount <= couponData.maxDiscountAmount){
                    const disAmount = perAmount;
                    const disTotal = Math.round(amount - disAmount);
                    return res.json({amountOkey:true,disAmount,disTotal});
                  }
                }else{
                  const disAmount = couponData.maxDiscountAmount;
                  const disTotal = Math.round(amount - disAmount);
                  return res.json({amountOkey:true,disAmount,disTotal});
                }
              }
            }
          }
        }
      }else{
        res.json({invalid:true});
      }
    }
    

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const listCoupon = async(req,res,next)=>{
  try {
    const url = req.url;
    const couponData = await Coupon.find({});
    res.render('listCoupon',{couponData,url});
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const loadAddCoupon = async(req,res,next)=>{
  try {
    res.render('addCoupon');
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const postAddCoupon = async(req,res,next)=>{
  try {
    const {code,discountType,date,amount,cartAmount,discountAmount,couponCount} = req.body;
    const coupon = new Coupon({
      code,
      discountType,
      expiryDate:date,
      discountAmount:amount,
      maxCartAmount:cartAmount,
      maxDiscountAmount:discountAmount,
      maxUsers:couponCount
    });
    const couponData = await coupon.save();
    if(couponData){
      res.redirect('/admin/listCoupon');
    }else{
      res.redirect('/admin/listCoupon');
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const loadEditCoupon = async(req,res,next)=>{
  try {
    const couponId = req.query.id;
    const couponData = await Coupon.findOne({_id:couponId});
    res.render('editCoupon',{coupon:couponData});
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const postEditCoupon = async(req,res,next)=>{
  try {
    const couponId = req.query.id;
    const {code,discountType,amount,date,cartAmount,discountAmount,couponCount} = req.body;
    const coupon = await Coupon.findByIdAndUpdate({_id:couponId},{
      code,
      discountType,
      discountAmount:amount,
      expiryDate:date,
      maxCartAmount:cartAmount,
      maxDiscountAmount:discountAmount,
      maxUsers:couponCount
    });
    await coupon.save();
    res.redirect('/admin/listCoupon');

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const deleteCoupon = async(req,res,next)=>{
  try {
    const couponId = req.query.id;
    await Coupon.deleteOne({_id:couponId});
    res.redirect('/admin/listCoupon');
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

module.exports = {
  applyCoupon,
  listCoupon,
  loadAddCoupon,
  postAddCoupon,
  loadEditCoupon,
  postEditCoupon,
  deleteCoupon
}