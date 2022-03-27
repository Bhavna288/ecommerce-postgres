const Sequelize = require('sequelize');
const logger = require('../config/logger');
const sequelize = require('../config/database');
const message = require('../response_message/message');
const UserCart = require('../models/userCart');
const User = require('../models/user');
const Product = require('../models/product');
const ProductDiscount = require('../models/productDiscount');

/**
 * insert usercart data
 * 
 * @body {userId, productId, quantity, createByIp} req to add usercart data
 */
exports.addUserCart = async (req, res, next) => {
    try {
        let {
            userId,
            productId,
            quantity,
            createByIp
        } = await req.body;
        let insert_status = await UserCart.create({
            userId,
            productId,
            quantity,
            createByIp
        });
        logger.info(`UserCart data inserted: ${JSON.stringify(req.body)}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.usercartadded, data: insert_status });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns all user cart data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllUserCart = async (req, res, next) => {
    try {
        let { limit, page, searchQuery } = await req.body;
        let offset = (page - 1) * limit;
        let user_cart_data = [], totalcount;
        if (searchQuery) {
            user_cart_data = await UserCart.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { '$product.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.description$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.SKU$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.category.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.category.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.discount.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.discount.description$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        sequelize.where(
                            sequelize.cast(sequelize.col('userCart.quantity'), 'varchar'),
                            { [Sequelize.Op.iLike]: `%${searchQuery}%` }
                        )
                    ],
                    status: [0, 1]
                },
                include: [{
                    model: User,
                    as: 'user',
                    include: [{ all: true, nested: true }]
                }, {
                    model: Product,
                    as: 'product',
                    include: [{ all: true, nested: true }]
                }]
            });
            totalcount = user_cart_data.length;
        } else if (limit == "" && page == "") {
            user_cart_data = await UserCart.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                include: [{ all: true, nested: true }]
            });
            totalcount = await UserCart.count({
                where: { status: ['0', '1'] },
            });
        }
        else {
            user_cart_data = await UserCart.findAll({

                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                limit: limit,
                offset: offset,
                include: [{ all: true, nested: true }]
            });
            totalcount = await UserCart.count({
                where: { status: ['0', '1'] },
            });
        }

        logger.info(`UserCart get data ${JSON.stringify(user_cart_data)} `);
        res.status(200)
            .json({ status: 200, data: user_cart_data, totalcount: totalcount });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns usercart data by id
 * 
 * @param {id} req to get usercart data by id
 */

exports.getUserCartById = async (req, res, next) => {
    try {
        let user_cart_data = await UserCart.findOne({
            where: {
                status: [0, 1],
                userCartId: req.params.id
            },
            include: [{ all: true, nested: true }]
        });
        logger.info(`UserCart get data by id ${req.params.id} results: ${JSON.stringify(user_cart_data)} `);
        if (user_cart_data)
            res.status(200)
                .json({ status: 200, data: user_cart_data });
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
 * returns usercart data by user id
 * 
 * @body {id, searchQuery} req to get usercart data by user id
 */

exports.getUserCartByUserId = async (req, res, next) => {
    try {
        let { userId, searchQuery } = req.body;
        let user_cart_data = [];
        if (searchQuery) {
            user_cart_data = await UserCart.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { '$product.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.description$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.SKU$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.category.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.category.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.discount.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.discount.description$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        sequelize.where(
                            sequelize.cast(sequelize.col('userCart.quantity'), 'varchar'),
                            { [Sequelize.Op.iLike]: `%${searchQuery}%` }
                        )
                    ],
                    userId: userId,
                    status: [0, 1]
                },
                include: [{
                    model: User,
                    as: 'user',
                    include: [{ all: true, nested: true }]
                }, {
                    model: Product,
                    as: 'product',
                    include: [{ all: true, nested: true }]
                }]
            });
        } else {
            user_cart_data = await UserCart.findAll({
                where: {
                    status: [0, 1],
                    userId: userId
                },
                include: [{ all: true, nested: true }]
            });
        }
        logger.info(`UserCart get data by user id ${req.params.id} results: ${JSON.stringify(user_cart_data)} `);
        if (user_cart_data)
            res.status(200)
                .json({ status: 200, data: user_cart_data });
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
 * updates usercart data
 * 
 * @body {userCartId, userId, productId, quantity, updateByIp} req to update usercart data
 */
exports.updateUserCart = async (req, res, next) => {
    try {
        let {
            userCartId,
            userId,
            productId,
            quantity,
            updateByIp
        } = await req.body;
        let update_status = await UserCart.update({
            userId,
            productId,
            quantity,
            updateByIp
        }, {
            where: {
                userCartId: userCartId
            }
        });
        logger.info(`UserCart data updated status: ${JSON.stringify(update_status)} for userid ${userCartId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.usercartupdated, data: {} });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * delete usercart by id
 *
 * @body {userCartId} to delete user cart
 */
exports.deleteUserCart = async (req, res, next) => {
    try {
        let {
            userCartId
        } = await req.body;
        let delete_status = await UserCart.update({
            status: 2
        }, {
            where: { userCartId: userCartId }
        });
        logger.info(`UserCart deleted by id ${userCartId} delete status: ${delete_status}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.usercartdeleted });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * change status of usercart by id
 *
 * @body {userCartId, status} to change status
 */
exports.changeStatus = async (req, res, next) => {
    try {
        let {
            userCartId,
            status
        } = await req.body;
        let change_status = await UserCart.update({
            status
        }, {
            where: {
                userCartId: userCartId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`UserCart status changed to ${status} for usercart ${userCartId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.usercartstatus });
        } else {
            logger.info(`UserCart status for usercart ${userCartId} not changed`);
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