const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Offset = sequelize.define('Offset', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  trees_planted: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  amount_usd: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0
  },
  stellar_tx_hash: {
    type: DataTypes.STRING
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'offsets'
});

module.exports = Offset;
