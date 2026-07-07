const express = require('express');
const router = express.Router();
const db = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// =========================================================================
// 1. GET /api/places -> PUBLIC ACCESS (No middleware guards)
// =========================================================================
router.get('/', asyncHandler(async (req, res) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM places', [], (err, rows) => {
      if (err) {
        res.status(500);
        return reject(new Error('Failed to fetch geospatial map markers.'));
      }
      res.json(rows || []);
      resolve();
    });
  });
}));

// =========================================================================
// 2. POST /api/places -> SECURED (Requires active login AND Admin clearance) 🛡️
// =========================================================================
router.post('/', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const { name, latitude, longitude, description } = req.body;

  if (!name || !latitude || !longitude) {
    res.status(400);
    throw new Error('Validation Fault: Spatial coordinates parameters missing.');
  }

  // Ensure table exists
  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS places (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        description TEXT
      )
    `, (err) => err ? reject(err) : resolve());
  });

  // Safe insertion
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO places (name, latitude, longitude, description) VALUES (?, ?, ?, ?)`,
      [name, latitude, longitude, description || ''],
      function (err) {
        if (err) {
          res.status(500);
          return reject(new Error('Failed to provision new spatial tracking node.'));
        }
        res.status(201).json({
          success: true,
          placeId: this.lastID,
          message: 'New eco tracking node written to data maps cleanly.'
        });
        resolve();
      }
    );
  });
}));

module.exports = router;