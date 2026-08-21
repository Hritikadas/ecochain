/**
 * Database Initialization & Seeder
 * 
 * Syncs all Sequelize models and seeds baseline data if tables are empty.
 * Works with both PostgreSQL (Supabase) and SQLite (local dev).
 */
const { sequelize, Product, Offset, Place, FootprintLog, Certificate } = require('../models');

async function initializeDatabase() {
  try {
    // Authenticate the connection
    await sequelize.authenticate();
    console.log('✅ Database connection authenticated successfully.');

    // Sync all models (creates tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log('✅ All Sequelize models synced (7 tables ready).');

    // Seed only if empty
    const productCount = await Product.count();
    if (productCount === 0) {
      console.log('🌱 Database fresh — seeding baseline assets...');

      // Marketplace products
      await Product.bulkCreate([
        {
          title: 'Certified Amazon Reforestation Credit',
          description: 'Verified high-impact biomass carbon capture asset anchored to Stellar ledger blocks.',
          price: 25.00,
          seller: 'EcoRegistry LLC',
          stellar_asset_code: 'AMZNRE',
          category: 'Carbon Offset Asset',
          certificate_url: 'https://example.org/cert/amazon-001'
        },
        {
          title: 'Mangrove Restoration Bond',
          description: 'Blue carbon maritime ecosystem restoration certificate tracking tidal marshlands.',
          price: 45.50,
          seller: 'Oceanic Shield Alliance',
          stellar_asset_code: 'MNGRV',
          category: 'Carbon Offset Asset',
          certificate_url: 'https://example.org/cert/mangrove-002'
        },
        {
          title: 'Solar Array Energy Yield NFT',
          description: 'Tokenized micro-fractional kilowatt hours generated via alternative energy grids.',
          price: 12.00,
          seller: 'Mithra Energy Labs',
          stellar_asset_code: 'SOLAR',
          category: 'Renewable Energy',
          certificate_url: 'https://example.org/cert/solar-003'
        }
      ]);

      // Carbon offsets for user #1
      await Offset.create({ user_id: 1, trees_planted: 150, amount_usd: 325.00 });

      // Eco map places
      await Place.bulkCreate([
        {
          name: 'Sanjay Gandhi National Park Canopy',
          description: 'Active drone-monitored biomass expansion sector.',
          latitude: 19.2288,
          longitude: 72.9182,
          status: 'Verified Healthy',
          type: 'park'
        },
        {
          name: 'Thane Creek Mangrove Reserve',
          description: 'Blue carbon tidal tracking arrays monitored via IoT modules.',
          latitude: 19.1693,
          longitude: 72.9964,
          status: 'Restoration In Progress',
          type: 'park'
        }
      ]);

      // Footprint logs for user #1
      await FootprintLog.bulkCreate([
        { user_id: 1, activity_type: 'Electricity Consumption Usage', input_value: 450, emissions_kg: 382.5 },
        { user_id: 1, activity_type: 'Commute Transit Tracking', input_value: 120, emissions_kg: 24.8 }
      ]);

      // Certificates
      await Certificate.create({
        certificate_id: 'CERT-2026-X892',
        issued_to: 'Hritika Das',
        carbon_tons: 14.2,
        verification_status: 'Settled on Horizon Network',
        stellar_ledger_index: 4829104
      });

      console.log('✨ All tables seeded with baseline data.');
    } else {
      console.log('💾 Existing data found — skipping seed.');
    }
  } catch (error) {
    console.error('🚨 Database initialization failed:', error.message);
    throw error;
  }
}

module.exports = initializeDatabase;