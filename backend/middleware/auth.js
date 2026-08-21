const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('🚨 CRITICAL: JWT_SECRET environment variable is not set!');
    console.error('   Generate one: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
  }
  return secret;
};

/**
 * JWT Authentication Middleware
 * Extracts and verifies the Bearer token from the Authorization header.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Access Denied: No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Session expired. Please log in again.'
      });
    }
    return res.status(403).json({
      error: 'Invalid authentication token.'
    });
  }
};

/**
 * Role-Based Authorization Middleware
 * Restricts endpoint access by checking the user's role.
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role "${req.user.role}" is not authorized for this action.`
      });
    }

    next();
  };
};

module.exports = { authenticateToken, authorizeRoles, getJwtSecret };