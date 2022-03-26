const Sequelize = require('sequelize');
const logger = require('../config/logger');
const message = require('../response_message/message');
const CityMaster = require('../models/cityMaster');
const StateMaster = require('../models/stateMaster');
const fs = require("fs");

/**
 * insert city data
 * 
 * @body {cityName, stateMasterId, createByIp} req to add city data
 */
exports.addCityMaster = async (req, res, next) => {
    try {
        let {
            cityName,
            stateMasterId,
            createByIp
        } = await req.body;
        let insert_status = await CityMaster.create({
            cityName,
            stateMasterId,
            createByIp
        })
        logger.info(`cityMaster data inserted: ${JSON.stringify(req.body)}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.cityadded, data: insert_status });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns all city data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllCities = async (req, res, next) => {
    try {
        let { limit, page } = await req.body;
        let offset = (page - 1) * limit;
        let city_data = [];
        if (limit == "" && page == "") {
            city_data = await CityMaster.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                include: [{ all: true, nested: true }]
            });
        }
        else {
            city_data = await CityMaster.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                limit: limit,
                offset: offset,
                include: [{ all: true, nested: true }]
            });

        }
        let totalcount = await CityMaster.count({
            raw: true,
            where: { status: ['0', '1'] },
        });
        logger.info(`cityMaster get data ${JSON.stringify(city_data)} `);
        res.status(200)
            .json({ status: 200, data: city_data, totalcount: totalcount });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns city data by id
 * 
 * @param {id} req to get city data by id
 */

exports.getCityMasterById = async (req, res, next) => {
    try {
        let city_data = await CityMaster.findOne({
            where: {
                status: [0, 1],
                cityMasterId: req.params.id
            },
            include: [{ all: true, nested: true }]
        });
        logger.info(`cityMaster get data by id ${req.params.id} results: ${JSON.stringify(city_data)} `);
        if (city_data)
            res.status(200)
                .json({ status: 200, data: city_data });
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
 * returns city data by state id
 * 
 * @param {id} req to get city data by state id
 */

exports.getCityMasterByStateId = async (req, res, next) => {
    try {
        let city_data = await CityMaster.findAll({
            where: {
                status: [0, 1],
                stateMasterId: req.params.id
            },
            include: [{ all: true, nested: true }]
        });
        logger.info(`cityMaster get data by state id ${req.params.id} results: ${JSON.stringify(city_data)} `);
        if (city_data)
            res.status(200)
                .json({ status: 200, data: city_data });
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
 * updates city data
 * 
 * @body {cityMasterId, cityName, stateMasterId, updateByIp} req to update city data
 */
exports.updateCityMaster = async (req, res, next) => {
    try {
        let {
            cityMasterId,
            cityName,
            stateMasterId,
            updateByIp
        } = await req.body;
        let update_status = await CityMaster.update({
            cityName,
            stateMasterId,
            updateByIp
        }, {
            where: {
                cityMasterId: cityMasterId
            }
        });
        logger.info(`cityMaster data updated status: ${JSON.stringify(update_status)} for cityid ${cityMasterId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.cityupdated, data: {} });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * delete city by id
 *
 * @body {cityMasterId} to delete city
 */
exports.deleteCityMaster = async (req, res, next) => {
    try {
        let {
            cityMasterId
        } = await req.body;
        let delete_status = await CityMaster.update({
            status: 2
        }, {
            where: { cityMasterId: cityMasterId }
        });
        logger.info(`cityMaster deleted by id ${cityMasterId} delete status: ${delete_status}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.citydeleted });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * change status of city by id
 *
 * @body {cityMasterId, status} to change status
 */
exports.changeStatus = async (req, res, next) => {
    try {
        let {
            cityMasterId,
            status
        } = await req.body;
        let change_status = await CityMaster.update({
            status
        }, {
            where: {
                cityMasterId: cityMasterId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`cityMaster status changed to ${status} for city ${cityMasterId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.citystatus });
        } else {
            logger.info(`cityMaster status for city ${cityMasterId} not changed`);
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
 * to get state id
 * @param {*} stateName 
 */

let getStateId = async (stateName) => {
    try {
        let get_state_id = await StateMaster.findOne({
            attributes: ['stateMasterId'],
            where: { stateName: stateName }
        })
        return get_state_id.stateMasterId;
    } catch (err) {
        return err;
    }
}

/**
 * import state data
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
                let cities = [];

                for (const state of countryData[102].states) {
                    let state_id = await getStateId(state.name);
                    for (const city of state.cities) {

                        cities.push({
                            cityName: city.name,
                            stateMasterId: state_id,
                            createByIp: createByIp
                        });
                    }
                }
                console.log(cities);
                let insert_db_status = await CityMaster.bulkCreate(cities, { returning: true });

                res.json({ success: 200, message: "data inserted" });

            });
        }
    } catch (err) {
        // console.log(err);
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
}