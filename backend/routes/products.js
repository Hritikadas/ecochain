const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// =========================================================================
// 1. GET ALL PRODUCTS -> PUBLIC ACCESS
// =========================================================================
router.get('/', asyncHandler(async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
}));

// =========================================================================
// 2. POST PRODUCT -> ADMIN ONLY 🛡️
// =========================================================================
router.post('/', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const {
    title, productName, product_name, name,
    description,
    price, cost,
    seller,
    stellar_asset_code, assetCode,
    category,
    certificateUrl, certificate_url
  } = req.body;

  const finalTitle = title || productName || product_name || name || 'Unnamed Eco Asset';
  const finalDesc = description || 'No description provided.';
  const finalPrice = parseFloat(price || cost) || 29.99;
  const finalSeller = seller || 'Independent Eco Vendor';
  const finalCategory = category || 'Renewable Energy';
  const finalCertUrl = certificateUrl || certificate_url || '';

  const rawAssetCode = stellar_asset_code || assetCode || 'ECO';
  const finalAssetCode = rawAssetCode.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase() || 'ECOSEC';
  const finalTxHash = `mock_tx_${Date.now()}`;

  const product = await Product.create({
    title: finalTitle,
    description: finalDesc,
    price: finalPrice,
    seller: finalSeller,
    stellar_asset_code: finalAssetCode,
    category: finalCategory,
    certificate_url: finalCertUrl,
    stellar_tx_hash: finalTxHash
  });

  res.status(201).json({
    success: true,
    id: product.id,
    ...product.toJSON(),
    message: 'Product catalog updated successfully!'
  });
}));

module.exports = router;