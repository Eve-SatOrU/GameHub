const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  userName: Sequelize.STRING,
  email: Sequelize.STRING,
  userPassword: Sequelize.STRING,
  phone: {
    type: Sequelize.STRING,
    allowNull: true
  },
  wallet: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
});

module.exports = User;