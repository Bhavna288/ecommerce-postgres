const Sequelize = require('sequelize');
const logger = require('../config/logger');
const message = require('../response_message/message');
const ProductCategory = require('../models/productCategory');

/**
 * insert product category  data
 * 
 * @body {name, description, createByIp} req to add product category  data
 */
exports.addProductCategory = async (req, res, next) => {
    try {
        let {
            name,
            description,
            createByIp
        } = await req.body;
        let insert_status = await ProductCategory.create({
            name,
            description,
            createByIp
        })
        logger.info(`ProductCategory data inserted: ${JSON.stringify(req.body)}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.productcategoryadded, data: insert_status });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns all product category s data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllProductCategories = async (req, res, next) => {
    try {
        let { limit, page } = await req.body;
        let offset = (page - 1) * limit;
        let product_category = [];
        if (limit == "" && page == "") {
            product_category = await ProductCategory.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                }
            });
        }
        else {
            product_category = await ProductCategory.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                limit: limit,
                offset: offset
            });

        }
        let totalcount = await ProductCategory.count({
            raw: true,
            where: { status: ['0', '1'] },
        });
        logger.info(`ProductCategory get data ${JSON.stringify(product_category)} `);
        res.status(200)
            .json({ status: 200, data: product_category, totalcount: totalcount });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns product category  data by id
 * 
 * @param {id} req to get product category  data by id
 */

exports.getProductCategoryById = async (req, res, next) => {
    try {
        let product_category = await ProductCategory.findOne({
            where: {
                status: [0, 1],
                productCategoryId: req.params.id
            }
        });
        logger.info(`ProductCategory get data by id ${req.params.id} results: ${JSON.stringify(product_category)} `);
        if (product_category)
            res.status(200)
                .json({ status: 200, data: product_category });
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
 * updates product category  data
 * 
 * @body {productCategoryId, name, description, updateByIp} req to update product category  data
 */
exports.updateProductCategory = async (req, res, next) => {
    try {
        let {
            productCategoryId,
            name,
            description,
            updateByIp
        } = await req.body;
        let update_status = await ProductCategory.update({
            name,
            description,
            updateByIp
        }, {
            where: {
                productCategoryId: productCategoryId
            }
        });
        logger.info(`ProductCategory data updated status: ${JSON.stringify(update_status)} for product category id ${productCategoryId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.productcategoryupdated, data: {} });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * delete product category  by id
 *
 * @body {productCategoryId} to delete product category 
 */
exports.deleteProductCategory = async (req, res, next) => {
    try {
        let {
            productCategoryId
        } = await req.body;
        let delete_status = await ProductCategory.update({
            status: 2
        }, {
            where: { productCategoryId: productCategoryId }
        });
        logger.info(`ProductCategory deleted by id ${productCategoryId} delete status: ${delete_status}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.productcategorydeleted });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * change status of product category  by id
 *
 * @body {productCategoryId, status} to change status
 */
exports.changeStatus = async (req, res, next) => {
    try {
        let {
            productCategoryId,
            status
        } = await req.body;
        let change_status = await ProductCategory.update({
            status
        }, {
            where: {
                productCategoryId: productCategoryId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`ProductCategory status changed to ${status} for product category  ${productCategoryId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.productcategorystatus });
        } else {
            logger.info(`ProductCategory status for product category  ${productCategoryId} not changed`);
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