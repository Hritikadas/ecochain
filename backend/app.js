const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import route controllers
const productRoutes = require('./routes/products');
const footprintRoutes = require('./routes/footprint');
const placeRoutes = require('./routes/places');
const offsetRoutes = require('./routes/offset');
const certificateRoutes = require('./routes/certificates');
const achievementRoutes = require('./routes/achievements');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');

// Import encryption middleware
const { encryptResponse, decryptRequest, getEncryptionKey } = require('./middleware/encryption');

const app = express();

// =========================================================================
// SECURITY MIDDLEWARE
// =========================================================================

// Helmet — sets secure HTTP headers (XSS, clickjacking, MIME sniffing protection)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false  // Let frontend handle CSP
}));

// CORS — whitelist specific origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'https://ecochain-mu.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, curl, mobile apps, tests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow any Vercel preview/production deployment
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    // In development / test, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // Reject without throwing — avoids 500 crash in Express error handler
    return callback(null, false);
  },
  credentials: true
}));

// Rate limiting — auth endpoints (prevent brute-force)
// Disabled in test environment to avoid flaky tests
if (process.env.NODE_ENV !== 'test') {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 20,                     // 20 attempts per window
    message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
  });

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false
  });

  app.use(generalLimiter);
  // Store authLimiter on app for route mounting
  app._authLimiter = authLimiter;
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Encryption middleware (request decryption + response encryption)
app.use(decryptRequest);
app.use(encryptResponse);

// Serve static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =========================================================================
// ROUTE MOUNTING
// =========================================================================
if (app._authLimiter) {
  app.use('/api/auth', app._authLimiter, authRoutes);
} else {
  app.use('/api/auth', authRoutes);
}
app.use('/api/products', productRoutes);
app.use('/api/footprint', footprintRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/offset', offsetRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/ai', aiRoutes);

// Encryption key exchange
app.get('/api/encryption/key', getEncryptionKey);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: process.env.DATABASE_URL ? 'PostgreSQL (Supabase)' : 'SQLite (local)',
    encryption: 'AES-256-GCM',
    timestamp: new Date()
  });
});

// =========================================================================
// GLOBAL ERROR HANDLER
// =========================================================================
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.message);

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An internal server error occurred.'
    : err.message;

  res.status(err.status || 500).json({ error: message });
});

module.exports = app;
