const Sequelize = require('sequelize');
const logger = require('../config/logger');
const message = require('../response_message/message');
const Product = require('../models/product');

/**
 * insert product data
 * 
 * @body {name, description, SKU, price, image, categoryId, discountId, quantity, createByIp} req to add product data
 */
exports.addProduct = async (req, res, next) => {
    try {
        let {
            name,
            description,
            SKU,
            price,
            categoryId,
            discountId,
            quantity,
            deliveryDays,
            createByIp
        } = await req.body;
        let image = "";
        if (req.file) {
            image = req.file.filename;
        }
        let insert_status = await Product.create({
            name,
            description,
            SKU,
            price,
            image,
            categoryId,
            discountId,
            quantity,
            deliveryDays,
            createByIp
        });

        logger.info(`Product data inserted: ${JSON.stringify(req.body)}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.productadded, data: insert_status });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns all products data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllProducts = async (req, res, next) => {
    try {
        let { limit, page } = await req.body;
        let offset = (page - 1) * limit;
        let product_data = [];
        if (limit == "" && page == "") {
            product_data = await Product.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                include: [{ all: true, nested: true }]
            });
        }
        else {
            product_data = await Product.findAll({
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
        let totalcount = await Product.count({
            raw: true,
            where: { status: ['0', '1'] },
        });
        logger.info(`Product get data ${JSON.stringify(product_data)} `);
        res.status(200)
            .json({ status: 200, data: product_data, totalcount: totalcount });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns product data by id
 * 
 * @param {id} req to get product data by id
 */

exports.getProductById = async (req, res, next) => {
    try {
        let product_data = await Product.findOne({
            where: {
                status: [0, 1],
                productId: req.params.id
            }
        });
        logger.info(`Product get data by id ${req.params.id} results: ${JSON.stringify(product_data)} `);
        if (product_data)
            res.status(200)
                .json({ status: 200, data: product_data });
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
 * returns product data by category id
 * 
 * @param {id} req to get product data by category id
 */

exports.getProductByCategoryId = async (req, res, next) => {
    try {
        let product_data = await Product.findAll({
            where: {
                status: [0, 1],
                categoryId: req.params.id
            }
        });
        logger.info(`Product get data by category id ${req.params.id} results: ${JSON.stringify(product_data)} `);
        if (product_data)
            res.status(200)
                .json({ status: 200, data: product_data });
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
 * returns product data by discount id
 * 
 * @param {id} req to get product data by  disocunt id
 */

exports.getProductByDiscountId = async (req, res, next) => {
    try {
        let product_data = await Product.findAll({
            where: {
                status: [0, 1],
                discountId: req.params.id
            }
        });
        logger.info(`Product get data by discount id ${req.params.id} results: ${JSON.stringify(product_data)} `);
        if (product_data)
            res.status(200)
                .json({ status: 200, data: product_data });
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
 * updates product data
 * 
 * @body {productId, name, description, SKU, price, image, categoryId, discountId, quantity, updateByIp} req to update product data
 */
exports.updateProduct = async (req, res, next) => {
    try {
        let {
            productId,
            name,
            description,
            SKU,
            price,
            categoryId,
            discountId,
            quantity,
            deliveryDays,
            updateByIp
        } = await req.body;
        let image = "";
        if (req.file) {
            image = req.file.filename;
        }
        let update_status = await Product.update({
            name,
            description,
            SKU,
            price,
            image,
            categoryId,
            discountId,
            quantity,
            deliveryDays,
            updateByIp
        }, {
            where: {
                productId: productId
            }
        });
        logger.info(`Product data updated status: ${JSON.stringify(update_status)} for productid ${productId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.productupdated, data: {} });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * delete product by id
 *
 * @body {productId} to delete product
 */
exports.deleteProduct = async (req, res, next) => {
    try {
        let {
            productId
        } = await req.body;
        let delete_status = await Product.update({
            status: 2
        }, {
            where: { productId: productId }
        });
        logger.info(`Product deleted by id ${productId} delete status: ${delete_status}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.productdeleted });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * change status of product by id
 *
 * @body {productId, status} to change status
 */
exports.changeStatus = async (req, res, next) => {
    try {
        let {
            productId,
            status
        } = await req.body;
        let change_status = await Product.update({
            status
        }, {
            where: {
                productId: productId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`product status changed to ${status} for product ${productId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.productstatus });
        } else {
            logger.info(`product status for product ${productId} not changed`);
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