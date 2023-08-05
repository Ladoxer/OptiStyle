const Banner = require('../models/bannerModel');


const listBanner = async(req,res,next)=>{
  try {
    const url = req.url;
    const bannerData = await Banner.find({});
    console.log(bannerData);
    res.render('listBanner',{banner:bannerData,url});
  } catch (error) {
    console.log(error.message);
    // next(error);
  }
}

const loadAddBanner = async(req,res,next)=>{
  try {
    res.render('addBanner');
  } catch (error) {
    next(error);
  }
}

const insertBanner = async(req,res,next)=>{
  try {
    const {heading,description} = req.body;
    const image = req.file.filename;

    const banner = new Banner({
      heading,
      description,
      image
    });
    const result = await banner.save();
    if(result){
      res.redirect('/admin/listBanner');
    }

  } catch (error) {
    next(error);
  }
}

const editBanner = async(req,res,next)=>{
  try {
    const id = req.query.id;
    const data = await Banner.findById({_id:id});
    res.render('editBanner',{data});

  } catch (error) {
    next(error);
  }
}

const updateBanner = async(req,res,next)=>{
  try {
    const id = req.query.id;
    const {heading,description} = req.body;

    await Banner.findByIdAndUpdate({_id:id},{heading,description});
    res.redirect('/admin/listBanner');
  } catch (error) {
    next(error);
  }
}

const unlistBanner = async(req,res,next)=>{
  try {
    const id = req.query.id;
    const banner = await Banner.findById({_id:id});
    if(banner.status === true){
      await Banner.findByIdAndUpdate({_id:id},{status: false});
    }else{
      await Banner.findByIdAndUpdate({_id:id},{status: true});
    }
    res.redirect('/admin/listBanner');

  } catch (error) {
    next(error);
  }
}

module.exports = {
  listBanner,
  loadAddBanner,
  insertBanner,
  editBanner,
  updateBanner,
  unlistBanner
}