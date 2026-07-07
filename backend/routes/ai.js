const express = require('express');
const router = express.Router();
const ecochainRAG = require('../config/ragEngine');
const { authenticateToken } = require('../middleware/auth');

// POST /api/ai/chat
router.post('/chat', authenticateToken, async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message payload parameters missing.' });
  }

  try {
    // Stream query down to our fresh engine class layer
    const aiResponseText = await ecochainRAG.askChatbot(message, history || "");
    
    return res.json({ response: aiResponseText });
  } catch (error) {
    console.error('🚨 Error caught inside AI Routing Layer:', error);
    return res.status(500).json({ 
      error: 'Failed to communicate with local AI Core Engine.',
      details: error.message 
    });
  }
});

module.exports = router;