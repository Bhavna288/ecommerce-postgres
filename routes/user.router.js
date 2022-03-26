const express = require('express');
const userController = require('../controllers/user.controller');
const router = express.Router();

router.post('/add', userController.addUser); // save data
router.post('/getalldata', userController.getAllUsers); // get all data
router.get('/getbyid/:id', userController.getUserById); // get data by id
router.post('/update', userController.updateUser); // update data
router.post('/delete', userController.deleteUser); // delete data by id
router.post('/changestatus', userController.changeStatus); // change status
module.exports = router;