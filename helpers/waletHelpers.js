require('dotenv').config()
const db = require('../config/connection')
var collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { use, response } = require('../app');
const { ObjectId } = require('mongodb');



module.exports = {

    getWalet: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wallet = await db.get().collection(collection.WALET_COLLECTION).findOne({ user: ObjectId(userId) })
            resolve(wallet)
        })
    },

    getWaletAmount: (data, userId) => {

        let proId = data.proId
        let orderId = data.orderId
        var date = new Date()
        data.date = date

        function indexNo(element, index, array) {
            return (element.item == proId);
        }

        return new Promise(async (resolve, reject) => {

            let wallet = await db.get().collection(collection.WALET_COLLECTION).findOne({ user: ObjectId(userId) })
            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(orderId) })

            db.get().collection(collection.ORDER_COLLECTIONS)
                .updateOne({ _id: ObjectId(orderId), 'products.item': ObjectId(proId) },
                    {
                        $set: {
                            "products.$.trackorder": 'canceled'
                        }
                    })

            let orderDetils = await db.get().collection(collection.ORDER_COLLECTIONS)
                .findOne({ 'products.item': ObjectId(proId) })

            const indexNum = orderDetils.products.findIndex(indexNo)

            let trackOrder = orderDetils.products[indexNum].trackorder

            if (orderDetils.products[indexNum].CouponP) {
                var TotalPrice = orderDetils.products[indexNum].OfferPrice
                console.log(TotalPrice);
                console.log('__________________________if');
            } else {
                var TotalPrice = orderDetils.products[indexNum].Price
                console.log(TotalPrice);
                console.log('__________________________else');
            }


            if (trackOrder == "canceled" && orderDetils.paymentMethod != "COD") {

                let wallet = await db.get().collection(collection.WALET_COLLECTION).findOne({ user: ObjectId(userId) })
                let finelAmount = parseInt(wallet.balance) + TotalPrice
                finelAmount = parseInt(finelAmount)

                let transactions = {
                    credit: parseInt(TotalPrice),
                    debit: 0,
                    date: data.date,
                    message: "cancel Bonus"
                }
                let userUpdate = await db.get().collection(collection.WALET_COLLECTION).updateOne({ user: ObjectId(userId) },
                    {
                        $set: {
                            balance: finelAmount
                        },

                        $push: {
                            transactions: transactions
                        }
                    })
            }
            resolve()
        })
    },

    returnProuductAmount: (data) => {

        let proId = data.proId
        let orderId = data.orderId
        let userId = data.userId
        var date = new Date()
        data.date = date
        function indexNo(element, index, array) {
            return (element.item == proId);
        }

        return new Promise(async (resolve, reject) => {

            let wallet = await db.get().collection(collection.WALET_COLLECTION).findOne({ user: ObjectId(userId) })
            let balance = wallet.balance
            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(proId) })

            db.get().collection(collection.ORDER_COLLECTIONS)
                .updateOne({ _id: ObjectId(orderId), 'products.item': ObjectId(proId) },
                    {
                        $set: {
                            "products.$.trackorder": 'Return Aproved'
                        }
                    })

            let detils = await db.get().collection(collection.ORDER_COLLECTIONS)
                .findOne({ _id: ObjectId(orderId), 'products.item': ObjectId(proId) })

            const findIndex = detils.products.findIndex(indexNo)

            if (detils.products[findIndex].CouponP) {
                var TotalPrice = detils.products[findIndex].OfferPrice
                console.log(TotalPrice);
                console.log('__________________________if');
            } else {
                var TotalPrice = detils.products[findIndex].Price
                console.log(TotalPrice);
                console.log('__________________________else');
            }

            let trackOrder = detils.products[findIndex].trackorder

            if (trackOrder == "Return Aproved") {

                let finelAmount = balance + TotalPrice
                finelAmount = parseInt(finelAmount)
                let transactions = {
                    credit: parseInt(TotalPrice),
                    debit: 0,
                    date: data.date,
                    message: "Return Bonus"
                }
                let userUpdate = await db.get().collection(collection.WALET_COLLECTION).updateOne({ user: ObjectId(userId) },
                    {
                        $set: {
                            balance: finelAmount
                        },

                        $push: {
                            transactions: transactions
                        }
                    })
            }
            resolve()
        })
    }

}