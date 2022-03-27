const Sequelize = require('sequelize');
const logger = require('../config/logger');
const message = require('../response_message/message');
const UserWishlist = require('../models/userWishlist');
const User = require('../models/user');
const Product = require('../models/product');

/**
 * insert userwishlist data
 * 
 * @body {userId, productId, createByIp} req to add userwishlist data
 */
exports.addUserWishlist = async (req, res, next) => {
    try {
        let {
            userId,
            productId,
            createByIp
        } = await req.body;
        let insert_status = await UserWishlist.create({
            userId,
            productId,
            createByIp
        });
        logger.info(`UserWishlist data inserted: ${JSON.stringify(req.body)}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.userwishlistadded, data: insert_status });
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

exports.getAllUserWishlist = async (req, res, next) => {
    try {
        let { limit, page, searchQuery } = await req.body;
        let offset = (page - 1) * limit;
        let user_wishlist_data = [], totalcount;
        if (searchQuery) {
            user_wishlist_data = await UserWishlist.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { '$product.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.description$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.SKU$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.category.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.category.description$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.discount.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.discount.description$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } }
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
            totalcount = user_wishlist_data.length;
        } else if (limit == "" && page == "") {
            user_wishlist_data = await UserWishlist.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                include: [{ all: true, nested: true }]
            });
            totalcount = await UserWishlist.count({
                where: { status: ['0', '1'] },
            });
        }
        else {
            user_wishlist_data = await UserWishlist.findAll({

                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                limit: limit,
                offset: offset,
                include: [{ all: true, nested: true }]
            });
            totalcount = await UserWishlist.count({
                where: { status: ['0', '1'] },
            });
        }

        logger.info(`UserWishlist get data ${JSON.stringify(user_wishlist_data)} `);
        res.status(200)
            .json({ status: 200, data: user_wishlist_data, totalcount: totalcount });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns userwishlist data by id
 * 
 * @param {id} req to get userwishlist data by id
 */

exports.getUserWishlistById = async (req, res, next) => {
    try {
        let user_wishlist_data = await UserWishlist.findOne({
            where: {
                status: [0, 1],
                userWishlistId: req.params.id
            },
            include: [{ all: true, nested: true }]
        });
        logger.info(`UserWishlist get data by id ${req.params.id} results: ${JSON.stringify(user_wishlist_data)} `);
        if (user_wishlist_data)
            res.status(200)
                .json({ status: 200, data: user_wishlist_data });
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
 * returns userwishlist data by user id
 * 
 * @body {userId, searchQuery} req to get userwishlist data by user id
 */

exports.getUserWishlistByUserId = async (req, res, next) => {
    try {
        let { userId, searchQuery } = req.body;
        let user_wishlist_data = [];
        if (searchQuery) {
            user_wishlist_data = await UserWishlist.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { '$product.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.description$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.SKU$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.category.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.category.description$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.discount.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$product.discount.description$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } }
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
            user_wishlist_data = await UserWishlist.findAll({
                where: {
                    status: [0, 1],
                    userId: userId
                },
                include: [{ all: true, nested: true }]
            });
        }
        logger.info(`UserWishlist get data by user id ${req.params.id} results: ${JSON.stringify(user_wishlist_data)} `);
        if (user_wishlist_data)
            res.status(200)
                .json({ status: 200, data: user_wishlist_data });
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
 * updates userwishlist data
 * 
 * @body {userWishlistId, userId, productId, updateByIp} req to update userwishlist data
 */
exports.updateUserWishlist = async (req, res, next) => {
    try {
        let {
            userWishlistId,
            userId,
            productId,
            updateByIp
        } = await req.body;
        let update_status = await UserWishlist.update({
            userId,
            productId,
            updateByIp
        }, {
            where: {
                userWishlistId: userWishlistId
            }
        });
        logger.info(`UserWishlist data updated status: ${JSON.stringify(update_status)} for userid ${userWishlistId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.userwishlistupdated, data: {} });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * delete userwishlist by id
 *
 * @body {userWishlistId} to delete user cart
 */
exports.deleteUserWishlist = async (req, res, next) => {
    try {
        let {
            userWishlistId
        } = await req.body;
        let delete_status = await UserWishlist.update({
            status: 2
        }, {
            where: { userWishlistId: userWishlistId }
        });
        logger.info(`UserWishlist deleted by id ${userWishlistId} delete status: ${delete_status}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.userwishlistdeleted });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * change status of userwishlist by id
 *
 * @body {userWishlistId, status} to change status
 */
exports.changeStatus = async (req, res, next) => {
    try {
        let {
            userWishlistId,
            status
        } = await req.body;
        let change_status = await UserWishlist.update({
            status
        }, {
            where: {
                userWishlistId: userWishlistId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`UserWishlist status changed to ${status} for UserWishlist ${userWishlistId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.userwishliststatus });
        } else {
            logger.info(`UserWishlist status for UserWishlist ${userWishlistId} not changed`);
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