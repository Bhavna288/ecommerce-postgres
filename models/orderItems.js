const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./order');
const Product = require('./product');
const UserCart = require('./userCart');
const table_name = 'orderItems';
const OrderItems = sequelize.define(table_name, {
    orderItemsId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    productId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    userCartId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    expectedDeliveryDate: {
        type: Sequelize.DATE,
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

OrderItems.belongsTo(Product, { as: "product", foreignKey: { name: "productId" } });
OrderItems.belongsTo(UserCart, { as: "cart", foreignKey: { name: "userCartId" } });

module.exports = OrderItems;