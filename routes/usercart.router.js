const express = require('express');
const userCartController = require('../controllers/usercart.controller');
const router = express.Router();

router.post('/add', userCartController.addUserCart); // save data
router.post('/getalldata', userCartController.getAllUserCart); // get all data
router.get('/getbyid/:id', userCartController.getUserCartById); // get data by id
router.post('/getbyuserid', userCartController.getUserCartByUserId); // get data by user id
router.post('/update', userCartController.updateUserCart); // update data
router.post('/delete', userCartController.deleteUserCart); // delete data by id
router.post('/changestatus', userCartController.changeStatus); // change status
module.exports = router;