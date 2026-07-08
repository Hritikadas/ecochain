const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

// =========================================================================
// 1. PUBLIC ACCESS GATEWAYS
// =========================================================================
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// =========================================================================
// 2. PROTECTED USER CONTEXT GATEWAYS
// =========================================================================
router.get('/profile', authenticateToken, (req, res) => {
  return res.json({ 
    message: 'Secure User Context Layer reached successfully.', 
    authenticatedUser: req.user 
  });
});

router.get('/verify', authenticateToken, asyncHandler(async (req, res) => {
  return res.json({
    user: {
      email: req.user.email,
      role: req.user.role
    },
    message: 'Token is valid and active.'
  });
}));

module.exports = router;