const express = require('express');
const bannerController = require('../controllers/banner.controller');
const { uploadBanner } = require('../middleware/upload');
const router = express.Router();

router.post('/add', uploadBanner, bannerController.addBanner); // save data
router.post('/getalldata', bannerController.getAllBanners); // get all data
router.get('/getbyid/:id', bannerController.getBannerById); // get data by id
router.post('/update', uploadBanner, bannerController.updateBanner); // update data
router.post('/delete', bannerController.deleteBanner); // delete data by id
router.post('/changestatus', bannerController.changeStatus); // change status
module.exports = router;