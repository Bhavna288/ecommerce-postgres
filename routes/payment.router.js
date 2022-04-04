const express = require('express');
const paymentController = require('../controllers/payment.controller');
const router = express.Router();

// router.post('/add', paymentController.addPayment); // save data
router.post('/getalldata', paymentController.getAllPayment); // get all data
router.get('/getbyid/:id', paymentController.getPaymentById); // get data by id
router.get('/getbyorderid/:id', paymentController.getPaymentByOrderId); // get data by user id
router.post('/changestatus', paymentController.changeStatus); // change status
module.exports = router;