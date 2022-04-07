const Sequelize = require('sequelize');
const logger = require('../config/logger');
const sequelize = require('../config/database');
const message = require('../response_message/message');
const AvailablePincodes = require('../models/availablePincodes');

/**
 * insert pincode  data
 * 
 * @body {pincode, createByIp} req to add pincode  data
 */
exports.addAvailablePincodes = async (req, res, next) => {
    try {
        let {
            pincode,
            createByIp
        } = await req.body;
        let insert_status = await AvailablePincodes.create({
            pincode,
            createByIp
        })
        logger.info(`AvailablePincodes data inserted: ${JSON.stringify(req.body)}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.availablepincodeadded, data: insert_status });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * insert pincode  data
 * 
 * @body {pincode, createByIp} req to add pincode  data
 */
exports.addPincodeArray = async (req, res, next) => {
    try {
        let {
            pincodeArray,
            createByIp
        } = await req.body;
        let pincodes = [];
        pincodeArray.forEach(element => {
            pincodes.push({
                pincode: element,
                createByIp: createByIp
            })
        });
        let insert_status = await AvailablePincodes.bulkCreate(pincodes);
        logger.info(`AvailablePincodes data inserted: ${JSON.stringify(req.body)}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.availablepincodeadded, data: insert_status });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns all pincode s data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllAvailablePincodes = async (req, res, next) => {
    try {
        let { limit, page, searchQuery } = await req.body;
        let offset = (page - 1) * limit;
        let available_pincode = [], totalcount;
        if (searchQuery) {
            available_pincode = await AvailablePincodes.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { pincode: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } }
                    ],
                    status: [0, 1]
                }
            });
            totalcount = available_pincode.length;
        } else if (limit == "" && page == "") {
            available_pincode = await AvailablePincodes.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                }
            });
            totalcount = await AvailablePincodes.count({
                raw: true,
                where: { status: ['0', '1'] },
            });
        }
        else {
            available_pincode = await AvailablePincodes.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                limit: limit,
                offset: offset
            });
            totalcount = await AvailablePincodes.count({
                raw: true,
                where: { status: ['0', '1'] },
            });
        }

        logger.info(`AvailablePincodes get data ${JSON.stringify(available_pincode)} `);
        res.status(200)
            .json({ status: 200, data: available_pincode, totalcount: totalcount });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns pincode  data by id
 * 
 * @param {id} req to get pincode  data by id
 */

exports.getAvailablePincodesById = async (req, res, next) => {
    try {
        let available_pincode = await AvailablePincodes.findOne({
            where: {
                status: [0, 1],
                pincodeId: req.params.id
            }
        });
        logger.info(`AvailablePincodes get data by id ${req.params.id} results: ${JSON.stringify(available_pincode)} `);
        if (available_pincode)
            res.status(200)
                .json({ status: 200, data: available_pincode });
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
 * returns pincode  data if available
 * 
 * @body {pincode} req to get pincode  data by id
 */

exports.checkPincode = async (req, res, next) => {
    try {
        let { pincode } = req.body;
        let available_pincode = await AvailablePincodes.findOne({
            where: {
                status: [0, 1],
                pincode: pincode
            }
        });
        logger.info(`AvailablePincodes get data by id ${req.params.id} results: ${JSON.stringify(available_pincode)} `);
        if (available_pincode)
            res.status(200)
                .json({ status: 200, message: message.resmessage.pincodevalid, data: available_pincode });
        else
            res.status(200)
                .json({ status: 200, data: {}, message: message.resmessage.pincodeinvalid });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * updates pincode  data
 * 
 * @body {pincodeId, pincode, updateByIp} req to update pincode  data
 */
exports.updateAvailablePincodes = async (req, res, next) => {
    try {
        let {
            pincodeId,
            pincode,
            updateByIp
        } = await req.body;
        let update_status = await AvailablePincodes.update({
            pincode,
            updateByIp
        }, {
            where: {
                pincodeId: pincodeId
            }
        });
        logger.info(`AvailablePincodes data updated status: ${JSON.stringify(update_status)} for pincode id ${pincodeId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.availablepincodeupdated, data: {} });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * delete pincode  by id
 *
 * @body {pincodeId} to delete pincode 
 */
exports.deleteAvailablePincodes = async (req, res, next) => {
    try {
        let {
            pincodeId
        } = await req.body;
        let delete_status = await AvailablePincodes.update({
            status: 2
        }, {
            where: { pincodeId: pincodeId }
        });
        logger.info(`AvailablePincodes deleted by id ${pincodeId} delete status: ${delete_status}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.availablepincodedeleted });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * change status of pincode  by id
 *
 * @body {pincodeId, status} to change status
 */
exports.changeStatus = async (req, res, next) => {
    try {
        let {
            pincodeId,
            status
        } = await req.body;
        let change_status = await AvailablePincodes.update({
            status
        }, {
            where: {
                pincodeId: pincodeId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`AvailablePincodes status changed to ${status} for pincode  ${pincodeId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.availablepincodestatus });
        } else {
            logger.info(`AvailablePincodes status for pincode  ${pincodeId} not changed`);
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