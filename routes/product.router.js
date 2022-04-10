const express = require('express');
const productController = require('../controllers/product.controller');
const router = express.Router();
const { uploadProductImage, uploadProductfile } = require('../middleware/upload')

router.post('/add', uploadProductImage, productController.addProduct); // save data
router.post('/addexcel', uploadProductfile, productController.addProductExcel); // save data
router.post('/getalldata', productController.getAllProducts); // get all data
router.get('/getbyid/:id', productController.getProductById); // get data by id
router.get('/getbycategoryid/:id', productController.getProductByCategoryId); // get data by category id
router.get('/getbydiscountid/:id', productController.getProductByDiscountId); // get data by discount id
router.post('/update', uploadProductImage, productController.updateProduct); // update data
router.post('/delete', productController.deleteProduct); // delete data by id
router.post('/changestatus', productController.changeStatus); // change status
module.exports = router;