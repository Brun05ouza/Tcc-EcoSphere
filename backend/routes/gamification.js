const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Obter perfil de gamificação
router.get('/profile', auth, async (req, res) => {
  try {
    const user = global.users.find(u => u.id === req.user.id);
    
    res.json({
      ecoPoints: user.ecoPoints,
      level: user.level,
      badges: user.badges || [],
      streak: user.streak || { current: 0, longest: 0 },
      totalClassifications: user.wasteClassifications?.length || 0,
      completedMissions: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Obter ranking
router.get('/ranking', auth, async (req, res) => {
  try {
    const sortedUsers = global.users
      .sort((a, b) => b.ecoPoints - a.ecoPoints)
      .slice(0, 10);

    const ranking = sortedUsers.map((user, index) => ({
      position: index + 1,
      name: user.name,
      points: user.ecoPoints,
      level: user.level,
      isCurrentUser: user.id === req.user.id
    }));

    res.json(ranking);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Registrar ação (ganhar pontos)
router.post('/action', auth, async (req, res) => {
  try {
    const { type, points, data } = req.body;
    console.log(`🎮 Backend: Recebendo ${points} pontos do tipo ${type}`);
    
    const userIndex = global.users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    const user = global.users[userIndex];
    
    console.log(`💰 Backend: EcoPoints antes: ${user.ecoPoints} (tipo: ${typeof user.ecoPoints})`);
    console.log(`💰 Backend: Pontos a adicionar: ${points} (tipo: ${typeof points})`);
    
    // Garantir que ecoPoints seja um número
    if (typeof user.ecoPoints !== 'number') {
      console.log('⚠️ Backend: ecoPoints não é número, convertendo para 0');
      user.ecoPoints = 0;
    }
    
    // Garantir que points seja um número
    const pointsToAdd = Number(points);
    console.log(`💰 Backend: Pontos convertidos: ${pointsToAdd}`);
    
    // Adicionar pontos
    user.ecoPoints += pointsToAdd;
    
    console.log(`💰 Backend: EcoPoints depois: ${user.ecoPoints}`);
    console.log(`👤 Backend: Usuário completo:`, JSON.stringify(user, null, 2));
    
    // Registrar ação baseada no tipo
    if (type === 'waste_classification') {
      if (!user.wasteClassifications) user.wasteClassifications = [];
      user.wasteClassifications.push({
        type: data.wasteType,
        confidence: data.confidence,
        points: points,
        date: new Date()
      });
    } else if (type === 'quiz' || type === 'eco_catcher') {
      if (!user.gameHistory) user.gameHistory = [];
      user.gameHistory.push({
        gameType: type,
        points: points,
        date: new Date(),
        data: data
      });
    }
    
    // Atualizar nível baseado nos pontos
    const oldLevel = user.level;
    if (user.ecoPoints >= 2000) user.level = 'Mestre Ambiental';
    else if (user.ecoPoints >= 1000) user.level = 'Guardião Verde';
    else if (user.ecoPoints >= 500) user.level = 'Eco Warrior';
    else if (user.ecoPoints >= 200) user.level = 'Reciclador';
    else if (user.ecoPoints >= 50) user.level = 'Iniciante Consciente';
    else user.level = 'Iniciante';
    
    // Verificar novas badges
    const newBadges = [];
    if (!user.badges) user.badges = [];
    
    // Badge de boas-vindas (primeira ação)
    if (user.badges.length === 0 && !user.badges.find(b => b.id === 1)) {
      newBadges.push({ id: 1, name: 'Bem-vindo', earnedAt: new Date() });
    }
    
    const classifications = user.wasteClassifications?.length || 0;
    const gamePoints = user.gameHistory?.reduce((sum, game) => sum + game.points, 0) || 0;
    
    if (classifications === 1 && !user.badges.find(b => b.id === 2)) {
      newBadges.push({ id: 2, name: 'Primeiro Passo', earnedAt: new Date() });
    }
    if (classifications === 10 && !user.badges.find(b => b.id === 3)) {
      newBadges.push({ id: 3, name: 'Reciclador', earnedAt: new Date() });
    }
    if (classifications === 50 && !user.badges.find(b => b.id === 4)) {
      newBadges.push({ id: 4, name: 'Eco Warrior', earnedAt: new Date() });
    }
    if (gamePoints >= 100 && !user.badges.find(b => b.id === 7)) {
      newBadges.push({ id: 7, name: 'Gamer Ecológico', earnedAt: new Date() });
    }
    
    user.badges.push(...newBadges);
    
    // Atualizar o usuário no array global
    global.users[userIndex] = user;
    
    const response = {
      ecoPoints: user.ecoPoints,
      level: user.level,
      newBadges: newBadges,
      totalPoints: points,
      levelChanged: oldLevel !== user.level
    };
    
    console.log(`📤 Backend: Enviando resposta:`, response);
    
    res.json(response);
  } catch (error) {
    console.error('❌ Backend: Erro ao registrar ação:', error);
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

// Obter badges
router.get('/badges', auth, async (req, res) => {
  try {
    const user = global.users.find(u => u.id === req.user.id);
    
    const allBadges = [
      { id: 1, name: 'Bem-vindo', description: 'Primeira ação na plataforma', points: 10 },
      { id: 2, name: 'Primeiro Passo', description: 'Primeira classificação de resíduo', points: 25 },
      { id: 3, name: 'Reciclador', description: '10 classificações corretas', points: 50 },
      { id: 4, name: 'Eco Warrior', description: '50 classificações corretas', points: 100 },
      { id: 5, name: 'Guardião Verde', description: '100 classificações corretas', points: 200 },
      { id: 6, name: 'Mestre Ambiental', description: '500 classificações corretas', points: 500 },
      { id: 7, name: 'Gamer Ecológico', description: '100 pontos em jogos', points: 50 }
    ];
    
    const userBadges = user.badges || [];
    const badges = allBadges.map(badge => ({
      ...badge,
      earned: userBadges.some(b => b.id === badge.id),
      earnedAt: userBadges.find(b => b.id === badge.id)?.earnedAt
    }));
    
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;