const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const table_name = 'MasterAdmin'
const MasterAdmin = sequelize.define(table_name, {
    adminId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    reset_password_token: {
        type: Sequelize.STRING,
        allowNull: true
    },
    status: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    updateBy: {
        type: Sequelize.BIGINT,
        allowNull: true
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

module.exports = MasterAdmin;