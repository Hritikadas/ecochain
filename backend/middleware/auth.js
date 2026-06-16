const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  
  // Enforce structural Bearer schema checks on incoming requests
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access Denied: Session validation parameters absent.' });
  }

  // Extract the raw token string from the header block
  const token = authHeader.split(' ')[1];

  try {
    // 🔐 Decode using the specific JWT Secret shared securely by your Supabase Database
    const verified = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    
    // Supabase stores the user's unique cloud database UUID inside the token's 'sub' field
    req.user = { id: verified.sub, email: verified.email };
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired Supabase token.' });
  }
};