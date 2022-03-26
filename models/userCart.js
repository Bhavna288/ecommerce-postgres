const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Product = require('./product');
const table_name = 'userCart';
const UserCart = sequelize.define(table_name, {
    userCartId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    productId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    quantity: {
        type: Sequelize.INTEGER,
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

UserCart.belongsTo(Product, { as: "product", foreignKey: { name: "productId" } });
UserCart.belongsTo(User, { as: "user", foreignKey: { name: "userId" } });

module.exports = UserCart;