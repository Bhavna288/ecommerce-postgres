const Sequelize = require('sequelize');
const logger = require('../config/logger');
const sequelize = require('../config/database');
const message = require('../response_message/message');
const Order = require('../models/order');
const UserCart = require('../models/userCart');
const OrderItems = require('../models/orderItems');
const Product = require('../models/product');
const User = require('../models/user');
const UserAddress = require('../models/userAddress');
const Stripe = require('stripe');
const { addPayment } = require('./payment.controller');
const { sendEmailForOrder } = require('../middleware/sendemail');

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
            orderDate,
            deliveryStatus,
            remarks,
            selectedAddress,
            mode,
            stripeEmail,
            deliveryType,
            successUrl,
            cancelUrl,
            createByIp
        } = await req.body;
        let totalPrice = 0;
        let get_items = await UserCart.findAll({
            raw: true,
            nest: true,
            where: {
                userId: userId,
                status: 1
            },
            include: [{
                model: Product,
                as: 'product',
                attributes: ["name", "price", "discountedPrice"]
            }]
        });

        await get_items.forEach(item => {
            totalPrice += ((item.product.discountedPrice ? item.product.discountedPrice : item.product.price) * item.quantity);
        })

        if (get_items.length > 0) {
            let insert_status = await Order.create({
                userId,
                totalPrice,
                orderDate,
                deliveryStatus,
                remarks,
                selectedAddress,
                deliveryType,
                createByIp
            });
            let items = [];
            for (var item of get_items) {
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
                    userCartId: item.userCartId,
                    expectedDeliveryDate: exp_date,
                    createByIp: createByIp
                })
            }

            let insert_items = await OrderItems.bulkCreate(items);
            insert_status.dataValues['orderItems'] = items;

            var item_obj = items.reduce((obj, item) => ({ ...obj, [item.productId]: JSON.stringify(items) }), {})
            let payment_body = {
                orderId: insert_status.orderId,
                stripeEmail: stripeEmail,
                metadata: item_obj,
                items: get_items,
                success_url: successUrl,
                cancel_url: cancelUrl,
                mode: mode,
                totalPrice: totalPrice,
                createByIp: createByIp
            }

            let add_payment = await addPayment(payment_body).then(async (add_payment) => {
                if (add_payment && add_payment.err) {
                    let delete_order = Order.destroy({ where: { orderId: insert_status.orderId } }).then((deleted) => {
                        res.status(200)
                            .json({ status: 401, message: message.resmessage.paymentfailed, data: {} });
                    }).catch(err => console.log(err));
                } else {
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
                        }).catch(err => {
                            return res.status(200)
                                .json({ status: 401, message: message.resmessage.orderproductnotremoved, data: {} });
                        });
                    }
                    logger.info(`UserCart emptied for user: ${userId}`);
                    insert_status.setDataValue('payment', add_payment);
                    await sendEmail(insert_status.orderId);

                    logger.info(`Order data inserted: ${JSON.stringify(req.body)} \n order items: ${insert_items}`);
                    res.status(200)
                        .json({ status: 200, message: message.resmessage.orderadded, data: insert_status });
                }
            });
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

const sendEmail = async (orderId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let get_this_order = await Order.findOne({
                where: {
                    status: [0, 1],
                    orderId: orderId
                },
                include: [{ all: true, nested: true }]
            });

            get_this_order = get_this_order.get({ plain: true });
            let od = new Date(get_this_order.orderDate);
            get_this_order.orderDate = od.getDate() + "-" + od.getMonth() + "-" + od.getFullYear();

            if (get_this_order) {
                let get_items = await OrderItems.findAll({
                    where: {
                        orderId: orderId,
                        status: 1
                    },
                    include: {
                        model: Product,
                        as: 'product'
                    }
                });

                get_items = get_items.map(item => {
                    let edd = new Date(item.dataValues.expectedDeliveryDate);
                    item.dataValues.expectedDeliveryDate = edd.getDate() + "-" + edd.getMonth() + "-" + edd.getFullYear();
                    item.dataValues.product = item.dataValues.product.dataValues;
                    return item.dataValues
                });
                console.log(get_items);

                get_this_order['orderItems'] = get_items;
            }

            sendEmailForOrder(get_this_order);
            return resolve(body);
        } catch (err) {
            return resolve({ status: 0, message: err });
        }
    });
}

