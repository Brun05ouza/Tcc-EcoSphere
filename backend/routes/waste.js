const express = require('express');
const auth = require('../middleware/auth');
const { db } = require('../config/firebase');

const router = express.Router();

// Salvar classificação de resíduo
router.post('/classification', auth, async (req, res) => {
  try {
    const { category, confidence, points } = req.body;
    const userId = req.user.uid;
    
    const classification = {
      userId,
      category,
      confidence,
      points,
      timestamp: new Date().toISOString()
    };
    
    // Salvar no Firestore
    await db.collection('classifications').add(classification);
    
    // Atualizar pontos do usuário
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const currentPoints = userDoc.data().ecoPoints || 0;
      await userRef.update({
        ecoPoints: currentPoints + points,
        lastClassification: new Date().toISOString()
      });
    }
    
    res.json({ 
      success: true, 
      pointsEarned: points,
      message: 'Classificação salva com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao salvar classificação:', error);
    res.status(500).json({ message: 'Erro ao salvar classificação' });
  }
});

// Obter histórico de classificações
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('classifications')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const classifications = [];
    snapshot.forEach(doc => {
      classifications.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(classifications);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico' });
  }
});

// Classificar resíduo (simulado - para compatibilidade)
router.post('/classify', auth, async (req, res) => {
  try {
    const wasteTypes = ['Plástico', 'Papel', 'Vidro', 'Metal', 'Orgânico'];
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

// Registrar descarte
router.post('/register', auth, async (req, res) => {
  try {
    const { type, location, points } = req.body;
    
    const gamificationData = {
      type: 'waste_classification',
      points: points || 50,
      data: { wasteType: type }
    };
    
    res.json({ message: 'Descarte registrado com sucesso', points: points || 50 });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;