# EcoSphere – Documentação Completa do Projeto

Documentação técnica e funcional do sistema EcoSphere: design, funcionalidades, estrutura de pastas, backend e configuração.

---

## 1. Visão Geral

O **EcoSphere** é uma plataforma web de sustentabilidade que combina:

- **Autenticação** (Supabase Auth: email/senha e Google OAuth)
- **Classificação de resíduos com IA** (TensorFlow.js / Teachable Machine ou serviço opcional)
- **Gamificação** (EcoPoints, badges, ranking)
- **Monitoramento ambiental** (dados climáticos)
- **ChatBot** (EcoBot – assistente com respostas locais e navegação)
- **Educação** (cursos, quiz, calculadora de carbono)
- **Recompensas** e **histórico** de ações

O backend é unificado no **Supabase** (PostgreSQL + Auth). O frontend é **React** com **Tailwind CSS**, **Framer Motion** e componentes como globo 3D (NASA WorldWind) e fundo de nebulosa no hero.

---

## 2. Estrutura de Pastas

Estrutura para análise do projeto:

```
Tcc-EcoSphere/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── Globe.lottie                    # Ícone animado do globo (opcional; copiar da raiz)
│   │   ├── worldwind/
│   │   │   └── images/
│   │   │       ├── stars.json
│   │   │       └── TectonicPlates.json
│   │   └── models/
│   │       └── waste-classifier/
│   │           ├── model.json              # Modelo TensorFlow.js (Teachable Machine)
│   │           ├── metadata.json
│   │           └── README.md
│   ├── src/
│   │   ├── index.js                       # Entry point, tratamento de AbortError
│   │   ├── App.js                         # Rotas, UserProvider, Navbar, Main, Footer, ChatBot
│   │   ├── App.css                        # Tailwind, componentes (.card, .btn-*), scroll oculto
│   │   ├── lib/
│   │   │   └── supabase.js                # Cliente Supabase (REACT_APP_SUPABASE_*)
│   │   ├── contexts/
│   │   │   └── UserContext.js             # user, token, loading, isAdmin, updateUser, logout, addEcoPoints, spendEcoPoints
│   │   ├── services/
│   │   │   ├── api.js                     # environmentalAPI, wasteAPI, gamificationAPI, userAPI
│   │   │   └── supabaseService.js         # Auth, profiles, waste_classifications, user_game_actions, ranking, badges
│   │   ├── hooks/
│   │   │   ├── useEcoPoints.js            # ecoPoints, loadEcoPoints, addEcoPoints, evento ecoPointsUpdated
│   │   │   ├── useWasteClassifier.js     # TensorFlow.js, classes 6 categorias, wasteInfo, classificação simulada
│   │   │   └── useEnterKey.js             # Utilitário tecla Enter
│   │   ├── data/
│   │   │   └── quizQuestions.js           # Perguntas do quiz diário
│   │   ├── components/
│   │   │   ├── Navbar.js                  # Logo, menu, notificações, EcoPoints, usuário; modo hero (transparente)
│   │   │   ├── Footer.js                  # Logo, links, redes sociais
│   │   │   ├── ChatBot.js                 # EcoBot: flutuante, mensagens, quick actions, processLocalMessage
│   │   │   ├── ProtectedRoute.js          # Redireciona para /login se não autenticado
│   │   │   ├── AdminProtectedRoute.js     # Proteção rota admin
│   │   │   ├── GoogleLogin.js              # Botão login Google
│   │   │   ├── DailyQuiz.js               # Quiz diário (EcoPoints)
│   │   │   ├── InteractiveCourse.js       # Curso interativo (educação)
│   │   │   ├── ui/
│   │   │   │   ├── AppIcon.js             # Mapa de ícones (lucide + globo/earth → EcoGlobeLogo)
│   │   │   │   ├── EcoGlobeLogo.jsx       # Globo Lottie (Globe.lottie) ou fallback PNG
│   │   │   ├── background/
│   │   │   │   ├── NebulaBackground.jsx   # Hero: nebulosa + estrelas
│   │   │   │   ├── NebulaBackground.css   # Gradientes #020617, #0a1a2a, #0f3d2e, blobs, stars
│   │   │   │   ├── VantaBackground.jsx    # Background alternativo (Vanta.js)
│   │   │   │   └── vantaBackground.css
│   │   │   └── globe/
│   │   │       ├── WorldWindGlobeBase.jsx # Canvas NASA WorldWind, layers, rotação
│   │   │       ├── DashboardGlobeCard.jsx # Globo 3D para Home/Dashboard
│   │   │       └── LoginGlobeBackground.jsx # Globo no fundo da Login
│   │   ├── assets/
│   │   │   └── icons/
│   │   │       ├── globo-icon.png         # Fallback do logo
│   │   │       ├── rocket.svg
│   │   │       ├── dashboard.svg
│   │   │       ├── IA.svg
│   │   │       ├── monitoramento.svg
│   │   │       ├── ecopoints.svg
│   │   │       ├── recompensas.svg
│   │   │       ├── educacao.svg
│   │   │       ├── camera.svg
│   │   │       ├── globe.svg
│   │   │       └── earth.svg
│   │   └── pages/
│   │       ├── Home.js                   # Hero (nebula + globo 3D + texto), features, stats, CTA
│   │       ├── Login.js                  # Auth email/senha + Google, glassmorphism
│   │       ├── Dashboard.js              # Gráficos, quiz, pegada de carbono
│   │       ├── WasteClassifier.js        # Classificação de resíduos (câmera/upload), useWasteClassifier
│   │       ├── Environmental.js          # Monitoramento (dados climáticos)
│   │       ├── Gamification.js           # EcoPoints, ranking, badges
│   │       ├── Rewards.js                # Resgate de recompensas
│   │       ├── Education.js              # Cursos, conteúdo educativo
│   │       ├── History.js                # Histórico de ações e classificações
│   │       ├── Profile.js                # Perfil do usuário
│   │       ├── Guide.js                  # Guia da plataforma
│   │       ├── EcoCatcher.js             # Jogo/atividade
│   │       ├── CarbonCalculator.js       # Calculadora de pegada de carbono
│   │       └── AdminDashboard.js         # Painel admin (protegido)
│   ├── package.json
│   ├── tailwind.config.js                # Cores eco, surface, shadows, mesh, font Plus Jakarta Sans
│   ├── craco.config.js                   # Config CRACO (Create React App)
│   └── .env.example
├── supabase/
│   └── migrations/
│       ├── 001_ecosphere_schema.sql      # profiles, waste_classifications, user_game_actions, RLS, handle_new_user
│       ├── 002_fix_handle_new_user.sql   # Ajuste handle_new_user (search_path)
│       └── 003_admin_role.sql            # Coluna is_admin em profiles
├── Globe.lottie                          # Asset Lottie do globo (copiar para frontend/public)
├── ai-service/                           # (Opcional) Serviço Flask para classificação por servidor
│   ├── app.py
│   └── requirements.txt
├── README.md
└── DOCUMENTACAO.md                       # Este arquivo
```

