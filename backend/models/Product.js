const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  seller: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stellar_asset_code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING
  },
  certificate_url: {
    type: DataTypes.STRING
  },
  stellar_tx_hash: {
    type: DataTypes.STRING
  }
}, {
  timestamps: false,
  tableName: 'products'
});

module.exports = Product;
