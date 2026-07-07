const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public Access Ingestion Gateways
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Private Context Authenticated Gateways (Verifies our Auth Middleware works)
router.get('/profile', authenticateToken, (req, res) => {
  return res.json({ 
    message: 'Secure User Context Layer reached successfully.', 
    authenticatedUser: req.user 
  });
});

module.exports = router;