const Sequelize = require('sequelize');
const logger = require('../config/logger');
const message = require('../response_message/message');
const CountryMaster = require('../models/countryMaster');
const fs = require("fs");

/**
 * insert country data
 * 
 * @body {countryName, countryCode, createByIp} req to add country data
 */
exports.addCountryMaster = async (req, res, next) => {
    try {
        let {
            countryName,
            countryCode,
            createByIp
        } = await req.body;
        let insert_status = await CountryMaster.create({
            countryName,
            countryCode,
            createByIp
        })
        logger.info(`countryMaster data inserted: ${JSON.stringify(req.body)}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.countryadded, data: insert_status });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns all country data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllCountries = async (req, res, next) => {
    try {
        let { limit, page } = await req.body;
        let offset = (page - 1) * limit;
        let country_data = [];
        if (limit == "" && page == "") {
            country_data = await CountryMaster.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                }
            });
        }
        else {
            country_data = await CountryMaster.findAll({
                raw: true,
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                limit: limit,
                offset: offset
            });

        }
        let totalcount = await CountryMaster.count({
            raw: true,
            where: { status: ['0', '1'] },
        });
        logger.info(`countryMaster get data ${JSON.stringify(country_data)} `);
        res.status(200)
            .json({ status: 200, data: country_data, totalcount: totalcount });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns country data by id
 * 
 * @param {id} req to get country data by id
 */

exports.getCountryMasterById = async (req, res, next) => {
    try {
        let country_data = await CountryMaster.findOne({
            raw: true,
            where: {
                status: [0, 1],
                countryId: req.params.id
            }
        });
        logger.info(`countryMaster get data by id ${req.params.id} results: ${JSON.stringify(country_data)} `);
        if (country_data)
            res.status(200)
                .json({ status: 200, data: country_data });
        else
            res.status(200)
                .json({ status: 200, data: {}, message: message.resmessage.deletedrecord });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * updates country data
 * 
 * @body {countryId, countryName, countryCode, updateByIp} req to update country data
 */
exports.updateCountryMaster = async (req, res, next) => {
    try {
        let {
            countryId,
            countryName,
            countryCode,
            updateByIp
        } = await req.body;
        let update_status = await CountryMaster.update({
            countryName,
            countryCode,
            updateByIp
        }, {
            where: {
                countryId: countryId
            }
        });
        logger.info(`countryMaster data updated status: ${JSON.stringify(update_status)} for countryid ${countryId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.countryupdated, data: {} });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * delete country by id
 *
 * @body {countryId} to delete country
 */
exports.deleteCountryMaster = async (req, res, next) => {
    try {
        let {
            countryId
        } = await req.body;
        let delete_status = await CountryMaster.update({
            status: 2
        }, {
            where: { countryId: countryId }
        });
        logger.info(`countryMaster deleted by id ${countryId} delete status: ${delete_status}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.countrydeleted });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * change status of country by id
 *
 * @body {countryId, status} to change status
 */
exports.changeStatus = async (req, res, next) => {
    try {
        let {
            countryId,
            status
        } = await req.body;
        let change_status = await CountryMaster.update({
            status
        }, {
            where: {
                countryId: countryId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`countryMaster status changed to ${status} for country ${countryId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.countrystatus });
        } else {
            logger.info(`countryMaster status for country ${countryId} not changed`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.deletedrecord });
        }
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * import country data
 * @param {file}
 */
exports.postImportData = async (req, res, next) => {
    try {
        const file = req.file;
        let {
            createByIp
        } = req.body;

        if (!file) {
            const error = new Error("No File");
            error.httpStatusCode = 400;
            console.log("Getting error :-", error);
            return next(error);
        } else {
            fs.readFile("./uploads/" + file.filename, async (err, data) => {
                if (err)
                    throw err;

                const countryData = JSON.parse(data);
                let countries = [];

                for (const country of countryData) {
                    countries.push({
                        countryName: country.name,
                        countryCode: country.phone_code,
                        createByIp: createByIp
                    });
                }
                let insert_db_status = await CountryMaster.bulkCreate(countries, { returning: true });
                console.log(insert_db_status);
                res.json({ success: 200, message: "data inserted" });

            });
        }
    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
}