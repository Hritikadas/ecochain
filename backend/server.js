const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import Core Database Context Configuration
const db = require('./config/database');

// Import Functional Feature App Route Controllers
const productRoutes = require('./routes/products');
const footprintRoutes = require('./routes/footprint');
const placeRoutes = require('./routes/places');
const offsetRoutes = require('./routes/offset');
const certificateRoutes = require('./routes/certificates');
const achievementRoutes = require('./routes/achievements');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// =========================================================================
// GLOBAL MIDDLEWARE MATRICES
// =========================================================================
app.use(cors());
app.use(express.json());

// Serve optional static assets from public asset upload folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =========================================================================
// ROUTE MOUNTING HUB
// =========================================================================
app.use('/api/products', productRoutes);
app.use('/api/footprint', footprintRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/offset', offsetRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);

// Base Health-Check Route Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: 'connected', timestamp: new Date() });
});

// =========================================================================
// GLOBAL EXCEPTION INTERCEPTOR HANDLER
// =========================================================================
app.use((err, req, res, next) => {
  console.error('🚨 Fallback server error intercepted:', err.stack);
  res.status(500).json({ error: 'An unexpected execution error occurred on the host container layers.' });
});

// Initialize Main Server Pipeline Loop Listener
app.listen(PORT, () => {
  console.log(`🚀 EcoChain Backend Engine successfully initialized on port ${PORT}`);
});