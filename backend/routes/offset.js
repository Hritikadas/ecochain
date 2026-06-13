const express = require('express');
const router = express.Router();
const StellarSdk = require('stellar-sdk');
const { server, network, publicKey, secretKey } = require('../config/stellar');
const db = require('../config/database');

// Buy carbon credits with REAL Stellar transaction
router.post('/buy', async (req, res) => {
  const { user_id, amount_usd } = req.body;
  
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
      [user_id, amount_usd, trees_planted, stellarTxHash, (xlm_amount / 10000000)],
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
            [user_id, amount_usd, trees_planted, stellarTxHash, (xlm_amount / 10000000)],
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
});

// Get user's carbon offsets
router.get('/user/:user_id', (req, res) => {
  const { user_id } = req.params;
  
  db.all(
    `SELECT * FROM offsets WHERE user_id = ? ORDER BY created_at DESC`,
    [user_id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

// Get total offsets for leaderboard
router.get('/total', (req, res) => {
  db.all(
    `SELECT user_id, SUM(trees_planted) as total_trees, COUNT(*) as total_offsets, SUM(amount_usd) as total_spent 
     FROM offsets 
     GROUP BY user_id 
     ORDER BY total_trees DESC 
     LIMIT 10`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

// Verify transaction on Stellar
router.get('/verify/:txHash', async (req, res) => {
  const { txHash } = req.params;
  
  try {
    const transaction = await server.transaction(txHash);
    
    res.json({
      verified: true,
      transaction: {
        hash: transaction.hash,
        fee: transaction.fee,
        timestamp: transaction.created_at,
        memo: transaction.memo?.value,
        operations: transaction.operations
      }
    });
  } catch (error) {
    res.status(404).json({ 
      verified: false,
      error: 'Transaction not found on Stellar network'
    });
  }
});

// Check wallet balance
router.get('/balance', async (req, res) => {
  try {
    const account = await server.loadAccount(publicKey);
    
    res.json({
      address: publicKey,
      balance: account.balances.find(b => b.asset_type === 'native').balance,
      sequence: account.sequence
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch balance',
      details: error.message
    });
  }
});

module.exports = router;