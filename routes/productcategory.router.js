const express = require('express');
const productCategoryController = require('../controllers/productcategory.controller');
const { uploadProductCategoryIcon } = require('../middleware/upload');
const router = express.Router();

router.post('/add', uploadProductCategoryIcon, productCategoryController.addProductCategory); // save data
router.post('/getalldata', productCategoryController.getAllProductCategories); // get all data
router.get('/getbyid/:id', productCategoryController.getProductCategoryById); // get data by id
router.post('/update', uploadProductCategoryIcon, productCategoryController.updateProductCategory); // update data
router.post('/delete', productCategoryController.deleteProductCategory); // delete data by id
router.post('/changestatus', productCategoryController.changeStatus); // change status
module.exports = router;