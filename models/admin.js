const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');


const Admin =sequelize.define('Admin' ,{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      userName: Sequelize.STRING,
      userPassword: Sequelize.STRING,
      wallet: {
        type: DataTypes.FLOAT,
        defaultValue: 1000,
      },    
});


module.exports = Admin;