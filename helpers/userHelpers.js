require('dotenv').config()
const db = require('../config/connection')
var collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { use, response } = require('../app');
const { ObjectId } = require('mongodb');
const referralCodes = require('referral-codes');
const { log } = require('handlebars');
const { blocUser } = require('./adminHelpers');

module.exports = {

    doSignup: (userData) => {

        var date = new Date()
        var month = date.getUTCMonth() + 1;
        var day = date.getUTCDate()
        var year = date.getUTCFullYear()
        userData.date = date


        return new Promise(async (resolve, reject) => {

            if (userData.Referral.length > 0) {
                let referral = await db.get().collection(collection.USER_COLLECTION).findOne({ Referral: userData.Referral })

                if (referral) {
                    let referralUser = await db.get().collection(collection.WALET_COLLECTION).findOne({ user: ObjectId(referral._id) })

                    let balance = referralUser.balance + 100
                    let transactions = {
                        credit: 100,
                        debit: 0,
                        date: userData.date,
                        message: "Referral Bonus"
                    }
                    let userUpdate = await db.get().collection(collection.WALET_COLLECTION).updateOne({ user: ObjectId(referral._id) },
                        {
                            $set: {
                                balance: balance
                            },

                            $push: {
                                transactions: transactions
                            }

                        })

                    Userreferral = referralCodes.generate({
                        prefix: 'promo-',
                        postfix: '-2015',
                    });

                    userData.userReferral = Userreferral[0]
                    userData.Password = await bcrypt.hash(userData.Password, 10)

                    db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async (data) => {
                        let transactions = {
                            credit: 50,
                            debit: 0,
                            date: userData.date,
                            message: "Referral Bonus"
                        }
                        let wallet = {
                            user: data.insertedId,
                            balance: 50,
                            transactions: [transactions],
                        }
                        let wallets = await db.get().collection(collection.WALET_COLLECTION).insertOne(wallet)
                        resolve(data.insertedId)
                    })

                } else {
                    userData.message = "Invalid Reffral"
                    resolve(userData)
                }
            } else {

                Userreferral = referralCodes.generate({
                    prefix: 'promo-',
                    postfix: '-2015',
                });
                userData.Referral = Userreferral[0]
                userData.Password = await bcrypt.hash(userData.Password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async (data) => {

                    let wallet = {
                        user: data.insertedId,
                        balance: 0,
                        transactions: [],

                    }
                    let wallets = await db.get().collection(collection.WALET_COLLECTION).insertOne(wallet)
                    resolve(data.insertedId)
                })
            }

        })
    },

    doLogin: (userData) => {

        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {
                if (!user.userBlocked) {
                    let status = await bcrypt.compare(userData.Password, user.Password)
                    console.log(status);
                    if (status) {
                        console.log(`login success`);
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log(`login false`);
                        response.status = false
                        resolve(response)
                    }
                } else {
                    console.log(`login false`);
                    resolve({ status: false })
                }
            } else {
                console.log(`login false`);
                resolve({ status: false })
            }
        })
    },
    getAllusers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().sort({ date: -1 }).toArray()
            resolve(users)
        })
    },

    otpPhone: (userData) => {

        let response = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Phone: userData.phonenumber })
            if (user) {
                console.log(`login success`);
                response.user = user
                response.status = true
                resolve(response)
            } else {
                console.log(`login false`);
                response.status = false
                resolve(response)
            }
        })
    },
    getUser: (userId) => {
        return new Promise((resolve, reject) => {
            let user = db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)}) 
            resolve(user)
        })
    },
    addToCart: async (productId, userId) => {

        let products = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(productId) })
        let Price = products.Price
        let proObj = {
            item: ObjectId(productId),
            quantity: 1,
            Price: Price,
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == productId)

                if (proExist !== -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: ObjectId(userId), 'products.item': ObjectId(productId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: ObjectId(userId) },
                            {
                                $push: { products: proObj }
                            }
                        ).then((response) => {
                            resolve()
                        })
                }

            } else {
                let cartObj = {
                    user: ObjectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {

            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
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
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },


            ]).toArray()
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })

    },
    chageProductQuantity: (detils) => {
        count = parseInt(detils.count)
        quantity = parseInt(detils.quantity)
        price = parseFloat(detils.Price)

        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: ObjectId(detils.cart) },
                        {
                            $pull: { products: { item: ObjectId(detils.product) } }
                        }

                    ).then((response) => {
                        console.log(response);
                        response.removeProduct = true
                        resolve(response)

                    })

            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({
                        _id: ObjectId(detils.cart),
                        'products.item': ObjectId(detils.product)
                    },
                        {
                            $inc: { 'products.$.quantity': count }

                        }

                    ).then((response) => {
                        resolve({ status: true })
                    })
            }
        })

    },

    deleteCartProducts: (detils) => {

        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: ObjectId(detils.cart) },
                    {
                        $pull: { products: { item: ObjectId(detils.product) } }
                    }
                ).then((response) => {
                    resolve(response)

                })

        })



    },

    getTotalAmount: (userId) => {

        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
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
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },

                {
                    $group: {

                        _id: null,

                        total: {
                            $sum:
                            {
                                $multiply:

                                    ['$quantity', '$product.Price']
                            }
                        }


                    }
                }

            ]).toArray()
            if (total[0]) {
                resolve(total[0].total)
            } else {
                resolve()
            }

        })
    },

    placeOrder: (order, products, totalPrice,) => {

        let proId = products[0].item

        return new Promise(async (resolve, reject) => {

            let status = order.paymentMethod === 'COD' ? 'placed' : 'pending'
            var date = new Date()
            var month = date.getUTCMonth() + 1;
            var day = date.getUTCDate()
            var year = date.getUTCFullYear()

            let address = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ _id: ObjectId(order.addressId) })

            newdate = year + "/" + month + "/" + day;
            let orderOBJ = {
                deliveryDetils: {

                    name: order.name,
                    Lastname: order.Lastname,
                    Streetaddress: order.Streetaddress,
                    Phone: order.Phone,
                    Streetaddress: order.Streetaddress,
                    Postcode: order.Postcode,
                    Email: order.Email,
                    Postcode: order.Postcode


                },

                userId: ObjectId(order.userId),
                paymentMethod: order["paymentMethod"],
                products: products,
                totalPrice: totalPrice,
                newTotal: parseInt(order.newtotal),
                status: status,
                date: newdate,
                time: date,
                month: month,
                year: year,
            }
            products.forEach(element => {
                element.trackorder = 'placed'
            });

            if (order.CouponP)

                products.forEach(element => {
                    element.CouponP = order.CouponP
                });

            products.forEach(element => {
                element.OfferPrice = Math.round(element.Price - parseInt(element.Price) * parseInt(element.CouponP) / 100)
            })

            db.get().collection(collection.ORDER_COLLECTIONS).insertOne(orderOBJ).then((response) => {

                products.forEach(element => {
                    let Stock = (0 - element.quantity)

                    db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: ObjectId(proId) },

                        {
                            $inc: {
                                Stock: Stock
                            }
                        })
                })

                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(order.userId) })

                resolve(response.insertedId)

            })
        })
    },

    getAllproductsList: (userId) => {

        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION)
                .findOne({ user: ObjectId(userId) })
            let products = cart.products

            resolve(products)

        })
    },
    getUserOrder: (userId) => {

        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTIONS)
                .find({ userId: ObjectId(userId) }).sort({ time: -1 }).toArray()
            resolve(orders)
        })
    },
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
                {
                    $match: { _id: ObjectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: 1,
                        userId: 1,
                        paymentMethod: 1,
                        deliveryDetils: 1,
                        totalPrice: 1,
                        status: 1,
                        orderStatus: 1,
                        date: 1,


                        productId: '$products.item',
                        quantity: '$products.quantity',
                        trackorder: '$products.trackorder',
                        OfferPrice: '$products.OfferPrice'

                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: "productId",
                        foreignField: '_id',
                        as: 'product'
                    }
                },

                {
                    $project: {
                        item: 1,
                        userId: 1,
                        paymentMethod: 1,
                        deliveryDetils: 1,
                        totalPrice: 1,
                        status: 1,
                        orderStatus: 1,
                        date: 1,
                        quantity: 1,
                        trackorder: 1,
                        OfferPrice: 1,
                        product: { $arrayElemAt: ['$product', 0] },
                    }
                }

            ]).toArray()

            resolve(orderItems)
        })

    },
    orderCancle: (orderId) => {
        statusz = orderId.status

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTIONS).updateOne({ _id: ObjectId(orderId.user) }, {
                $set: {
                    status: statusz
                }
            }).then(() => {
                resolve()
            })
        })
    },

    addAddress: (address, userId) => {
        console.log(address);

        var date = new Date()
        address.date = date
        return new Promise((resolve, reject) => {
            address.userId = ObjectId(userId)

            db.get().collection(collection.ADDRESS_COLLECTION).insertOne(address).then((address) => {
                resolve(address)

            })
        })
    },
    getAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: ObjectId(userId) }).sort({ date: -1 }).toArray()
            resolve(address)

        })
    },

    getAddress2: (Id) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ _id: ObjectId(Id) })
            resolve(address)
        })

    },

    editUSer: (data, userId) => {

        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).updateOne(
                { _id: ObjectId(userId) },
                {
                    $set:
                    {
                        Name: data.name,
                        Email: data.email,
                        Phone: data.phone,
                    }
                }
            )
            resolve(user)
        })

    },
    chagePassword: (userData, userId) => {

        console.log(userData);

        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
            console.log(user);
            if (user) {
                if (!user.userBlocked) {
                    let status = await bcrypt.compare(userData.password, user.Password)

                    if (status) {
                        userData.password1 = await bcrypt.hash(userData.password1, 10)
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) },
                            {
                                $set: {
                                    Password: userData.password1
                                }
                            })
                        resolve(status)
                        console.log('update success');

                    } else {

                    }
                }
            }
        })
    },
    chageAddress: (data, userId) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.ADDRESS_COLLECTION)
                .updateOne({ userId: ObjectId(userId) },
                    {
                        $set: {
                            name: data.fname,
                            Lastname: data.lname,
                            Streetaddress: data.Streetaddress,
                            text: data.text,
                            Town: data.town,
                            State: data.state,
                            Postcode: data.pincode,
                            Phone: data.phone,
                            Email: data.email
                        }
                    })
            resolve(response)
        })

    },

    removeAddress: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({ _id: ObjectId(userId) })
            resolve(response)
        })
    },
    addNewAddress: (data, userId) => {
        let date = new Date()
        data.date = date
        return new Promise((resolve, reject) => {
            data.userId = ObjectId(userId)
            db.get().collection(collection.ADDRESS_COLLECTION).insertOne(data).then((response) => {
                resolve(response)
            })

        })
    },

    accountDelete: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: ObjectId(userId) })
            resolve()
            console.log('delete your account');
        })

    },
    userProduct: (proId) => {
        console.log(proId);
        return new Promise(async (resolve, reject) => {
            let prouser = await db.get().collection(collection.ORDER_COLLECTIONS).findOne({ _id: ObjectId(proId) }).sort({ date: -1 })
            resolve(prouser)

        })
    },
    orderReturn: (data) => {
        let orderId = data.orderId
        let proId = data.proId
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.ORDER_COLLECTIONS)
                .findOne({ _id: ObjectId(orderId), 'products.item': ObjectId(proId) })
            resolve(product)
        })
    },
    orderReturn1: (ordertId) => {
        console.log(ordertId);
        console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([


                {
                    $match: { _id: ObjectId(ordertId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: 1,
                        userId: 1,
                        paymentMethod: 1,
                        deliveryDetils: 1,
                        totalPrice: 1,
                        status: 1,
                        orderStatus: 1,
                        date: 1,


                        productId: '$products.item',
                        quantity: '$products.quantity',
                        trackorder: '$products.trackorder',
                        OfferPrice: '$products.OfferPrice'

                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: "productId",
                        foreignField: '_id',
                        as: 'product'
                    }
                },

                {
                    $project: {
                        item: 1,
                        userId: 1,
                        paymentMethod: 1,
                        deliveryDetils: 1,
                        totalPrice: 1,
                        status: 1,
                        orderStatus: 1,
                        date: 1,
                        quantity: 1,
                        trackorder: 1,
                        OfferPrice: 1,
                        product: { $arrayElemAt: ['$product', 0] },
                    }
                }
            ]).toArray()
            resolve(product)
        })
    },

    searchDetils: (detils) => {

        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ Name: { $regex: detils.q } }).toArray()

            resolve(products)
        })
    },
    getRefrralCode: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let reffral = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
            resolve(reffral)
        })
    }
}