const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Banner = require("../models/bannerModel");
const Offer = require("../models/offerModel");
const ProductOffer = require("../models/productOfferModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const loadSignIn = async (req, res,next) => {
  try {
    if (req.session.user_id) {
      res.redirect("/home");
    } else {
      res.render("signIn");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const loadSignUp = async (req, res,next) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

let otp = "";
let tempEmail;
const sendMail = async (name, email, user_id) => {
  try {
    let digits = "0123456789";
    for (let i = 0; i < 4; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const options = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "for email verification",
      html:
        "<p>Hii " + name + " ,Please enter " + otp + " for verification</p>",
    };
    transporter.sendMail(options, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(otp);
        console.log("email has been send to :-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const insertUser = async (req, res,next) => {
  try {
    const { name, email, password, mobile, referalcode } = req.body;
    console.log(req.body);
    const spassword = await securePassword(password);
    const referralCode = generateReferralCode(8);
    const user = new User({
      name,
      email,
      mobile,
      password: spassword,
      is_admin: 0,
      referal_code: referralCode,
    });
    let userData;
    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      res.render("signup", {
        message: "This email is already exist so verify the mail using sign In",
      });
    } else {
      if (req.body.referalcode) {
        const parentUserData = await User.findOne({
          referal_code: req.body.referalcode,
        });
        if (!parentUserData) {
          return res.render("signup", { message: "Invalid referal code" });
        }
      }
      userData = await user.save();
    }
    tempEmail = userData.email;

    if (userData) {
      

      if (userData.is_verified === 0) {
        otp = "";
        sendMail(req.body.name, req.body.email, userData._id);
        res.render("otpPage", {
          message: "Enter the otp to verify your email", referalcode, email
        });
      } else {
        res.render("signup", { message: "Registration successfull" });
      }
    } else {
      res.render("signup", { message: "Your registration failed" });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//--------Function for referal code----------

function generateReferralCode(length) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let referralCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    referralCode += charset[randomIndex];
  }
  return referralCode;
}

//---------End-------------------------------

const verifyMail = async (req, res,next) => {
  try {
    let otpRecieved = req.body.otp;
    const {referalcode,email} = req.body;
    if (otpRecieved === otp) {
      res.redirect("/signin");
      await User.updateOne(
        { email: tempEmail },
        { $set: { is_verified: 1 } }
      );
      if(referalcode){
        const parentUserData = await User.findOne({referal_code:referalcode});
        if(parentUserData){
          await User.findByIdAndUpdate({_id:parentUserData._id},{$inc:{wallet:50}});
          const userData = await User.findOne({email:email});
          await User.findByIdAndUpdate({_id:userData._id},{$inc:{wallet:20}});
        }
      }
    } else {
      res.render("otpPage", { message: "Wrong Otp" });
      res.status(500).send("invalid OTP");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const verifyUser = async (req, res,next) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_verified === 1) {
        if (userData) {
          const passwordMatch = await bcrypt.compare(
            password,
            userData.password
          );
          if (passwordMatch) {
            if (userData.is_blocked === false) {
              req.session.user_id = userData._id;
              res.redirect("/home");
            } else {
              res.render("signIn", { message: "This user has been blocked" });
            }
          } else {
            res.render("signIn", { message: "Incorrect email or password" });
          }
        } else {
          res.render("signIn", { message: "Incorrect email or password" });
        }
      } else {
        otp = "";
        tempEmail = email;
        sendMail(userData.name, userData.email, userData._id);
        res.render("otpPage", { message: "Verify your email first" });
      }
    } else {
      res.render("signIn", { message: "User not exist" });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const loadHome = async (req, res,next) => {
  try {
    const currentDate = new Date();
    const categoryOfferCheck = await Offer.find();
    categoryOfferCheck.forEach(async (x) => {
      if (x.endDate <= currentDate) {
        await Offer.updateOne({ _id: x._id }, { $set: { status: "Expired" } });
      } else {
        await Offer.updateOne({ _id: x._id }, { $set: { status: "Active" } });
      }
    });
    const productOfferCheck = await ProductOffer.find();
    productOfferCheck.forEach(async (x) => {
      if (x.endDate <= currentDate) {
        await ProductOffer.updateOne(
          { _id: x._id },
          { $set: { status: "Expired" } }
        );
      } else {
        await ProductOffer.updateOne(
          { _id: x._id },
          { $set: { status: "Active" } }
        );
      }
    });
    const categoryOffer = await Offer.find({ status: "Active" }).populate(
      "category"
    );
    const productOffer = await ProductOffer.find({ status: "Active" });

    const userName = await User.findOne({ _id: req.session.user_id });
    const productData = await Product.find({ list: true })
      .limit(12)
      .sort("-createdAt");
    const category = await Category.find({ status: true });
    const bannerData = await Banner.find({ status: true });
    // console.log(productData);
    if (req.session.user_id) {
      let customer = true;
      res.render("index", {
        customer,
        userName,
        product: productData,
        banner: bannerData,
        category,
        categoryOffer,
        productOffer,
      });
    } else {
      let customer = false;
      res.render("index", {
        customer,
        product: productData,
        banner: bannerData,
        category,
        categoryOffer,
        productOffer,
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const loadProfile = async (req, res,next) => {
  try {
    const userName = await User.findOne({ _id: req.session.user_id });
    const addressData = await Address.findOne({ userId: req.session.user_id });
    // const [address1] = addressData? addressData.addresses: undefined;
    if(addressData){
      var [address] =  addressData.addresses;
    }else{
      var address;
    }
    

    if (req.session.user_id) {
      const customer = true;
      res.render("profile", { customer, userName, address });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const loadLogout = async (req, res,next) => {
  try {
    req.session.destroy();
    res.redirect("/signin");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const loadEditProfile = async(req,res,next)=>{
  try {
    let customer = true;
    const userData = await User.findOne({_id:req.session.user_id});
    res.render('editProfile',{user:userData,customer});

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const postEditProfile = async(req,res,next)=>{
  try {
    const {name,mobile} = req.body;
    const userUpdate = await User.findByIdAndUpdate({_id:req.session.user_id},{name,mobile});
    if(userUpdate){
      return res.redirect('/profile');
    }
    let customer = true;
    return res.render('editProfile',{message:"something wrong...",customer});

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const loadShop = async(req,res,next)=>{
  try {

    const page = Number(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const price = req.query.value;
    let category = req.query.category || "All";
    let Search = req.query.search || ""
    Search = Search.trim();

    const categoryData = await Category.find({ status: true });
    let cat = [];
    for(let i=0;i<categoryData.length;i++){
      cat[i] = categoryData[i].categoryName;
    }

    // const sample = "Hello,Hi,Tta";
    // const s1 = sample.split('');
    // console.log(s1);

    let sort;
    category === "All"? category = [...cat] : category = req.query.category.split(',');
    req.query.value === "High" ? sort = -1 : sort = 1;
    let catId = [];
    for(let i=0;i<categoryData.length;i++){
      if(categoryData[i].categoryName == category[i]){
        catId.push(categoryData[i]._id);
      }else if(req.query.category === 'All'){
        catId.push(categoryData[i]._id); 
      }
    }


    const productData = await Product.aggregate([
      {$match : {productName : {$regex : '^'+Search, $options : 'i'},category : {$in : catId}, list : true }},
      {$sort : {price : sort}},
      {$skip : skip},
      {$limit : limit}
    ])

    const productCount = await Product.countDocuments({
      productName: { $regex: Search, $options: 'i'},
      list:true,
      category: { $in:catId}
    });

    const totalPage = Math.ceil(productCount / limit);

    // console.log(productCount,totalPage);
    






    const currentDate = new Date();
    const categoryOfferCheck = await Offer.find();
    categoryOfferCheck.forEach(async (x) => {
      if (x.endDate <= currentDate) {
        await Offer.updateOne({ _id: x._id }, { $set: { status: "Expired" } });
      } else {
        await Offer.updateOne({ _id: x._id }, { $set: { status: "Active" } });
      }
    });
    const productOfferCheck = await ProductOffer.find();
    productOfferCheck.forEach(async (x) => {
      if (x.endDate <= currentDate) {
        await ProductOffer.updateOne(
          { _id: x._id },
          { $set: { status: "Expired" } }
        );
      } else {
        await ProductOffer.updateOne(
          { _id: x._id },
          { $set: { status: "Active" } }
        );
      }
    });
    const categoryOffer = await Offer.find({ status: "Active" }).populate(
      "category"
    );
    const productOffer = await ProductOffer.find({ status: "Active" });

    const userName = await User.findOne({ _id: req.session.user_id });
    // const productData = await Product.find({ list: true })
    //   .limit(12)
    //   .sort("-createdAt");
    

    if(req.session.user_id){
      const customer = true;
      res.render('shop',{customer,userName,product:productData,category:categoryData,page,Search,price,totalPage,cat:category,categoryOffer,productOffer});
    } else {
      const customer = false;
      res.render('shop',{customer,product:productData,category:categoryData,page,Search,price,totalPage,cat:category,categoryOffer,productOffer});
    } 






    // const customer = true;
    // res.render('shop',{
    //   customer,
    //   userName,
    //   product: productData,
    //   category,
    //   categoryOffer,
    //   productOffer,});
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

module.exports = {
  loadSignUp,
  insertUser,
  sendMail,
  verifyMail,
  loadSignIn,
  verifyUser,
  loadHome,
  loadProfile,
  loadLogout,
  loadEditProfile,
  postEditProfile,
  loadShop,
};
