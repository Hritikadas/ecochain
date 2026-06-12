require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/database');

// Import Application Routers
const authRoutes = require('./routes/auth');
const footprintRoutes = require('./routes/footprint');
const productsRoutes = require('./routes/products');
const certificatesRoutes = require('./routes/certificates');
const placesRoutes = require('./routes/places');
const offsetRoutes = require('./routes/offset');
const achievementRoutes = require('./routes/achievements');

const app = express();
const PORT = 3001;

// 🎯 CRITICAL FIX: Global Middlewares MUST be initialized 
// BEFORE any app.use router mounts execute!
// Strict CORS initialization profile wrapper
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Core Health Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Ecochain Engine Core API is live!' });
});

// Mount Application Routers Securely
app.use('/api/auth', authRoutes);
app.use('/api/footprint', footprintRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/offset', offsetRoutes);
app.use('/api/achievements', achievementRoutes);

// Global Unhandled Catch-All Route Error Interceptor 
// This forces any hidden middleware exceptions to print out directly to your console logs!
app.use((err, req, res, next) => {
  console.log("\n💥 GLOBAL EXPRESS CRASH INTERCEPTOR:");
  console.error(err.stack || err);
  console.log("=====================================\n");
  res.status(500).json({ error: 'Internal pipeline crash', details: err.message });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 ECOCHAIN BACKEND RUNNING: http://localhost:${PORT}`);
  console.log(`=========================================`);
});