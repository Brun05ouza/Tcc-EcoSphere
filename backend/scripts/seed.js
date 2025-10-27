const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedDatabase = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect('mongodb://localhost:27017/ecosphere', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Conectado ao MongoDB');

    // Limpar dados existentes
    await User.deleteMany({});

    // Criar usuários de exemplo
    const users = [
      {
        name: 'Ana Silva',
        email: 'ana@exemplo.com',
        password: await bcrypt.hash('123456', 10),
        ecoPoints: 2850,
        level: 'Mestre Ambiental',
        badges: [
          { id: 1, name: 'Bem-vindo' },
          { id: 2, name: 'Primeiro Passo' },
          { id: 3, name: 'Reciclador' },
          { id: 4, name: 'Eco Warrior' },
          { id: 5, name: 'Guardião Verde' }
        ],
        wasteClassifications: Array(150).fill().map((_, i) => ({
          type: ['plastico', 'papel', 'vidro', 'metal', 'organico'][i % 5],
          confidence: 0.8 + Math.random() * 0.2,
          points: 50 + Math.floor(Math.random() * 50),
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }))
      },
      {
        name: 'Carlos Santos',
        email: 'carlos@exemplo.com',
        password: await bcrypt.hash('123456', 10),
        ecoPoints: 2340,
        level: 'Guardião Verde',
        badges: [
          { id: 1, name: 'Bem-vindo' },
          { id: 2, name: 'Primeiro Passo' },
          { id: 3, name: 'Reciclador' },
          { id: 4, name: 'Eco Warrior' }
        ],
        wasteClassifications: Array(80).fill().map((_, i) => ({
          type: ['plastico', 'papel', 'vidro', 'metal', 'organico'][i % 5],
          confidence: 0.8 + Math.random() * 0.2,
          points: 50 + Math.floor(Math.random() * 50),
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }))
      },
      {
        name: 'Maria Costa',
        email: 'maria@exemplo.com',
        password: await bcrypt.hash('123456', 10),
        ecoPoints: 1180,
        level: 'Eco Warrior',
        badges: [
          { id: 1, name: 'Bem-vindo' },
          { id: 2, name: 'Primeiro Passo' },
          { id: 3, name: 'Reciclador' }
        ],
        wasteClassifications: Array(35).fill().map((_, i) => ({
          type: ['plastico', 'papel', 'vidro', 'metal', 'organico'][i % 5],
          confidence: 0.8 + Math.random() * 0.2,
          points: 50 + Math.floor(Math.random() * 50),
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }))
      }
    ];

    await User.insertMany(users);

    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('Usuários criados:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.ecoPoints} EcoPoints`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    process.exit(1);
  }
};

seedDatabase();