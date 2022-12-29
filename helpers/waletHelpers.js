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
        return new Promise(async (resolve, reject) => {

            let wallet = await db.get().collection(collection.WALET_COLLECTION).findOne({ user: ObjectId(userId) })
            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(proId) })

            db.get().collection(collection.ORDER_COLLECTIONS)
                .updateOne({ _id: ObjectId(orderId), 'products.item': ObjectId(proId) },
                    {
                        $set: {
                            "products.$.trackorder": 'canceled'
                        }
                    })

            let detils = await db.get().collection(collection.ORDER_COLLECTIONS)
                .findOne({ _id: ObjectId(orderId), 'products.item': ObjectId(proId) })
            let trackOrder = detils.products[0].trackorder

            if (detils.products[0].CouponP) {
                let detils = await db.get().collection(collection.ORDER_COLLECTIONS)
                    .findOne({ _id: ObjectId(orderId), 'products.item': ObjectId(proId) })
                var TotalPrice = detils.products[0].OfferPrice || detils.products[0].Price
            } else {
                var TotalPrice = detils.products[0].OfferPrice || detils.products[0].Price
            }

            if (trackOrder == "canceled" && detils.paymentMethod != "COD") {



                let finelAmount = TotalPrice + wallet.balance
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
            let trackOrder = detils.products[0].trackorder
            let TotalPrice = detils.products[0].OfferPrice || detils.products[0].Price

            if (detils.products[0].CouponP) {
                let detils = await db.get().collection(collection.ORDER_COLLECTIONS)
                    .findOne({ _id: ObjectId(orderId), 'products.item': ObjectId(proId) })
                let TotalPrice = detils.products[0].OfferPrice || detils.products[0].Price
            } else {
                let TotalPrice = detils.products[0].OfferPrice || detils.products[0].Price
            }

            if (trackOrder == "Return Aproved") {

                let finelAmount = TotalPrice + balance
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