**Resumo dos diretórios principais:**

- **frontend/src/pages**: uma página por rota (Home, Login, Dashboard, WasteClassifier, Environmental, Gamification, Rewards, Education, History, Profile, Guide, EcoCatcher, CarbonCalculator, AdminDashboard).
- **frontend/src/components**: layout (Navbar, Footer), fluxos (ChatBot, ProtectedRoute, AdminProtectedRoute, GoogleLogin), UI (AppIcon, EcoGlobeLogo), background (NebulaBackground, VantaBackground), globe (WorldWindGlobeBase, DashboardGlobeCard, LoginGlobeBackground), quiz e curso (DailyQuiz, InteractiveCourse).
- **frontend/src/services**: api.js (camada de API que usa supabaseService e Supabase auth), supabaseService.js (funções diretas ao Supabase).
- **frontend/src/hooks**: useEcoPoints, useWasteClassifier, useEnterKey.
- **frontend/src/contexts**: UserContext (estado global do usuário e sessão).
- **frontend/src/data**: quizQuestions.js (perguntas do quiz).
- **frontend/src/lib**: supabase.js (createClient).

### Observações da estrutura

- **frontend/src**: todo o código React (contextos, serviços, hooks, componentes, páginas).
- **frontend/public**: estáticos; `Globe.lottie` deve ser copiado da raiz para `public/` para o logo animado.
- **supabase/migrations**: aplicar em ordem 001 → 002 → 003 no SQL Editor do Supabase.
- **ai-service** (opcional): não está na árvore acima; se existir, é um serviço Flask separado para classificação por servidor (`REACT_APP_AI_SERVICE_URL`).

