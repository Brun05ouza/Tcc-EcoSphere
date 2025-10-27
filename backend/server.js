const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initializeFirebase } = require('./config/firebase');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://172.16.42.65:3000', 'http://0.0.0.0:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Inicializar Firebase
let db;
try {
  db = initializeFirebase();
  global.db = db;
  console.log('✅ Servidor iniciado com Firebase');
} catch (error) {
  console.error('❌ Falha ao conectar Firebase');
  process.exit(1);
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/waste', require('./routes/waste'));

// Inicializar coleções Firebase
const initFirebaseCollections = async () => {
  try {
    const collections = ['users', 'gamification', 'waste_classifications'];
    for (const collection of collections) {
      await db.collection(collection).limit(1).get();
    }
    console.log('✅ Coleções Firebase verificadas');
  } catch (error) {
    console.error('❌ Erro ao verificar coleções:', error);
  }
};

initFirebaseCollections();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EcoSphere API funcionando!' });
});

// Debug endpoint
app.get('/api/debug/users', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => {
      const { password, ...userWithoutPassword } = doc.data();
      return { id: doc.id, ...userWithoutPassword };
    });
    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://172.16.42.65:${PORT}/api`);
  console.log(`🌐 Acesso local: http://localhost:${PORT}/api`);
  console.log(`🌍 Acesso rede: http://172.16.42.65:${PORT}/api`);
});