'use strict';
const API = require('./middleware/apikey');
const userRoutes = require('./routes/user.router');
const countryMasterRoutes = require('./routes/countrymaster.router');
const stateMasterRoutes = require('./routes/statemaster.router');
const cityMasterRoutes = require('./routes/citymaster.router');

module.exports = (app) => {
    app.use('/user', API.validateKey, userRoutes);
    app.use('/countrymaster', API.validateKey, countryMasterRoutes);
    app.use('/statemaster', API.validateKey, stateMasterRoutes);
    app.use('/citymaster', API.validateKey, cityMasterRoutes);
};