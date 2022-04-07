const express = require('express');
const availablePincodeController = require('../controllers/availablepincodes.controller');
const router = express.Router();

router.post('/add', availablePincodeController.addAvailablePincodes); // save data
router.post('/bulkadd', availablePincodeController.addPincodeArray); // save bulk data
router.post('/getalldata', availablePincodeController.getAllAvailablePincodes); // get all data
router.get('/getbyid/:id', availablePincodeController.getAvailablePincodesById); // get data by id
router.post('/checkpincode', availablePincodeController.checkPincode); // check for valid pincode
router.post('/update', availablePincodeController.updateAvailablePincodes); // update data
router.post('/delete', availablePincodeController.deleteAvailablePincodes); // delete data by id
router.post('/changestatus', availablePincodeController.changeStatus); // change status
module.exports = router;