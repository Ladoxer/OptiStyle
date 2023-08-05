const express = require('express');
const userRoute = express();
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const userController = require('../controllers/userController');
const categoryController = require('../controllers/categoryController');
const cartController = require('../controllers/cartController');
const productController = require('../controllers/productController');
const addressController = require('../controllers/addressController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const session = require('express-session');
const auth = require('../middleware/auth');

userRoute.use(session({
  secret:process.env.SECRET_KEY,
  saveUninitialized:true,
  resave:false
}));

// userRoute.set('view engine','ejs');
userRoute.set('views',path.join(__dirname,'../views/user'));

// get methods
userRoute.get('/signup',userController.loadSignUp);
userRoute.get('/signin',auth.isLogout,userController.loadSignIn);
userRoute.get('/contact',userController.loadcontactUs);
userRoute.get('/',userController.loadHome);
userRoute.get('/home',userController.loadHome);
userRoute.get('/productDetail',productController.loadShowProduct);
userRoute.get('/cart',auth.isLogin,cartController.loadCart);
userRoute.get('/removeProduct',auth.isLogin,cartController.removeProduct);
userRoute.get('/checkout',auth.isLogin,cartController.loadCheckout);
userRoute.get('/addAddress',auth.isLogin,addressController.addAddress);
userRoute.get('/removeAddress',auth.isLogin,addressController.removeAddress);
userRoute.get('/orderSuccess',auth.isLogin,orderController.orderSuccess);
userRoute.get('/showOrder',auth.isLogin,orderController.showOrder);
userRoute.get('/viewOrderProducts',orderController.viewOrderProducts);

userRoute.get('/profile',auth.isLogin,userController.loadProfile);
userRoute.get('/editProfile',auth.isLogin,userController.loadEditProfile);
userRoute.get('/addAddressProfile',auth.isLogin,addressController.addAddressProfile);
userRoute.get('/editAddressProfile',auth.isLogin,addressController.loadEditAddressProfile);

userRoute.get('/shop',userController.loadShop);

userRoute.get('/logout',auth.isLogout,userController.loadLogout);




// post methods
userRoute.post('/signup',userController.insertUser);
userRoute.post('/send',userController.sendMail);
userRoute.post('/verify',userController.verifyMail);
userRoute.post('/signin',userController.verifyUser);
userRoute.post('/addToCart',auth.isLogin,cartController.addToCart);
userRoute.post('/changeProductQuantity',cartController.changeProductCount);
userRoute.post('/addAddress',addressController.insertAddress);
userRoute.post('/checkout',orderController.placeOrder);
userRoute.post('/cancelOrder',orderController.cancelOrder);
userRoute.post('/verifyPayment',orderController.verifyPayment);
userRoute.post('/applyCoupon',couponController.applyCoupon);
userRoute.post('/editProfile',userController.postEditProfile);
userRoute.post('/addAddressProfile',addressController.insertAddressProfile);
userRoute.post('/editAddressProfile',addressController.postEditAddressProfile);




module.exports = userRoute;