const logger = require('../config/logger');
const validateKey = (req, res, next) => {
    let myKyey = "2cbc4da1-9acc-4300-b6f6-0731a2465806";
    let api_key = req.header('x-api-key');
    console.log(api_key);
    if (myKyey === api_key) {
        logger.info(`API Key matched`)
        next();
    } else {
        logger.info('API key does not match!');
        const error = new Error('API key does not match!');
        error.statusCode = 401;
        throw error;
    }
};

module.exports = { validateKey };