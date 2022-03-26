const express = require('express');
const stateMasterController = require('../controllers/statemaster.controller');
const router = express.Router();

router.post('/add', stateMasterController.addStateMaster); // save data
router.post('/getalldata', stateMasterController.getAllStates); // get all data
router.get('/getbyid/:id', stateMasterController.getStateMasterById); // get data by id
router.get('/getbycountryid/:id', stateMasterController.getStateMasterByCountryId); // get data by country id
router.post('/update', stateMasterController.updateStateMaster); // update data
router.post('/delete', stateMasterController.deleteStateMaster); // delete data by id
router.post('/changestatus', stateMasterController.changeStatus); // change status
module.exports = router;