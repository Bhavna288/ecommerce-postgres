const multer = require('multer')
var mkdirp = require('mkdirp');
const mime = require('mime-types')

const ProductImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        upload_path = "./uploads/product/images";
        mkdirp(upload_path).then(made =>
            cb(null, upload_path)
        ).catch(err => console.error(err));
    },
    filename: (req, file, cb) => {
        console.log(file.mimetype);
        cb(null, file.fieldname + '_' + Date.now() + '.' + mime.extension(file.mimetype));
    }

})

const imageFilter = (req, file, cb) => {
    if (
        file.mimetype.includes("jpg") ||
        file.mimetype.includes("jpeg") ||
        file.mimetype.includes("png")
    ) {
        cb(null, true);
    } else {
        cb("Please upload only jpg, jpeg or png file.", false);
    }
};

const uploadProductImage = multer({
    storage: ProductImageStorage,
    fileFilter: imageFilter
}).array('images', 10);

const ProductCategoryIconStorayge = multer.diskStorage({
    destination: function (req, file, cb) {
        upload_path = "./uploads/productcategory/icon";
        mkdirp(upload_path).then(made =>
            cb(null, upload_path)
        ).catch(err => console.error(err));
    },
    filename: (req, file, cb) => {
        console.log(file.mimetype);
        cb(null, file.fieldname + '_' + Date.now() + '.' + mime.extension(file.mimetype));
    }

})

const iconFilter = (req, file, cb) => {
    if (
        file.mimetype.includes("jpg") ||
        file.mimetype.includes("jpeg") ||
        file.mimetype.includes("png")
    ) {
        cb(null, true);
    } else {
        cb("Please upload only jpg, jpeg or png file.", false);
    }
};

const uploadProductCategoryIcon = multer({
    storage: ProductCategoryIconStorayge,
    fileFilter: iconFilter
}).single('categoryIcon');


const BannerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        upload_path = "./uploads/banner/";
        mkdirp(upload_path).then(made =>
            cb(null, upload_path)
        ).catch(err => console.error(err));
    },
    filename: (req, file, cb) => {
        console.log(file.mimetype);
        cb(null, file.fieldname + '_' + Date.now() + '.' + mime.extension(file.mimetype));
    }

})

const uploadBanner = multer({
    storage: BannerStorage,
    fileFilter: imageFilter
}).single('bannerImage');

const excelFilter = (req, file, cb) => {
    if (
        file.mimetype.includes("excel") ||
        file.mimetype.includes("spreadsheetml")
    ) {
        cb(null, true);
    } else {
        cb("Please upload only excel file.", false);
    }
};

const ProductExcelStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        upload_path = "./uploads/product/excel/";
        // mkdirp(upload_path, function (err) {
        //     if (err) console.error(err)
        //     else {
        //         //setting destination.
        cb(null, upload_path);
        //     }
        // });
    },
    filename: (req, file, cb) => {
        console.log(file.mimetype);
        cb(null, `${Date.now()}-productdata-${file.originalname}`);
    }

})

const uploadProductfile = multer({
    storage: ProductExcelStorage,
    fileFilter: excelFilter
}).single('products');

module.exports = { uploadProductImage, uploadProductCategoryIcon, uploadBanner, uploadProductfile };