const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured.');
  }
  return secret;
};

/**
 * Register a new user account
 */
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Password strength check
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({ 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.' 
      });
    }

    // Check for existing user
    const userExists = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (userExists) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      userId: newUser.id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate user and issue JWT token
 */
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get full profile from database (not just JWT payload)
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ authenticatedUser: user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile (name)
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.name = name.trim();
    await user.save();

    // Update localStorage data by returning fresh user info
    return res.json({
      success: true,
      message: 'Profile updated.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return res.status(400).json({
        error: 'New password must contain uppercase, lowercase, and a number.'
      });
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's eco activity stats (offsets, badges, footprint)
 */
exports.getUserStats = async (req, res, next) => {
  try {
    const Offset = require('../models/Offset');
    const Badge = require('../models/Badge');
    const FootprintLog = require('../models/FootprintLog');
    const Certificate = require('../models/Certificate');
    const { fn, col } = require('sequelize');

    const userId = req.user.userId;

    // Aggregate stats
    const [offsetStats, badgeCount, footprintStats, certCount] = await Promise.all([
      Offset.findOne({
        where: { user_id: userId },
        attributes: [
          [fn('SUM', col('trees_planted')), 'totalTrees'],
          [fn('SUM', col('amount_usd')), 'totalSpent'],
          [fn('COUNT', col('id')), 'totalTransactions']
        ],
        raw: true
      }),
      Badge.count({ where: { user_id: userId } }),
      FootprintLog.findOne({
        where: { user_id: userId },
        attributes: [
          [fn('SUM', col('emissions_kg')), 'totalEmissions'],
          [fn('COUNT', col('id')), 'totalLogs']
        ],
        raw: true
      }),
      Certificate.count({ where: { issued_to: req.user.name } })
    ]);

    return res.json({
      stats: {
        treesPlanted: parseInt(offsetStats?.totalTrees) || 0,
        totalOffsetSpent: parseFloat(offsetStats?.totalSpent) || 0,
        offsetTransactions: parseInt(offsetStats?.totalTransactions) || 0,
        badgesEarned: badgeCount,
        totalEmissionsKg: parseFloat(footprintStats?.totalEmissions) || 0,
        footprintLogs: parseInt(footprintStats?.totalLogs) || 0,
        certificatesEarned: certCount
      }
    });
  } catch (error) {
    next(error);
  }
};