const Sequelize = require('sequelize');
const logger = require('../config/logger');
const sequelize = require('../config/database');
const message = require('../response_message/message');
const Order = require('../models/order');
const UserCart = require('../models/userCart');
const OrderItems = require('../models/orderItems');
const Product = require('../models/product');

/**
 * insert order data
 * 
 * @body {userId, referenceNumber, totalPrice, orderDate, expectedDeliveryDate, deliveryStatus, remarks,
 *       createByIp} req to add order data
 */
exports.addOrder = async (req, res, next) => {
    try {
        let {
            userId,
            totalPrice,
            orderDate,
            deliveryStatus,
            remarks,
            selectedAddress,
            createByIp
        } = await req.body;

        let get_items = await UserCart.findAll({
            where: {
                userId: userId,
                status: 1
            }
        });

        if (get_items.length > 0) {
            let insert_status = await Order.create({
                userId,
                totalPrice,
                orderDate,
                deliveryStatus,
                remarks,
                selectedAddress,
                createByIp
            });
            let items = [];
            await get_items.forEach(async (item, index) => {
                let get_delivery_time = await Product.findOne({
                    attributes: ['deliveryDays'],
                    where: {
                        productId: item.productId,
                        status: 1
                    }
                });
                let exp_date = new Date(orderDate);
                exp_date.setDate(exp_date.getDate() + get_delivery_time.deliveryDays);
                items.push({
                    orderId: insert_status.orderId,
                    quantity: item.quantity,
                    productId: item.productId,
                    expectedDeliveryDate: exp_date,
                    createByIp: createByIp
                })
            })

            // emptying the user cart
            let empty_cart = await UserCart.update({
                status: 2
            }, {
                where: {
                    userId: userId,
                    status: 1
                },
                returning: true
            });

            for (const item of empty_cart[1]) {
                // subtracting the quantity of the product
                let remove_product = await Product.update({
                    quantity: Sequelize.literal('quantity - ' + item.quantity)
                }, {
                    where: {
                        productId: item.productId,
                        status: 1
                    }
                });
            }
            logger.info(`UserCart emptied for user: ${userId}`);

            let insert_items = await OrderItems.bulkCreate(items);
            insert_status.dataValues['orderItems'] = items;

            logger.info(`Order data inserted: ${JSON.stringify(req.body)} \n order items: ${insert_items}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.orderadded, data: insert_status });
        } else {
            logger.info(`Order not added: ${JSON.stringify(req.body)}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.orderfailed, data: {} });
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

exports.getAllOrders = async (req, res, next) => {
    try {
        let { limit, page } = await req.body;
        let offset = (page - 1) * limit;
        let order_data = [];
        if (limit == "" && page == "") {
            order_data = await Order.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                include: [{ all: true, nested: true }]
            });
        }
        else {
            order_data = await Order.findAll({
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
        if (order_data.length > 0) {
            for (const order of order_data) {
                order.dataValues['orderItems'] = await OrderItems.findAll({
                    raw: true,
                    where: {
                        orderId: order.orderId,
                        status: 1
                    }
                });
            }
        }
        console.log(order_data);

        let totalcount = await Order.count({
            raw: true,
            where: { status: ['0', '1'] },
        });
        logger.info(`Order get data ${JSON.stringify(order_data)} `);
        res.status(200)
            .json({ status: 200, data: order_data, totalcount: totalcount });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns order data by id
 * 
 * @param {id} req to get order data by id
 */

exports.getOrderById = async (req, res, next) => {
    try {
        let order_data = await Order.findOne({
            where: {
                status: [0, 1],
                orderId: req.params.id
            },
            include: [{ all: true, nested: true }]
        });

        if (order_data) {
            let get_items = await OrderItems.findAll({
                where: {
                    orderId: req.params.id,
                    status: 1
                }
            });
            order_data.dataValues['orderItems'] = get_items;
        }
        logger.info(`Order get data by id ${req.params.id} results: ${JSON.stringify(order_data)} `);
        if (order_data)
            res.status(200)
                .json({ status: 200, data: order_data });
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
 * returns order data by user id
 * 
 * @param {id} req to get order data by user id
 */

exports.getOrderByUserId = async (req, res, next) => {
    try {
        let order_data = await Order.findAll({
            where: {
                status: [0, 1],
                userId: req.params.id
            },
            include: [{ all: true, nested: true }]
        });
        if (order_data.length > 0) {
            for (var order of order_data) {
                order.dataValues['orderItems'] = await OrderItems.findAll({
                    where: {
                        orderId: order.orderId,
                        status: 1
                    }
                });
            }
        }
        logger.info(`Order get data by user id ${req.params.id} results: ${JSON.stringify(order_data)} `);
        if (order_data)
            res.status(200)
                .json({ status: 200, data: order_data });
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
 * updates order data
 * 
 * @body {orderId, userId, referenceNumber, totalPrice, orderDate, expectedDeliveryDate, deliveryStatus, remarks,
 *       updateByIp} req to update order data
 */
exports.updateOrder = async (req, res, next) => {
    try {
        let {
            orderId,
            userId,
            totalPrice,
            orderDate,
            deliveryStatus,
            remarks,
            selectedAddress,
            updateByIp
        } = await req.body;
        let update_status = await Order.update({
            userId,
            totalPrice,
            orderDate,
            deliveryStatus,
            remarks,
            selectedAddress,
            updateByIp
        }, {
            where: {
                orderId: orderId
            }
        });
        logger.info(`Order data updated status: ${JSON.stringify(update_status)} for userid ${orderId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.orderupdated, data: {} });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * delete order by id
 *
 * @body {orderId} to delete user
 */
exports.deleteOrder = async (req, res, next) => {
    try {
        let {
            orderId
        } = await req.body;
        let delete_status = await Order.update({
            status: 2
        }, {
            where: { orderId: orderId }
        });
        logger.info(`Order deleted by id ${orderId} delete status: ${delete_status}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.orderdeleted });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * change status of order by id
 *
 * @body {orderId, status} to change status
 */
exports.changeStatus = async (req, res, next) => {
    try {
        let {
            orderId,
            status
        } = await req.body;
        let change_status = await Order.update({
            status
        }, {
            where: {
                orderId: orderId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`Order status changed to ${status} for order ${orderId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.orderstatus });
        } else {
            logger.info(`Order status for order ${orderId} not changed`);
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