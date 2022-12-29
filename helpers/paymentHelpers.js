require('dotenv').config()
const db = require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');

const paypal = require('paypal-rest-sdk')
const Razorpay = require('razorpay');
const { response } = require('../app');

var instance = new Razorpay({
    key_id: process.env.Razorpay_key_id,
    key_secret: process.env.Razorpay_key_secret,
});


paypal.configure({
    'mode': 'sandbox',
    'client_id': process.env.paypal_client_id,
    'client_secret': process.env.paypal_client_secret
})

module.exports = {
    genarateRazoepay: (orderId, total) => {
        console.log(orderId)
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId.toString()
            }
            console.log(options.receipt);
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log('---------order err---------------');
                    console.log(err);
                } else {

                    resolve(order)
                }

            })


        })

    },

    paymentVerify: (data) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'oCQqhHlOcp6NwLDORHA2CERF')
            hmac.update(data['payment[razorpay_order_id]'] + '|' + data['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac === data['payment[razorpay_signature]']) {
                resolve()

            } else {
                reject()
            }
        })

    },




    genaratePaypal: (orderId, total) => {
        console.log(orderId)
        return new Promise((resolve, reject) => {
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/success/" + orderId,
                    "cancel_url": "http://localhost:3000/cancel/"
                },
                "transactions": [{
                    // "item_list": {
                    //     "items": [{
                    //         "name": "Red Sox Hat",
                    //         "sku": "001",
                    //         "price": "5.00",
                    //         "currency": "USD",
                    //         "quantity": 1
                    //     }]
                    // },
                    'amount': {
                        'currency': "USD",
                        'total': total
                    },
                    "description": "Hat for the best team ever"
                }]
            };



            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === 'approval_url') {
                            let link = payment.links[i].href
                            resolve(link)
                        }
                    }
                }
            });

        })





    },
    chagePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTIONS)
                .updateOne({ _id: ObjectId(orderId) },
                    {
                        $set: {
                            status: orderId.status = 'placed'
                        }
                    }).then(() => {
                        resolve(response)


                    })
        })
    },
    chagePaymentStatus1: (data) => {
        return new Promise(async (resolve, reject) => {
            let updateStatus = await db.get().collection(collection.ORDER_COLLECTIONS).updateOne({ _id: ObjectId(data.orderId), userId: ObjectId(data.userId) },
                {
                    $set: { status: data.status }
                }
            )
            resolve(updateStatus)
        })
    },
}






