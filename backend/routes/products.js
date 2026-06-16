const express = require('express');
const router = express.Router();
const db = require('../config/database');

// =========================================================================
// 1. GET ALL PRODUCTS (READ LEDGER)
// =========================================================================
router.get('/', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      console.error('🚨 Error reading products from DB:', err.message);
      return res.status(500).json({ error: 'Database read error' });
    }
    res.json(rows || []);
  });
});

// =========================================================================
// 2. POST ENDPOINT WITH AUTO-INITIALIZATION & FLEXIBLE SCHEMA MAPPING
// =========================================================================
router.post('/', (req, res) => {
  // Destructure whatever names your frontend form might be sending
  const { 
    title, productName, product_name, name,
    description, 
    price, cost,
    seller, 
    stellar_asset_code, assetCode,
    category,
    certificateUrl, certificate_url
  } = req.body;

  // Fallback defaults so the SQL query never fails due to a missing field
  const finalTitle = title || productName || product_name || name || 'Unnamed Eco Asset';
  const finalDesc = description || 'No description provided.';
  const finalPrice = parseFloat(price || cost) || 29.99;
  const finalSeller = seller || 'Independent Eco Vendor';
  const finalCategory = category || 'Renewable Energy';
  const finalCertUrl = certificateUrl || certificate_url || '';
  
  // Create a clean fallback asset code matching Stellar standards
  const rawAssetCode = stellar_asset_code || assetCode || 'ECO';
  const finalAssetCode = rawAssetCode.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase() || 'ECOSEC';

  console.log(`📥 Processing product write request: "${finalTitle}"`);

  // 🛡️ Safety Guardrail: Dynamically initialize table parameters if running on empty cloud host (Render)
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      seller TEXT,
      stellar_asset_code TEXT,
      category TEXT,
      certificate_url TEXT,
      stellar_tx_hash TEXT
    )
  `, (tableErr) => {
    if (tableErr) {
      console.error('🚨 Database schema synchronization failure:', tableErr.message);
      return res.status(500).json({ error: 'Database schema synchronization failed.' });
    }

    // Generate a secure default mock transaction hash to populate the field
    const finalTxHash = `mock_tx_${Date.now()}`;

    // Execute the insertion row block using verified schema configurations
    db.run(
      `INSERT INTO products (title, description, price, seller, stellar_asset_code, category, certificate_url, stellar_tx_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalTitle, finalDesc, finalPrice, finalSeller, finalAssetCode, finalCategory, finalCertUrl, finalTxHash],
      function (err) {
        if (err) {
          console.error('🚨 SQLite insertion error on products table:', err.message);
          return res.status(500).json({ error: 'Failed to write product asset to database.', details: err.message });
        }

        console.log(`✨ Product successfully written to ecochain.db with ID: ${this.lastID}`);
        return res.status(201).json({
          success: true,
          id: this.lastID,
          title: finalTitle,
          description: finalDesc,
          price: finalPrice,
          seller: finalSeller,
          stellar_asset_code: finalAssetCode,
          category: finalCategory,
          certificate_url: finalCertUrl,
          stellar_tx_hash: finalTxHash,
          message: "Product catalog updated successfully!"
        });
      }
    );
  });
});

module.exports = router;