const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const dbConnect = async()=>{
  try {
    await mongoose.connect(process.env.MONGO);
    console.log('connected to database..');
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = dbConnect;