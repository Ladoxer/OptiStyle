const Category = require('../models/categoryModel');
const uc = require('upper-case');

const listCategory = async (req,res,next)=>{
  try {
    if(req.session.admin_id){
      const url = req.url;
      const categoryData = await Category.find({});
      res.render('listCategory',{category:categoryData,url});
    }else{
      res.redirect('/admin');
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const addCategory = async(req,res,next)=>{
  try {
    if(req.session.admin_id){
      const catName = uc.upperCase(req.body.categoryName);
      const category = new Category({
        categoryName:catName
      })
      if(catName.trim().length === 0){
        res.render('addCategory',{message:"Invalid typing"});
      }else{
        const catData = await Category.findOne({categoryName:catName});
        if(catData){
          res.render('addCategory',{message:"This category is already exist"});
        }else{
          const categoryData = await category.save();
          if(categoryData){
            res.redirect('/admin/addCategory');
          }else{
            res.redirect('/admin/dashboard');
          }
        }
      }
    }else{
      res.redirect('/admin');
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const editCategory = async(req,res,next)=>{
  try {
    const catId = req.query.id;
    const catData = await Category.findOne({_id:catId});
    res.render('editCategory',{category:catData});

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const postEdit = async(req,res,next)=>{
  try {
    const catId = req.query.id;
    const catName = uc.upperCase(req.body.categoryName);
    const catData = await Category.findOne({_id:catId});
    if(catName.trim().length === 0){
      res.render('editCategory',{category:catData,message:"Invalid Entry"});
    }else{
      const updated = await Category.findByIdAndUpdate({_id:catId},{$set:{categoryName:catName}});
      res.redirect('/admin/listCategory');
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const deleteCategory = async(req,res,next)=>{
  try {
    if(req.session.admin_id){
      const deleteData = await Category.findByIdAndDelete({_id:req.query.id});
      if(deleteData){
        res.redirect('/admin/listCategory');
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

const anListCategory = async(req,res,next)=>{
  try {
    const catId = req.query.id;
    const catUpdate = await Category.findByIdAndUpdate({_id:catId},{$set:{status:true}});
    const categoryData = await Category.find({});
    if(catUpdate){
      res.render('listCategory',{category:categoryData,message:"Category Listed"});
    }else{
      res.render('listCategory',{category:categoryData,message:"Category Listing Failed"});
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const unListCategory = async(req,res,next)=>{
  try {
    const catId = req.query.id;
    const catUpdate = await Category.findByIdAndUpdate({_id:catId},{$set:{status:false}});
    const categoryData = await Category.find({});
    if(catUpdate){
      res.render('listCategory',{category:categoryData,message:"Category Unlisted"});
    }else{
      res.render('listCategory',{category:categoryData,message:"Category Unlisting Failed"});
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

module.exports = {
  listCategory,
  addCategory,
  editCategory,
  postEdit,
  deleteCategory,
  anListCategory,
  unListCategory,
}