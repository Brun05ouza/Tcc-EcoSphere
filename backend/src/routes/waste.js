const express = require('express');
const router = express.Router();

router.post('/classify', (req, res) => {
  res.json({ 
    type: 'plastico',
    confidence: 0.85,
    points: 85,
    tips: 'Lave o recipiente antes do descarte.'
  });
});

module.exports = router;