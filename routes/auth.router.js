const express = require('express');
const authcontroller = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/verifyToken')
const router = express.Router();


router.post('/login', authcontroller.login); //  Login


module.exports = router;