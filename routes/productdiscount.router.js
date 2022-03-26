const express = require('express');
const productDiscountController = require('../controllers/productdiscount.controller');
const router = express.Router();

router.post('/add', productDiscountController.addProductDiscount); // save data
router.post('/getalldata', productDiscountController.getAllProductDiscount); // get all data
router.get('/getbyid/:id', productDiscountController.getProductDiscountById); // get data by id
router.post('/update', productDiscountController.updateProductDiscount); // update data
router.post('/delete', productDiscountController.deleteProductDiscount); // delete data by id
router.post('/changestatus', productDiscountController.changeStatus); // change status
module.exports = router;