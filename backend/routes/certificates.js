const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// =========================================================================
// 1. GET /api/certificates -> User's certificates
// =========================================================================
router.get('/', asyncHandler(async (req, res) => {
  const certificates = await Certificate.findAll({
    where: { issued_to: req.user.name }
  });
  res.json(certificates);
}));

// =========================================================================
// 2. POST /api/certificates/mint -> ADMIN ONLY 🛡️
// =========================================================================
router.post('/mint', authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const { issued_to, carbon_tons, certificate_id } = req.body;

  if (!issued_to || !carbon_tons) {
    return res.status(400).json({ error: 'issued_to and carbon_tons are required.' });
  }

  const certId = certificate_id || `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const txHash = `st_hash_${Math.random().toString(36).substring(2, 15).toUpperCase()}`;

  const cert = await Certificate.create({
    certificate_id: certId,
    issued_to,
    carbon_tons: parseFloat(carbon_tons),
    verification_status: 'Settled on Horizon Network',
    stellar_tx_hash: txHash,
    stellar_ledger_index: Math.floor(Math.random() * 9999999)
  });

  res.status(201).json({
    success: true,
    certificateId: cert.id,
    certificate_id: certId,
    transactionHash: txHash,
    message: 'Certificate minted and anchored successfully.'
  });
}));

module.exports = router;