require ('dotenv').config()
const db = require('../config/connection')
var collection = require('../config/collections');
const { ObjectId, Timestamp } = require('mongodb');
// var collection = require('../config/collections');


module.exports = {

    addProduct: (product, callback) => {
        product.Price = parseInt(product.Price)
        product.Stock = parseInt(product.Stock)

        var date = new Date()
        var month = date.getUTCMonth() + 1;
        var day = date.getUTCDate()
        var year = date.getUTCFullYear()

        product.date = date
        product.month = month
        product.day = day
        product.year = year

        product.categoryName = ObjectId(product.categoryName)
        db.get().collection(collection.PRODUCTS_COLLECTION).insertOne(product).then((data) => {
            callback(data.insertedId)
        })
    },

    getAllproducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find().sort({date:-1}).toArray()
            resolve(products)

        })
    },
    addCategory: (category) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ADD_CATEGORY_COLLECTION).insertOne(category).then((category) => {
                resolve(category.insertedId)
            })
        })
    },

    getAllcategory: () => {
        return new Promise(async (resolve, reject) => {
            let categoryName = await db.get().collection(collection.ADD_CATEGORY_COLLECTION).find().toArray()
            resolve(categoryName)
        })
    },
    getProductDetails: (productId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(productId) }).then((product) => {
                resolve(product)
            })
        })
    },

    addWishlist: (productId, userId) => {
        let proObj = {
            item: ObjectId(productId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectId(userId) })
            if (userWishlist) {
                let proExist = userWishlist.product.findIndex(product => product.item == productId)
                if (proExist !== -1) {
                    db.get().collection(collection.WISHLIST_COLLECTION)
                        .updateOne({ 'product.item': ObjectId(productId) },
                            {
                                $pull: { product: proObj }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.WISHLIST_COLLECTION)
                        .updateOne({ user: ObjectId(userId) },
                            {
                                $push: { product: proObj }
                            }
                        ).then((response) => {
                            resolve()
                        })
                }

            } else {
                let wishObj = {
                    user: ObjectId(userId),
                    product: [proObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishObj).then((response) => {
                    resolve()
                })
            }
        })

    },
    getWishList: (userId) => {

        return new Promise(async (resolve, reject) => {
            let wishItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',

                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()

            resolve(wishItems)
        })

    },

    // getShowImage: (productId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let products = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(productId) })
    //         resolve(products)
    //     })
    // },




    getShowImage: (productId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(productId) })
            resolve(products)
        })
    },
    productHelpers:(limit)=>{
        return new Promise(async(resolve, reject) => {
          let product=await db.get().collection(collection.PRODUCTS_COLLECTION).find().skip(limit.startFrom).limit(limit.perpage).toArray()
          resolve(product)
        })
       },
       getCountProducts:()=>{
        // return new Promise(async(resolve, reject) => {
        //   let count=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
        //   resolve(count.length)
        // })
        return new Promise(async(resolve, reject) => {
          let count=await db.get().collection(collection.PRODUCTS_COLLECTION).find().toArray()
          console.log(count);
          console.log('ooooooooooooooooooooooooooooooooo');
         resolve(count.length)
        })
       },
       productHelperswomen:(limit)=>{
        return new Promise(async(resolve, reject) => {
          let product=await db.get().collection(collection.ADD_CATEGORY_COLLECTION).find({ addCategory: { $regex: "^w" } }).skip(limit.startFrom).limit(limit.perpage).toArray()
          resolve(product)
        })
       },
}



