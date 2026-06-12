require('dotenv').config(); // Load environment variables from your .env file
const { Horizon, Keypair } = require('@stellar/stellar-sdk');

// 1. Initialize connection to Stellar Horizon Testnet
const server = new Horizon.Server('https://horizon-testnet.stellar.org');

// 2. Safely parse and authenticate the Secret Key from the environment
let keypair;
try {
  if (!process.env.STELLAR_SECRET_KEY) {
    throw new Error('STELLAR_SECRET_KEY is missing from your .env configuration file.');
  }
  
  // Extract and build your cryptographic keypair 
  keypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY);
  
} catch (error) {
  console.error('❌ CRITICAL STELLAR ERROR:', error.message);
  console.log('⚠️ Generating an emergency random keypair fallback to prevent server crash...');
  keypair = Keypair.random();
}

console.log('=========================================');
console.log('✨ STELLAR BLOCKCHAIN ENGINE INITIALIZED ✨');
console.log(`📡 Network: Horizon Testnet (https://horizon-testnet.stellar.org)`);
console.log(`💳 Active Wallet Address: ${keypair.publicKey()}`);
console.log('=========================================');

// Export all values cleanly for your routes/products.js ledger updates
module.exports = {
  server,
  keypair,
  publicKey: keypair.publicKey(),
  secretKey: keypair.secret()
};