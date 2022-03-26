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
    orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
    },
    amount: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    mode: {
        type: Sequelize.STRING,
        allowNull: false
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

Payment.belongsTo(Order, { as: "order", foreignKey: { name: "orderId" } });

module.exports = Payment;