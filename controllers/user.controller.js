const Sequelize = require('sequelize');
const logger = require('../config/logger');
const message = require('../response_message/message');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const UserAddress = require('../models/userAddress');

/**
 * insert user data
 * 
 * @body {name, email, password, admin, mobileNumber, createByIp} req to add user data
 */
exports.addUser = async (req, res, next) => {
    try {
        const salt = await bcrypt.genSalt(10);
        let {
            name,
            email,
            admin,
            mobileNumber,
            createByIp
        } = await req.body;
        let mobile_number = await User.findAll({
            where: { mobileNumber: mobileNumber, status: ['0', '1'] },
        });
        if (mobile_number.length > 0) {
            res.status(200)
                .json({ status: 401, message: message.resmessage.mobilealreadyexists, data: {} });
        } else {
            const password = bcrypt.hashSync(req.body.password, salt);
            let insert_status = await User.create({
                name,
                email,
                password,
                admin,
                mobileNumber,
                createByIp
            })
            logger.info(`User data inserted: ${JSON.stringify(req.body)}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.useradded, data: insert_status });
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
 * returns all users data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllUsers = async (req, res, next) => {
    try {
        let { limit, page, searchQuery } = await req.body;
        let offset = (page - 1) * limit;
        let user_data = [], totalcount;
        if (searchQuery) {
            user_data = await User.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { name: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { email: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { mobileNumber: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } }
                    ],
                    status: [0, 1]
                }
            });
            totalcount = user_data.length;
        } else if (limit == "" && page == "") {
            user_data = await User.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                }
            });
            totalcount = await User.count({
                raw: true,
                where: { status: ['0', '1'] },
            });
        }
        else {
            user_data = await User.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                limit: limit,
                offset: offset
            });
            totalcount = await User.count({
                raw: true,
                where: { status: ['0', '1'] },
            });
        }

        user_data = user_data.map(item => item.dataValues);

        for (var user of user_data) {
            let user_address = await UserAddress.findAll({
                where: {
                    status: [0, 1],
                    userId: user.userId
                }
            });

            user_address = user_address.map(item => item.dataValues);
            user['address'] = user_address;
        }

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
            where: {
                status: [0, 1],
                userId: req.params.id
            }
        });

        logger.info(`User get data by id ${req.params.id} results: ${JSON.stringify(user_data)} `);
        if (user_data) {
            user_data = user_data.get({ plain: true });
            let user_address = await UserAddress.findAll({
                where: {
                    status: [0, 1],
                    userId: req.params.id
                }
            });

            user_address = user_address.map(item => item.dataValues);
            user_data['address'] = user_address;
            res.status(200)
                .json({ status: 200, data: user_data });
        }
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
 * @body {userId, name, email, password, admin, mobileNumber, updateByIp} req to update user data
 */
exports.updateUser = async (req, res, next) => {
    try {
        const salt = await bcrypt.genSalt(10);
        let {
            userId,
            name,
            email,
            admin,
            mobileNumber,
            updateByIp
        } = await req.body;
        let mobile_number = await User.findAll({
            where: {
                mobileNumber: mobileNumber,
                status: ['0', '1'],
                userId: { [Sequelize.Op.ne]: userId }
            },
        });
        if (mobile_number.length > 0) {
            res.status(200)
                .json({ status: 401, message: message.resmessage.mobilealreadyexists, data: {} });
        } else {
            const password = bcrypt.hashSync(req.body.password, salt);
            let update_status = await User.update({
                name,
                email,
                password,
                admin,
                mobileNumber,
                updateByIp
            }, {
                where: {
                    userId: userId
                }
            });
            logger.info(`User data updated status: ${JSON.stringify(update_status)} for userid ${userId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.userupdated, data: {} });
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
        logger.info(`User deleted by id ${userId} delete status: ${delete_status}`);
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