require ('dotenv').config()
const { response } = require('express');
var express = require('express');
const session = require('express-session');
const { Logger, Db } = require('mongodb');
const adminHelpers = require('../helpers/adminHelpers');
const paymentHelpers = require('../helpers/paymentHelpers');
var router = express.Router();
var productsHelpers = require('../helpers/productsHelpers')
const userHelpers = require('../helpers/userHelpers');
const client = require("twilio")(process.env.twilio_SID,process.env.twilio_CID);
const paypal = require('paypal-rest-sdk');
const dashBordHelpers = require('../helpers/dashBordHelpers');
const categoryHelpers = require('../helpers/categoryHelpers');
const couppenHelpers = require('../helpers/couppenHelpers');
const { log } = require('handlebars');
const referralCodes = require('referral-codes');
const waletHelpers = require('../helpers/waletHelpers');

paypal.configure({
  'mode': 'sandbox',
  'client_id': 'AT4owDQpEO7Cv00yb2Kd8qwz9Ejnmp18d_f4iaa8tYPwi4Bx4LnPgGY2IJhbcDahF2xwQZp-ziOLGQ1F',
  'client_secret': 'EHmq9ltmiAhvj8EGX_4NBhX8bkW-G6K8eWT08F4aZNnTkj2bC2EP-1stqpvzmwwevzlZkA-kgjKKFH8m'
})
const { index2, mens, womens, kids, zoom, login, register, registerPost, loginPost, otpLogin, sendCode, sendCodePost, otpVerify, productsList, viewCart, addCart, ChageProductQuantity, removeProduct, GetCouponCode, CheckCouponCode, PlaceOrder, placeOrderPost, VerifyPayment, peymantMethode, VerifyPaymentRazorpzy, verifyPaymentpaypala, OrderSuccess, Dashboard, ViewOrderProducts, OrderCancle, AddAddress, AddAddresses, AddressDetails, Wishlist, AddToWishList, dashbord2, TrackOrder, Profilechanges, Updatepassword, AccountDelete, addaddress1, DEleteaddress, Addaddress1, UpdateStatus, SearchSubmit, OrderReturn, ReturnProduct } = require('../contruller/userContruller');


const { placeOrder } = require('../helpers/userHelpers');

const verifyLogin = (req, res, next) => {
  if (req.session.logedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}
let phonenumber





/* GET home page. */
router.get('/', index2);
/* end  home page. */

//get catogorys
router.get('/mens', mens)
router.get('/womens', womens)
router.get('/kids', kids)
//end catogorys

//zoom products
router.get('/productZoom/:id',verifyLogin, zoom)
//end zooming

//page login 
router.get('/login', login);

router.get('/register', register);

router.post('/register', registerPost);

router.post('/login', loginPost)

router.get('/logout', (req, res, next) => {
  req.session.destroy()
  res.redirect('/')
})

//end login

//otp login method
router.get('/otpLogin', otpLogin)

router.get('/sendcode', sendCode)

router.post("/sendcode", sendCodePost);

router.post("/verify", otpVerify);
//end otp login

//start all products
router.get('/productsList', verifyLogin, productsList)
//end all prouducts

//cart
router.get('/viewCart', verifyLogin, viewCart)

router.get('/addToCart/:id', addCart)

router.post('/chageProductQuantity', ChageProductQuantity)
//end caert

// router.get('/delete/:id', (req, res, next) => {
//   userHelpers.deleteCartProducts(req.params.id)
//   res.redirect('/viewCart')
// })

//place order
router.post('/remove-Product-Cart/:id', removeProduct)

router.get('/getCouponCode/:id', verifyLogin, GetCouponCode)

router.post('/checkCouponCode', CheckCouponCode)

router.get('/placeOrder', verifyLogin, PlaceOrder)

router.post('/placeOrder', verifyLogin, peymantMethode)
// end place order

//verifyPayment razorepay
router.post('/verifyPayment', VerifyPaymentRazorpzy)

//verifyPayment paypala
router.get('/success/:id', verifyPaymentpaypala);

router.get('/orderSuccess', OrderSuccess)
//end payment Methord

router.get('/dashboard', verifyLogin, Dashboard)

router.get('/viewOrderProducts/:id', verifyLogin, ViewOrderProducts)

router.post('/orderCancle', OrderCancle)

router.get('/addAddress', verifyLogin, AddAddress)

router.post('/addAddresses', verifyLogin, AddAddresses)

router.get('/get-address-details/:id', verifyLogin, AddressDetails)

router.get('/wishlist', verifyLogin, Wishlist)

router.get('/addToWishList/:id', AddToWishList)

router.get('/dashbord', verifyLogin, dashbord2)

router.get('/trackOrder', TrackOrder)

//edit account..................

router.put('/profilechanges', verifyLogin, Profilechanges)

//edit password..................

router.patch('/updatepassword', verifyLogin, Updatepassword);

//Deacctivate Account.................

router.get('/accountDelete/:id', AccountDelete)

router.post('/addaddress', verifyLogin, addaddress1)

router.delete('/deleteaddress/:id', DEleteaddress)

router.post('/addaddress1', verifyLogin, Addaddress1)

router.post('/updateStatus', verifyLogin, UpdateStatus)

router.get('/returnProduct/:id', verifyLogin, ReturnProduct)

router.post('/orderReturn', verifyLogin, OrderReturn)

router.post('/searchSubmit', SearchSubmit)


module.exports = router