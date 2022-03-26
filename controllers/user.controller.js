const Sequelize = require('sequelize');
const logger = require('../config/logger');
const message = require('../response_message/message');
const User = require('../models/user');

/**
 * insert user data
 * 
 * @body {name, email, password, admin, createByIp} req to add user data
 */
exports.addUser = async (req, res, next) => {
    try {
        let {
            name,
            email,
            password,
            admin,
            createByIp
        } = await req.body;
        let insert_status = await User.create({
            name,
            email,
            password,
            admin,
            createByIp
        })
        logger.info(`user data inserted: ${JSON.stringify(req.body)}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.useradded, data: insert_status });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns all users data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllUsers = async (req, res, next) => {
    try {
        let { limit, page } = await req.body;
        let offset = (page - 1) * limit;
        let user_data = [];
        if (limit == "" && page == "") {
            user_data = await User.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                }
            });
        }
        else {
            user_data = await User.findAll({
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
        let totalcount = await User.count({
            raw: true,
            where: { status: ['0', '1'] },
        });
        logger.info(`User get data ${JSON.stringify(user_data)} `);
        res.status(200)
            .json({ status: 200, data: user_data, totalcount: totalcount });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns user data by id
 * 
 * @param {id} req to get user data by id
 */

exports.getUserById = async (req, res, next) => {
    try {
        let user_data = await User.findOne({
            raw: true,
            where: {
                status: [0, 1],
                userId: req.params.id
            }
        });
        logger.info(`User get data by id ${req.params.id} results: ${JSON.stringify(user_data)} `);
        if (user_data)
            res.status(200)
                .json({ status: 200, data: user_data });
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
 * updates user data
 * 
 * @body {userId, name, email, password, admin, updateByIp} req to update user data
 */
exports.updateUser = async (req, res, next) => {
    try {
        let {
            userId,
            name,
            email,
            password,
            admin,
            updateByIp
        } = await req.body;
        let update_status = await User.update({
            name,
            email,
            password,
            admin,
            updateByIp
        }, {
            where: {
                userId: userId
            }
        });
        logger.info(`user data updated status: ${JSON.stringify(update_status)} for userid ${userId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.userupdated, data: {} });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * delete user by id
 *
 * @body {userId} to delete user
 */
exports.deleteUser = async (req, res, next) => {
    try {
        let {
            userId
        } = await req.body;
        let delete_status = await User.update({
            status: 2
        }, {
            where: { userId: userId }
        });
        logger.info(`user deleted by id ${userId} delete status: ${delete_status}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.userdeleted });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * change status of user by id
 *
 * @body {userId, status} to change status
 */
exports.changeStatus = async (req, res, next) => {
    try {
        let {
            userId,
            status
        } = await req.body;
        let change_status = await User.update({
            status
        }, {
            where: {
                userId: userId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`user status changed to ${status} for user ${userId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.userstatus });
        } else {
            logger.info(`user status for user ${userId} not changed`);
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