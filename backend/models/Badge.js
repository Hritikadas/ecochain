const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Badge = sequelize.define('Badge', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  badge_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  badge_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stellar_tx_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  earned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'badges'
});

module.exports = Badge;
