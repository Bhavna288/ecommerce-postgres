const express = require('express');
const masterAdminController = require('../controllers/masteradmin.controller');
const { verifyToken } = require('../middleware/verifyToken')
const router = express.Router();

router.post('/add', masterAdminController.postAddmasterAdmin); // Save data
router.post('/login', masterAdminController.login); //  Login
router.post('/changepassword', verifyToken, masterAdminController.changepassword); //Change password
router.post('/forgot', masterAdminController.forgot); //  Forgot Password
router.post('/reset', masterAdminController.otpverifyandchangepassword); //  Reset Password

module.exports = router;