const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Conexão MongoDB (opcional para desenvolvimento)
try {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecosphere', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB conectado');
} catch (error) {
  console.log('MongoDB não disponível, rodando sem banco de dados');
}

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/environmental', require('./routes/environmental'));
app.use('/api/waste', require('./routes/waste'));
app.use('/api/gamification', require('./routes/gamification'));

app.get('/', (req, res) => {
  res.json({ message: 'EcoSphere API funcionando!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesso local: http://localhost:${PORT}`);
  console.log(`Acesso rede: http://172.16.42.65:${PORT}`);
});