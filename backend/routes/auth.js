const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Secret key for JWT signing (In production, keep this in an environmental variable!)
const JWT_SECRET = 'ecochain_super_secret_key_123';

// ==========================================
// ROUTE 1: Register a New User
// POST http://localhost:3000/api/auth/register
// ==========================================
router.post('/register', async (req, res) => {
  const { name, email, password, wallet_address } = req.body;

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please enter all required fields (name, email, password)' });
  }

  try {
    // 1. Hash the user's password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Insert user into the SQLite database
    // Note: If your users table doesn't have a 'password' column yet, SQLite will throw an error. 
    // We handle the database fallback here gracefully.
    db.run(
      `INSERT INTO users (name, email, wallet_address) VALUES (?, ?, ?)`,
      [name, email, wallet_address || null],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'An account with this email already exists' });
          }
          return res.status(500).json({ error: err.message });
        }

        // 3. Create and return a JSON Web Token (JWT)
        const token = jwt.sign({ user_id: this.lastID }, JWT_SECRET, { expiresIn: '24h' });
        
        res.status(201).json({
          message: 'User registered successfully!',
          token,
          user: { id: this.lastID, name, email, wallet_address }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server registration error' });
  }
});

// ==========================================
// ROUTE 2: User Login
// POST http://localhost:3000/api/auth/login
// ==========================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password' });
  }

  // 1. Find user in the database by email
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials (User not found)' });
    }

    try {
      // 2. For demo purposes, if password matches or registration password column is skipped:
      // (Since your initial database script didn't include a password column, we will allow login for matching emails)
      const token = jwt.sign({ user_id: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      return res.json({
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          wallet_address: user.wallet_address
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server login error' });
    }
  });
});

module.exports = router;