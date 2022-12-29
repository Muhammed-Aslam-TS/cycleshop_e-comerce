require('dotenv').config()
var express = require('express');
var router = express.Router();
var productsHelpers = require('../helpers/productsHelpers')
const userHelpers = require('../helpers/userHelpers');
const adminHelpers = require('../helpers/adminHelpers');
const couppenHelpers = require('../helpers/couppenHelpers');
const { upload, upload2, upload3 } = require('../public/javascripts/fileUpload');
const { render, response } = require('../app');

const waletHelpers = require('../helpers/waletHelpers');
const { Admin } = require('mongodb');
const { index, AdminDashbord, SalesReport, adminDashbordPost, User, products, productsDelete, productsEdit, productsEditPost, AddProduct, addProductPost, AllUser, blockUser, unblockUser, CatogoryList, AddCategory, addCategoryPost, DeleteCatogory, CatogoryEdit, OrderStatus, UserOrderStatus, ViewBanner, AddBanner, addBannerPost, BanerEdit, UserDetils, BannerDelete, ProductOffer, CategoryOffer, productOfferPost, AddCouppen, CouponList, OrderProduct, updateStatus, addCouppenPost, ReturnStatus, AddBannerPost, Banner, BannerAdd, CateegoryPost } = require('../contruller/adminContruller');




const admin = {
  Email: 'tzme.aslam@gmail.com',
  password: '123'
}



router.get('/', index)

router.post('/adminDashbord', AdminDashbord)

router.get('/salesReport', SalesReport)

/* GET users listing. */
router.get('/adminDashbord', adminDashbordPost);

router.get('/user', User)

//Get Products 
router.get('/Products', products)

router.get('/delete/:id', productsDelete)

router.get('/edit/:id', productsEdit)

router.post('/edit/:id', upload.array("Image"), productsEditPost)

//add products

router.get('/addProduct', AddProduct)

router.post('/addProduct', upload.array("Image"), addProductPost)

router.get('/allUser', AllUser)

router.get('/block', blockUser)

router.get('/unblock', unblockUser)

//Add category
router.get('/catogoryList', CatogoryList)

router.get('/addCategory', AddCategory);

router.post('/addCategory', upload2.any('Images'), CateegoryPost)

router.delete('/deleteCatogory/:id', (req, res, next) => {
  console.log(req.params.id);
  console.log('00000000000000000000000000000');
  adminHelpers.catogoryDelete(req.params.id).then((deleteBanner) => {
    res.redirect('/admin/catogoryList')
  })
})

router.get('/catogoryEdit/:id', CatogoryEdit)

router.get('/orderStatus', OrderStatus)

router.post('/userOrderStatus', UserOrderStatus)

router.get('/viewBanner', ViewBanner)

router.get('/addBanner', AddBanner)

router.post('/addBanner', upload3.any('Images'), BannerAdd)

router.get('/bannerDelete/:id', BannerDelete)

router.get('/banerEdit/:id', BanerEdit)

router.get('/userDetils/:id', UserDetils)

router.get('/productOffer', ProductOffer)

router.post('/productOffer/:id', productOfferPost)

// router.post('/admin/productOffer/:id', (req, res, next) => {
//   console.log(req.params.id);
//   console.log('id vannu...................');
//   res.redirect('/admin/productOffer')
// })

router.get('/categoryOffer', CategoryOffer)

router.get('/addCouppen', AddCouppen)

router.post('/addCouppen', addCouppenPost)

// router.get('/couponList', (req, res, next) => {
//   couppenHelpers.getCoupon().then((coupon) => {
//     res.render('admin/couponList', { admin: true, coupon })
//   })
// })
router.get('/couponList', CouponList)

router.get('/orderProduct/:id', OrderProduct)

router.post('/update-status', updateStatus)

router.post('/returnStatus', ReturnStatus)





module.exports = router;













// const itemsPerPage = 10;

// app.get('/items',async (req, res) => {
//   const page = req.query.page || 1;
//   const offset = (page - 1) * itemsPerPage;
//   const limit = itemsPerPage;

//   // Retrieve the appropriate items from the database
//   const items = await collection.find().skip(offset).limit(limit).toArray();

//   // Render the items to the user
//   res.render('items', { items });
// });
