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
const chartHelper = require('../helpers/chartHelper')
const sharp = require('sharp');




const admin = {
    Email: 'tzme.aslam@gmail.com',
    password: '123'
}


module.exports.index = (req, res, next) => {
    if (req.session.body) {
        res.render('/admin')
    } else {
        res.render('admin/adminLogin', { "loginErr": req.session.loginErr, login: true })
        req.session.loginErr = false
    }
},
    module.exports.AdminDashbord = (req, res, next) => {
        if (req.body.Email == admin.Email && req.body.Password == admin.password) {
            req.session.admin = true
            res.redirect('/admin/adminDashbord')
        } else {
            req.session.loginErr = true
            res.redirect('/admin')
        }
    },


    module.exports.SalesReport = async (req, res, next) => {
        let dailySailsReport = await adminHelpers.dailySailsReport()
        let monthlySailsReport = await adminHelpers.monthlySailsReport()
        let yearlySailsReport = await adminHelpers.yearlySailsReport()
        let getDailysalesreportfordownload = await adminHelpers.getDailysalesreportfordownload()
        let getMonthlysalesreportfordownload = await adminHelpers.getDailysalesreportfordownload()
        let getYearlysalesreportfordownload = await adminHelpers.getDailysalesreportfordownload()

        res.render('admin/salesReport', {
            admin: true,
            dailySailsReport,
            monthlySailsReport,
            yearlySailsReport,
            getDailysalesreportfordownload,
            getMonthlysalesreportfordownload,
            getYearlysalesreportfordownload,
        })
    },
    module.exports.adminDashbordPost = async (req, res, next) => {
        // let dailySailsReport = await adminHelpers.dailySailsReport()
        // let monthlySailsReport = await adminHelpers.monthlySailsReport()
        // let yearlySailsReport = await adminHelpers.yearlySailsReport()
        // let getDailysalesreportfordownload = await adminHelpers.getDailysalesreportfordownload()
        // let getMonthlysalesreportfordownload = await adminHelpers.getDailysalesreportfordownload()
        // let getYearlysalesreportfordownload = await adminHelpers.getDailysalesreportfordownload()

       // let cod = await chartHelper.totalCodSales()
  
     
        let razorpay = await chartHelper.totalRazorpaySales()
        let paypal = await chartHelper.totalPaypalSales()
       // let totalRevenue = cod[0].CodTotal + razorpay[0].razorpayTotal + paypal[0].paypalTotal

        let getTotalSalesGraph = await chartHelper.getTotalSalesGraph()
        let dailySalesReport = await chartHelper.getDailySalesReport()
        let monthlySalesReport = await chartHelper.getMonthlySalesReport()
        let yearlySalesReport = await chartHelper.getYearlySalesReport()

        res.render('admin/adminDashbord', {
            admin: true, razorpay, paypal, dailySalesReport,
            monthlySalesReport, yearlySalesReport, getTotalSalesGraph
        });


        // res.render('admin/adminDashbord', {
        //     admin: true, dailySailsReport, monthlySailsReport, yearlySailsReport,
        //     getDailysalesreportfordownload, getMonthlysalesreportfordownload, getYearlysalesreportfordownload
        // })

    },
    module.exports.User = (req, res, next) => {
        res.render('admin/allUsers', { admin: true })
    },
    module.exports.products =  (req, res, next) => {
        productsHelpers.getAllproducts().then(async(products) => {

            // const page = req.query.page || 1;
            // const offset = (page - 1) * itemsPerPage;
            // const limit = itemsPerPage;

            // Retrieve the appropriate items from the database
            //const items = await collection.find().skip(offset).limit(limit).toArray();

            // Render the items to the user
            // res.render('items', { items });

             res.render('admin/productList', { products, admin: true })
        })
    },
    module.exports.productsDelete = (req, res, next) => {
        adminHelpers.deleetProducts(req.params.id).then((deleet) => {
            res.redirect('/admin/products')
        })
    },
    module.exports.productsEdit = async (req, res, netx) => {
        let id = req.params.id
        let product = await productsHelpers.getProductDetails(id)
        let category = await productsHelpers.getAllcategory()
        res.render('admin/editProducts', { admin: true, product, category })
    },
    module.exports.productsEditPost = (req, res, next) => {
        let id = req.params.id
        Imagefiles = req.files
        ImageFileName = Imagefiles.map((images) => {
            return images.filename
        })
        const product = req.body
        req.body.img = ImageFileName
        adminHelpers.editProducts(id, product).then(() => {
            res.redirect('/admin/Products')
        })
    },
    module.exports.AddProduct = (req, res, next) => {
        productsHelpers.getAllcategory().then((categoryName) => {
            
            res.render('admin/addProduct', { admin: true, categoryName })
        })
    },
    module.exports.addProductPost = (req, res, next) => {
        Imagefiles = req.files
        ImageFileName = Imagefiles.map((images) => {
            return images.filename
        })
        sharp('input.jpg')
        .extract({ left: 0, top: 0, width: 100, height: 100 })
        .toFile('output.jpg', (err, info) => {
          // output.jpg is a 100x100 version of input.jpg
        });

        req.body.img = ImageFileName
        productsHelpers.addProduct(req.body, (id) => {
            res.redirect('/admin/Products')
        })
    }, module.exports.AllUser = (req, res, next) => {
        userHelpers.getAllusers().then((user) => {
            res.render('admin/userList', { user, admin: true })
        })
    },
    module.exports.blockUser = (req, res, next) => {
        adminHelpers.blocUser(req.query.id).then((bolck) => {
            res.redirect('/admin/allUser')
        })
    },
    module.exports.unblockUser = (req, res, next) => {
        adminHelpers.unblocUser(req.query.id).then((unblock) => {
            res.redirect('/admin/allUser')
        })
    }, module.exports.CatogoryList = (req, res, next) => {
        adminHelpers.getcatogery().then((getcatogery) => {
            res.render('admin/catogoryList', { admin: true, getcatogery })
        })
    },
    module.exports.AddCategory = function (req, res, next) {
        // router.get('/allCoupon', (req, res, next) => {
        //     let coupon = couppenHelpers.getAllcoupon()
        //     res.render('user/couponList', { coupon })
        // })
        res.render('admin/addCategory', { admin: true })
    },
    module.exports.CateegoryPost = (req, res, next) => {
        let category = req.body
        category.img = req.files[0].filename
        productsHelpers.addCategory(category).then(() => {
            res.redirect('/admin/addCategory')
        })
    },
    // module.exports.DeleteCatogory = (req, res, next) => {
    //     console.log(req.params.id);
    //     console.log('00000000000000000000000000000');
    //     adminHelpers.catogoryDelete(req.params.id).then((deleteBanner) => {
    //         res.redirect('/admin/catogoryList')
    //     })
    // },
    module.exports.CatogoryEdit = (req, res, next) => {
        adminHelpers.editBanner(req.params.id).then((bannrtEdit) => {
            res.redirect('/admin/editCategory')
        })
    },
    module.exports.OrderStatus = async (req, res, next) => {
        let orders = await adminHelpers.getUserOrder()
        let user = await userHelpers.getAllusers()
        res.render('admin/orderStatus', { admin: true, orders, user })
    },
    module.exports.UserOrderStatus = (req, res, next) => {
        adminHelpers.userOrderStatus(req.body).then(() => {
            res.json({ status: true })
        })
    },
    module.exports.ViewBanner = (req, res, next) => {
        adminHelpers.getBanner().then((banner) => {
            res.render('admin/viewBanner', { admin: true, banner })
        })
    },
    module.exports.AddBanner = (req, res, next) => {
        res.render('admin/addBanner', { admin: true })
    },
    module.exports.BannerAdd = (req, res, next) => {
        let banner = req.body
        banner.Img = req.files[0].filename
        adminHelpers.addBanner(banner).then(() => {
            res.redirect('/admin/viewBanner')
        })
    },
    module.exports.BannerDelete = (req, res, next) => {
        ;
        adminHelpers.bannerDelete(req.params.id).then((deleteBanner) => {
            res.redirect('/admin/viewBanner')
        })
    },
    module.exports.BanerEdit = (req, res, next) => {
        adminHelpers.editBanner(req.params.id).then((bannrtEdit) => {
            res.redirect('/admin/addBanner')
        })
    },
    module.exports.UserDetils = async (req, res, next) => {
        let user = await adminHelpers.userOrder(req.params.id)
        res.render('admin/userDetils', { user, admin: true })
    },
    module.exports.ProductOffer = async (req, res, next) => {
        let products = await productsHelpers.getAllproducts()
        res.render('admin/productOffer', { admin: true, products })
    },
    module.exports.productOfferPost = async (req, res, next) => {
        adminHelpers.productOffer(req.body, req.params.id)
        res.redirect('/admin/productOffer')
    },
    module.exports.CategoryOffer = (req, res, next) => {
        res.render('admin/categoryOffer', { admin: true, })
    },
    module.exports.AddCouppen = (req, res, next) => {
        res.render('admin/addCoupen', { admin: true })
    },
    module.exports.addCouppenPost = (req, res, next) => {
        couppenHelpers.addCoupon(req.body).then(() => {
            res.redirect('/admin/addCouppen')
        })
    },
    module.exports.CouponList = (req, res, next) => {
        couppenHelpers.getCoupon().then((coupon) => {
            res.render('admin/couponList', { admin: true, coupon })
        })
    },
    module.exports.OrderProduct = async (req, res, next) => {
        let orders = await adminHelpers.getUserOrder()
        let user = await userHelpers.getAllusers()
        let products = await userHelpers.getOrderProducts(req.params.id)
        res.render('admin/orderProduct', { admin: true, orders, user, products })
    },
    module.exports.updateStatus = (req, res, next) => {
        adminHelpers.updateStatus(req.body).then(() => {
            res.json({ status: true })
        })
    },
    module.exports.ReturnStatus = (req, res, next) => {

        waletHelpers.returnProuductAmount(req.body).then(() => {
        })
        adminHelpers.updateStatus1(req.body).then(() => {
            res.json({ status: true })
        })
    }
