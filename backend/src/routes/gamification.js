const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
  res.json({ 
    ecoPoints: 1250,
    nivel: 3,
    badges: ['Reciclador', 'Eco Warrior']
  });
});

module.exports = router;