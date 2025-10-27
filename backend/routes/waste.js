const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Classificar resíduo (simulado)
router.post('/classify', auth, async (req, res) => {
  try {
    // Simular classificação
    const wasteTypes = ['plastico', 'papel', 'vidro', 'metal', 'organico'];
    const type = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
    const confidence = 0.85 + Math.random() * 0.1;
    const points = Math.floor(Math.random() * 50) + 50;
    
    const result = {
      type,
      confidence,
      points,
      tips: 'Lave o recipiente antes do descarte. Remova tampas e rótulos quando possível.',
      locations: ['Supermercado Central - 0.5km', 'Ponto de Coleta Norte - 1.2km']
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Obter histórico de classificações
router.get('/history', auth, async (req, res) => {
  try {
    const user = global.users.find(u => u.id === req.user.id);
    res.json(user.wasteClassifications || []);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Registrar descarte
router.post('/register', auth, async (req, res) => {
  try {
    const { type, location, points } = req.body;
    
    // Registrar ação de gamificação
    const gamificationData = {
      type: 'waste_classification',
      points: points || 50,
      data: { wasteType: type }
    };
    
    // Aqui você chamaria a rota de gamificação
    res.json({ message: 'Descarte registrado com sucesso', points: points || 50 });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;