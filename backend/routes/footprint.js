const express = require('express');
const router = express.Router();
const db = require('../config/database');
const axios = require('axios');

// Calculate carbon footprint with AI (with fallback)
router.post('/calculate', async (req, res) => {
  const { user_id, commute_km, commute_mode, diet_type, electricity_kwh } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing required parameter: user_id' });
  }

  try {
    let total_co2_tons;
    let suggestions;

    // Try calling the Python AI service first
    try {
      const aiResponse = await axios.post('http://localhost:8000/api/ai/footprint/calculate', {
        commute_km: Number(commute_km) || 0,
        commute_mode: commute_mode || 'car',
        diet_type: diet_type || 'vegetarian',
        electricity_kwh: Number(electricity_kwh) || 0
      }, { timeout: 3000 });

      total_co2_tons = aiResponse.data.total_co2_tons;
      suggestions = aiResponse.data.suggestions;
      console.log('✅ AI Service calculated footprint successfully');

    } catch (aiError) {
      // Fallback: Calculate locally if AI service is offline
      console.warn('⚠️ AI Service offline. Using local calculation fallback...');
      
      const commuteFactors = { car: 0.17, bus: 0.09, metro: 0.05, bike: 0, walk: 0 };
      const dietFactors = { meat: 1.5, vegetarian: 1.0, vegan: 0.8 };
      
      const commuteEmissions = (Number(commute_km) || 0) * (commuteFactors[commute_mode] || 0.17) * 365 / 1000;
      const dietEmissions = (dietFactors[diet_type] || 1.0) * 365 / 1000;
      const electricityEmissions = (Number(electricity_kwh) || 0) * 0.5 * 12 / 1000;
      
      total_co2_tons = commuteEmissions + dietEmissions + electricityEmissions;
      suggestions = 'Consider switching to public transport, reducing meat consumption, and using energy-efficient appliances.';
    }

    // Save the footprint log to the database
    db.run(
      `INSERT INTO footprint_logs (user_id, activity_type, input_value, emissions_kg) 
       VALUES (?, ?, ?, ?)`,
      [user_id, 'Full Footprint Analysis', total_co2_tons, total_co2_tons * 1000],
      function (err) {
        if (err) {
          console.error('🚨 Database error saving footprint log:', err.message);
          return res.status(500).json({ error: 'Failed to save footprint calculation', details: err.message });
        }

        console.log(`✅ Footprint log saved for user ${user_id}: ${total_co2_tons} tons CO2`);
        
        res.json({
          total_co2_tons: parseFloat(total_co2_tons.toFixed(2)),
          suggestions: suggestions
        });
      }
    );

  } catch (error) {
    console.error('Footprint calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate carbon footprint',
      details: error.message 
    });
  }
});

// Get user's footprint history
router.get('/user/:user_id', (req, res) => {
  const { user_id } = req.params;
  
  db.all(
    `SELECT * FROM footprint_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 20`,
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

module.exports = router;
