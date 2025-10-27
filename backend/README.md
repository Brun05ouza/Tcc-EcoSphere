# EcoSphere Backend API

API completa para o sistema EcoSphere com autenticação, gamificação e gerenciamento de usuários.

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 16+
- MongoDB (local ou Atlas)

### Instalação
```bash
cd backend
npm install
```

### Configuração
1. Copie o arquivo `.env` e configure as variáveis
2. Certifique-se que o MongoDB está rodando

### Executar
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### Popular Banco (Opcional)
```bash
node scripts/seed.js
```

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login

### Usuários
- `GET /api/users/profile` - Obter perfil
- `PUT /api/users/profile` - Atualizar perfil

### Gamificação
- `GET /api/gamification/profile` - Dados de gamificação
- `GET /api/gamification/ranking` - Ranking global
- `GET /api/gamification/badges` - Badges disponíveis
- `POST /api/gamification/action` - Registrar ação

### Resíduos
- `POST /api/waste/classify` - Classificar resíduo
- `GET /api/waste/history` - Histórico de classificações

## 🗄️ Estrutura do Banco

### Usuário
```javascript
{
  name: String,
  email: String,
  password: String,
  ecoPoints: Number,
  level: String,
  badges: [{ id, name, earnedAt }],
  wasteClassifications: [{ type, confidence, points, date }],
  missions: [{ id, progress, completed }],
  streak: { current, longest, lastActivity }
}
```

## 🔐 Autenticação

Todas as rotas protegidas requerem header:
```
Authorization: Bearer <token>
```

## 🎮 Sistema de Gamificação

### Níveis
- Iniciante (0-49 pontos)
- Iniciante Consciente (50-199 pontos)
- Reciclador (200-499 pontos)
- Eco Warrior (500-999 pontos)
- Guardião Verde (1000-1999 pontos)
- Mestre Ambiental (2000+ pontos)

### Badges
- Bem-vindo: Cadastro na plataforma
- Primeiro Passo: 1ª classificação
- Reciclador: 10 classificações
- Eco Warrior: 50 classificações
- Guardião Verde: 100 classificações
- Mestre Ambiental: 500 classificações

## 🌐 CORS

API configurada para aceitar requisições de:
- http://localhost:3000 (desenvolvimento)
- http://172.16.42.65:3000 (rede local)