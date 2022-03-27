const Sequelize = require('sequelize');
const logger = require('../config/logger');
const message = require('../response_message/message');
const UserAddress = require('../models/userAddress');
const CityMaster = require('../models/cityMaster');
const StateMaster = require('../models/stateMaster');
const CountryMaster = require('../models/countryMaster');

/**
 * insert useraddress data
 * 
 * @body {userId, fullName, mobileNumber, pincode, addressLine1, addressLine2, cityMasterId, 
 *        stateMasterId, countryMasterId, isDefault, addressType, createByIp} req to add useraddress data
 */
exports.addUserAddress = async (req, res, next) => {
    try {
        let {
            userId,
            fullName,
            mobileNumber,
            pincode,
            addressLine1,
            addressLine2,
            cityMasterId,
            stateMasterId,
            countryMasterId,
            isDefault,
            addressType,
            createByIp
        } = await req.body;
        let insert_status = await UserAddress.create({
            userId,
            fullName,
            mobileNumber,
            pincode,
            addressLine1,
            addressLine2,
            cityMasterId,
            stateMasterId,
            countryMasterId,
            isDefault,
            addressType,
            createByIp
        });
        if (isDefault) {
            let unset_default = await UserAddress.update({
                isDefault: 0
            }, {
                where: {
                    userId: userId,
                    userAddressId: { [Sequelize.Op.ne]: insert_status.userAddressId }
                }
            });
        }
        logger.info(`useraddress data inserted: ${JSON.stringify(req.body)}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.useraddressadded, data: insert_status });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns all user address data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllUserAddress = async (req, res, next) => {
    try {
        let { limit, page, searchQuery } = await req.body;
        let offset = (page - 1) * limit;
        let user_address_data = [], totalcount;
        if (searchQuery) {
            user_address_data = await UserAddress.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { fullName: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { pincode: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { addressLine1: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { addressLine2: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { mobileNumber: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$city.cityName$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$state.stateName$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$country.countryName$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } }
                    ],
                    status: [0, 1]
                },
                include: [{
                    model: CityMaster,
                    as: 'city',
                    include: [{ all: true, nested: true }]
                }, {
                    model: StateMaster,
                    as: 'state',
                    include: [{ all: true, nested: true }]
                }, {
                    model: CountryMaster,
                    as: 'country',
                    include: [{ all: true, nested: true }]
                }]
            });
            totalcount = user_address_data.length;
        } else if (limit == "" && page == "") {
            user_address_data = await UserAddress.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                include: [{ all: true, nested: true }]
            });
            totalcount = await UserAddress.count({
                where: { status: ['0', '1'] },
            });
        }
        else {
            user_address_data = await UserAddress.findAll({

                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                limit: limit,
                offset: offset,
                include: [{ all: true, nested: true }]
            });
            totalcount = await UserAddress.count({
                where: { status: ['0', '1'] },
            });
        }

        logger.info(`UserAddress get data ${JSON.stringify(user_address_data)} `);
        res.status(200)
            .json({ status: 200, data: user_address_data, totalcount: totalcount });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns useraddress data by id
 * 
 * @param {id} req to get useraddress data by id
 */

exports.getUserAddressById = async (req, res, next) => {
    try {
        let user_address_data = await UserAddress.findOne({
            where: {
                status: [0, 1],
                userAddressId: req.params.id
            },
            include: [{ all: true, nested: true }]
        });
        logger.info(`UserAddress get data by id ${req.params.id} results: ${JSON.stringify(user_address_data)} `);
        if (user_address_data)
            res.status(200)
                .json({ status: 200, data: user_address_data });
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
 * returns useraddress data by user id
 * 
 * @body {userId, searchQuery} req to get useraddress data by user id
 */

exports.getUserAddressByUserId = async (req, res, next) => {
    try {
        let { searchQuery, userId } = req.body;
        let user_address_data = [];
        if (searchQuery) {
            user_address_data = await UserAddress.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { fullName: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { pincode: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { addressLine1: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { addressLine2: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { mobileNumber: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$city.cityName$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$state.stateName$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$country.countryName$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } }
                    ],
                    userId: userId,
                    status: [0, 1]
                },
                include: [{
                    model: CityMaster,
                    as: 'city',
                    include: [{ all: true, nested: true }]
                }, {
                    model: StateMaster,
                    as: 'state',
                    include: [{ all: true, nested: true }]
                }, {
                    model: CountryMaster,
                    as: 'country',
                    include: [{ all: true, nested: true }]
                }]
            });
        } else {
            user_address_data = await UserAddress.findAll({
                where: {
                    status: [0, 1],
                    userId: userId
                },
                include: [{ all: true, nested: true }]
            });
        }
        logger.info(`UserAddress get data by user id ${req.params.id} results: ${JSON.stringify(user_address_data)} `);
        if (user_address_data)
            res.status(200)
                .json({ status: 200, data: user_address_data });
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
 * returns default useraddress data by user id
 * 
 * @param {id} req to get default useraddress data by user id
 */

exports.getDefaultUserAddressByUserId = async (req, res, next) => {
    try {
        let user_address_data = await UserAddress.findOne({
            where: {
                status: [0, 1],
                userId: req.params.id,
                isDefault: true
            },
            include: [{ all: true, nested: true }]
        });
        logger.info(`UserAddress get default address data by id ${req.params.id} results: ${JSON.stringify(user_address_data)} `);
        if (user_address_data)
            res.status(200)
                .json({ status: 200, data: user_address_data });
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
 * updates useraddress data
 * 
 * @body {userAddressId, userId, fullName, mobileNumber, pincode, addressLine1, addressLine2, cityMasterId, 
 *        stateMasterId, countryMasterId, isDefault, addressType, updateByIp} req to update useraddress data
 */
exports.updateUserAddress = async (req, res, next) => {
    try {
        let {
            userAddressId,
            userId,
            fullName,
            mobileNumber,
            pincode,
            addressLine1,
            addressLine2,
            cityMasterId,
            stateMasterId,
            countryMasterId,
            isDefault,
            addressType,
            updateByIp
        } = await req.body;
        let update_status = await UserAddress.update({
            userId,
            fullName,
            mobileNumber,
            pincode,
            addressLine1,
            addressLine2,
            cityMasterId,
            stateMasterId,
            countryMasterId,
            isDefault,
            addressType,
            updateByIp
        }, {
            where: {
                userAddressId: userAddressId
            }
        });
        if (isDefault) {
            let unset_default = await UserAddress.update({
                isDefault: 0
            }, {
                where: {
                    userId: userId,
                    userAddressId: { [Sequelize.Op.ne]: userAddressId }
                }
            });
        }
        logger.info(`useraddress data updated status: ${JSON.stringify(update_status)} for userid ${userAddressId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.useraddressupdated, data: {} });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * delete useraddress by id
 *
 * @body {userAddressId} to delete user address
 */
exports.deleteUserAddress = async (req, res, next) => {
    try {
        let {
            userAddressId
        } = await req.body;
        let delete_status = await UserAddress.update({
            status: 2
        }, {
            where: { userAddressId: userAddressId }
        });
        logger.info(`useraddress deleted by id ${userAddressId} delete status: ${delete_status}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.useraddressdeleted });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * change default address of user
 *
 * @body {userAddressId, userId} to change default address of user
 */
exports.changeDefaultAddress = async (req, res, next) => {
    try {
        let {
            userAddressId,
            userId
        } = await req.body;
        let change_default = await UserAddress.update({
            isDefault: true
        }, {
            where: {
                userAddressId: userAddressId
            }
        });
        let unset_default = await UserAddress.update({
            isDefault: false
        }, {
            where: {
                userId: userId,
                userAddressId: { [Sequelize.Op.ne]: userAddressId }
            }
        });
        logger.info(`useraddress default changed for user ${userId}, default address${userAddressId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.useraddressdefault });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * change status of useraddress by id
 *
 * @body {userAddressId, status} to change status
 */
exports.changeStatus = async (req, res, next) => {
    try {
        let {
            userAddressId,
            status
        } = await req.body;
        let change_status = await UserAddress.update({
            status
        }, {
            where: {
                userAddressId: userAddressId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`useraddress status changed to ${status} for useraddress ${userAddressId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.useraddressstatus });
        } else {
            logger.info(`useraddress status for useraddress ${userAddressId} not changed`);
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