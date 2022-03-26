const express = require('express');
const countryMasterController = require('../controllers/countrymaster.controller');
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

router.post('/add', countryMasterController.addCountryMaster); // save data
router.post('/addfile', upload.single("file"), countryMasterController.postImportData); // save data
router.post('/getalldata', countryMasterController.getAllCountries); // get all data
router.get('/getbyid/:id', countryMasterController.getCountryMasterById); // get data by id
router.post('/update', countryMasterController.updateCountryMaster); // update data
router.post('/delete', countryMasterController.deleteCountryMaster); // delete data by id
router.post('/changestatus', countryMasterController.changeStatus); // change status
module.exports = router;