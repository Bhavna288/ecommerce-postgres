const express = require('express');
const stateMasterController = require('../controllers/statemaster.controller');
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

router.post('/add', stateMasterController.addStateMaster); // save data
router.post('/getalldata', stateMasterController.getAllStates); // get all data
router.post('/addfile', upload.single("file"), stateMasterController.postImportData); // save data
router.get('/getbyid/:id', stateMasterController.getStateMasterById); // get data by id
router.get('/getbycountryid/:id', stateMasterController.getStateMasterByCountryId); // get data by country id
router.post('/update', stateMasterController.updateStateMaster); // update data
router.post('/delete', stateMasterController.deleteStateMaster); // delete data by id
router.post('/changestatus', stateMasterController.changeStatus); // change status
module.exports = router;