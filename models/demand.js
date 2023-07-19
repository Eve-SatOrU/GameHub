const { DataTypes } = require('sequelize');
const sequelize = require('../util/database.js');
const User =require('./user.js');
const Demand = sequelize.define('demand', {
money: {
    type: DataTypes.FLOAT,
    allowNull: false,
},
imageData: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
});


// Define associations
Demand.associate = (models) => {
    // A demand belongs to a user
    Demand.belongsTo(models.User, { foreignKey: 'userName', targetKey: 'userName' });
  };
    
module.exports = Demand;