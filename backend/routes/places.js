const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// =========================================================================
// 1. GET /api/places -> PUBLIC ACCESS
// =========================================================================
router.get('/', asyncHandler(async (req, res) => {
  const places = await Place.findAll();
  res.json(places);
}));

// =========================================================================
// 2. POST /api/places -> ADMIN ONLY 🛡️
// =========================================================================
router.post('/', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const { name, latitude, longitude, description, status, type } = req.body;

  if (!name || !latitude || !longitude) {
    return res.status(400).json({ error: 'Name, latitude, and longitude are required.' });
  }

  const place = await Place.create({
    name,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    description: description || '',
    status: status || 'Verification Active',
    type: type || 'location'
  });

  res.status(201).json({
    success: true,
    placeId: place.id,
    message: 'New eco location added successfully.'
  });
}));

module.exports = router;