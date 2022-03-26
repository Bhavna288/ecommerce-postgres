const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const UserAddress = require('./userAddress');
const table_name = 'order';
const Order = sequelize.define(table_name, {
    orderId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    referenceNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: () => {
            return Date.now();
        }
    },
    totalPrice: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    orderDate: {
        type: Sequelize.DATE,
        allowNull: false
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    deliveryStatus: {
        type: Sequelize.STRING,
        allowNull: false
    },
    remarks: {
        type: Sequelize.STRING,
        allowNull: true
    },
    selectedAddress: {
        type: Sequelize.INTEGER,
        allowNull: false,
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

Order.belongsTo(User, { as: "user", foreignKey: { name: "userId" } });
Order.belongsTo(UserAddress, { as: "address", foreignKey: { name: "selectedAddress" } });

module.exports = Order;