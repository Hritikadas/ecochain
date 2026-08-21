const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const FootprintLog = sequelize.define('FootprintLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  activity_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  input_value: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  emissions_kg: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  logged_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'footprint_logs'
});

module.exports = FootprintLog;
