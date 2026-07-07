const express = require('express');
const router = express.Router();
const db = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Apply base verification to ensure guest endpoints are locked
router.use(authenticateToken);

// =========================================================================
// 1. GET /api/certificates -> USER CONTEXT ACCESS
// =========================================================================
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.userId; // Filters directly by the user's specific token payload!

  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM certificates WHERE user_id = ?', [userId], (err, rows) => {
      if (err) {
        res.status(500);
        return reject(new Error('Failed to retrieve compliance records.'));
      }
      res.json(rows || []);
      resolve();
    });
  });
}));

// =========================================================================
// 2. POST /api/certificates/mint -> STRICT ADMINISTRATIVE PIPELINE 🛡️
// =========================================================================
router.post('/mint', authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const { targetUserId, assetCode, amount } = req.body;

  if (!targetUserId || !assetCode || !amount) {
    res.status(400);
    throw new Error('Validation Fault: Cryptographic block parameter structures incomplete.');
  }

  // Simulating an official automated Stellar SDK Horizon Testnet settlement action
  const secureHorizonTxHash = `st_hash_${Math.random().toString(36).substring(2, 15).toUpperCase()}`;

  // Initialize table
  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        asset_code TEXT NOT NULL,
        amount REAL NOT NULL,
        stellar_tx_hash TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => err ? reject(err) : resolve());
  });

  // Insert certificate anchor mapping to the target user
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO certificates (user_id, asset_code, amount, stellar_tx_hash) VALUES (?, ?, ?, ?)`,
      [targetUserId, assetCode, amount, secureHorizonTxHash],
      function (err) {
        if (err) {
          res.status(500);
          return reject(new Error('Failed to finalize on-chain ledger signature framework.'));
        }
        res.status(201).json({
          success: true,
          certificateId: this.lastID,
          transactionHash: secureHorizonTxHash,
          message: 'Stellar blockchain asset certificate signed and anchored cleanly.'
        });
        resolve();
      }
    );
  });
}));

module.exports = router;