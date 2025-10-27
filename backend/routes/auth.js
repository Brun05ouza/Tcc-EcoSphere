const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Função para validar força da senha
const validatePassword = (password) => {
  if (!password || password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  if (!/[^\w\s]/.test(password)) return false;
  return true;
};

// Registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const db = global.db;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres' });
    }

    // Verificar se usuário já existe
    const existingUser = await db.collection('users').where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const userData = {
      name,
      email,
      password: hashedPassword,
      ecoPoints: 0,
      level: 'Iniciante',
      badges: [],
      wasteClassifications: [],
      gameHistory: [],
      streak: { current: 0, longest: 0 },
      createdAt: new Date()
    };

    const userRef = await db.collection('users').add(userData);
    const userId = userRef.id;

    // Gerar token
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'ecosphere-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email,
        ecoPoints: 0,
        level: 'Iniciante'
      }
    });
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

// Login com Google
router.post('/google', async (req, res) => {
  try {
    console.log('🔍 Dados recebidos do Google:', req.body);
    const { id, name, email, picture, provider } = req.body;
    const db = global.db;

    if (!id || !email || !name) {
      console.log('❌ Dados incompletos:', { id: !!id, name: !!name, email: !!email });
      return res.status(400).json({ 
        message: 'Dados do Google incompletos',
        received: { id: !!id, name: !!name, email: !!email }
      });
    }

    console.log('✅ Dados válidos recebidos do Google');

    // Verificar se usuário já existe
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();
    let user;

    if (usersSnapshot.empty) {
      // Criar novo usuário
      console.log('🆕 Criando novo usuário Google...');
      const newUser = {
        googleId: id,
        name,
        email,
        picture: picture || null,
        provider: 'google',
        ecoPoints: 100, // Bonus por cadastro
        level: 'Iniciante',
        badges: [],
        wasteClassifications: [],
        gameHistory: [],
        streak: { current: 0, longest: 0 },
        createdAt: new Date(),
        lastLogin: new Date()
      };

      const docRef = await db.collection('users').add(newUser);
      user = { id: docRef.id, ...newUser };
      console.log('✅ Novo usuário Google criado:', user.email);
    } else {
      // Usuário existente
      console.log('👤 Usuário Google existente encontrado');
      const doc = usersSnapshot.docs[0];
      user = { id: doc.id, ...doc.data() };
      
      // Atualizar dados do Google e último login
      const updateData = {
        lastLogin: new Date()
      };
      
      if (user.googleId !== id) updateData.googleId = id;
      if (user.picture !== picture && picture) updateData.picture = picture;
      if (user.provider !== 'google') updateData.provider = 'google';
      
      if (Object.keys(updateData).length > 1) { // Mais que apenas lastLogin
        await db.collection('users').doc(user.id).update(updateData);
        Object.assign(user, updateData);
        console.log('🔄 Dados do usuário atualizados');
      } else {
        await db.collection('users').doc(user.id).update({ lastLogin: new Date() });
      }
      
      console.log('✅ Login Google existente:', user.email);
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'ecosphere-secret',
      { expiresIn: '7d' }
    );

    // Remover dados sensíveis e preparar resposta
    const { password, ...userWithoutPassword } = user;
    
    const responseData = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        provider: user.provider,
        ecoPoints: user.ecoPoints || 0,
        level: user.level || 'Iniciante',
        badges: user.badges || [],
        streak: user.streak || { current: 0, longest: 0 }
      }
    };

    console.log('✅ Login Google concluído com sucesso');
    res.json(responseData);
  } catch (error) {
    console.error('❌ Erro no login Google:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = global.db;

    // Verificar usuário
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    const userDoc = userSnapshot.docs[0];
    const user = userDoc.data();
    const userId = userDoc.id;

    // Verificar senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'ecosphere-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        ecoPoints: user.ecoPoints,
        level: user.level,
        provider: user.provider || 'local'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

module.exports = router;