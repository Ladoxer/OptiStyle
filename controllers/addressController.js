const User = require('../models/userModel');
const Address = require('../models/addressModel');

const addAddress = async(req,res,next)=>{
  try {
    const userName = await User.findOne({_id:req.session.user_id});
    if(req.session.user_id){
      let customer = true;
      res.render('addAddress',{customer,userName});
    }else{
      res.redirect('/singin');
    }

  } catch (error) {
    next(error);
  }
}

const insertAddress = async(req,res,next)=>{
  try {
    const userData = await User.findOne({_id:req.session.user_id});
    const addressDetails = await Address.findOne({userId:req.session.user_id});
    const {userName,mobile,alterMobile,address,city,state,pincode,landmark} = req.body;
    if(addressDetails){
      const updatedOne = await Address.updateOne({userId:req.session.user_id},{$push:{addresses:{
        userName,
        mobile,
        alternativeMob:alterMobile,
        address,
        city,
        state,
        pincode,
        landmark,
      }}});
      if(updatedOne){
        res.redirect('/checkout');
      }else{
        res.redirect('/checkout');
      }
    }else{
      const addressAdd = new Address({
        userId:userData._id,
        addresses:[{
          userName,
          mobile,
          alternativeMob:alterMobile,
          address,
          city,
          state,
          pincode,
          landmark,
        }]
      });
      const addressData = await addressAdd.save();
      if(addressData){
        res.redirect('/checkout');
      }else{
        res.redirect('/checkout');
      }
    }

  } catch (error) {
    next(error);
  }
}

const removeAddress = async(req,res,next)=>{
  try {
    await Address.updateOne({userId:req.session.user_id},{$pull:{addresses:{_id:req.query.id}}});
    res.redirect('/checkout');
  } catch (error) {
    next(error);
  }
}

const addAddressProfile = async(req,res,next)=>{
  try {
    const userName = await User.findOne({_id:req.session.user_id});
    if(req.session.user_id){
      let customer = true;
      res.render('addAddressProfile',{customer,userName});
    }else{
      res.redirect('/singin');
    }

  } catch (error) {
    next(error);
  }
}

const insertAddressProfile = async(req,res,next)=>{
  try {
    const userData = await User.findOne({_id:req.session.user_id});
    const addressDetails = await Address.findOne({userId:req.session.user_id});
    const {userName,mobile,alterMobile,address,city,state,pincode,landmark} = req.body;
    if(addressDetails){
      const updatedOne = await Address.updateOne({userId:req.session.user_id},{$push:{addresses:{
        userName,
        mobile,
        alternativeMob:alterMobile,
        address,
        city,
        state,
        pincode,
        landmark,
      }}});
      if(updatedOne){
        res.redirect('/profile');
      }else{
        res.redirect('/profile');
      }
    }else{
      const addressAdd = new Address({
        userId:userData._id,
        addresses:[{
          userName,
          mobile,
          alternativeMob:alterMobile,
          address,
          city,
          state,
          pincode,
          landmark,
        }]
      });
      const addressData = await addressAdd.save();
      if(addressData){
        res.redirect('/profile');
      }else{
        res.redirect('/profile');
      }
    }

  } catch (error) {
    next(error);
  }
}

const loadEditAddressProfile = async(req,res,next)=>{
  try {
    const userName = await User.findOne({_id:req.session.user_id});
    const addressDetails = await Address.findOne({userId:req.session.user_id});
    const [address] = addressDetails.addresses;
    let customer = true;
    res.render('editAddressProfile',{customer,userName,address});

  } catch (error) {
    next(error);
  }
}

const postEditAddressProfile = async(req,res,next)=>{
  try {
    const userData = await User.findOne({_id:req.session.user_id});
    const {userName,mobile,alterMobile,address,city,state,pincode,landmark} = req.body;

    await Address.findOneAndUpdate({userId:req.session.user_id, "addresses._id":req.query.id},{$set:{
      "addresses.$.userName":userName,
      "addresses.$.mobile":mobile,
      "addresses.$.alternativeMob":alterMobile,
      "addresses.$.address":address,
      "addresses.$.city":city,
      "addresses.$.state":state,
      "addresses.$.pincode":pincode,
      "addresses.$.landmark":landmark,
     }});

     res.redirect('/profile');

  } catch (error) {
    next(error);
  }
}

module.exports = {
  addAddress,
  insertAddress,
  removeAddress,
  addAddressProfile,
  insertAddressProfile,
  loadEditAddressProfile,
  postEditAddressProfile,
}