const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 1. Fetch green coordinates with filtering support
// GET http://localhost:3000/api/places?type=ev
router.get('/', (req, res) => {
  const { type } = req.query;

  if (type && type !== 'all') {
    // Filtered lookup matching Leaflet short-keys
    db.all('SELECT * FROM places WHERE type = ?', [type], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    // Default fetch-all query
    db.all('SELECT * FROM places', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

// 2. Add community location matching React Leaflet structure
// POST http://localhost:3000/api/places/add
router.post('/add', (req, res) => {
  const { name, type, latitude, longitude, note } = req.body;

  if (!name || !type || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing critical geographic fields parameters.' });
  }

  db.run(
    `INSERT INTO places (name, type, latitude, longitude, description) VALUES (?, ?, ?, ?, ?)`,
    [name, type, parseFloat(latitude), parseFloat(longitude), note || ''],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: this.lastID,
        message: 'New eco node mapped successfully! 🗺️'
      });
    }
  );
});

module.exports = router;