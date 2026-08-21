const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Place = sequelize.define('Place', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Verification Active'
  },
  type: {
    type: DataTypes.STRING
  }
}, {
  timestamps: false,
  tableName: 'places'
});

module.exports = Place;
