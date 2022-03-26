const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const CountryMaster = require('./countryMaster');
const table_name = 'stateMaster'
const StateMaster = sequelize.define(table_name, {
    stateMasterId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    stateName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    stateCode: {
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

StateMaster.belongsTo(CountryMaster, { foreignKey: { name: "countryMasterId" } });

module.exports = StateMaster;