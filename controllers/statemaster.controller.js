const Sequelize = require('sequelize');
const logger = require('../config/logger');
const message = require('../response_message/message');
const StateMaster = require('../models/stateMaster');
const fs = require("fs");
const CountryMaster = require('../models/countryMaster');

/**
 * insert state data
 * 
 * @body {stateName, stateCode, countryMasterId, createByIp} req to add state data
 */
exports.addStateMaster = async (req, res, next) => {
    try {
        let {
            stateName,
            stateCode,
            countryMasterId,
            createByIp
        } = await req.body;
        let insert_status = await StateMaster.create({
            stateName,
            stateCode,
            countryMasterId,
            createByIp
        })
        logger.info(`stateMaster data inserted: ${JSON.stringify(req.body)}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.stateadded, data: insert_status });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns all state data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllStates = async (req, res, next) => {
    try {
        let { limit, page } = await req.body;
        let offset = (page - 1) * limit;
        let state_data = [];
        if (limit == "" && page == "") {
            state_data = await StateMaster.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                include: [{ all: true, nested: true }]
            });
        }
        else {
            state_data = await StateMaster.findAll({
                raw: true,
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
        let totalcount = await StateMaster.count({
            raw: true,
            where: { status: ['0', '1'] },
        });
        logger.info(`stateMaster get data ${JSON.stringify(state_data)} `);
        res.status(200)
            .json({ status: 200, data: state_data, totalcount: totalcount });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns state data by id
 * 
 * @param {id} req to get state data by id
 */

exports.getStateMasterById = async (req, res, next) => {
    try {
        let state_data = await StateMaster.findOne({
            raw: true,
            where: {
                status: [0, 1],
                stateId: req.params.id
            },
            include: [{ all: true, nested: true }]
        });
        logger.info(`stateMaster get data by id ${req.params.id} results: ${JSON.stringify(state_data)} `);
        if (state_data)
            res.status(200)
                .json({ status: 200, data: state_data });
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
 * returns state data by country id
 * 
 * @param {id} req to get state data by country id
 */

exports.getStateMasterByCountryId = async (req, res, next) => {
    try {
        let state_data = await StateMaster.findAll({
            raw: true,
            where: {
                status: [0, 1],
                countryMasterId: req.params.id
            },
            include: [{ all: true, nested: true }]
        });
        logger.info(`stateMaster get data by country id ${req.params.id} results: ${JSON.stringify(state_data)} `);
        if (state_data)
            res.status(200)
                .json({ status: 200, data: state_data });
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
 * updates state data
 * 
 * @body {stateId, stateName, stateCode, countryMasterId, updateByIp} req to update state data
 */
exports.updateStateMaster = async (req, res, next) => {
    try {
        let {
            stateId,
            stateName,
            stateCode,
            countryMasterId,
            updateByIp
        } = await req.body;
        let update_status = await StateMaster.update({
            stateName,
            stateCode,
            countryMasterId,
            updateByIp
        }, {
            where: {
                stateId: stateId
            }
        });
        logger.info(`stateMaster data updated status: ${JSON.stringify(update_status)} for stateid ${stateId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.stateupdated, data: {} });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * delete state by id
 *
 * @body {stateId} to delete state
 */
exports.deleteStateMaster = async (req, res, next) => {
    try {
        let {
            stateId
        } = await req.body;
        let delete_status = await StateMaster.update({
            status: 2
        }, {
            where: { stateId: stateId }
        });
        logger.info(`stateMaster deleted by id ${stateId} delete status: ${delete_status}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.statedeleted });
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
 * @body {cityId, status} to change status
 */
exports.changeStatus = async (req, res, next) => {
    try {
        let {
            cityId,
            status
        } = await req.body;
        let change_status = await StateMaster.update({
            status
        }, {
            where: {
                cityId: cityId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`stateMaster status changed to ${status} for city ${cityId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.citystatus });
        } else {
            logger.info(`stateMaster status for city ${cityId} not changed`);
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
 * to get country id of state
 * @param {*} countryName 
 */

let getCountryId = async (countryName) => {
    try {
        let get_country_id = await CountryMaster.findOne({
            attributes: ['countryMasterId'],
            where: { countryName: countryName }
        })
        return get_country_id.countryMasterId;
    } catch (err) {
        console.log(err);
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
            createBy,
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
                let states = [];

                for (const country of countryData) {
                    let country_id = await getCountryId(country.name);
                    for (const state of country.states) {
                        states.push({
                            stateName: state.name,
                            stateCode: state.state_code,
                            countryMasterId: country_id,
                            createByIp: createByIp
                        });
                    }
                }
                let insert_db_status = await StateMaster.bulkCreate(states, { returning: true });
                // console.log(insert_db_status);

                res.json({ success: 200, message: "data inserted" });

            });
        }
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
}