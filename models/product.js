const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const ProductCategory = require('./productCategory');
const ProductDiscount = require('./productDiscount');
const table_name = 'product';
const Product = sequelize.define(table_name, {
    productId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true
    },
    SKU: {
        type: Sequelize.STRING,
        allowNull: false
    },
    images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
    },
    price: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    discountedPrice: {
        type: Sequelize.DECIMAL,
        allowNull: true
    },
    tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
    },
    categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    discountId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    deliveryDays: {
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

Product.belongsTo(ProductCategory, { as: "category", foreignKey: { name: "categoryId" } });
Product.belongsTo(ProductDiscount, { as: "discount", foreignKey: { name: "discountId" } });

module.exports = Product;