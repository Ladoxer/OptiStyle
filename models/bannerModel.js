const mongoose = require('mongoose');
const bannerSchema = new mongoose.Schema({
  heading:{
    type:String,
    required:true,
  },
  description:{
    type:String,
    required:true
  },
  image:{
    type: String,
    required:true,
  },
  status:{
    type:Boolean,
    default:false
  },
  order:{
    type: Number,
    
  }
});

const bannerModel = mongoose.model("banner",bannerSchema);
module.exports = bannerModel;