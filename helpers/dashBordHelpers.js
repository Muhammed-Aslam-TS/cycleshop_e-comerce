require ('dotenv').config()
const db = require('../config/connection')
var collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { use, response } = require('../app');
const { ObjectId } = require('mongodb');


module.exports = {

    getUsserAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: ObjectId(userId) }).sort({date:-1}).toArray()
            resolve(address)
        })
    },
    getUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION)
                .findOne({ _id: ObjectId(userId) })
            resolve(user)
        })
    },
    // getUserOrders:(userId)=>{
    //     console.log(userId);
    //     return new Promise(async (resolve, reject) => {
    //         let orders = await db.get().collection(collection.ORDER_COLLECTIONS)
    //             .find({ userId: ObjectId(userId) }).toArray()

    //         resolve(orders)
    //     })
    // }

}