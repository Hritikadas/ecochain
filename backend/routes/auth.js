const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// =========================================================================
// PUBLIC ROUTES (no auth required)
// =========================================================================
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// =========================================================================
// PROTECTED ROUTES (JWT required)
// =========================================================================

// Get full user profile from database
router.get('/profile', authenticateToken, authController.getProfile);

// Update profile (name)
router.put('/profile', authenticateToken, authController.updateProfile);

// Change password
router.put('/change-password', authenticateToken, authController.changePassword);

// Get user's eco activity stats
router.get('/stats', authenticateToken, authController.getUserStats);

// Verify token validity
router.get('/verify', authenticateToken, (req, res) => {
  return res.json({
    user: {
      id: req.user.userId,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    },
    message: 'Token is valid and active.'
  });
});

module.exports = router;