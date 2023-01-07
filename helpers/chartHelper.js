require ('dotenv').config()
const db = require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');


module.exports = {
    totalCodSales:()=>{
        console.log('__________________________cod');
        return new Promise(async(resolve, reject)=>{
            let CodTotal= await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
                {
                    $match: 
                    {
                        paymentMethod:'COD'
                    }
                },
                {
                    $project: 
                    {
                        totalPrice:1
                    }
                },
                {
                    $group: 
                    {
                        _id:null,
                        CodTotal:
                        {
                            $sum:'$totalPrice'
                        }

                    }
                }
            ]).toArray();
            // console.log(CodTotal);
            // console.log('___________________________________');
            resolve(CodTotal)
        })
    },
    totalRazorpaySales:()=>{
        return new Promise(async(resolve, reject)=>{
            let razorpayTotal= await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
                {
                    $match: 
                    {
                        paymentMethod:'RazorPay'
                    }
                },
                {
                    $project: 
                    {
                        totalPrice:1
                    }
                },
                {
                    $group: 
                    {
                        _id:null,
                        razorpayTotal:
                        {
                            $sum:'$totalPrice'
                        }

                    }
                }
            ]).toArray();
            // console.log(razorpayTotal);
            // console.log('________________________________');
            resolve(razorpayTotal)
        })
    },
    
    totalPaypalSales:()=>{
        return new Promise(async(resolve, reject)=>{
            let paypalTotal= await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
                {
                    $match: 
                    {
                        paymentMethod:'PayPal'
                    }
                },
                {
                    $project: 
                    {
                        totalPrice:1
                    }
                },
                {
                    $group: 
                    {
                        _id:null,
                        paypalTotal:
                        {
                            $sum:'$totalPrice'
                        }

                    }
                }
            ]).toArray();
            // console.log(paypalTotal);
            // console.log('_________________________________');
            resolve(paypalTotal)
        })
    },
    getDailySalesReport:()=>{   
        return new Promise (async(resolve,reject)=>{
            let dailySales=await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
                {
                    $match:{
                        'status':{$nin:['orderCancle','pending','Return Aproved','Return requsted']}
                    }
                },
                {
                    $group:{
                        _id:'$date',
                        totalPrice:{$sum:'$totalPrice'} ,
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                },
                {
                    $limit:10
                },
 
            ]).toArray()
            resolve(dailySales)
   
        })
    },
    getMonthlySalesReport:()=>{
        return new Promise(async(resolve, reject) => {
            let monthlySales=await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
               
                {
                    $match:{
                        'status':{$nin:['orderCancle','pending','Return Aproved','Return requsted']}
                    }
                },
               
               
                {
                    $project:{
                        isoDate:{$dateFromString:{dateString:"$date"}},
                        totalPrice:1
                    }
                },
                {
                    $group: {
                        _id:{ $dateToString: {  format: "%Y-%m", date: "$isoDate"} },
                        total: { $sum: "$totalPrice" },
                        count:{$sum:1}
                    }
                }, 
                {
                    $sort:{_id:-1}  
                }
                
            ]).toArray()
            console.log(monthlySales)
            resolve(monthlySales)
        })
    },
    getYearlySalesReport:()=>{
        return new Promise(async(resolve, reject) => {
            let yearlySales =await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
               
                {
                    $match:{
                        'status':{$nin:['orderCancle','pending','Return Aproved','Return requsted']}
                    }
                },
                {
                    $project:{
                        isoDate:{$dateFromString:{dateString:"$date"}},
                        totalPrice:1
                    }
                },
                {
                    $group: {
                        _id:{ $dateToString: { format: "%Y", date: "$isoDate"} },
                        totalPrice: { $sum: "$totalPrice" },
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{_id:1}
                }
               
            ]).toArray()
            console.log('Yearly sales report')
            console.log(yearlySales);
            resolve(yearlySales)
        })
    },
    getDailySalesTotal:()=>{
        return new Promise (async(resolve,reject)=>{
            let dailySalesTotal=await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
                {
                    $match:{
                        'status':{$nin:['orderCancle','pending','Return Aproved','Return requsted']}
                    }
                },
                {
                    $group:{
                        _id:'$date',
                        totalPrice:{$sum:'$totalPrice'} ,
                        count:{$sum:1}
                       
                    }
                },
                {
                    $sort:{
                        _id:1
                    }
                },
                {
                    $limit:7
                },
                {
                    $project:{
                        totalPrice:1,
                    }
                },{
                    $group:{
                        _id:null,
                        total:{$sum:'$totalPrice'}
                    }
                }
               
   
            ]).toArray()
            console.log(dailySalesTotal[0].total)
            resolve(dailySalesTotal[0].total)
   
        })
    },
    getTotalSalesGraph:()=>{
        return new Promise (async(resolve,reject)=>{
            let dailySales=await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
                {
                    $match:{
                        'status':{$nin:['orderCancle','pending','Return Aproved','Return requsted']}
                    }
                },
                {
                    $group:{
                        _id:'$date',
                        totalPrice:{$sum:'$totalPrice'} ,
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                },
                {
                    $limit:7
                },

            ]).toArray()


            let monthlySales=await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
               
                {
                    $match:{
                        'status':{$nin:['orderCancle','pending','Return Aproved','Return requsted']}
                    }
                },
               
                
                {
                    $project:{
                        isoDate:{$dateFromString:{dateString:"$date"}},
                        totalPrice:1
                    }
                },
                {
                    $group: {
                        _id:{ $dateToString: { format: "%Y-%m", date: "$isoDate"} },
                        totalPrice: { $sum: "$totalPrice" },
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{_id:-1}
                }
               
            ]).toArray()

            let yearlySales =await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
               
                {
                    $match:{
                        'status':{$nin:['orderCancle','pending','Return Aproved','Return requsted']}
                    }
                },
                {
                    $project:{
                        isoDate:{$dateFromString:{dateString:"$date"}},
                        totalPrice:1
                    }
                },
                {
                    $group: {
                        _id:{ $dateToString: { format: "%Y", date: "$isoDate"} },
                        totalPrice: { $sum: "$totalPrice" },
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{_id:1}
                }
               
            ]).toArray()
            resolve({dailySales,monthlySales,yearlySales})


            
            })
    },

}