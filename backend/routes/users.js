const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Obter perfil do usuário
router.get('/profile', auth, async (req, res) => {
  try {
    const db = global.db;
    const userDoc = await db.collection('users').doc(req.user.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const user = { id: userDoc.id, ...userDoc.data() };
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Atualizar perfil
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const db = global.db;
    
    await db.collection('users').doc(req.user.userId).update({
      name,
      email,
      updatedAt: new Date()
    });
    
    const userDoc = await db.collection('users').doc(req.user.userId).get();
    const user = { id: userDoc.id, ...userDoc.data() };
    delete user.password;
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Adicionar pontos
router.post('/points', auth, async (req, res) => {
  try {
    const { points, action } = req.body;
    const userId = req.user.userId;
    const db = global.db;

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const user = userDoc.data();
    const newPoints = (user.ecoPoints || 0) + points;

    await db.collection('users').doc(userId).update({
      ecoPoints: newPoints,
      lastPointsGain: {
        points,
        action,
        timestamp: new Date()
      }
    });

    const updatedUser = { id: userId, ...user, ecoPoints: newPoints };
    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;