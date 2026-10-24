/**
 * Test Setup & Helpers
 * 
 * Provides shared utilities for all test files:
 *  - Database initialization before all tests
 *  - Token generation for authenticated requests
 *  - Database cleanup after all tests
 */

// Force test environment FIRST — before any other imports
process.env.NODE_ENV = 'test';

// Ensure JWT_SECRET is set for tests
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_jwt_secret_for_automated_testing_only_do_not_use_in_production';
}

// Ensure ENCRYPTION_KEY is set
if (!process.env.ENCRYPTION_KEY) {
  process.env.ENCRYPTION_KEY = '94594484f6866a6beca1bd66f6b58b8a89be576d630d916097941657f152b430';
}

// Ensure STELLAR_SECRET_KEY is set (Stellar SDK needs it)
if (!process.env.STELLAR_SECRET_KEY) {
  process.env.STELLAR_SECRET_KEY = 'SCZANGBA5YHTNYVVV3C7CAZMCLXPILHSE7HG3EQZIUOCB2CPLHPO7SM';
}

const initializeDatabase = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

let dbInitialized = false;

/**
 * Initialize the test database (call once in beforeAll)
 */
async function setupDatabase() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

/**
 * Create a test user and return a JWT token
 */
async function createTestUser({ name = 'Test User', email, password = 'TestPass1', role = 'user' } = {}) {
  const uniqueEmail = email || `test_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`;

  const salt = await bcrypt.genSalt(4); // Fast for tests
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: uniqueEmail,
    password: hashedPassword,
    role
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { user, token: `Bearer ${token}`, rawToken: token };
}

/**
 * Create an admin user and return token
 */
async function createAdminUser() {
  return createTestUser({ name: 'Admin User', role: 'admin' });
}

/**
 * Generate a token for an arbitrary payload (for testing invalid/expired tokens)
 */
function generateToken(payload, options = {}) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h', ...options });
}

module.exports = {
  setupDatabase,
  createTestUser,
  createAdminUser,
  generateToken
};
