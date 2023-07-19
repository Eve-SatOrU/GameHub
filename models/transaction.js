// models/Transaction.js
const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  userName: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  packageID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  responseCode: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  playerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  operationId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Transaction;
