const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const table_name = 'countryMaster'
const CountryMaster = sequelize.define(table_name, {
    countryMasterId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    countryName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    countryCode: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    createBy: {
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
    }
});

module.exports = CountryMaster;