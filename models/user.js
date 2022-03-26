const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const table_name = 'user';
const User = sequelize.define(table_name, {
    userId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    admin: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true,
        isEmail: true
    },
    mobileNumber: {
        type: Sequelize.BIGINT,
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

module.exports = User;