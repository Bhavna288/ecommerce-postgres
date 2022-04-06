const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const OrderItems = require('./orderItems');
const Payment = require('./payment');
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
    deliveryStatus: {
        type: Sequelize.STRING,
        allowNull: false
    },
    deliveryType: {
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

Order.belongsTo(User, { as: "user", foreignKey: { name: "userId" } });
Order.belongsTo(UserAddress, { as: "address", foreignKey: { name: "selectedAddress" } });
Order.hasOne(Payment, { foreignKey: { name: "orderId" }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Order.hasMany(OrderItems, { foreignKey: { name: "orderId" }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
OrderItems.belongsTo(Order, { as: "order", foreignKey: { name: "orderId" } });
Payment.belongsTo(Order, { as: "order", foreignKey: { name: "orderId" } });

module.exports = Order;