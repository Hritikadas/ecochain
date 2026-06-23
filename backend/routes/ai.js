const express = require('express');
const router = express.Router();
const ecochainRAG = require('../config/ragEngine');

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message payload parameters missing.' });
  }

  // Stream query down to our fresh engine class
  const aiResponseText = await ecochainRAG.askChatbot(message, history || "");
  
  res.json({ response: aiResponseText });
});

module.exports = router;