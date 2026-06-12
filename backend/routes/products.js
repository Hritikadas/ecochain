const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 1. GET ALL PRODUCTS
router.get('/', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      console.error('🚨 Error reading products from DB:', err.message);
      return res.status(500).json({ error: 'Database read error' });
    }
    res.json(rows || []);
  });
});

// 2. FUNCTIONAL POST ENDPOINT WITH FLEXIBLE SCHEMA MAPPING
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
  
  // Create a clean fallback asset code
  const rawAssetCode = stellar_asset_code || assetCode || 'ECO';
  const finalAssetCode = rawAssetCode.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase() || 'ECOSEC';

  console.log(`📥 Processing product write request: "${finalTitle}"`);

  db.run(
    `INSERT INTO products (title, description, price, seller, stellar_asset_code, category, certificate_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [finalTitle, finalDesc, finalPrice, finalSeller, finalAssetCode, finalCategory, finalCertUrl],
    function (err) {
      if (err) {
        console.error('🚨 SQLite insertion error on products table:', err.message);
        return res.status(500).json({ error: 'Failed to write product asset to database.' });
      }

      console.log(`✨ Product successfully written to ecochain.db with ID: ${this.lastID}`);
      return res.status(201).json({
        id: this.lastID,
        title: finalTitle,
        description: finalDesc,
        price: finalPrice,
        seller: finalSeller,
        stellar_asset_code: finalAssetCode,
        category: finalCategory,
        certificate_url: finalCertUrl,
        message: "Product catalog updated successfully!"
      });
    }
  );
});

module.exports = router;