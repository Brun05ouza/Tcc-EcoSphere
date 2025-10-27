const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Banco em memória
global.users = [];
global.nextUserId = 1;

// Função de validação de senha
const validatePassword = (password) => {
  if (!password || password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  if (!/[^\w\s]/.test(password)) return false;
  return true;
};

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando!' });
});

// Registro simplificado
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Dados recebidos:', req.body);
    
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: 'Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo especial' 
      });
    }

    const existingUser = global.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      id: global.nextUserId++,
      name,
      email,
      password: hashedPassword,
      ecoPoints: 100,
      level: 'Iniciante Consciente'
    };

    global.users.push(user);
    console.log('✅ Usuário criado:', { id: user.id, name: user.name, email: user.email });

    res.status(201).json({
      token: 'fake-token-' + user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        ecoPoints: user.ecoPoints,
        level: user.level
      }
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ message: 'Erro no servidor: ' + error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📡 Teste: http://localhost:${PORT}/api/health`);
});