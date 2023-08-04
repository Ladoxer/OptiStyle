const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const dashboardHelper = require('../helpers/dashboardHelpers');

const bcrypt = require('bcrypt');

const loadDashboard = async (req,res,next)=>{
  try {

    const today = new Date();
    today.setHours(0,0,0,0);
    // console.log(today);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    // console.log(yesterday);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentMonthStartDate = new Date(currentYear,currentMonth,1,0,0,0);
    const previousMonthStartDate = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0);
    const previousMonthEndDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);


    const promises = [
      dashboardHelper.currentMonthRevenue(currentMonthStartDate,now),
      dashboardHelper.previousMonthRevenue(previousMonthStartDate,previousMonthEndDate),
      dashboardHelper.paymentMethodAmount(),
      dashboardHelper.todayIncome(today,now),
      dashboardHelper.yesterdayIncome(today,yesterday),
      dashboardHelper.totalRevenue(),
      Order.find({status:"placed"}).count(),
      Order.find({status:"Delivered"}).count(),
      User.find({is_blocked:false,is_verified:1}).count(),
      Product.find({list:true}).count(),
      dashboardHelper.dailyChart(),
      dashboardHelper.categorySales()
    ];

    const results = await Promise.all(promises);

    const revenueCurrentMonth = results[0]
    const revenuePreviousMonth = results[1]
    const paymentMethodAmount = results[2]
    const todayIncome = results[3]
    const yesterdayIncome = results[4]
    const totalRevenue = results[5]
    const ordersToShip = results[6]
    const completedOrders = results[7]
    const userCount = results[8]
    const productCount = results[9]
    const dailyChart = results[10]
    const categorySales = results[11]

    const razorPayAmount = paymentMethodAmount && paymentMethodAmount.length > 0 ? paymentMethodAmount[0].amount.toString() : 0;
    const codPayAmount = paymentMethodAmount && paymentMethodAmount.length > 0 ? paymentMethodAmount[1].amount.toString() : 0;

    const monthlyGrowth = revenuePreviousMonth === 0 ? 100 : (((revenueCurrentMonth - revenuePreviousMonth)/revenuePreviousMonth)*100).toFixed(1);

    const dailyGrowth = (((todayIncome - yesterdayIncome)/yesterdayIncome)*100).toFixed(1);

    if(req.session.admin_id){
      const url = req.url;
      res.render('dashboard',{
        url,
        admin:req.session.admin_id,
        todayIncome,
        dailyGrowth,
        totalRevenue,
        revenueCurrentMonth,
        monthlyGrowth,
        razorPayAmount,
        codPayAmount,
        userCount,
        ordersToShip,
        completedOrders,
        productCount,
        dailyChart,
        categorySales
      });
    }else{
      res.redirect('/admin');
    }
  } catch (error) {
    next(error);
  }
}

const loadLogin = async(req,res,next)=>{
  try {
    if(req.session.admin_id){
      res.redirect('/admin/dashboard');
    }else{
      res.render('login');
    }

  } catch (error) {
    next(error);
  }
}

const verifyAdmin = async(req,res,next)=>{
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({email:email,is_admin:1});
    if(userData.email === email){
      const passwordMatch = await bcrypt.compare(password,userData.password);
      if(passwordMatch){
        req.session.admin_id = true;
        res.redirect('/admin/dashboard');
      }else{
        res.render('login',{message:"Invalid email and password"});
      }
    }else{
      res.render('login',{message:"Invalid email and password"});
    }

  } catch (error) {
    next(error);
  }
}


const loadUserList = async(req,res,next)=>{
  try {
    if(req.session.admin_id){
      const url = req.url;
      const userData = await User.find({is_admin:0});
      res.render('userList',{users:userData,url});
    }else{
      res.redirect('/admin');
    }

  } catch (error) {
    next(error);
  }
}

const blockUser = async(req,res,next)=>{
  try {
    const id = req.query.id;
    const findUser = await User.findOne({_id:id});
    if(findUser.is_blocked === true){
      res.redirect('/admin/userList');
    }else{
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:true}});
      res.redirect('/admin/userList');
    }

  } catch (error) {
    next(error);
  }
}

const unblockUser = async(req,res,next)=>{
  try {
    const id = req.query.id;
    const findUser = await User.findOne({_id:id});
    if(findUser.is_blocked === false){
      res.redirect('/admin/userList');
    }else{
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}});
      res.redirect('/admin/userList');
    }

  } catch (error) {
    next(error);
  }
}

const loadAddCategory = async(req,res,next)=>{
  try {
    if(req.session.admin_id){
      res.render('addCategory');
    }else{
      res.redirect('/admin');
    }
  } catch (error) {
    next(error);
  }
}


module.exports = {
  loadLogin,
  verifyAdmin,
  loadDashboard,
  loadUserList,
  blockUser,
  unblockUser,
  loadAddCategory,
}