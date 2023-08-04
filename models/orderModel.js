const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  deliveryAddress:{
    type:String,
    required:true
  },
  userId:{
    type:String,
    required:true
  },
  userName:{
    type:String,
    required:true
  },
  paymentMethod:{
    type:String,
    required:true
  },
  paymentId:{
    type:String
  },
  products:[{
    productId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"product",
      required:true
    },
    count:{
      type:Number,
    },
    productPrice:{
      type:Number,
      required:true
    },
    totalPrice:{
      type:Number
    }
  }],
  totalAmount:{
    type:Number,
    required:true
  },
  Amount:{
    type:Number,
    required:true
  },
  date:{
    type:Date
  },
  status:{
    type:String
  },
  orderWallet:{
    type:Number
  },
},
{timestamps:true}
);

const orderModel = mongoose.model("order",orderSchema);
module.exports = orderModel;