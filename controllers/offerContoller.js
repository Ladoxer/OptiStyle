const Offer = require('../models/offerModel');
const ProductOffer = require('../models/productOfferModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');


//? category offer
const categoryOfferList = async(req,res,next)=>{
  try {
    const url = req.url;
    const offers = await Offer.find().populate('category');
    console.log(offers);
    res.render('categoryOfferList',{offers,url});

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const addCategoryOffer = async(req,res,next)=>{
  try {
    const categories = await Category.find({status:true});
    res.render('addCategoryOffer',{categories});
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const getCategoryOffer = async(req,res,next)=>{
  try {
    const data = {
      title: req.body.title,
      description:req.body.description,
      category:req.body.category,
      discountPercentage:req.body.discountPercentage,
      startDate:req.body.startDate,
      endDate:req.body.endDate,
    };
    console.log(data);
    if(!data.title || !data.description || !data.category || !data.discountPercentage || !data.startDate || !data.endDate){
      return res.json({error: 'Fill in all fields!'});
    }

    const newOffer = await Offer.create(data);
    console.log(newOffer);
    res.json({newOffer});

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const editCategoryOffer = async(req,res,next)=>{
  try {
    const offerId = req.query.id;
    const data = await Offer.findOne({_id:offerId}).populate('category');
    console.log(data);
    const categories = await Category.find({status:true});
    res.render('editCategoryOffer',{data,categories});

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const updateCategoryOffer = async(req,res,next)=>{
  try {
    const offerId = req.body.id;
    const data = {
      title:req.body.title,
      description:req.body.description,
      category:req.body.category,
      discountPercentage:req.body.discountPercentage,
      startDate:req.body.startDate,
      endDate:req.body.endDate,
    };
    if (!data.title || !data.description || !data.category || !data.discountPercentage || !data.startDate || !data.endDate){
      return res.json({ error: 'Fill in all fields!' });
    }

    const currentDate = new Date();
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (startDate < endDate && endDate >= currentDate){
      data.status = "Active";
    } else if (endDate <= currentDate){
      data.status = "Expired";
    } else if (startDate > endDate){
      return res.json({ error: "Starting date is wrong!"});
    }

    await Offer.updateOne({_id:offerId},data);
    res.json({success: 'sucess'});

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

/////////////////////////////////////////////////

//? product offer
const productOfferList = async(req,res,next)=>{
  try {
    const url = req.url;
    const productOffers = await ProductOffer.find().populate('productName');
    res.render('productOfferList',{productOffers,url});

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const addProductOffer = async(req,res,next)=>{
  try {
    const products = await Product.find({list:true});
    res.render('addProductOffer',{products});
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const getProductOffer = async(req,res,next)=>{
  try {
    const data = {
      productName:req.body.productName,
      description:req.body.description,
      discountPercentage:req.body.discountPercentage,
      startDate:req.body.startDate,
      endDate:req.body.endDate,
    }
    if(!data.productName || !data.description || !data.discountPercentage || !data.startDate || !data.endDate){
      return res.json({error: 'Fill in all fields!'});
    }
    const newOffer = await ProductOffer.create(data);
    console.log(newOffer);
    res.json({newOffer});
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const editProductOffer = async(req,res,next)=>{
  try {
    const offerId = req.query.id;
    const data = await ProductOffer.findOne({_id:offerId}).populate('productName');
    const products = await Product.find({list:true});

    res.render('editProductOffer',{data,products});

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const updateProductOffer = async(req,res,next)=>{
  try {
    const offerId = req.body.id;
    const data = {
      productName:req.body.productName,
      description:req.body.description,
      discountPercentage:req.body.discountPercentage,
      startDate:req.body.startDate,
      endDate:req.body.endDate,
    }
    if(!data.productName || !data.description || !data.discountPercentage || !data.startDate || !data.endDate){
      return res.json({error: 'Fill in all fields!'});
    }

    const currentDate = new Date();
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if(startDate<endDate && endDate >= currentDate ){
      data.status = "Active";
    } else if (endDate <= currentDate){
      data.status = "Expired";
    } else if (startDate > endDate) {
      return res.json({error: 'Starting date is wrong!'});
    }

    await ProductOffer.updateOne({_id:offerId},data);
    return res.json({success:'success'});

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}


module.exports = {
  productOfferList,
  addProductOffer,
  getProductOffer,
  editProductOffer,
  updateProductOffer,
  categoryOfferList,
  addCategoryOffer,
  getCategoryOffer,
  editCategoryOffer,
  updateCategoryOffer,
}