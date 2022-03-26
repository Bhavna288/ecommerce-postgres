const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const StateMaster = require('./stateMaster');
const table_name = 'cityMaster'
const CityMaster = sequelize.define(table_name, {
    cityMasterId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    cityName: {
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
    }
});

CityMaster.belongsTo(StateMaster, { foreignKey: { name: "stateMasterId" } });

module.exports = CityMaster;