const express = require('express');
const router = express.Router();
const FootprintLog = require('../models/FootprintLog');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// =========================================================================
// POST /api/footprint -> Record emissions
// =========================================================================
router.post('/', asyncHandler(async (req, res) => {
  const { transport, energy, waste } = req.body;
  const userId = req.user.userId;

  if (transport === undefined || energy === undefined || waste === undefined) {
    return res.status(400).json({ error: 'Missing calculation parameters: transport, energy, waste.' });
  }

  // CO2e calculation
  const calculatedTotal = (parseFloat(transport) * 0.2) + (parseFloat(energy) * 0.4) + (parseFloat(waste) * 0.1);

  const log = await FootprintLog.create({
    user_id: userId,
    activity_type: 'Combined Analysis',
    input_value: parseFloat(transport) + parseFloat(energy) + parseFloat(waste),
    emissions_kg: calculatedTotal
  });

  res.status(201).json({
    success: true,
    recordId: log.id,
    userId,
    total_co2e: calculatedTotal,
    message: 'Carbon footprint recorded successfully.'
  });
}));

// =========================================================================
// GET /api/footprint -> Get user's footprint history
// =========================================================================
router.get('/', asyncHandler(async (req, res) => {
  const logs = await FootprintLog.findAll({
    where: { user_id: req.user.userId },
    order: [['logged_at', 'DESC']]
  });
  res.json(logs);
}));

module.exports = router;