const express = require('express');
const router = express.Router();
const StellarSdk = require('stellar-sdk');
const { server, network, publicKey, secretKey } = require('../config/stellar');
const db = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// =========================================================================
// 1. BUY CARBON CREDITS -> SECURED USER ACCESS 🔑
// =========================================================================
router.post('/buy', authenticateToken, asyncHandler(async (req, res) => {
  const { user_id, amount_usd } = req.body;
  
  // Security Verification: Ensure regular users cannot buy offsets on behalf of another user
  const targetUid = user_id || req.user.userId;
  if (req.user.role !== 'admin' && parseInt(targetUid) !== req.user.userId) {
    return res.status(403).json({ error: 'Forbidden: You are unauthorized to execute purchases for this user profile.' });
  }
  
  try {
    if (amount_usd < 1) {
      return res.status(400).json({ error: 'Minimum amount is $1' });
    }

    // Calculate XLM amount (1 XLM = ~0.30 USD, so $10 = ~33 XLM)
    // For demo: $1 = 3.3 XLM (adjust based on real exchange rate)
    const xlm_amount = Math.round(amount_usd * 3.3 * 10000000); // Stellar uses 7 decimal places
    
    // Calculate trees planted ($1 = 0.5 trees)
    const trees_planted = Math.floor(amount_usd * 0.5);

    // recipient wallet (your organization's wallet)
    const recipientAddress = 'GDYOUR_RECIPIENT_WALLET_ADDRESS_HERE'; // Replace with your wallet

    // Verify recipient address exists
    try {
      await server.loadAccount(recipientAddress);
    } catch (error) {
      return res.status(500).json({ 
        error: 'Invalid recipient wallet address',
        details: 'Please check STELLAR_RECIPIENT_WALLET in environment variables'
      });
    }

    // Get sender account info
    const sourceAccount = await server.loadAccount(publicKey);

    // Create transaction
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: network.networkPassphrase
    })
    .addOperation(StellarSdk.Operation.payment({
      destination: recipientAddress,
      asset: StellarSdk.Asset.native(), // XLM
      amount: (xlm_amount / 10000000).toString() // Convert back to normal number
    }))
    .addMemo(StellarSdk.Memo.text(`Carbon Offset: $${amount_usd} = ${trees_planted} trees`))
    .setTimeout(30)
    .build();

    // Sign transaction with sender's keypair
    transaction.sign(StellarSdk.Keypair.fromSecret(secretKey));

    // Submit to Stellar network
    const result = await server.submitTransaction(transaction);

    // Save to database
    const stellarTxHash = result.hash;

    db.run(
      `INSERT INTO offsets (user_id, amount_usd, trees_planted, stellar_tx_hash, xlm_amount) 
       VALUES (?, ?, ?, ?, ?)`,
      [targetUid, amount_usd, trees_planted, stellarTxHash, (xlm_amount / 10000000)],
      (err) => {
        if (err) {
          // Create table if not exists
          db.run(`
            CREATE TABLE IF NOT EXISTS offsets (
              id INTEGER PRIMARY KEY,
              user_id INTEGER,
              amount_usd REAL,
              trees_planted INTEGER,
              stellar_tx_hash TEXT,
              xlm_amount REAL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);

          db.run(
            `INSERT INTO offsets (user_id, amount_usd, trees_planted, stellar_tx_hash, xlm_amount) 
             VALUES (?, ?, ?, ?, ?)`,
            [targetUid, amount_usd, trees_planted, stellarTxHash, (xlm_amount / 10000000)],
            (err2) => {
              if (err2) {
                console.error('DB insert error:', err2);
              }
            }
          );
        }
      }
    );

    res.json({
      success: true,
      message: 'Carbon credits purchased successfully!',
      amount_usd: amount_usd,
      trees_planted: trees_planted,
      xlm_amount: (xlm_amount / 10000000),
      transaction_hash: stellarTxHash,
      explorer_url: `https://stellar.expert/explorer/testnet/tx/${stellarTxHash}`,
      recipient: recipientAddress,
      memo: `Carbon Offset: $${amount_usd} = ${trees_planted} trees`
    });

  } catch (error) {
    console.error('Stellar payment error:', error);
    
    // Handle specific Stellar errors
    if (error.type === 'transaction_failed') {
      res.status(400).json({ 
        error: 'Transaction failed',
        details: error.extras?.result_codes?.transaction || 'Unknown error',
        note: 'Check if you have enough testnet XLM'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to process payment',
        details: error.message
      });
    }
  }
}));

// =========================================================================
// 2. GET USER CARBON OFFSETS -> SECURED USER/ADMIN ACCESS 🔑
// =========================================================================
router.get('/user/:user_id', authenticateToken, asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  
  // Security Verification: Ensure regular users cannot view other profiles' offsets
  if (req.user.role !== 'admin' && parseInt(user_id) !== req.user.userId) {
    res.status(403);
    throw new Error('Forbidden: You are unauthorized to view another profile\'s offset registry.');
  }
  
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM offsets WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id],
      (err, rows) => {
        if (err) {
          console.error('🚨 DB Error fetching offsets:', err.message);
          res.status(500);
          return reject(new Error('Database read error during offset fetch.'));
        }
        res.json(rows);
        resolve();
      }
    );
  });
}));

// =========================================================================
// 3. GET TOTAL OFFSETS LEADERBOARD -> SECURED USER ACCESS 🔑
// =========================================================================
router.get('/total', authenticateToken, asyncHandler(async (req, res) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT user_id, SUM(trees_planted) as total_trees, COUNT(*) as total_offsets, SUM(amount_usd) as total_spent 
       FROM offsets 
       GROUP BY user_id 
       ORDER BY total_trees DESC 
       LIMIT 10`,
      [],
      (err, rows) => {
        if (err) {
          console.error('🚨 DB Error fetching leaderboard:', err.message);
          res.status(500);
          return reject(new Error('Database aggregation error during leaderboard fetch.'));
        }
        res.json(rows || []);
        resolve();
      }
    );
  });
}));

// =========================================================================
// 4. VERIFY STELLAR TRANSACTION -> SECURED USER ACCESS 🔑
// =========================================================================
router.get('/verify/:txHash', authenticateToken, asyncHandler(async (req, res) => {
  const { txHash } = req.params;
  
  try {
    const transaction = await server.transactions().transaction(txHash).call();
    
    res.json({
      verified: true,
      transaction: {
        hash: transaction.hash,
        fee: transaction.fee_charged,
        timestamp: transaction.created_at,
        memo: transaction.memo,
        successful: transaction.successful
      }
    });
  } catch (error) {
    console.error('🚨 Stellar verification error:', error.message);
    res.status(404).json({ 
      verified: false,
      error: 'Transaction not found on Stellar network'
    });
  }
}));

// =========================================================================
// 5. CHECK WALLET BALANCE -> ADMIN ONLY 🛡️
// =========================================================================
router.get('/balance', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(b => b.asset_type === 'native');
    
    res.json({
      address: publicKey,
      balance: nativeBalance ? nativeBalance.balance : '0',
      sequence: account.sequence,
      message: 'Wallet balance retrieved successfully.'
    });
  } catch (error) {
    console.error('🚨 Failed to fetch wallet balance:', error.message);
    res.status(500);
    throw new Error('Failed to retrieve Stellar wallet balance.');
  }
}));

module.exports = router;