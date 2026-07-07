const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_eco_secret_key';

/**
 * Handle Production Account Provisioning Pipeline with Password Hashing
 */
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Validation Fault: Parameters missing from payload framework.' });
    }

    // Look for preexisting email constraints directly on the disk
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({ error: 'Conflict State: This email profile is already registered.' });
    }

    // Generate secure cryptographic salt rounds and hash password parameters
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save instance record into ecochain.db tables
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Account successfully provisioned into EcoChain relational layers.',
      userId: newUser.id
    });
  } catch (error) {
    next(error); // Offload pipeline error mechanics to global middleware exceptions interceptor
  }
};

/**
 * Handle Production Session Generation via Hash Verification Check
 */
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Validation Fault: Credentials payload incomplete.' });
    }

    // Lookup user by unique identifier index query
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid email or password credentials.' });
    }

    // Perform verification comparison match against the salted secure database string
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Unauthorized: Invalid email or password credentials.' });
    }

    // Generate authenticated JWT signature matrix payload
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token: `Bearer ${token}`,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    next(error);
  }
};