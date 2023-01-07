require ('dotenv').config()
const db = require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');


module.exports = {

    addCoupon: (coupon) => {
        coupon.CouppenP = parseInt(coupon.CouppenP)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then((coupon) => {
                resolve(coupon)
            })
        })
    },
    getCoupon: () => {

        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupon)

        })

    },

    getCoupon2: (Id) => {

        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ _id: ObjectId(Id) })
            resolve(coupon)

        })


    },


    checkCoupon: (detils) => {
        data = detils.CouppenCode
        return new Promise(async (resolve, reject) => {
            let check = await db.get().collection(collection.COUPON_COLLECTION).findOne({ CouppenCode: data })
            resolve(check)
        })
    },

}