---

## 3. Stack Tecnológico

### Frontend

| Tecnologia        | Uso |
|-------------------|-----|
| React 18          | UI e componentes |
| React Router 6    | Rotas (/, /login, /dashboard, etc.) |
| Tailwind CSS 3    | Estilos, tema eco/surface, utilitários |
| Framer Motion     | Animações (hero, listas, modais) |
| CRACO             | Customização do Create React App |
| Lucide React      | Ícones (Bell, User, Bot, etc.) |
| @supabase/supabase-js | Cliente Supabase (auth + DB) |
| @lottiefiles/dotlottie-react | Logo animado (Globe.lottie) |
| @nasaworldwind/worldwind | Globo 3D (WorldWind) |
| TensorFlow.js + @tensorflow/tfjs | Modelo de classificação de resíduos (ou simulada) |
| Chart.js + react-chartjs-2 | Gráficos no Dashboard |
| Axios             | Requisições HTTP (se usado) |
| Leaflet / react-leaflet | Mapas (monitoramento) |
| Phaser / Three / Vanta | Efeitos ou jogos (EcoCatcher, backgrounds) |

### Backend / Infra

- **Supabase**: Auth (email/senha + OAuth Google), PostgreSQL, Row Level Security (RLS).
- **Variáveis de ambiente**: `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, opcionais: `REACT_APP_GOOGLE_CLIENT_ID`, `REACT_APP_OPENWEATHER_API_KEY`, `REACT_APP_AI_SERVICE_URL`.

---

## 4. Design

### 4.1 Sistema de cores (Tailwind)

- **eco**: 50–950 (verde); destaque da marca (botões, links, badges).
- **surface**: 50–300 (neutros claros para fundos).
- **accent**: amber, teal, sage (destaques secundários).
- **Nebulosa (hero)**: `#020617` (preto), `#0a1a2a` (azul escuro), `#0f3d2e` (verde escuro).

### 4.2 Tipografia

- **Font**: Plus Jakarta Sans (sans e display) em `tailwind.config.js`.
- Títulos em destaque com gradiente (eco/teal/emerald) e `tracking-tight`.

### 4.3 Componentes globais (App.css)

- **.card**: fundo branco, borda, sombra suave, `rounded-2xl`.
- **.card-hover**: igual ao card + hover com sombra e borda eco.
- **.btn-primary**: gradiente eco–teal, branco, hover glow/scale.
- **.btn-secondary**: borda eco, texto eco, hover fundo eco-50.
- **.input-base**: borda, focus ring eco.
- **.section-container**: `container mx-auto px-4 max-w-7xl`.
- **.gradient-text**: texto com gradiente eco/teal.

### 4.4 Scroll

- Scroll **oculto** em toda a aplicação (barra não visível; rolagem mantida).
- `scrollbar-width: none` (Firefox), `-ms-overflow-style: none` (IE/Edge), `::-webkit-scrollbar { display: none }` (Chrome/Safari).

### 4.5 Body na Home

- Na página **Home**, o `body` recebe `background: #020617` para não aparecer faixa clara atrás do navbar transparente; ao sair da Home, o fundo é restaurado.

### 4.6 Hero (Home)

- **Container**: `min-h-screen`, `relative overflow-hidden`, margem negativa (`-mt-20 md:-mt-[80px]`) e `pt-20 md:pt-[80px]` para o hero “subir” e a nebulosa ficar atrás do navbar.
- **NebulaBackground**: fundo em camadas (gradiente base + 3 blobs animados com `blur(80px)` + ~80 partículas “estrelas” com animação de brilho). Cores: `#020617`, `#0a1a2a`, `#0f3d2e`.
- **Globo 3D**: posicionado em `absolute right-0 top-1/2 -translate-y-1/2`, tamanho `min(75vw, 960px)` e `max-h-[85vh]`, só em desktop (`hidden lg:block`). Componente: `DashboardGlobeCard` → `WorldWindGlobeBase` (NASA WorldWind).
- **Bloco de texto**: `w-fit max-w-xl`, alinhado ao início (esquerda). Contém:
  - Tagline: “Sua jornada sustentável”.
  - Logo (EcoGlobeLogo) + título “EcoSphere” na mesma linha (flex), borda esquerda verde em desktop.
  - Linha decorativa em gradiente.
  - Parágrafo e dois botões (Começar Agora, Testar IA) em linha, ícone + texto, `whitespace-nowrap`.

