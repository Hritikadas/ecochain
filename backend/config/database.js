const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Establish persistent absolute pathing to the SQLite cluster storage file
const dbPath = path.join(__dirname, '../ecochain.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('🚨 SQLite Engine Connection Failure:', err.message);
  } else {
    console.log('📡 Connected to SQLite core engine context file successfully.');
  }
});

db.serialize(() => {
  console.log('⚙️ Synchronizing relational schemas across all 6 core features...');

  // =========================================================================
  // RELATIONAL DATA SCHEMAS FOR ALL 6 FULL-STACK APP FEATURES
  // =========================================================================

  // Feature 1: Marketplace Products Table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    seller TEXT NOT NULL,
    stellar_asset_code TEXT NOT NULL,
    category TEXT,
    certificate_url TEXT,
    stellar_tx_hash TEXT
  )`);

  // Feature 2: Carbon Offsets (Dynamic Portfolio Totals)
  db.run(`CREATE TABLE IF NOT EXISTS offsets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    trees_planted INTEGER NOT NULL DEFAULT 0,
    amount_usd REAL NOT NULL DEFAULT 0.0,
    stellar_tx_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Feature 3: Gamification Badges Inventory
  db.run(`CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    badge_title TEXT NOT NULL,
    badge_type TEXT NOT NULL,
    stellar_tx_hash TEXT NOT NULL,
    earned_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Feature 4: Eco Map Tracker (Spatio-Temporal IoT Coordinates)
  db.run(`CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Verification Active',
    type TEXT
  )`);

  // Feature 5: Carbon Analyzer Log (Emissions ledger computations)
  db.run(`CREATE TABLE IF NOT EXISTS footprint_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity_type TEXT NOT NULL,
    input_value REAL NOT NULL,
    emissions_kg REAL NOT NULL,
    logged_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Feature 6: Cryptographic Escrow Validation Certificates
  db.run(`CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    certificate_id TEXT UNIQUE NOT NULL,
    issued_to TEXT NOT NULL,
    carbon_tons REAL NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'Pending Ledger Block Settle',
    stellar_ledger_index INTEGER,
    stellar_tx_hash TEXT
  )`);

  // =========================================================================
  // LIVE INITIAL BASING SEEDER
  // (Only populates if tables are empty to avoid overwriting your new logs)
  // =========================================================================
  db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
    if (!err && row.count === 0) {
      console.log('🌱 SQLite storage currently fresh. Seeding baseline assets...');

      // Seed baseline items for the Marketplace
      const prodStmt = db.prepare(`INSERT INTO products (title, description, price, seller, stellar_asset_code, category, certificate_url) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      prodStmt.run('Certified Amazon Reforestation Credit', 'Verified high-impact biomass carbon capture asset anchored to Stellar ledger blocks.', 25.00, 'EcoRegistry LLC', 'AMZNRE', 'Carbon Offset Asset', 'https://example.org/cert/amazon-001');
      prodStmt.run('Mangrove Restoration Bond', 'Blue carbon maritime ecosystem restoration certificate tracking tidal marshlands.', 45.50, 'Oceanic Shield Alliance', 'MNGRV', 'Carbon Offset Asset', 'https://example.org/cert/mangrove-002');
      prodStmt.run('Solar Array Energy Yield NFT', 'Tokenized micro-fractional kilowatt hours generated via alternative energy grids.', 12.00, 'Mithra Energy Labs', 'SOLAR', 'Renewable Energy', 'https://example.org/cert/solar-003');
      prodStmt.finalize();

      // Seed baseline starting offset point values for Hritika Das (User #1)
      db.run(`INSERT INTO offsets (user_id, trees_planted, amount_usd) VALUES (1, 150, 325.00)`);

      // Seed spatial tracker anchors for the interactive map interface
      const mapStmt = db.prepare(`INSERT INTO places (name, description, latitude, longitude, status, type) VALUES (?, ?, ?, ?, ?, ?)`);
      mapStmt.run('Sanjay Gandhi National Park Canopy', 'Active drone-monitored biomass expansion sector.', 19.2288, 72.9182, 'Verified Healthy', 'park');
      mapStmt.run('Thane Creek Mangrove Reserve', 'Blue carbon tidal tracking arrays monitored via IoT modules.', 19.1693, 72.9964, 'Restoration In Progress', 'park');
      mapStmt.finalize();

      // Seed starting logs for the Carbon Analyzer
      const logStmt = db.prepare(`INSERT INTO footprint_logs (user_id, activity_type, input_value, emissions_kg) VALUES (?, ?, ?, ?)`);
      logStmt.run(1, 'Electricity Consumption Usage', 450, 382.5);
      logStmt.run(1, 'Commute Transit Tracking', 120, 24.8);
      logStmt.finalize();

      // Seed valid transaction receipt references for verification audits
      const certStmt = db.prepare(`INSERT INTO certificates (certificate_id, issued_to, carbon_tons, verification_status, stellar_ledger_index) VALUES (?, ?, ?, ?, ?)`);
      certStmt.run('CERT-2026-X892', 'Hritika Das', 14.2, 'Settled on Horizon Network', 4829104);
      certStmt.finalize();

      console.log('✨ All 6 relational functional schemas successfully structured and seeded inside ecochain.db.');
    } else {
      console.log('💾 Existing ecochain.db data context loaded. Skipping seeder run.');
    }
  });
});

module.exports = db;