const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  certificate_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  issued_to: {
    type: DataTypes.STRING,
    allowNull: false
  },
  carbon_tons: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  verification_status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending Ledger Block Settle'
  },
  stellar_ledger_index: {
    type: DataTypes.INTEGER
  },
  stellar_tx_hash: {
    type: DataTypes.STRING
  }
}, {
  timestamps: false,
  tableName: 'certificates'
});

module.exports = Certificate;