### 4.7 Navbar

- **Sticky** no topo; comportamento condicionado ao scroll na Home:
  - **Hero visível** (path `/` e `scrollY < 420`): fundo **transparente**, borda transparente, texto/ícones claros (stone-300, branco, emerald).
  - **Scroll ou outra página**: fundo **branco sólido**, borda stone, sombra; texto/ícones escuros.
- Logo: **EcoGlobeLogo** (Lottie ou fallback) + texto “EcoSphere”.
- Itens: Dashboard, IA Resíduos, Monitoramento, Histórico, EcoPoints, Recompensas, Educação; ícones SVG por rota.
- Área do usuário: sino (notificações), badge de EcoPoints, avatar e dropdown (Perfil, Sair). Admin: link para `/admin`.

### 4.8 Logo principal (EcoGlobeLogo)

- **Fonte**: arquivo Lottie `public/Globe.lottie` (DotLottieReact); se falhar, fallback para `globo-icon.png`.
- Usado na Navbar, Home (hero e CTA), Login, Footer, Dashboard, CarbonCalculator, AppIcon (quando nome é `globe` ou `earth`).
- Aceita `size`, `className` e `style` (ex.: filter verde para tema claro/escuro).

### 4.9 Footer

- Fundo escuro (stone-900), logo EcoGlobeLogo + “EcoSphere”, texto de descrição, links e ícones de redes.

### 4.10 ChatBot (EcoBot)

- Botão flutuante (canto inferior direito): ícone **Bot** (robô) quando fechado, X quando aberto.
- Painel: cabeçalho com “EcoBot”, lista de mensagens, campo de texto, ações rápidas (EcoPoints, Classificar, Recompensas, Monitoramento).
- Respostas por **processLocalMessage** (saudações, navegação, dicas de reciclagem, água, energia, etc.) e redirecionamento para rotas.

### 4.11 Ícones e assets

- **AppIcon**: componente unificado; para `globe`/`earth` renderiza **EcoGlobeLogo**; para os demais usa Lucide (Globe, Recycle, Trophy, Leaf, Bot, etc.) ou SVGs de `assets/icons/` (dashboard, IA, monitoramento, ecopoints, recompensas, educacao, camera, rocket).
- **SVGs em assets/icons**: rocket.svg, dashboard.svg, IA.svg, monitoramento.svg, ecopoints.svg, recompensas.svg, educacao.svg, camera.svg, globe.svg, earth.svg.
- **globo-icon.png**: fallback do logo quando Globe.lottie não está disponível ou falha.

---

## 5. Funcionalidades por Página e Módulo

### 5.1 Rotas (App.js)

- **Públicas**: `/login` (Login).
- **Protegidas (ProtectedRoute)**: `/` (Home), `/dashboard`, `/classificar-residuos`, `/monitoramento`, `/gamificacao`, `/eco-catcher`, `/educacao`, `/recompensas`, `/historico`, `/calculadora-carbono`, `/perfil`, `/guia`.
- **Admin (AdminProtectedRoute)**: `/admin` (AdminDashboard).

### 5.2 Home (`/`)

- Hero em tela cheia: NebulaBackground + globo 3D à direita + bloco de texto à esquerda (tagline, logo+título, parágrafo, botões).
- Body com fundo `#020617` enquanto está na Home.
- Seção “Funcionalidades Principais”: 4 cards (Monitoramento, IA Resíduos, Gamificação, Educação) com ícones e animação on scroll.
- Seção “Impacto da Comunidade”: estatísticas animadas (usuários, ações, CO₂) em cards sobre gradiente verde.
- CTA final: “Pronto para fazer a diferença?” + botão “Começar Jornada Sustentável”.
- No mobile: globo 3D em seção separada (`max-w-sm`, `aspect-square`).

### 5.3 Login (`/login`)

- Layout em duas colunas (em desktop): uma com texto e lista de features, outra com formulário em estilo glassmorphism.
- Toggle Login/Registro; campos: email, senha, nome (registro), confirmação de senha.
- Login com Google (Supabase OAuth) quando configurado.
- Fundo: LoginGlobeBackground (WorldWind) com opacidade; globo decorativo atrás do formulário.
- Após login/registro: atualização do UserContext e redirecionamento.

