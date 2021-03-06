const Sequelize = require('sequelize');
const logger = require('../config/logger');
const sequelize = require('../config/database');
const message = require('../response_message/message');
const Product = require('../models/product');
const ProductDiscount = require('../models/productDiscount');
const ProductCategory = require('../models/productCategory');
const readXlsxFile = require("read-excel-file/node");

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
            images,
            deliveryDays,
            slug,
            createByIp
        } = await req.body;
        // let images = [];
        if (req.files) {
            images = [];
            for (const file of req.files)
                images.push(file.filename);
        }
        let insert_status, discountedPrice = null;
        if (discountId) {
            let product_discount = await ProductDiscount.findOne({
                where: {
                    status: 1,
                    productDiscountId: discountId
                }
            });

            if (product_discount) {
                discountedPrice = price - (price * product_discount.percentage / 100);
            } else {
                return res.json({ status: 200, message: message.resmessage.productdiscountnotexists, data: {} })
            }
        }
        insert_status = await Product.create({
            name,
            description,
            SKU,
            price,
            images,
            categoryId,
            discountId,
            quantity,
            discountedPrice,
            deliveryDays,
            slug,
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
 * 
 * @body {excel file} req 
 * @param {*} res 
 * @param {*} next 
 */

exports.addProductExcel = async (req, res, next) => {
    try {
        if (req.file == undefined) {
            return res.status(400).send("Please upload an excel file!");
        }
        let path = "./uploads/product/excel/" + req.file.filename;
        readXlsxFile(path).then(async (rows) => {
            // skip header
            rows.shift();
            let ProductData = [];
            rows.forEach((row) => {
                let product_data = {
                    name: row[0],
                    description: row[1],
                    SKU: row[2],
                    price: row[3],
                    images: row[4],
                    categoryId: row[5],
                    discountId: row[6],
                    quantity: row[7],
                    deliveryDays: row[8],
                    slug: row[9],
                    createByIp: req.body.createByIp
                };
                ProductData.push(product_data);
            });
            for (var product_data of ProductData) {

                if (product_data.discountId !== undefined) {
                    let product_discount = await ProductDiscount.findOne({
                        where: {
                            status: 1,
                            productDiscountId: product_data.discountId
                        }
                    });

                    if (product_discount) {
                        let discountedPrice = product_data.price - (product_data.price * product_discount.percentage / 100);
                        product_data.discountedPrice = discountedPrice;
                    }
                }
            }
            Product.bulkCreate(ProductData).then(() => {
                res.status(200).send({
                    status: 200,
                    message: "Uploaded the file successfully: " + req.file.originalname,
                });
            })
                .catch((error) => {
                    res.status(200).send({
                        status: 401,
                        message: "Fail to import data into database!",
                        error: error.message,
                    });
                });

        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Could not upload the file: " + req.file.originalname,
        });
    }
};

/**
 * returns all products data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllProducts = async (req, res, next) => {
    try {
        let { limit, page, searchQuery } = await req.body;
        let offset = (page - 1) * limit;
        let product_data = [], totalcount;
        if (searchQuery) {
            product_data = await Product.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { name: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { description: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { SKU: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { slug: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$category.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$category.description$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$discount.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$discount.description$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        sequelize.where(
                            sequelize.cast(sequelize.col('discount.percentage'), 'varchar'),
                            { [Sequelize.Op.iLike]: `%${searchQuery}%` }
                        ),
                        sequelize.where(
                            sequelize.cast(sequelize.col('product.deliveryDays'), 'varchar'),
                            { [Sequelize.Op.iLike]: `%${searchQuery}%` }
                        ),
                        sequelize.where(
                            sequelize.cast(sequelize.col('product.quantity'), 'varchar'),
                            { [Sequelize.Op.iLike]: `%${searchQuery}%` }
                        ),
                        sequelize.where(
                            sequelize.cast(sequelize.col('product.price'), 'varchar'),
                            { [Sequelize.Op.iLike]: `%${searchQuery}%` }
                        )
                    ],
                    status: [0, 1]
                },
                include: [{
                    model: ProductCategory,
                    as: 'category'
                }, {
                    model: ProductDiscount,
                    as: 'discount'
                }]
            });
            totalcount = product_data.length;
        } else if (limit == "" && page == "") {
            product_data = await Product.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                include: [{ all: true, nested: true }]
            });
            totalcount = await Product.count({
                raw: true,
                where: { status: ['0', '1'] },
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
            totalcount = await Product.count({
                raw: true,
                where: { status: ['0', '1'] },
            });
        }

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
            },
            include: [{ all: true, nested: true }]
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
            images,
            deliveryDays,
            slug,
            updateByIp
        } = await req.body;
        // let images = [];
        if (req.files) {
            images = [];
            for (const file of req.files)
                images.push(file.filename);
        }
        let update_status;
        if (discountId) {
            let product_discount = await ProductDiscount.findOne({
                where: {
                    status: 1,
                    productDiscountId: discountId
                }
            });

            if (product_discount) {
                let discountedPrice = price - (price * product_discount.percentage / 100);
                update_status = await Product.update({
                    name,
                    description,
                    SKU,
                    price,
                    images,
                    categoryId,
                    discountId,
                    discountedPrice,
                    quantity,
                    deliveryDays,
                    slug,
                    updateByIp
                }, {
                    where: {
                        productId: productId
                    }
                });
            } else {
                return res.json({ status: 200, message: message.resmessage.productdiscountnotexists, data: {} })
            }
        } else {
            update_status = await Product.update({
                name,
                description,
                SKU,
                price,
                images,
                categoryId,
                discountId,
                quantity,
                deliveryDays,
                slug,
                updateByIp
            }, {
                where: {
                    productId: productId
                }
            });
        }
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