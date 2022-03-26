const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const StateMaster = require('./stateMaster');
const CountryMaster = require('./countryMaster');
const CityMaster = require('./cityMaster');
const User = require('./user');
const table_name = 'userAddress';
const UserAddress = sequelize.define(table_name, {
    userAddressId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    fullName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    mobileNumber: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pincode: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    addressLine1: {
        type: Sequelize.STRING,
        allowNull: true
    },
    addressLine2: {
        type: Sequelize.STRING,
        allowNull: true
    },
    cityMasterId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    stateMasterId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    countryMasterId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    isDefault: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    addressType: {
        type: Sequelize.ENUM(['Home', 'Work', 'Other']),
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

UserAddress.belongsTo(User, { as: "user", foreignKey: { name: "userId" } });
UserAddress.belongsTo(CountryMaster, { as: "country", foreignKey: { name: "countryMasterId" } });
UserAddress.belongsTo(StateMaster, { as: "state", foreignKey: { name: "stateMasterId" } });
UserAddress.belongsTo(CityMaster, { as: "city", foreignKey: { name: "cityMasterId" } });

module.exports = UserAddress;