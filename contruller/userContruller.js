require('dotenv').config()
const { response } = require('express');
var express = require('express');
const session = require('express-session');
const { Logger, Db } = require('mongodb');
const adminHelpers = require('../helpers/adminHelpers');
const paymentHelpers = require('../helpers/paymentHelpers');
var router = express.Router();
var productsHelpers = require('../helpers/productsHelpers')
const userHelpers = require('../helpers/userHelpers');

// const client = require('twilio')(
//     process.env.twilio_Account_ID,
//      process.env.twilio_Auth_Token);
var client = require('twilio')('AC75feddde923dee45c88cd0e18980b66b', '95e0d7d6753e88a28495660876c37d4a');

const paypal = require('paypal-rest-sdk');
const dashBordHelpers = require('../helpers/dashBordHelpers');
const categoryHelpers = require('../helpers/categoryHelpers');
const couppenHelpers = require('../helpers/couppenHelpers');
const { log } = require('handlebars');
const referralCodes = require('referral-codes');
const waletHelpers = require('../helpers/waletHelpers');

paypal.configure({
    'mode': 'sandbox',
    'client_id': process.env.paypal_client_id,
    'client_secret': process.env.paypal_client_secret
}),


    module.exports.index2 = async (req, res, next) => {
        if (req.session.user) {
            let user = req.session.user
            let banner = await adminHelpers.getBanner()
            let cartCount = await userHelpers.getCartCount(req.session.user._id)
            let mens = await categoryHelpers.mensCategory()
            let womens = await categoryHelpers.womensCategory()
            let kids = await categoryHelpers.kidsCategory()
            productsHelpers.getAllproducts().then((products) => {
                res.render('user/index-2', { products, user, cartCount, banner, mens, womens, kids })
            })
        } else {
            let banner = await adminHelpers.getBanner()
            productsHelpers.getAllproducts().then((products) => {
                res.render('user/index-2', { products, banner })
            })
        }
    },

    module.exports.mens = async (req, res, next) => {
        let mens = await categoryHelpers.mensCategory()
        let user = req.session.user
        let cartCount = await userHelpers.getCartCount(req.session.user._id)

        let category1 = req.params.name
        let page = {}
        page.total = await productsHelpers.getCountProducts()
        page.perpage = 3
        page.pages = Math.ceil(page.total / page.perpage)
        page.pageno = (req.query.page == null) ? 1 : parseInt(req.query.page)
        page.startFrom = (page.pageno - 1) * page.perpage
        let pro = await productsHelpers.productHelpers(page)
        let member = req.session.user;


        res.render('user/mensProducts', { pro, category1, page, mens, cartCount, user })
    },

    module.exports.womens = async (req, res, next) => {
        let womens = await categoryHelpers.womensCategory()
        let user = req.session.user
        let cartCount = await userHelpers.getCartCount(req.session.user._id)

        let category1 = req.params.name
        let page = {}
        page.total = await productsHelpers.getCountProducts()
        page.perpage = 3
        page.pages = Math.ceil(page.total / page.perpage)
        page.pageno = (req.query.page == null) ? 1 : parseInt(req.query.page)
        page.startFrom = (page.pageno - 1) * page.perpage
        let pro = await productsHelpers.productHelperswomen(page)
        let member = req.session.user;

        res.render('user/womensProducts', { pro, category1, page, womens, user, cartCount })

    },
    module.exports.kids = async (req, res, next) => {
        let kids = await categoryHelpers.kidsCategory()
        let user = req.session.user
        let cartCount = await userHelpers.getCartCount(req.session.user._id)

        let category1 = req.params.name
        let page = {}
        page.total = await productsHelpers.getCountProducts()
        page.perpage = 3
        page.pages = Math.ceil(page.total / page.perpage)
        page.pageno = (req.query.page == null) ? 1 : parseInt(req.query.page)
        page.startFrom = (page.pageno - 1) * page.perpage
        let pro = await productsHelpers.productHelpers(page)
        let member = req.session.user;
        // res.render('user/productsList', { pro, category1, page, products, cartCount, user })
        res.render('user/kidsProducts', { pro, category1, page, kids, cartCount, user })
    },
    module.exports.zoom = (req, res, next) => {
        let id = req.params.id
        productsHelpers.getShowImage(id).then(async (products) => {
            let user = req.session.user
            let cartCount = await userHelpers.getCartCount(req.session.user._id)
            res.render('user/productZoom', { products, cartCount, user })
        })

    }, module.exports.login = (req, res, next) => {
        if (req.session.logedIn) {
            res.redirect('/')
        } else {
            res.render('user/userLogin', { "loginErr": req.session.loginErr, login: true })
            req.session.loginErr = false
        }
    },
    module.exports.register = (req, res, next) => {
        res.render('user/userRegister', { login: true })
    },
    module.exports.registerPost = (req, res, next) => {
        userHelpers.doSignup(req.body).then((response) => {
            res.redirect('/login')
        })
    },
    module.exports.loginPost = (req, res, next) => {
        userHelpers.doLogin(req.body).then((response) => {

            if (response.status) {
                req.session.logedIn = true
                req.session.user = response.user

                res.redirect('/')
            } else {
                req.session.loginErr = true
                res.redirect('/login')
            }
        })
    },
    module.exports.otpLogin = (req, res, next) => {
        res.render('user/userOtpLogin')
    },
    module.exports.sendCode = (req, res, next) => {
        res.render('user/sendcode')
    },
    module.exports.sendCodePost = (req, res) => {
        userHelpers.otpPhone(req.body).then((response) => {
            console.log(response);
            console.log('1111111111111111111111111');
            if (response.status) {
                req.session.logedIn = true
                req.session.user = response.user
                let phonenumber = req.body.phonenumber
                console.log(phonenumber);
                console.log('5555555555555555555555');
                client.verify
                    .services('95e0d7d6753e88a28495660876c37d4a')
                    .verifications.create({
                        to: `+91${phonenumber}`,
                        channel: "sms",
                    })
                    .then((data) => {

                        res.redirect('/sendcode')
                    });
            } else {
                res.redirect('/otpLogin')

            }
        })
    },
    module.exports.otpVerify = (req, res) => {
        let code = req.body.code1 + req.body.code2 + req.body.code3 + req.body.code4 + req.body.code5 + req.body.code6
        console.log(code);
        client.verify
            .services('VA3d11c88f199ec6adb2220f590fa751a5') // Change service ID
            .verificationChecks.create({
                to: `+91${phonenumber}`,
                code: code,
            })
            .then((data) => {
                if (data.status === "approved") {
                    res.redirect('/')
                } else {
                    res.status(400).send({
                        message: "User is not Verified!!",
                        data,
                    });
                }
            });
    },
    module.exports.productsList = (req, res, next) => {
        productsHelpers.getAllproducts().then(async (products) => {
            let cartCount = await userHelpers.getCartCount(req.session.user._id)
            let user = req.session.user._id
            let category1 = req.params.name
            console.log(category1);

            let page = {}
            page.total = await productsHelpers.getCountProducts()
            console.log("LLL+++++++++++++");
            console.log(page.total);
            page.perpage = 3
            page.pages = Math.ceil(page.total / page.perpage)
            page.pageno = (req.query.page == null) ? 1 : parseInt(req.query.page)
            page.startFrom = (page.pageno - 1) * page.perpage
            let pro = await productsHelpers.productHelpers(page)
            let member = req.session.user;
            console.log("???????");
            console.log(page);
            res.render('user/productsList', { pro, category1, page, products, cartCount, user })
        })
    },
    module.exports.viewCart = async (req, res, next) => {

        let products = await userHelpers.getCartProducts(req.session.user._id)
        let total = await userHelpers.getTotalAmount(req.session.user._id)
        let cartCount = await userHelpers.getCartCount(req.session.user._id)
        let user = req.session.user._id
        res.render('user/cart', { products, user, total, cartCount })

    },
    module.exports.addCart = (req, res, next) => {

        let params = req.params.id
        let userId = req.session.user._id
        userHelpers.addToCart(params, userId).then((response) => {
            res.json({ status: true })

        })
    },
    module.exports.ChageProductQuantity = (req, res, next) => {

        userHelpers.chageProductQuantity(req.body).then(async (response) => {
            response.total = await userHelpers.getTotalAmount(req.body.user)
            res.json(response)
        })
    }, module.exports.removeProduct = (req, res, next) => {
        userHelpers.deleteCartProducts(req.body).then((response) => {
            res.redirect('/remove-Product-Cart')
        })
    },
    module.exports.GetCouponCode = async (req, res, next) => {
        let coupon = await couppenHelpers.getCoupon2(req.params.id)
        res.json(coupon)
    },
    module.exports.CheckCouponCode = async (req, res, next) => {
        let check = await couppenHelpers.checkCoupon(req.body)
        res.json(check)
    },
    module.exports.PlaceOrder = async (req, res, next) => {
        let address = await userHelpers.getAddress(req.session.user._id)
        let total = await userHelpers.getTotalAmount(req.session.user._id)
        let cart = await userHelpers.getAllproductsList(req.session.user._id)
        let coupon = await couppenHelpers.getCoupon()


        if (cart != null) {
            res.render('user/placeOrder', { total, user: req.session.user, address, coupon })
        } else {
            res.redirect('/viewCart')
        }
    },
    module.exports.peymantMethode = async (req, res, net) => {

        let product = await userHelpers.getAllproductsList(req.body.userId)
        if (req.body.newTotal > 1) {
            totalPrice = req.body.newTotal
        } else {
            totalPrice = await userHelpers.getTotalAmount(req.session.user._id)

        }

        userHelpers.placeOrder(req.body, product, totalPrice,).then((orderId) => {

            if (req.body.paymentMethod === 'COD') {

                let response = { paymentMethod: 'COD' }

                res.json(response)


            } else if (req.body.paymentMethod === 'RazorPay') {
                paymentHelpers.genarateRazoepay(orderId, totalPrice).then((data) => {

                    let response = {
                        paymentMethod: 'RazorPay',
                        RazorPayDetils: data
                    }
                    res.json(response)
                })

            } else if (req.body.paymentMethod === 'PayPal') {
                paymentHelpers.genaratePaypal(orderId, totalPrice).then((data) => {

                    let response = {
                        paymentMethod: 'PayPal',
                        PayPalDetils: data
                    }
                    res.json(response)
                })
            }

        })

    },
    module.exports.VerifyPaymentRazorpzy = (req, res, next) => {

        paymentHelpers.paymentVerify(req.body).then(() => {
            paymentHelpers.chagePaymentStatus(req.body['order[receipt]']).then(() => {
                console.log('payment successful');
                res.json({ status: true })
            }).catch((err) => {
                console.log(err);
                res.json({ status: false, errMsg: '' })
            })
        })
    },
    module.exports.verifyPaymentpaypala = (req, res) => {
        console.log(req.params.id);
        console.log('id vannoooo?');
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": '25.00'
                }
            }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                console.log('hello mandan aslam');
                console.log(error.response);
                throw error;
            } else {

                // console.log(JSON.stringify(payment));

                paymentHelpers.chagePaymentStatus1(req.params.id).then((response) => {
                    console.log('hello mandan aslam tahlakh dfishgfgfh');
                    res.redirect('/orderSuccess')

                })
            }
        });
    },
    module.exports.OrderSuccess = (req, res, next) => {
        res.render('user/orderSuccess',)
    },
    module.exports.Dashboard = async (req, res, next) => {
        let orders = await userHelpers.getUserOrder(req.session.user._id)
        console.log(orders);

        res.render('user/dashboard', { user: req.session.user, orders, })
    },
    module.exports.ViewOrderProducts = async (req, res, next) => {
        let products = await userHelpers.getOrderProducts(req.params.id)
        let orders = await userHelpers.getUserOrder(req.session.user._id)
        res.render('user/viewOrderProducts', { products, orders })
    },
    module.exports.OrderCancle = (req, res, next) => {
        console.log(req.body);
        console.log('body222222222222222222222222222222222');
        userHelpers.orderCancle(req.body).then(() => {
            res.json({ status: true })
        })
    },
    module.exports.AddAddress = (req, res, next) => {
        res.render('user/addAddress', { user: req.session.user._id, })

    },
    module.exports.AddAddresses = (req, res, next) => {
        userHelpers.addAddress(req.body, req.session.user._id).then(() => {
            res.redirect('/placeOrder')
        })
    },
    module.exports.AddressDetails = async (req, res, next) => {
        let address = await userHelpers.getAddress2(req.params.id)
        res.json(address)
    },
    module.exports.Wishlist = async (req, res, next) => {
        let products = await productsHelpers.getWishList(req.session.user._id)
        let cartCount = await userHelpers.getCartCount(req.session.user._id)
        let user = req.session.user._id
        res.render('user/wishlist', { products, user, cartCount })
    },
    module.exports.AddToWishList = (req, res, next) => {
        let params = req.params.id
        let userId = req.session.user._id
        productsHelpers.addWishlist(params, userId).then((data) => {
            res.json({ status: true })
        })
    },
    module.exports.dashbord2 = async (req, res, next) => {
        //address.............
        let address = await dashBordHelpers.getUsserAddress(req.session.user._id)
        //user......................
        let user = await dashBordHelpers.getUser(req.session.user._id)
        //orders..............................
        let orders = await userHelpers.getUserOrder(req.session.user._id)
        //wallet..............................
        let wallet = await waletHelpers.getWalet(req.session.user._id)
        console.log(wallet);
        console.log('****************************************');
        //refral..............................
        let refral = await userHelpers.getRefrralCode(req.session.user._id)
        //userr..............................
        let userr = req.session.user
        //cartcount..............................
        let cartCount = await userHelpers.getCartCount(req.session.user._id)

        res.render('user/dashboard', { address, user, orders, wallet, refral, userr, cartCount })
    },
    module.exports.TrackOrder = (req, res, next) => {
        res.render('user/trackOrder')
    },
    module.exports.Profilechanges = (req, res, next) => {
        let userId = req.session.user._id

        userHelpers.editUSer(req.body, userId).then((response) => {
            res.json(response)
        })
    }, module.exports.Updatepassword = (req, res, next) => {
        let userId = req.session.user._id
        userHelpers.chagePassword(req.body, userId).then((response) => {
            res.json(response)
        })
    },
    module.exports.AccountDelete = (req, res, next) => {
        userHelpers.accountDelete(req.params.id).then((response) => {
            res.render('user/userLogin')
        })
    },
    module.exports.addaddress1 = (req, res, next) => {
        let userId = req.session.user._id
        userHelpers.chageAddress(req.body, userId).then((response) => {
            res.json(response)
        })
    },
    module.exports.DEleteaddress = (req, res, next) => {
        userHelpers.removeAddress(req.params.id).then((response) => {
            res.json(response)
        })
    },
    module.exports.Addaddress1 = (req, res, next) => {
        console.log(req.body);
        userHelpers.addNewAddress(req.body, req.session.user._id).then((response) => {
            res.json(response)
        })

    },
    module.exports.UpdateStatus = async (req, res, next) => {
        console.log(req.body);
        console.log('===================================');
        let proId = await waletHelpers.getWaletAmount(req.body, req.session.user._id).then((response) => {
        })
        adminHelpers.cancelOrder(req.body).then(() => {
            res.json({ status: true })
        })
    },
    module.exports.ReturnProduct = async (req, res, next) => {
        let orders = await userHelpers.getUserOrder(req.session.user._id)
        let product = await userHelpers.orderReturn1(req.params.id)
        res.render('user/returnProduct', { product, orders })
    },
    module.exports.OrderReturn = async (req, res, next) => {
        adminHelpers.returnRequst(req.body).then(() => {
            res.json({ status: true })
        })
    },
    module.exports.SearchSubmit = async (req, res, next) => {
        let products = await userHelpers.searchDetils(req.body)
        res.render('user/searchResult', { products, user: true })
    }