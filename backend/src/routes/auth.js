const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint', token: 'demo-token' });
});

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint' });
});

module.exports = router;