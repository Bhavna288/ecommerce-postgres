const express = require('express');
const userWishlistController = require('../controllers/userwishlist.controller');
const router = express.Router();

router.post('/add', userWishlistController.addUserWishlist); // save data
router.post('/getalldata', userWishlistController.getAllUserWishlist); // get all data
router.get('/getbyid/:id', userWishlistController.getUserWishlistById); // get data by id
router.post('/getbyuserid', userWishlistController.getUserWishlistByUserId); // get data by user id
router.post('/update', userWishlistController.updateUserWishlist); // update data
router.post('/delete', userWishlistController.deleteUserWishlist); // delete data by id
router.post('/changestatus', userWishlistController.changeStatus); // change status
module.exports = router;