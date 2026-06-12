const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Buy carbon credits (SIMULATED for MVP demo)
router.post('/buy', async (req, res) => {
  const { user_id, amount_usd } = req.body;
  
  if (!user_id || !amount_usd) {
    return res.status(400).json({ error: 'Missing required parameters: user_id and amount_usd' });
  }

  try {
    // Calculate trees planted (hardcoded for demo: $1 = 0.5 trees)
    const trees_planted = Math.floor(amount_usd * 0.5);
    
    // Simulate Stellar transaction (for MVP demo)
    const simulatedTxHash = `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Save offset to database with correct schema
    db.run(
      `INSERT INTO offsets (user_id, amount_usd, trees_planted, stellar_tx_hash) 
       VALUES (?, ?, ?, ?)`,
      [user_id, amount_usd, trees_planted, simulatedTxHash],
      function (err) {
        if (err) {
          console.error('🚨 Database error:', err.message);
          return res.status(500).json({ error: 'Failed to save offset to database', details: err.message });
        }

        console.log(`✅ Offset saved: User ${user_id} retired $${amount_usd}, planted ${trees_planted} trees`);
        
        // Return success response
        res.status(201).json({
          message: 'Carbon credits purchased successfully!',
          amount_usd: amount_usd,
          trees_planted: trees_planted,
          transaction_hash: simulatedTxHash,
          explorer_url: `https://stellar.expert/explorer/testnet/tx/${simulatedTxHash}`,
          note: 'This is a demo simulation. In production, this will use real Stellar transactions.'
        });
      }
    );
  } catch (error) {
    console.error('Offset purchase error:', error);
    res.status(500).json({ 
      error: 'Failed to purchase carbon credits',
      details: error.message 
    });
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
        console.error('🚨 Database error:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows || []);
    }
  );
});

// Get total offsets (for leaderboard)
router.get('/total', (req, res) => {
  db.all(
    `SELECT user_id, SUM(trees_planted) as total_trees, COUNT(*) as total_offsets 
     FROM offsets 
     GROUP BY user_id 
     ORDER BY total_trees DESC 
     LIMIT 10`,
    [],
    (err, rows) => {
      if (err) {
        console.error('🚨 Database error:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows || []);
    }
  );
});

module.exports = router;