/**
 * returns all users data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllOrders = async (req, res, next) => {
    try {
        let { limit, page, searchQuery } = await req.body;
        let offset = (page - 1) * limit;
        let order_data = [], totalcount;
        if (searchQuery) {
            order_data = await Order.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { referenceNumber: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { deliveryStatus: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { remarks: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { deliveryType: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$user.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$user.email$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$user.mobileNumber$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$address.fullName$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$address.pincode$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$address.addressLine1$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$address.addressLine2$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$address.mobileNumber$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$address.city.cityName$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$address.state.stateName$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$address.country.countryName$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        sequelize.where(
                            sequelize.cast(sequelize.col('order.totalPrice'), 'varchar'),
                            { [Sequelize.Op.iLike]: `%${searchQuery}%` }
                        ),
                        sequelize.where(
                            sequelize.cast(sequelize.col('order.orderDate'), 'varchar'),
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
                    model: UserAddress,
                    as: 'address',
                    include: ['state', 'city', 'country']
                }]
            });
            totalcount = order_data.length;
        } else if (limit == "" && page == "") {
            order_data = await Order.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                include: [{ all: true, nested: true }]
            });
            totalcount = await Order.count({
                raw: true,
                where: { status: ['0', '1'] },
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
            totalcount = await Order.count({
                raw: true,
                where: { status: ['0', '1'] },
            });
        }
        if (order_data.length > 0) {
            for (const order of order_data) {
                order.dataValues['orderItems'] = await OrderItems.findAll({
                    where: {
                        orderId: order.orderId,
                        status: 1
                    },
                    include: {
                        model: Product,
                        as: 'product'
                    }
                });
            }
        }

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
 * returns order data by reference number
 * 
 * @body {referenceNumber} req to get order data by id
 */

exports.getOrderByReferenceNumber = async (req, res, next) => {
    try {
        let { referenceNumber } = req.body;
        let order_data = await Order.findOne({
            where: {
                status: [0, 1],
                referenceNumber: referenceNumber
            },
            include: [{ all: true, nested: true }]
        });

        if (order_data) {
            let get_items = await OrderItems.findAll({
                where: {
                    orderId: order_data.orderId,
                    status: 1
                }
            });
            order_data.dataValues['orderItems'] = get_items;
        }
        logger.info(`Order get data by referenceNumber ${referenceNumber} results: ${JSON.stringify(order_data)} `);
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
 * @body {orderId, deliveryType, deliveryStatus, remarks, updateByIp} req to update order data
 */
exports.updateOrder = async (req, res, next) => {
    try {
        let {
            orderId,
            remarks,
            selectedAddress,
            deliveryType,
            updateByIp
        } = await req.body;
        let update_status = await Order.update({
            remarks,
            selectedAddress,
            deliveryType,
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
 * change delivery status of order by id
 *
 * @body {orderId, deliveryStatus} to change status
 */
exports.changeDeliveryStatus = async (req, res, next) => {
    try {
        let {
            orderId,
            deliveryStatus
        } = await req.body;
        let change_status = await Order.update({
            deliveryStatus
        }, {
            where: {
                orderId: orderId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`Order delivery status changed to ${deliveryStatus} for order ${orderId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.orderdeliverystatus });
        } else {
            logger.info(`Order delivery status for order ${orderId} not changed`);
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

/**
 * change delivery type of order by id
 *
 * @body {orderId, deliveryType} to change type
 */
exports.changeDeliveryType = async (req, res, next) => {
    try {
        let {
            orderId,
            deliveryType
        } = await req.body;
        let change_delivery_type = await Order.update({
            deliveryType
        }, {
            where: {
                orderId: orderId,
                status: [0, 1]
            }
        });
        if (change_delivery_type != 0) {
            logger.info(`Order delivery type changed to ${deliveryType} for order ${orderId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.orderdeliverytype });
        } else {
            logger.info(`Order delivery type for order ${orderId} not changed`);
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