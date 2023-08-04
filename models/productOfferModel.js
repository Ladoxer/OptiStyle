const mongoose = require('mongoose');

const productOfferSchema = mongoose.Schema({
  productName:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"product",
    required:true
  },
  description:{
    type: String,
    required: true,
  },
  discountPercentage: {
    type:Number,
    required: true,
  },
  startDate:{
    type:Date,
    required:true,
  },
  endDate:{
    type:Date,
    required:true,
  },
  status:{
    type:String,
    default:'Active',
  }
});

productOfferSchema.pre('save', function(next){
  const currentDate = new Date();
  if(this.endDate <= currentDate){
    this.status = 'Expired';
  }
  next();
});

productOfferModel = mongoose.model('productOffer',productOfferSchema);

module.exports = productOfferModel;