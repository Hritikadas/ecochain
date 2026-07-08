const express = require('express');
const router = express.Router();
const ecochainRAG = require('../config/ragEngine');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

// =========================================================================
// AI CHATBOT ENDPOINT -> SECURED USER ACCESS 🔑
// =========================================================================
router.post('/chat', authenticateToken, asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  // Validate required input parameters
  if (!message) {
    res.status(400);
    throw new Error('Message payload parameters missing.');
  }

  console.log(`🤖 AI Chat request from User ID: ${req.user.userId} - Message: "${message.substring(0, 50)}..."`);

  // Stream query down to RAG engine layer
  const aiResponseText = await ecochainRAG.askChatbot(message, history || "");
  
  if (!aiResponseText) {
    res.status(500);
    throw new Error('AI engine returned empty response.');
  }

  return res.json({ 
    response: aiResponseText,
    user_id: req.user.userId,
    timestamp: new Date().toISOString()
  });
}));

module.exports = router;