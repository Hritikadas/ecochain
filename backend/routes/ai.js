const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');
const ragEngine = require('../config/ragEngine');

// =========================================================================
// POST /api/ai/chat — Authenticated AI Carbon Coach chat endpoint
// =========================================================================
router.post('/chat', authenticateToken, asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'A non-empty "message" field is required.' });
  }

  // Accept either a plain string or an array of {role, content} messages
  const chatHistoryText = Array.isArray(history)
    ? history.map(h => `${h.role}: ${h.content}`).join('\n')
    : (typeof history === 'string' ? history : '');

  const aiResponse = await ragEngine.askChatbot(message.trim(), chatHistoryText);

  return res.json({
    response: aiResponse,
    user: req.user?.email || null
  });
}));

// =========================================================================
// GET /api/ai/status — AI service health check
// =========================================================================
router.get('/status', asyncHandler(async (req, res) => {
  const status = ragEngine.getStatus();
  return res.json(status);
}));

module.exports = router;