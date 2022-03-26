const express = require('express');
const userAddressController = require('../controllers/useraddress.controller');
const router = express.Router();

router.post('/add', userAddressController.addUserAddress); // save data
router.post('/getalldata', userAddressController.getAllUserAddress); // get all data
router.get('/getbyid/:id', userAddressController.getUserAddressById); // get data by id
router.get('/getbyuserid/:id', userAddressController.getUserAddressByUserId); // get data by user id
router.get('/getdefaultbyuserid/:id', userAddressController.getDefaultUserAddressByUserId); // get default data by user id
router.post('/update', userAddressController.updateUserAddress); // update data
router.post('/makedefault', userAddressController.changeDefaultAddress); // change default data
router.post('/delete', userAddressController.deleteUserAddress); // delete data by id
router.post('/changestatus', userAddressController.changeStatus); // change status
module.exports = router;