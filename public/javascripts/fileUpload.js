const multer = require('multer')



// handle storage using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/productMulterImage')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
});
const upload = multer({ storage: storage });





const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/categoryImages')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
});
const upload2 = multer({ storage: storage2 });




const storage3 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/bannerImages')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
});
const upload3 = multer({ storage: storage3 });


module.exports = {
    upload,
    upload2,
    upload3
};