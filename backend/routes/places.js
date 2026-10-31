const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Place = require('../models/Place');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// =========================================================================
// 1. GET /api/places -> PUBLIC ACCESS (Supports type filter and keyword search)
// =========================================================================
router.get('/', asyncHandler(async (req, res) => {
  const { type, q } = req.query;
  const where = {};

  if (type && type !== 'all') {
    // Map common variants (e.g. 'ev' matches 'ev' or 'ev_charger')
    if (type === 'ev') {
      where.type = { [Op.or]: ['ev', 'ev_charger', 'charging'] };
    } else {
      where.type = type;
    }
  }

  if (q && q.trim()) {
    const searchTerm = `%${q.trim()}%`;
    where[Op.or] = [
      { name: { [Op.like]: searchTerm } },
      { description: { [Op.like]: searchTerm } }
    ];
  }

  const places = await Place.findAll({ where, order: [['id', 'DESC']] });
  res.json(places);
}));

// Helper to create an eco location
const handleCreatePlace = async (req, res, defaultStatus = 'Verified Active') => {
  const { name, latitude, longitude, description, note, status, type } = req.body;

  if (!name || latitude === undefined || longitude === undefined || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
    return res.status(400).json({ error: 'Name, latitude, and longitude are required.' });
  }

  const place = await Place.create({
    name: name.trim(),
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    description: (description || note || '').trim(),
    status: status || defaultStatus,
    type: type || 'ev'
  });

  return res.status(201).json({
    success: true,
    placeId: place.id,
    message: 'New eco location added successfully.',
    place
  });
};

// =========================================================================
// 2. POST /api/places & /api/places/add -> ADMIN ONLY 🛡️
// =========================================================================
router.post('/', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  return handleCreatePlace(req, res, 'Verified Active');
}));

router.post('/add', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  return handleCreatePlace(req, res, 'Verified Active');
}));

// =========================================================================
// 3. POST /api/places/suggest -> AUTHENTICATED USER COMMUNITY PROPOSAL 🌱
// =========================================================================
router.post('/suggest', authenticateToken, asyncHandler(async (req, res) => {
  return handleCreatePlace(req, res, 'Community Submitted');
}));

module.exports = router;
