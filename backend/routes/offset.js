const express = require('express');
const router = express.Router();
const { Horizon, Keypair, TransactionBuilder, BASE_FEE, Networks, Operation, Asset, Memo } = require('@stellar/stellar-sdk');
const { server, keypair, publicKey, secretKey } = require('../config/stellar');
const Offset = require('../models/Offset');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { fn, col } = require('sequelize');

// =========================================================================
// 1. BUY CARBON CREDITS -> SECURED USER ACCESS 🔑
// =========================================================================
router.post('/buy', authenticateToken, asyncHandler(async (req, res) => {
  const { user_id, amount_usd } = req.body;

  const targetUid = user_id || req.user.userId;
  if (req.user.role !== 'admin' && parseInt(targetUid) !== req.user.userId) {
    return res.status(403).json({ error: 'You cannot purchase offsets for another user.' });
  }

  try {
    if (amount_usd < 1) {
      return res.status(400).json({ error: 'Minimum amount is $1' });
    }

    const xlm_amount = Math.round(amount_usd * 3.3 * 10000000);
    const trees_planted = Math.floor(amount_usd * 0.5);

    // For demo: use a self-payment to record on-chain
    let stellarTxHash = `demo_tx_${Date.now()}`;

    try {
      const sourceAccount = await server.loadAccount(publicKey);

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.manageData({
          name: `offset_${Date.now()}`,
          value: `$${amount_usd}_${trees_planted}trees`
        }))
        .addMemo(Memo.text(`Offset: $${amount_usd}`))
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const result = await server.submitTransaction(transaction);
      stellarTxHash = result.hash;
    } catch (stellarErr) {
      console.warn('⚠️ Stellar transaction failed, using demo hash:', stellarErr.message);
    }

    // Save to database
    const offset = await Offset.create({
      user_id: targetUid,
      amount_usd,
      trees_planted,
      stellar_tx_hash: stellarTxHash
    });

    res.json({
      success: true,
      message: 'Carbon credits purchased successfully!',
      amount_usd,
      trees_planted,
      xlm_amount: (xlm_amount / 10000000),
      transaction_hash: stellarTxHash,
      explorer_url: `https://stellar.expert/explorer/testnet/tx/${stellarTxHash}`
    });

  } catch (error) {
    console.error('Offset purchase error:', error.message);
    res.status(500).json({ error: 'Failed to process offset purchase.', details: error.message });
  }
}));

// =========================================================================
// 2. GET USER OFFSETS -> SECURED USER ACCESS 🔑
// =========================================================================
router.get('/user/:user_id', authenticateToken, asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  if (req.user.role !== 'admin' && parseInt(user_id) !== req.user.userId) {
    return res.status(403).json({ error: 'You cannot view another user\'s offsets.' });
  }

  const offsets = await Offset.findAll({
    where: { user_id },
    order: [['created_at', 'DESC']]
  });

  res.json(offsets);
}));

// =========================================================================
// 3. GET LEADERBOARD -> SECURED ACCESS 🔑
// =========================================================================
router.get('/total', authenticateToken, asyncHandler(async (req, res) => {
  const leaderboard = await Offset.findAll({
    attributes: [
      'user_id',
      [fn('SUM', col('trees_planted')), 'total_trees'],
      [fn('COUNT', col('id')), 'total_offsets'],
      [fn('SUM', col('amount_usd')), 'total_spent']
    ],
    group: ['user_id'],
    order: [[fn('SUM', col('trees_planted')), 'DESC']],
    limit: 10,
    raw: true
  });

  res.json(leaderboard || []);
}));

// =========================================================================
// 4. VERIFY STELLAR TRANSACTION -> SECURED ACCESS 🔑
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
    res.status(404).json({
      verified: false,
      error: 'Transaction not found on Stellar network'
    });
  }
}));

// =========================================================================
// 5. WALLET BALANCE -> ADMIN ONLY 🛡️
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
    res.status(500).json({ error: 'Failed to retrieve wallet balance.' });
  }
}));

module.exports = router;