const Sequelize = require('sequelize');
const logger = require('../config/logger');
const sequelize = require('../config/database');
const message = require('../response_message/message');
const Payment = require('../models/payment');
const Order = require('../models/order');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51KjnicSCSdPhz8Uw985iwrerpwUCgeLgAJdKOuvA6BNHYPfzy9gEReOQs72tECozyufEpAuMwU4zZnxsWx77nkUL00U5ffLAW0');
const domain = "localhost:3000"

/**
 * insert payment data
 * 
 * @body {orderId, amount, mode, createByIp} req to add payment data
 */
exports.addPayment = async (body) => {
    try {
        let {
            orderId,
            payment,
            stripeEmail,
            nameOnCard,
            metadata,
            items,
            success_url,
            cancel_url,
            mode,
            totalPrice,
            createByIp
        } = body;
        let insert_payment_status, session;
        if (mode == 'card') {
            const paymentMethod = await stripe.paymentMethods.create({
                type: 'card',
                card: {
                    number: payment.cardNumber,
                    exp_month: payment.expMonth,
                    exp_year: payment.expYear,
                    cvc: payment.cvc
                },
            }).catch(err => { return { err: err } });
            await stripe.customers.create({
                email: stripeEmail,
                name: nameOnCard
            }).then(async (customer) => {
                const attachPaymentMethod = await stripe.paymentMethods.attach(
                    paymentMethod.id,
                    { customer: customer.id }
                ).catch(err => { return { err: err } });
                session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    customer: customer.id,
                    metadata: metadata,
                    line_items: items.map(item => {
                        return {
                            price_data: {
                                currency: 'inr',
                                product_data: {
                                    name: item.product.name
                                },
                                unit_amount: (item.product.discountedPrice ? item.product.discountedPrice : item.product.price) * 100
                            },
                            quantity: item.quantity
                        }
                    }),
                    mode: "payment",
                    success_url,
                    cancel_url
                }).catch(err => { return { err: err } });
            }).catch(err => { return { err: err } });
            insert_payment_status = await Payment.create({
                orderId: orderId,
                amount: session.amount_total / 100,
                mode: mode,
                sessionId: session.id,
                currency: 'inr',
                stripeEmail: stripeEmail,
                url: session.url,
                createByIp: createByIp
            }).catch(err => { console.log(err); return ({ err: err }) });

            logger.info(`Payment data inserted: ${JSON.stringify(body)}`);

            return insert_payment_status;
        } else {
            insert_payment_status = await Payment.create({
                orderId: orderId,
                amount: totalPrice,
                mode: mode,
                currency: 'inr',
                createByIp: createByIp
            }).catch(err => { console.log(err); return ({ err: err }) });

            logger.info(`Payment data inserted: ${JSON.stringify(body)}`);

            return insert_payment_status;
        }

    } catch (err) {
        if (!err.statusCode) {
            return ({ status: 401, err: err, data: {} })
        }
    }
};

/**
 * returns all payment data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllPayment = async (req, res, next) => {
    try {
        let { limit, page, searchQuery } = await req.body;
        let offset = (page - 1) * limit;
        let payment_data = [], totalcount;
        if (searchQuery) {
            payment_data = await Payment.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { mode: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$order.referenceNumber$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$order.deliveryStatus$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$order.remarks$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$order.user.name$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$order.user.email$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        { '$order.user.mobileNumber$': { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                        sequelize.where(
                            sequelize.cast(sequelize.col('payment.amount'), 'varchar'),
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
                    model: Order,
                    as: 'order',
                    include: ['user']
                }]
            });
            totalcount = payment_data.length;
        } else if (limit == "" && page == "") {
            payment_data = await Payment.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                include: [{ all: true, nested: true }]
            });
            totalcount = await Payment.count({
                where: { status: ['0', '1'] },
            });
        }
        else {
            payment_data = await Payment.findAll({

                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                limit: limit,
                offset: offset,
                include: [{ all: true, nested: true }]
            });
            totalcount = await Payment.count({
                where: { status: ['0', '1'] },
            });
        }

        logger.info(`Payment get data ${JSON.stringify(payment_data)} `);
        res.status(200)
            .json({ status: 200, data: payment_data, totalcount: totalcount });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns payment data by id
 * 
 * @param {id} req to get payment data by id
 */

exports.getPaymentById = async (req, res, next) => {
    try {
        let payment_data = await Payment.findOne({
            where: {
                status: [0, 1],
                paymentId: req.params.id
            },
            include: [{ all: true, nested: true }]
        });
        logger.info(`Payment get data by id ${req.params.id} results: ${JSON.stringify(payment_data)} `);
        if (payment_data)
            res.status(200)
                .json({ status: 200, data: payment_data });
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
 * returns payment data by order id
 * 
 * @param {id} req to get payment data by order id
 */

exports.getPaymentByOrderId = async (req, res, next) => {
    try {
        let payment_data = await Payment.findAll({
            where: {
                status: [0, 1],
                orderId: req.params.id
            },
            include: [{ all: true, nested: true }]
        });
        logger.info(`Payment get data by order id ${req.params.id} results: ${JSON.stringify(payment_data)} `);
        if (payment_data)
            res.status(200)
                .json({ status: 200, data: payment_data });
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
 * change status of payment by id
 *
 * @body {paymentId, status} to change status
 */
exports.changeStatus = async (req, res, next) => {
    try {
        let {
            paymentId,
            status
        } = await req.body;
        let change_status = await Payment.update({
            status
        }, {
            where: {
                paymentId: paymentId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`Payment status changed to ${status} for payment ${paymentId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.paymentstatus });
        } else {
            logger.info(`Payment status for payment ${paymentId} not changed`);
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