require('dotenv').config(); // Load environment variables from your .env file
const { Horizon, Keypair } = require('@stellar/stellar-sdk');

// Lazy-initialized Stellar connection
// Defers network connection until first use (avoids blocking in test environments)
let _server = null;
let _keypair = null;
let _initialized = false;

function _init() {
  if (_initialized) return;
  _initialized = true;

  // 1. Initialize connection to Stellar Horizon Testnet
  _server = new Horizon.Server('https://horizon-testnet.stellar.org');

  // 2. Safely parse and authenticate the Secret Key from the environment
  try {
    if (!process.env.STELLAR_SECRET_KEY) {
      throw new Error('STELLAR_SECRET_KEY is missing from your .env configuration file.');
    }
    
    // Extract and build your cryptographic keypair 
    _keypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY);
    
  } catch (error) {
    console.error('❌ CRITICAL STELLAR ERROR:', error.message);
    console.log('⚠️ Generating an emergency random keypair fallback to prevent server crash...');
    _keypair = Keypair.random();
  }

  if (process.env.NODE_ENV !== 'test') {
    console.log('=========================================');
    console.log('✨ STELLAR BLOCKCHAIN ENGINE INITIALIZED ✨');
    console.log(`📡 Network: Horizon Testnet (https://horizon-testnet.stellar.org)`);
    console.log(`💳 Active Wallet Address: ${_keypair.publicKey()}`);
    console.log('=========================================');
  }
}

// Export getters that lazy-initialize on first access
module.exports = {
  get server() { _init(); return _server; },
  get keypair() { _init(); return _keypair; },
  get publicKey() { _init(); return _keypair.publicKey(); },
  get secretKey() { _init(); return _keypair.secret(); }
};