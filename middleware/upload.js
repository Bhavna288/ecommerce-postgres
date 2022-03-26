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
}).single('image');

module.exports = { uploadProductImage };