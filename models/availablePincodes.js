const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const table_name = 'availablePincodes'
const AvailablePincodes = sequelize.define(table_name, {
    pincodeId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    pincode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
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
    }
});

module.exports = AvailablePincodes;