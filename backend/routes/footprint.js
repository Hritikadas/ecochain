const express = require('express');
const router = express.Router();
const db = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

// 💖 Global Router Guard: Every single route in this file now requires a valid login token
router.use(authenticateToken);

// =========================================================================
// POST /api/footprint -> Record calculated emissions metrics
// =========================================================================
router.post('/', asyncHandler(async (req, res) => {
  const { transport, energy, waste } = req.body;
  const userId = req.user.userId; // Extracted dynamically from the decoded JWT payload!

  if (transport === undefined || energy === undefined || waste === undefined) {
    res.status(400);
    throw new Error('Validation Fault: Missing analytical calculation parameters.');
  }

  // Basic calculation: Convert raw values into metric tons of CO2 equivalent (CO2e)
  const calculatedTotal = (parseFloat(transport) * 0.2) + (parseFloat(energy) * 0.4) + (parseFloat(waste) * 0.1);

  // Initialize table fallback safely
  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS footprints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        transport REAL,
        energy REAL,
        waste REAL,
        total_co2e REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => err ? reject(err) : resolve());
  });

  // Write down onto database disk
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO footprints (user_id, transport, energy, waste, total_co2e) VALUES (?, ?, ?, ?, ?)`,
      [userId, transport, energy, waste, calculatedTotal],
      function (err) {
        if (err) {
          res.status(500);
          return reject(new Error('Failed to record emission profile matrix.'));
        }
        res.status(201).json({
          success: true,
          recordId: this.lastID,
          userId,
          total_co2e: calculatedTotal,
          message: 'Carbon analytics footprint compiled successfully.'
        });
        resolve();
      }
    );
  });
}));

module.exports = router;