### 5.4 Dashboard (`/dashboard`)

- Gráficos (Chart.js): linha e doughnut/bar para métricas do usuário.
- Uso de `useEcoPoints` e `gamificationAPI.getProfile()`.
- Bloco “Pegada de Carbono” e “Impacto Coletivo da Plataforma” com ícone EcoGlobeLogo.
- DailyQuiz (modal/popover) para ganhar pontos.

### 5.5 Classificador de Resíduos (`/classificar-residuos`)

- **Hook useWasteClassifier**: carrega modelo TensorFlow.js de `/models/waste-classifier/model.json` ou usa modo “simulated”.
- Categorias: Plástico, Metal, Vidro, Papel, Orgânico, Eletrônico; cada uma com `wasteInfo` (lixeira, dicas, ícone, cores).
- Fluxo: câmera ou upload de imagem → classificação → exibição de resultado (categoria, confiança, dicas, pontos) → salvamento no Supabase (`waste_classifications`) e soma de pontos no perfil.
- Integração opcional com `REACT_APP_AI_SERVICE_URL` (backend de classificação).

### 5.6 Monitoramento (`/monitoramento`)

- environmentalAPI (mock ou integração futura): cidade, temperatura, qualidade do ar, alertas.
- Página para exibir dados ambientais e possivelmente mapas (Leaflet).

### 5.7 Gamificação (`/gamificacao`)

- Exibição de EcoPoints, nível, ranking (top 10) e badges.
- `gamificationAPI.getProfile()`, `getRanking()`, `getBadges()`.
- Badges definidos em supabaseService (Bem-vindo, Primeiro Passo, Reciclador, Eco Warrior, etc.) e conquistas por classificações e ações de jogo.

### 5.8 Recompensas (`/recompensas`)

- Listagem de recompensas resgatáveis com EcoPoints; uso de `userAPI.spendPoints` / `spendEcoPoints` do contexto.

### 5.9 Educação (`/educacao`)

- Conteúdo educativo e possivelmente InteractiveCourse (cursos/desafios).

### 5.10 Histórico (`/historico`)

- Histórico de classificações e ações do usuário (waste_classifications, user_game_actions via API/Supabase).

### 5.11 Perfil (`/perfil`)

- Dados do usuário (UserContext), edição de nome/email e atualização via userAPI/supabaseService.

### 5.12 Guia (`/guia`)

- Guia de uso da plataforma.

### 5.13 EcoCatcher (`/eco-catcher`)

- Página de jogo/atividade (possível uso de Phaser ou similar).

### 5.14 Calculadora de Carbono (`/calculadora-carbono`)

- Fluxo de perguntas (transporte, energia, etc.); cálculo de pegada e exibição de resultado com dicas; uso de EcoGlobeLogo na UI.

### 5.15 Admin (`/admin`)

- AdminDashboard: acessível apenas com `user.isAdmin`; conteúdo específico do painel administrativo.

---

## 6. Backend (Supabase)

### 6.1 Tabelas (001_ecosphere_schema.sql)

- **profiles**: `id` (FK auth.users), `name`, `email`, `avatar_url`, `eco_points`, `level`, `badges` (jsonb), `streak` (jsonb), `created_at`, `updated_at`. Trigger `set_updated_at`; trigger `on_auth_user_created` chama `handle_new_user()` para criar perfil ao se cadastrar.
- **waste_classifications**: `id`, `user_id`, `category`, `confidence`, `points`, `created_at`; índices em `user_id` e `created_at`.
- **user_game_actions**: `id`, `user_id`, `game_type`, `points`, `data` (jsonb), `created_at`; índice em `user_id`.

### 6.2 Row Level Security (RLS)

- **profiles**: leitura permitida a todos; insert/update apenas no próprio perfil (`auth.uid() = id`).
- **waste_classifications**: todas as operações restritas ao próprio `user_id`.
- **user_game_actions**: idem, por `user_id`.

### 6.3 Migrations adicionais

- **002**: redefine `handle_new_user()` com `search_path = ''` e tratamento de exceção.
- **003**: adiciona `is_admin` (boolean) em `profiles`.

### 6.4 Serviço (supabaseService.js)

