require ('dotenv').config()
const db = require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');





module.exports = {

    blocUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let block = await db.get().collection(collection.USER_COLLECTION).updateOne(
                { _id: ObjectId(userId) },
                { $set: { userBlocked: true } }
            )
            resolve(block)
        })
    },
    unblocUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let unblock = await db.get().collection(collection.USER_COLLECTION).updateOne(
                { _id: ObjectId(userId) },
                { $set: { userBlocked: false } }
            )
            resolve(unblock)

        })
    },
    deleetProducts: (productId) => {
        return new Promise(async (resolve, reject) => {
            let deleet = await db.get().collection(collection.PRODUCTS_COLLECTION).deleteOne(
                { _id: ObjectId(productId) }
            )
            resolve(deleet)
        })
    },
    editProducts: (productId, product) => {
        product.Price = parseInt(product.Price)
        product.Stock = parseInt(product.Stock)
        product.ProductOffer = parseInt(product.ProductOffer)
        // product.ProductOffer= product.Price*product.ProductOffer/100
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                { _id: ObjectId(productId) },
                {
                    $set:
                    {
                        Name: product.Name,
                        Price: product.Price,
                        Stock: product.Stock,
                        addCategory: product.addCategory,
                        Image: product.Image,
                        Description: product.Description
                    }
                }
            ).then((response) => {
                resolve()
            })
        })
    },

    getUserOrder: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTIONS)
                .find().sort({ time: -1 }).toArray()
            resolve(orders)
        })
    },
    userOrderStatus: (orderId) => {
        let Status = orderId.status
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTIONS).updateOne({ _id: ObjectId(orderId.user) }, {
                $set: {
                    status: Status
                }
            }).then(() => {
                resolve()
            })
        })
    },
    addBanner: (banner) => {
        var date = new Date()
        var month = date.getUTCMonth() + 1;
        var day = date.getUTCDate()
        var year = date.getUTCFullYear()



        banner.date = date
        banner.month = month
        banner.day = day
        banner.year = year

        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((banner) => {
                resolve(banner)
            })
        })

    },
    getBanner: () => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banner)
        })
    },
    getcatogery: () => {
        return new Promise(async (resolve, reject) => {
            let catogory = await db.get().collection(collection.ADD_CATEGORY_COLLECTION).find().sort({ date: -1 }).toArray()
            resolve(catogory)
        })
    },
    catogoryDelete: (catogoryId) => {
     
        return new Promise(async (resolve, reject) => {
            let catogoryDelete = await db.get().collection(collection.ADD_CATEGORY_COLLECTION)
                .deleteOne({ _id: ObjectId(catogoryId) })
            resolve(catogoryDelete)
        })
    },



    bannerDelete: (bannerId) => {
        return new Promise(async (resolve, reject) => {
            let deleteBanner = await db.get().collection(collection.BANNER_COLLECTION)
                .deleteOne({ _id: ObjectId(bannerId) })
            resolve(deleteBanner)
        })
    },
    editBanner: (bannerId, banner) => {

        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.BANNER_COLLECTION)
                .updateOne({ _id: ObjectId(bannerId) },
                    {
                        $set: {
                            // bannerName: banner.Name,
                            // img: banner.Img,
                        }
                    }
                ).then((response) => {
                    resolve()
                })

        })
    },
    getBannerDetails: (bannerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: ObjectId(bannerId) }).then((banner) => {
                resolve(banner)
            })

        })
    },

    dailySailsReport: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTIONS)
                .aggregate([
                    {
                        $match: {
                            Status: { $ne: 'pending' },
                            trackorder: { $ne: 'canclled' }
                        }
                    },
                    {
                        $group: {
                            _id: '$date',
                            dailySaleAmount: { $sum: '$totalPrice' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            dailySaleAmount: 1,
                            count: 1,
                        }
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }
                ]).toArray().then((dailysales) => {
                    let totalPrice = 0
                    dailysales.forEach(element => {
                        totalPrice += element.dailySaleAmount
                    });
                    dailysales.totalPrice = totalPrice
                    resolve(dailysales)
                })
        })
    },

    monthlySailsReport: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTIONS)
                .aggregate([
                    {
                        $match: {
                            Status: { $ne: 'pending' },
                            trackorder: { $ne: 'canclled' }
                        }
                    },
                    {
                        $group: {
                            _id: '$month',
                            monthlySaleAmount: { $sum: '$totalPrice' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            monthlySaleAmount: 1,
                            count: 1,
                        }
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }
                ]).toArray().then((monthlysales) => {
                    let totalPrice = 0
                    monthlysales.forEach(element => {
                        totalPrice += element.monthlySaleAmount
                    });
                    monthlysales.totalPrice = totalPrice
                    resolve(monthlysales)
                })
        })
    },

    yearlySailsReport: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTIONS)
                .aggregate([
                    {
                        $match: {
                            Status: { $ne: 'pending' },
                            trackorder: { $ne: 'canclled' }
                        }
                    },
                    {
                        $group: {
                            _id: '$year',
                            yearlySaleAmount: { $sum: '$totalPrice' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            yearlySaleAmount: 1,
                            count: 1,
                        }
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }
                ]).toArray().then((yearlysales) => {
                    let totalPrice = 0
                    yearlysales.forEach(element => {
                        totalPrice += element.yearlySaleAmount
                    });
                    yearlysales.totalPrice = totalPrice
                    resolve(yearlysales)
                })
        })
    },

    getDailysalesreportfordownload: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTIONS).aggregate([


                {
                    $group:
                    {
                        _id: "$date",
                        DailySaleAmount: { $sum: "$totalPrice" },
                        count: { $sum: 1 }


                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                }, {
                    $limit: 30
                }


            ]).toArray().then((getDailysalesreportfordownload) => {

                console.log(getDailysalesreportfordownload)

                resolve(getDailysalesreportfordownload)
            })
        })
    },

    getMonthlysalesreportfordownload: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTIONS).aggregate([


                {
                    $group:
                    {
                        _id: "$month",
                        MonthlySaleAmount: { $sum: "$totalPrice" },
                        count: { $sum: 1 }


                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                }, {
                    $limit: 30
                }


            ]).toArray().then((getMonthlysalesreportfordownload) => {

                console.log(getMonthlysalesreportfordownload)

                resolve(getMonthlysalesreportfordownload)
            })
        })
    },

    getYearlysalesreportfordownload: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTIONS).aggregate([


                {
                    $group:
                    {
                        _id: "$year",
                        YearlySaleAmount: { $sum: "$totalPrice" },
                        count: { $sum: 1 }


                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                }, {
                    $limit: 30
                }


            ]).toArray().then((getYearlysalesreportfordownload) => {

                console.log(getYearlysalesreportfordownload)

                resolve(getYearlysalesreportfordownload)
            })
        })
    },


    userOrder: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
            resolve(user)
        })
    },

    productOffer: (data, productId) => {
        let offerProduct = data.productoffer
        productOffer = parseInt(offerProduct)


        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(productId) })


            let total = product.Price


            let limit = total * 40 / 100


            let offerPrice = limit * productOffer / 100


            let finelPrice = total - offerPrice


            let price = finelPrice


            let oldPrice = total


            db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: ObjectId(productId) },
                {
                    $set: {
                        Price: price,
                        OldPrice: oldPrice,
                        productOffer: productOffer,
                    }
                })
            resolve()
        })
    },
  
    updateStatus: (details) => {

        let orderId = details.orderId
        let proId = details.proId

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTIONS)
                .updateOne({ _id: ObjectId(proId), 'products.item': ObjectId(orderId) },
                    {
                        $set: {
                            'products.$.trackorder': details.status
                        }
                    }
                ).then((response) => {
                    resolve(response)
                })
        })
    },

    cancelOrder: (details) => {
        let orderId = details.orderId
        let proId = details.proId
        let status = details.status
        let quantity = details.quantity
        return new Promise((resolve, reject) => {
            status = 'canceled'
            db.get().collection(collection.ORDER_COLLECTIONS)
                .updateOne({ _id: ObjectId(orderId), 'products.item': ObjectId(proId) },
                    {
                        $set: {
                            'products.$.trackorder': status
                        }
                    }
                ).then(async (response) => {
                    // await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: ObjectId(proId) },
                    //     {
                    //         $inc: {
                    //             Stock: quantity
                    //         }
                    //     })
                    resolve(response)
                })
        })
    },

    returnRequst: async (details) => {
        let orderId = details.orderId
        let proId = details.proId
        let status = details.status

        let order = await db.get().collection(collection.ORDER_COLLECTIONS).findOne({ 'products.item': ObjectId(proId) })

        console.log(order);
        let quantity = order.products[0].quantity

        return new Promise((resolve, reject) => {
            status = 'Return requsted'
            db.get().collection(collection.ORDER_COLLECTIONS)
                .updateOne({ _id: ObjectId(orderId), 'products.item': ObjectId(proId) },
                    {
                        $set: {
                            'products.$.trackorder': status
                        }
                    }
                ).then(async (response) => {
                    await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: ObjectId(proId) },
                        {
                            $inc: {
                                Stock: quantity
                            }
                        })
                    resolve(response)
                })
        })
    },

    updateStatus1:async (details) => {
        let orderId = details.orderId
        let proId = details.proId
  
        details.status = 'Return Aproved'


        let order = await db.get().collection(collection.ORDER_COLLECTIONS).findOne({ 'products.item': ObjectId(proId) })

        console.log(order);
        let quantity = order.products[0].quantity


        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTIONS)
                .updateOne({ _id: ObjectId(orderId), 'products.item': ObjectId(proId) },
                    {
                        $set: {
                            'products.$.trackorder': details.status
                        }
                    }
                ).then(async (response) => {
                    await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: ObjectId(proId) },
                        {
                            $inc: {
                                Stock: quantity
                            }
                        })
                    resolve(response)
                })
        })
    },
}