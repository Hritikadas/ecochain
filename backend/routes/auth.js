const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

// =========================================================================
// PUBLIC ACCESS AUTHENTICATION ENDPOINTS
// =========================================================================

// User Registration - PUBLIC ACCESS
router.post('/register', asyncHandler(authController.registerUser));

// User Login - PUBLIC ACCESS
router.post('/login', asyncHandler(authController.loginUser));

// =========================================================================
// SECURED AUTHENTICATED ENDPOINTS 🔑
// =========================================================================

// Get User Profile - SECURED USER ACCESS
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  console.log(`✅ Profile access granted for User ID: ${req.user.userId} (${req.user.email})`);
  
  return res.json({ 
    success: true,
    message: 'Secure User Context Layer reached successfully.', 
    authenticatedUser: {
      userId: req.user.userId,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    },
    timestamp: new Date().toISOString()
  });
}));

// Verify Token Validity - SECURED USER ACCESS
router.get('/verify', authenticateToken, asyncHandler(async (req, res) => {
  return res.json({
    success: true,
    valid: true,
    user: {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role
    },
    message: 'Token is valid and active.'
  });
}));

module.exports = router;