- **Auth**: signUp, signIn, signInWithGoogle, signOut, getSession, onAuthStateChange.
- **Profiles**: getCurrentProfile, getProfile, updateProfile, addPointsToProfile, subtractPointsFromProfile; níveis por faixa de pontos (LEVELS); definição de badges (BADGES_DEF).
- **Gamificação**: getGamificationProfile, getRanking, registerAction (insere user_game_actions e atualiza profiles/badges), getBadges.
- **Resíduos**: saveClassification (insert + addPointsToProfile), getClassificationHistory.
- Mapeamento snake_case (DB) ↔ camelCase (app) em profileToApp.

---

## 7. Contextos e Hooks

### 7.1 UserContext

- **Estado**: user, token, loading.
- **Derivado**: isAdmin (user?.isAdmin).
- **Métodos**: updateUser, logout, addEcoPoints, spendEcoPoints.
- Inicialização: getSession + getCurrentProfile; onAuthStateChange para manter sessão e perfil; timeouts para não travar se Supabase não responder.
- Fallback: se perfil falhar, usa sessionToFallbackUser(auth.user).

### 7.2 useEcoPoints

- Estado: ecoPoints, loading, error.
- loadEcoPoints: busca gamificationAPI.getProfile e atualiza estado e localStorage.
- addEcoPoints: chama gamificationAPI.registrarAcao, atualiza estado e localStorage e dispara evento `ecoPointsUpdated`.
- Listener global para `ecoPointsUpdated` para sincronizar pontos entre componentes.

### 7.3 useWasteClassifier

- Carrega modelo TensorFlow.js ou define “simulated”.
- classes: array das 6 categorias; wasteInfo: objeto por categoria (bin, tips, iconName, cores).
- Método de classificação (imagem → categoria, confidence, points) e integração com wasteAPI.saveClassification.

---

## 8. Variáveis de Ambiente

Arquivo: `frontend/.env` (copiar de `.env.example`).

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| REACT_APP_SUPABASE_URL | Sim | URL do projeto Supabase |
| REACT_APP_SUPABASE_ANON_KEY | Sim | Chave anon do Supabase |
| REACT_APP_GOOGLE_CLIENT_ID | Não | Client ID Google OAuth (login com Google) |
| REACT_APP_OPENWEATHER_API_KEY | Não | Chave OpenWeatherMap (monitoramento) |
| REACT_APP_AI_SERVICE_URL | Não | URL do ai-service (classificação por servidor) |

---

## 9. Como Rodar o Projeto

1. **Clonar e instalar**
   - `git clone <repo> && cd Tcc-EcoSphere/frontend && npm install`

2. **Supabase**
   - Criar projeto em supabase.com.
   - Executar no SQL Editor, em ordem: `001_ecosphere_schema.sql`, `002_fix_handle_new_user.sql`, `003_admin_role.sql`.
   - Em Settings → API: copiar URL e anon key para o `.env`.
   - (Opcional) Authentication → Providers: ativar Google e configurar Client ID.

3. **Frontend**
   - Copiar `.env.example` para `.env` e preencher as variáveis.
   - (Opcional) Copiar `Globe.lottie` da raiz para `frontend/public/Globe.lottie`.
   - `npm start` (dev) ou `npm run build` (produção).

4. **Ai-service (opcional)**
   - Se existir pasta/rep de ai-service: configurar Flask, instalar dependências, rodar servidor e definir `REACT_APP_AI_SERVICE_URL` no `.env`.

---

## 10. Resumo das Integrações

- **Supabase**: auth, profiles, waste_classifications, user_game_actions; RLS e triggers.
- **TensorFlow.js**: modelo em `public/models/waste-classifier/` ou classificação simulada.
- **NASA WorldWind**: globo 3D (WorldWindGlobeBase) em Home, Login e Dashboard.
- **Lottie**: Globe.lottie para logo animado (EcoGlobeLogo).
- **ChatBot**: 100% local (processLocalMessage + navegação); sem OpenAI/Gemini obrigatório.
- **Monitoramento**: environmentalAPI mock; OpenWeatherMap opcional via env.

Esta documentação cobre a estrutura de pastas, o design (cores, componentes, hero, navbar, scroll, ícones), todas as funcionalidades por rota e módulo, backend Supabase, contextos, hooks, serviços, variáveis de ambiente e como rodar o projeto, sem resumir ou omitir as partes principais do sistema.
