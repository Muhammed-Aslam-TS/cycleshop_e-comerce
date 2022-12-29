require ('dotenv').config()
const db = require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');


module.exports = {

    mensCategory: () => {
        return new Promise((resolve, reject) => {
            let mens = db.get().collection(collection.PRODUCTS_COLLECTION)
                .find({ addCategory: { $regex: "^m" } }).toArray()
            resolve(mens)
            console.log(mens);
        })
    },
    womensCategory: () => {
        return new Promise((resolve, reject) => {
            let womens = db.get().collection(collection.PRODUCTS_COLLECTION)
                .find({ addCategory: { $regex: "^w" } }).toArray()
            resolve(womens)
            console.log(womens);
        })
    },

    kidsCategory:()=>{
        return new Promise((resolve, reject) => {
            let kids = db.get().collection(collection.PRODUCTS_COLLECTION)
                .find({ addCategory: { $regex: "^k" } }).toArray()
            resolve(kids)
            console.log(kids);
        })
    }

}