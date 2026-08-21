const sequelize = require('../config/sequelize');
const User = require('./User');
const Product = require('./Product');
const Offset = require('./Offset');
const Badge = require('./Badge');
const Place = require('./Place');
const FootprintLog = require('./FootprintLog');
const Certificate = require('./Certificate');

// Export all models and the sequelize instance
module.exports = {
  sequelize,
  User,
  Product,
  Offset,
  Badge,
  Place,
  FootprintLog,
  Certificate
};
