const express = require('express');
const orderController = require('../controllers/order.controller');
const router = express.Router();

router.post('/add', orderController.addOrder); // save data
router.post('/getalldata', orderController.getAllOrders); // get all data
router.get('/getbyid/:id', orderController.getOrderById); // get data by id
router.get('/getbyuserid/:id', orderController.getOrderByUserId); // get data by user id
router.post('/getbyrefno', orderController.getOrderByReferenceNumber); // get data by reference number
router.post('/update', orderController.updateOrder); // update data
router.post('/delete', orderController.deleteOrder); // delete data by id
router.post('/changestatus', orderController.changeStatus); // change status
router.post('/updatedeliverystatus', orderController.changeDeliveryStatus); // change delivery status
module.exports = router;