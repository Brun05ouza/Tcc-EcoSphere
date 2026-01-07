# EcoSphere - Plataforma de Sustentabilidade

Sistema web completo para gestão ambiental com IA, gamificação e monitoramento em tempo real.

## 🚀 Funcionalidades

- **Classificação de Resíduos com IA** - TensorFlow.js + Google Teachable Machine
  - Upload de imagem ou captura de câmera
  - 6 categorias: Plástico, Metal, Vidro, Papel, Orgânico, Eletrônico
  - Score de confiança em tempo real
  - Sistema de pontuação inteligente
- **Monitoramento Ambiental** - Dados climáticos e qualidade do ar em tempo real
- **Sistema de Gamificação** - EcoPoints, badges e ranking de usuários
- **ChatBot Inteligente** - Assistente virtual com IA (OpenAI/Gemini)
- **Autenticação Google OAuth** - Login seguro e rápido
- **Dashboard Interativo** - Visualização de dados e estatísticas

## 🛠️ Tecnologias

### Frontend
- React.js
- Tailwind CSS
- Framer Motion
- React Router

### Backend
- Node.js
- Express.js
- Firebase Firestore
- JWT Authentication

### APIs Integradas
- Google OAuth 2.0
- OpenAI GPT-3.5
- Google Gemini
- OpenWeatherMap
- TensorFlow.js
- Google Teachable Machine

## 📦 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/ecosphere.git
cd ecosphere
```

### 2. Configure o Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis no .env
npm run dev
```

### 3. Configure o Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Configure as variáveis no .env
npm start
```

### 4. (Opcional) Treinar Modelo de IA
Para classificação de resíduos com IA real:
- Siga o guia: `TEACHABLE_MACHINE_GUIDE.md`
- Ou use classificação simulada (já funciona!)

## ⚙️ Configuração

### Variáveis de Ambiente

**Backend (.env)**
```
JWT_SECRET=seu_jwt_secret
FIREBASE_PROJECT_ID=seu_project_id
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_GOOGLE_CLIENT_ID=seu_google_client_id
REACT_APP_OPENAI_API_KEY=sua_chave_openai
REACT_APP_GEMINI_API_KEY=sua_chave_gemini
```

### Firebase Setup
1. Crie projeto no Firebase Console
2. Ative Firestore Database
3. Configure Authentication (Google)
4. Baixe service account key
5. Coloque em `backend/config/`

## 🚀 Deploy

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
```

### Backend (Railway/Heroku)
```bash
cd backend
npm start
```

## 📱 Uso

1. **Cadastro/Login** - Use Google OAuth ou email/senha
2. **Dashboard** - Visualize estatísticas e progresso
3. **Classificar Resíduos** - Upload de imagem ou câmera para IA identificar
   - 6 categorias automáticas
   - Score de confiança
   - Dicas de descarte
   - Ganhe EcoPoints!
4. **ChatBot** - Tire dúvidas sobre sustentabilidade
5. **Gamificação** - Ganhe pontos e badges por ações sustentáveis

## 🤖 Classificação de Resíduos com IA

### Início Rápido
```bash
# Sistema já funciona com classificação simulada!
# Acesse: http://localhost:3000/classificador
```

### Treinar Modelo Real (Opcional)
1. Acesse: https://teachablemachine.withgoogle.com
2. Siga o guia: `TEACHABLE_MACHINE_GUIDE.md`
3. Exporte como TensorFlow.js
4. Coloque em: `frontend/public/models/waste-classifier/`

### Documentação Completa
- **Início Rápido:** `QUICK_START.md`
- **Guia de Treinamento:** `TEACHABLE_MACHINE_GUIDE.md`
- **Documentação Técnica:** `AI_IMPLEMENTATION.md`
- **Checklist:** `CHECKLIST.md`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- **Bruno Souza** - *Desenvolvimento inicial* - [Brun05ouza](https://github.com/Brun05ouza)

## 🙏 Agradecimentos

- Firebase pela infraestrutura
- OpenAI e Google pelas APIs de IA
- Comunidade open source
