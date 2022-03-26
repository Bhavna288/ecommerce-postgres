const express = require('express');
const cityMasterController = require('../controllers/citymaster.controller');
const router = express.Router();

const multer = require("multer");
const bodyParser = require("body-parser");
router.use(bodyParser.json());

//file Upload setting
const PATH = "./uploads";
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PATH);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

let upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 1024 * 1024 },
});
router.post('/add', cityMasterController.addCityMaster); // save data
router.post('/addfile', upload.single("file"), cityMasterController.postImportData); // save data
router.post('/getalldata', cityMasterController.getAllCities); // get all data
router.get('/getbyid/:id', cityMasterController.getCityMasterById); // get data by id
router.get('/getbystateid/:id', cityMasterController.getCityMasterByStateId); // get data by state id
router.post('/update', cityMasterController.updateCityMaster); // update data
router.post('/delete', cityMasterController.deleteCityMaster); // delete data by id
router.post('/changestatus', cityMasterController.changeStatus); // change status
module.exports = router;