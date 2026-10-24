const app = require('./app');
const initializeDatabase = require('./config/database');

const PORT = process.env.PORT || 3001;

// =========================================================================
// START SERVER
// =========================================================================
async function startServer() {
  try {
    // Initialize database (sync models + seed)
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 EcoChain Backend running on port ${PORT}`);
      console.log(`🔒 Security: Helmet, CORS whitelist, Rate limiting active`);
      console.log(`🔐 Encryption: AES-256-GCM ready`);
    });
  } catch (error) {
    console.error('🚨 Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();