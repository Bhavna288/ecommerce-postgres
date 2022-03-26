const Sequelize = require('sequelize');
const logger = require('../config/logger');
const message = require('../response_message/message');
const ProductDiscount = require('../models/productDiscount');

/**
 * insert product discount  data
 * 
 * @body {name, description, percentage, createByIp} req to add product discount  data
 */
exports.addProductDiscount = async (req, res, next) => {
    try {
        let {
            name,
            description,
            percentage,
            createByIp
        } = await req.body;
        let insert_status = await ProductDiscount.create({
            name,
            description,
            percentage,
            createByIp
        })
        logger.info(`ProductDiscount data inserted: ${JSON.stringify(req.body)}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.productdiscountadded, data: insert_status });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns all product discount s data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllProductDiscount = async (req, res, next) => {
    try {
        let { limit, page } = await req.body;
        let offset = (page - 1) * limit;
        let product_discount = [];
        if (limit == "" && page == "") {
            product_discount = await ProductDiscount.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                }
            });
        }
        else {
            product_discount = await ProductDiscount.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                limit: limit,
                offset: offset
            });

        }
        let totalcount = await ProductDiscount.count({
            raw: true,
            where: { status: ['0', '1'] },
        });
        logger.info(`ProductDiscount get data ${JSON.stringify(product_discount)} `);
        res.status(200)
            .json({ status: 200, data: product_discount, totalcount: totalcount });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns product discount  data by id
 * 
 * @param {id} req to get product discount  data by id
 */

exports.getProductDiscountById = async (req, res, next) => {
    try {
        let product_discount = await ProductDiscount.findOne({
            where: {
                status: [0, 1],
                productDiscountId: req.params.id
            }
        });
        logger.info(`ProductDiscount get data by id ${req.params.id} results: ${JSON.stringify(product_discount)} `);
        if (product_discount)
            res.status(200)
                .json({ status: 200, data: product_discount });
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
 * updates product discount  data
 * 
 * @body {productDiscountId, name, description, percentage, updateByIp} req to update product discount  data
 */
exports.updateProductDiscount = async (req, res, next) => {
    try {
        let {
            productDiscountId,
            name,
            description,
            percentage,
            updateByIp
        } = await req.body;
        let update_status = await ProductDiscount.update({
            name,
            description,
            percentage,
            updateByIp
        }, {
            where: {
                productDiscountId: productDiscountId
            }
        });
        logger.info(`ProductDiscount data updated status: ${JSON.stringify(update_status)} for product discount id ${productDiscountId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.productdiscountupdated, data: {} });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * delete product discount  by id
 *
 * @body {productDiscountId} to delete product discount 
 */
exports.deleteProductDiscount = async (req, res, next) => {
    try {
        let {
            productDiscountId
        } = await req.body;
        let delete_status = await ProductDiscount.update({
            status: 2
        }, {
            where: { productDiscountId: productDiscountId }
        });
        logger.info(`ProductDiscount deleted by id ${productDiscountId} delete status: ${delete_status}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.productdiscountdeleted });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * change status of product discount  by id
 *
 * @body {productDiscountId, status} to change status
 */
exports.changeStatus = async (req, res, next) => {
    try {
        let {
            productDiscountId,
            status
        } = await req.body;
        let change_status = await ProductDiscount.update({
            status
        }, {
            where: {
                productDiscountId: productDiscountId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`ProductDiscount status changed to ${status} for product discount  ${productDiscountId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.productdiscountstatus });
        } else {
            logger.info(`ProductDiscount status for product discount  ${productDiscountId} not changed`);
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