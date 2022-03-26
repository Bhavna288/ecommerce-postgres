const Sequelize = require('sequelize');
const logger = require('../config/logger');
const message = require('../response_message/message');
const Payment = require('../models/payment');

/**
 * insert payment data
 * 
 * @body {orderId, amount, mode, createByIp} req to add payment data
 */
exports.addPayment = async (req, res, next) => {
    try {
        let {
            orderId,
            amount,
            mode,
            createByIp
        } = await req.body;
        let insert_status = await Payment.create({
            orderId,
            amount,
            mode,
            createByIp
        });
        logger.info(`Payment data inserted: ${JSON.stringify(req.body)}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.paymentadded, data: insert_status });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns all payment data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllPayment = async (req, res, next) => {
    try {
        let { limit, page } = await req.body;
        let offset = (page - 1) * limit;
        let payment_data = [];
        if (limit == "" && page == "") {
            payment_data = await Payment.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                include: [{ all: true, nested: true }]
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

        }
        let totalcount = await Payment.count({
            where: { status: ['0', '1'] },
        });
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
 * updates payment data
 * 
 * @body {paymentId, orderId, amount, mode, updateByIp} req to update payment data
 */
exports.updatePayment = async (req, res, next) => {
    try {
        let {
            paymentId,
            orderId,
            amount,
            mode,
            updateByIp
        } = await req.body;
        let update_status = await Payment.update({
            orderId,
            amount,
            mode,
            updateByIp
        }, {
            where: {
                paymentId: paymentId
            }
        });
        logger.info(`Payment data updated status: ${JSON.stringify(update_status)} for userid ${paymentId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.paymentupdated, data: {} });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * delete payment by id
 *
 * @body {paymentId} to delete payment
 */
exports.deletePayment = async (req, res, next) => {
    try {
        let {
            paymentId
        } = await req.body;
        let delete_status = await Payment.update({
            status: 2
        }, {
            where: { paymentId: paymentId }
        });
        logger.info(`Payment deleted by id ${paymentId} delete status: ${delete_status}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.paymentdeleted });
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