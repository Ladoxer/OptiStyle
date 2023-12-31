const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
  title:{
    type:String,
    required:true,
  },
  description:{
    type:String,
    required:true
  },
  category:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  discountPercentage: {
    type:Number,
    required:true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate:{
    type: Date,
    required: true,
  },
  status:{
    type: String,
    default: 'Active',
  }
});

offerSchema.pre('save',function(next){
  const currentDate = new Date();
  if(this.endDate <= currentDate){
    this.status = 'Expired';
  }
  next();
});

const offerModel = mongoose.model('offer',offerSchema);

module.exports = offerModel;