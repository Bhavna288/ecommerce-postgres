const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./order');
const table_name = 'payment';
const Payment = sequelize.define(table_name, {
    paymentId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    amount: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    mode: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sessionId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    currency: {
        type: Sequelize.STRING,
        allowNull: true
    },
    stripeEmail: {
        type: Sequelize.STRING,
        allowNull: true
    },
    nameOnCard: {
        type: Sequelize.STRING,
        allowNull: true
    },
    url: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    createByIp: {
        type: Sequelize.STRING,
        allowNull: false
    },
    updateByIp: {
        type: Sequelize.STRING,
        allowNull: true
    },
});

module.exports = Payment;