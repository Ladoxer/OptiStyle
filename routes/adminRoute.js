const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const adminRoute = express();
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const bannerController = require('../controllers/bannerController');
const offerController = require('../controllers/offerContoller');
const path = require('path');
const config = require('../config/config');
const upload = require('../config/multer').upload;
const session = require('express-session');
const auth = require('../middleware/adminauth');

adminRoute.use(session({
  secret:process.env.SECRET_KEY,
  saveUninitialized:true,
  resave:false
}));

// adminRoute.set('view engine','ejs');
adminRoute.set('views',path.join(__dirname,'../views/admin'));



// get methods
adminRoute.get('/',adminController.loadLogin);
adminRoute.get('/dashboard',auth.isLogin,adminController.loadDashboard);
adminRoute.get('/userList',auth.isLogin,adminController.loadUserList);
adminRoute.get('/block',auth.isLogin,adminController.blockUser);
adminRoute.get('/unblock',auth.isLogin,adminController.unblockUser);
adminRoute.get('/listCategory',auth.isLogin,categoryController.listCategory);
adminRoute.get('/addCategory',auth.isLogin,adminController.loadAddCategory);
adminRoute.get('/editCategory',auth.isLogin,categoryController.editCategory);
adminRoute.get('/deleteCategory',auth.isLogin,categoryController.deleteCategory);
adminRoute.get('/anListCategory',auth.isLogin,categoryController.anListCategory);
adminRoute.get('/unListCategory',auth.isLogin,categoryController.unListCategory);
adminRoute.get('/productList',auth.isLogin,productController.loadProductList);
adminRoute.get('/addProduct',auth.isLogin,productController.loadAddProduct);
adminRoute.get('/editProduct',auth.isLogin,productController.editProduct);
adminRoute.get('/unblockProduct',auth.isLogin,productController.unblockProduct);
adminRoute.get('/blockProduct',auth.isLogin,productController.blockProduct);
adminRoute.get('/orders',auth.isLogin,orderController.adminShowOrder);
adminRoute.get('/viewProduct',auth.isLogin,orderController.viewProduct);
adminRoute.get('/editOrder',auth.isLogin,orderController.editOrder);
adminRoute.get('/listCoupon',auth.isLogin,couponController.listCoupon);
adminRoute.get('/addCoupon',auth.isLogin,couponController.loadAddCoupon);
adminRoute.get('/editCoupon',auth.isLogin,couponController.loadEditCoupon);
adminRoute.get('/deleteCoupon',auth.isLogin,couponController.deleteCoupon);
adminRoute.get('/listBanner',auth.isLogin,bannerController.listBanner);
adminRoute.get('/addBanner',auth.isLogin,bannerController.loadAddBanner);
adminRoute.get('/editBanner',auth.isLogin,bannerController.editBanner);
adminRoute.get('/showBanner',auth.isLogin,bannerController.unlistBanner);
// sales-report
adminRoute.get('/sales',auth.isLogin,orderController.getSalesReport);

// post methods
adminRoute.post('/',adminController.verifyAdmin);
adminRoute.post('/addCategory',categoryController.addCategory);
adminRoute.post('/editCategory',categoryController.postEdit);
adminRoute.post('/addProduct',upload.array('image',10),productController.addProduct);
adminRoute.post('/removeImage',productController.removeImg);
adminRoute.post('/editProduct',upload.array('image',10),productController.updateProduct);
adminRoute.post('/editOrder',orderController.postEditOrder);
adminRoute.post('/addCoupon',couponController.postAddCoupon);
adminRoute.post('/editCoupon',couponController.postEditCoupon);
adminRoute.post('/addBanner',upload.single('image'),bannerController.insertBanner);
adminRoute.post('/editBanner',bannerController.updateBanner);

//? category offer
adminRoute.get('/categoryOffer',auth.isLogin,offerController.categoryOfferList);
adminRoute.get('/addCategoryOffer',auth.isLogin,offerController.addCategoryOffer);
adminRoute.get('/editCategoryOffer',auth.isLogin,offerController.editCategoryOffer);
//--------------------------//
adminRoute.post('/addCategoryOffer',offerController.getCategoryOffer);
adminRoute.post('/editCategoryOffer',offerController.updateCategoryOffer);


//? product offer
adminRoute.get('/productOffer',auth.isLogin,offerController.productOfferList);
adminRoute.get('/addProductOffer',auth.isLogin,offerController.addProductOffer);
adminRoute.get('/editProductOffer',auth.isLogin,offerController.editProductOffer);
//--------------------------//
adminRoute.post('/addProductOffer',offerController.getProductOffer);
adminRoute.post('/editProductOffer',offerController.updateProductOffer);







module.exports = adminRoute;