const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DATABASE_URL) {
  // Production / Supabase PostgreSQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    }
  });
  console.log('📡 Database: Connected to PostgreSQL (Supabase)');
} else {
  // Local Development — SQLite fallback
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../ecochain.db'),
    logging: false
  });
  console.log('📡 Database: Connected to SQLite (local dev)');
}

module.exports = sequelize;