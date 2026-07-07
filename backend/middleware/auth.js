const jwt = require('jsonwebtoken');

/**
 * High-Level Request Authenticator Gatekeeper
 * Intercepts incoming requests, decodes signed JWTs, and injects session variables.
 */
const authenticateToken = (req, res, next) => {
  // Extract Authorization Header (Format: Bearer <TOKEN>)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access Denied: Missing cryptographic identity token credentials.' 
    });
  }

  try {
    // Validate signature authenticity against our host secret payload
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET || 'fallback_eco_secret_key');
    
    // Inject the sanitized user context directly into the pipeline request state
    req.user = decodedPayload;
    
    next(); // Pass control safely to the next controller layer
  } catch (error) {
    console.error('🚨 Cryptographic Token Parsing Failure:', error.message);
    return res.status(403).json({ 
      error: 'Forbidden: Session validation token has expired or is structurally malformed.' 
    });
  }
};

/**
 * Flexible Role Checking Middleware Factory 🛡️
 * Restricts endpoint access dynamically by checking the injected user role array.
 * Use case: authorizeRoles('admin') or authorizeRoles('admin', 'moderator')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Ensure the user has been verified by the authenticateToken middleware first
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized: Authentication context is missing.'
      });
    }

    // 2. Check if the user's role exists inside the allowedRoles parameters list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access denied. Your profile clearance role (${req.user.role}) is unauthorized to perform this operation.`
      });
    }

    next(); // Pass control safely to the next controller layer
  };
};

module.exports = { authenticateToken, authorizeRoles };