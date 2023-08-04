const Order = require('../models/orderModel');

const todayIncome = async(today, now) =>{
  const todayOrders = await Order.aggregate([
    {$match:{date:{$gte:today,$lt:now}}},
    {$unwind:"$products"},
    {$group:{_id:null,todayIncome:{$sum:{$multiply:[{$toDouble:"$products.count"},{$toDouble:"$products.productPrice"}]}}}},
    {$project:{todayIncome:1}}
  ]);
  const todayIncome = todayOrders.length > 0 ? todayOrders[0].todayIncome : 0;
  return todayIncome;
}

const yesterdayIncome = async(today,yesterday) =>{
  const yesterdayOrders = await Order.aggregate([
    {$match:{date:{$gte:yesterday,$lt:today}}},
    {$unwind:"$products"},
    {$group:{_id:null,yesterdayIncome:{$sum:{$multiply:[{$toDouble:"$products.count"},{$toDouble:"$products.productPrice"}]}}}},
    {$project:{yesterdayIncome:1}}
  ]);
  const yesterdayIncome = yesterdayOrders.length > 0 ? yesterdayOrders[0].yesterdayIncome : 0;
  return yesterdayIncome
}

const totalRevenue = async() =>{
  const revenue = await Order.aggregate([
    {$match:{status:{$ne:"Pending"}}},
    {$group:{_id:null,revenue:{$sum:"$totalAmount"}}}
  ]);
  const totalRevenue = revenue.length > 0 ? revenue[0].revenue : 0;
  return totalRevenue;
}

const currentMonthRevenue = async(currentMonthStratDate,now)=>{
  const currentMonthRevenue = await Order.aggregate([
    {$match:{date:{$gte:currentMonthStratDate,$lt:now},status:{$ne:"Pending"}}},
    {$group:{_id:null,currentMonthRevenue:{$sum:"$totalAmount"}}}
  ]);
  const result = currentMonthRevenue.length > 0 ? currentMonthRevenue[0].currentMonthRevenue : 0;
  return result;
}

const previousMonthRevenue = async(previousMonthStratDate,previousMonthEndDate)=>{
  const previousMonthRevenue = await Order.aggregate([
    {$match:{date:{$gte:previousMonthStratDate,$lt:previousMonthEndDate},status:{$ne:"Pending"}}},
    {$group:{_id:null,previousMonthRevenue:{$sum:"$totalAmount"}}}
  ]);
  const result = previousMonthRevenue.length > 0 ? previousMonthRevenue[0].previousMonthRevenue : 0;
  return result;
}

const paymentMethodAmount = async () =>{
  const paymentMethodTotal = await Order.aggregate([
    {$match:{status:{$ne: "Pending"}}},
    {$group:{_id:"$paymentMethod",amount:{$sum:"$totalAmount"}}}
  ]);
  const result = paymentMethodTotal.length > 0 ? paymentMethodTotal : 0;
  return result;
}

const dailyChart = async () =>{
  const dailyOrders = await Order.aggregate([
    {$match:{status:{$ne:"Pending"}}},
    {$group:{_id:{$dateToString:{format:"%Y-%m-%d",date:"$date"}},dailyrevenue:{$sum:"$totalAmount"}}},
    {$sort:{_id:1}},
    {$limit:14}
  ]);

  const result = dailyOrders || 0;
  return result;
}

const categorySales = async() => {
  const catSales = await Order.aggregate([
    {$match:{status:{$ne:"Pending"}}},
    {$unwind:"$products"},
    {$lookup:{
      from:"products",
      localField:"products.productId",
      foreignField:"_id",
      as: "categories"
    }},
    {$unwind:"$categories"},
    {$lookup:{
      from:"categories",
      localField:"categories.category",
      foreignField:"_id",
      as:"category"
    }},
    {$unwind:"$category"},
    {$group:{_id:"$category.categoryName",qty:{$sum:"$products.count"}}}
  ]);
  // console.log(catSales);  
  return catSales;
}


module.exports = {
  todayIncome,
  yesterdayIncome,
  totalRevenue,
  currentMonthRevenue,
  previousMonthRevenue,
  paymentMethodAmount,
  dailyChart,
  categorySales,
}