# EcoSphere — Documentação Técnica Completa para TCC

**Autor:** Bruno Souza  
**Curso:** Tecnologia da Informação / Ciência da Computação  
**Tema:** Desenvolvimento de Plataforma Web de Sustentabilidade com Inteligência Artificial  
**Repositório:** https://github.com/Brun05ouza/Tcc-EcoSphere

---

## Sumário

1. [Apresentação do Projeto](#1-apresentação-do-projeto)
2. [Objetivos](#2-objetivos)
3. [Justificativa e Relevância](#3-justificativa-e-relevância)
4. [Arquitetura Geral do Sistema](#4-arquitetura-geral-do-sistema)
5. [Tecnologias Utilizadas](#5-tecnologias-utilizadas)
6. [Estrutura de Pastas](#6-estrutura-de-pastas)
7. [Banco de Dados e Backend (Supabase)](#7-banco-de-dados-e-backend-supabase)
8. [Frontend — React](#8-frontend--react)
9. [Páginas e Funcionalidades Detalhadas](#9-páginas-e-funcionalidades-detalhadas)
10. [Componentes Reutilizáveis](#10-componentes-reutilizáveis)
11. [Sistema de Design (UI/UX)](#11-sistema-de-design-uiux)
12. [Módulo de Inteligência Artificial](#12-módulo-de-inteligência-artificial)
13. [Sistema de Gamificação](#13-sistema-de-gamificação)
14. [Autenticação e Segurança](#14-autenticação-e-segurança)
15. [Responsividade](#15-responsividade)
16. [Variáveis de Ambiente](#16-variáveis-de-ambiente)
17. [Como Executar o Projeto](#17-como-executar-o-projeto)
18. [Fluxos de Usuário](#18-fluxos-de-usuário)
19. [Resultados e Considerações Finais](#19-resultados-e-considerações-finais)
20. [Referências Tecnológicas](#20-referências-tecnológicas)

---

## 1. Apresentação do Projeto

O **EcoSphere** é uma plataforma web de sustentabilidade ambiental que combina inteligência artificial, gamificação e educação ecológica em um único sistema integrado. O projeto foi desenvolvido como Trabalho de Conclusão de Curso com o objetivo de demonstrar como a tecnologia pode ser utilizada como ferramenta de engajamento ambiental e transformação de comportamento.

A plataforma permite que usuários:
- Classifiquem resíduos através de imagens utilizando modelos de visão computacional
- Acompanhem dados de monitoramento ambiental em tempo real
- Aprendam sobre sustentabilidade por meio de cursos interativos, artigos e desafios
- Ganhem pontos (EcoPoints), badges e subam no ranking da comunidade
- Resgatem recompensas com os pontos acumulados
- Calculem sua pegada de carbono
- Interajam com um assistente virtual especializado em ecologia (EcoBot)

---

## 2. Objetivos

### 2.1 Objetivo Geral

Desenvolver uma plataforma web completa que integre inteligência artificial e gamificação para incentivar práticas sustentáveis e educar usuários sobre meio ambiente.

### 2.2 Objetivos Específicos

- Implementar um sistema de classificação de resíduos baseado em aprendizado de máquina (TensorFlow.js) que funcione diretamente no navegador do usuário, sem necessidade de servidor dedicado de IA
- Criar um sistema de gamificação completo com pontos, badges, ranking e missões para aumentar o engajamento
- Desenvolver um módulo educacional com cursos interativos, artigos, desafios e dicas práticas
- Integrar dados meteorológicos reais através da API OpenWeatherMap para o monitoramento ambiental
- Construir um sistema de recompensas onde o usuário pode trocar pontos por benefícios
- Garantir que toda a plataforma seja responsiva e funcione em dispositivos móveis
- Implementar autenticação segura com email/senha e login social via Google (OAuth)
- Persistir todos os dados na nuvem utilizando o Supabase como Backend as a Service (BaaS)

---

## 3. Justificativa e Relevância

O descarte inadequado de resíduos sólidos, a crescente emissão de carbono e o baixo engajamento da população com práticas sustentáveis são problemas urgentes na sociedade contemporânea. Estudos mostram que o lúdico e a gamificação aumentam significativamente a adesão a mudanças de comportamento.

O EcoSphere surge como resposta tecnológica a este cenário, unindo:
- **Inteligência Artificial**: tornando acessível a identificação de resíduos para qualquer pessoa com um smartphone
- **Gamificação**: transformando ações sustentáveis em desafios com recompensas reais
- **Educação Digital**: oferecendo conteúdo de qualidade de forma interativa e progressiva
- **Comunidade**: criando um senso de pertencimento e impacto coletivo mensurável

---

## 4. Arquitetura Geral do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                     React 18 + SPA                          │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Páginas │  │Componentes│  │  Hooks   │  │ Contextos │  │
│  │  (14)    │  │ (20+)    │  │(3 custom)│  │(UserCtx)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Camada de Serviços                    │   │
│  │          api.js + supabaseService.js                │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────────┐   ┌──────────────┐
  │ Supabase │      │ OpenWeather  │   │  TensorFlow  │
  │  (BaaS)  │      │    API       │   │  .js (local) │
  │          │      │  (opcional)  │   │ no navegador │
  │ Auth     │      └──────────────┘   └──────────────┘
  │ PostgreSQL│
  │ Storage  │
  │ RLS      │
  └──────────┘
```

### Modelo Arquitetural

O EcoSphere adota o padrão **SPA (Single Page Application)** com React, onde:

- Toda a navegação é controlada pelo `React Router v6` no cliente (sem recarregamento de página)
- A autenticação e persistência de dados ficam no **Supabase** (BaaS — Backend as a Service)
- O modelo de classificação de IA roda **localmente no navegador** via TensorFlow.js, sem necessidade de servidor dedicado
- A API de monitoramento ambiental (OpenWeatherMap) é consumida diretamente pelo front-end
- O estado global do usuário é gerenciado pelo `UserContext` (Context API do React)

---

## 5. Tecnologias Utilizadas

### 5.1 Frontend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **React** | 18.2.0 | Biblioteca principal para construção da UI |
| **React Router DOM** | 6.8.0 | Roteamento client-side entre páginas |
| **Tailwind CSS** | 3.2.0 | Estilização via classes utilitárias |
| **Framer Motion** | 12.x | Animações fluidas de componentes |
| **CRACO** | 7.1.0 | Customização do Create React App |
| **Lucide React** | 0.547.0 | Biblioteca de ícones SVG |
| **@supabase/supabase-js** | 2.95.3 | Cliente oficial Supabase (Auth + DB) |
| **@lottiefiles/dotlottie-react** | 0.18.x | Animação Lottie para o logotipo |
| **@nasaworldwind/worldwind** | 0.11.1 | Globo 3D da NASA (renderização WebGL) |
| **TensorFlow.js** | 4.22.0 | Inferência do modelo de IA no navegador |
| **@tensorflow-models/mobilenet** | 2.1.1 | Modelo base para classificação de imagens |
| **Chart.js + react-chartjs-2** | 4.2.0 / 5.2.0 | Gráficos e dashboards |
| **React CountUp** | 6.5.3 | Animação de contagem numérica |
| **Leaflet + React Leaflet** | 1.9.4 / 4.2.1 | Mapas interativos (opcional) |
| **Axios** | 1.3.0 | Cliente HTTP para requisições |
| **Three.js** | 0.134.0 | Gráficos 3D (suporte) |

### 5.2 Backend / Infraestrutura

| Tecnologia | Finalidade |
|---|---|
| **Supabase** | BaaS: Auth, PostgreSQL, Storage, RLS |
| **PostgreSQL** | Banco de dados relacional (via Supabase) |
| **Supabase Auth** | Autenticação email/senha e OAuth Google |
| **Supabase Storage** | Upload e armazenamento de fotos de perfil (bucket `avatars`) |
| **Row Level Security (RLS)** | Segurança a nível de linha no banco de dados |
| **OpenWeatherMap API** | Dados meteorológicos em tempo real (opcional) |

### 5.3 Ferramentas de Desenvolvimento

| Ferramenta | Uso |
|---|---|
| **Git + GitHub** | Controle de versão e hospedagem do código |
| **VS Code / Cursor IDE** | Editor de código |
| **npm** | Gerenciador de pacotes |
| **Node.js** | Ambiente de execução |
| **CRACO** | Customização do webpack sem ejetar |

---

## 6. Estrutura de Pastas

```
Tcc-EcoSphere/
├── frontend/                          # Aplicação React
│   ├── public/
│   │   ├── index.html                 # HTML base
│   │   ├── Globe.lottie               # Animação do logotipo
│   │   ├── worldwind/
│   │   │   └── images/
│   │   │       ├── stars.json         # Dados de estrelas (globo 3D)
│   │   │       └── TectonicPlates.json
│   │   └── models/
│   │       └── waste-classifier/
│   │           ├── model.json         # Modelo TensorFlow.js treinado
│   │           ├── metadata.json      # Metadados do modelo
│   │           └── README.md
│   ├── src/
│   │   ├── index.js                   # Entry point + tratamento AbortError
│   │   ├── App.js                     # Roteamento, providers e layout global
│   │   ├── App.css                    # Tailwind + classes customizadas
│   │   ├── lib/
│   │   │   └── supabase.js            # Instância do cliente Supabase
│   │   ├── contexts/
│   │   │   └── UserContext.js         # Estado global do usuário autenticado
│   │   ├── services/
│   │   │   ├── api.js                 # Camada de abstração de APIs
│   │   │   └── supabaseService.js     # Serviços diretos ao Supabase
│   │   ├── hooks/
│   │   │   ├── useEcoPoints.js        # Hook para gerenciar EcoPoints
│   │   │   ├── useWasteClassifier.js  # Hook para classificação com IA
│   │   │   └── useEnterKey.js         # Utilitário para tecla Enter
│   │   ├── data/
│   │   │   └── quizQuestions.js       # Banco de perguntas do quiz
│   │   ├── components/
│   │   │   ├── Navbar.js              # Navbar global com menu responsivo
│   │   │   ├── Footer.js              # Rodapé global
│   │   │   ├── ChatBot.js             # Assistente virtual EcoBot
│   │   │   ├── ProtectedRoute.js      # Proteção de rotas autenticadas
│   │   │   ├── AdminProtectedRoute.js # Proteção de rotas de admin
│   │   │   ├── GoogleLogin.js         # Botão de login com Google
│   │   │   ├── DailyQuiz.js           # Quiz diário (modal)
│   │   │   ├── InteractiveCourse.js   # Modal de curso interativo
│   │   │   ├── ui/
│   │   │   │   ├── AppIcon.js         # Mapa unificado de ícones
│   │   │   │   ├── EcoGlobeLogo.jsx   # Logotipo animado (Lottie)
│   │   │   │   └── LoadingScreen.js   # Tela de carregamento
│   │   │   ├── home/
│   │   │   │   ├── FeaturesBento.jsx  # Grade de funcionalidades (Home)
│   │   │   │   └── FeaturesSection.jsx
│   │   │   ├── background/
│   │   │   │   ├── NebulaBackground.jsx # Background nebulosa (hero)
│   │   │   │   └── NebulaBackground.css
│   │   │   └── globe/
│   │   │       ├── WorldWindGlobeBase.jsx  # Engine do globo 3D (NASA)
│   │   │       ├── DashboardGlobeCard.jsx  # Globo da Home/Dashboard
│   │   │       └── LoginGlobeBackground.jsx # Globo da tela de login
│   │   ├── assets/
│   │   │   └── icons/
│   │   │       ├── dashboard.svg      # Ícones de navegação personalizados
│   │   │       ├── IA.svg
│   │   │       ├── monitoramento.svg
│   │   │       ├── ecopoints.svg
│   │   │       ├── recompensas.svg
│   │   │       ├── educacao.svg
│   │   │       ├── rocket.svg
│   │   │       ├── camera.svg
│   │   │       ├── globe.svg
│   │   │       └── globo-icon.png     # Fallback do logotipo
│   │   └── pages/
│   │       ├── Home.js                # Página inicial (landing)
│   │       ├── Login.js               # Autenticação
│   │       ├── Dashboard.js           # Painel de dados do usuário
│   │       ├── WasteClassifier.js     # Classificador de resíduos com IA
│   │       ├── Environmental.js       # Monitoramento ambiental
│   │       ├── Gamification.js        # EcoPoints, quiz, game, badges, ranking
│   │       ├── Rewards.js             # Loja de recompensas
│   │       ├── Education.js           # Educação ambiental (cursos, artigos, desafios)
│   │       ├── History.js             # Histórico de ações do usuário
│   │       ├── Profile.js             # Perfil do usuário
│   │       ├── Guide.js               # Guia de uso da plataforma
│   │       ├── EcoCatcher.js          # Minijogo Eco Catcher
│   │       ├── CarbonCalculator.js    # Calculadora de pegada de carbono
│   │       └── AdminDashboard.js      # Painel administrativo
│   ├── tailwind.config.js             # Tema customizado (cores eco, surface)
│   ├── craco.config.js                # Configuração CRACO
│   └── package.json
├── supabase/
│   └── migrations/
│       ├── 001_ecosphere_schema.sql   # Schema principal (profiles, tabelas, RLS)
│       ├── 002_fix_handle_new_user.sql
│       └── 003_admin_role.sql         # Coluna is_admin
├── ai-service/                        # Serviço Flask opcional
│   ├── app.py
│   └── requirements.txt
├── DOCUMENTACAO.md                    # Documentação técnica anterior
├── DOCUMENTACAO_TCC.md                # Este arquivo (documentação completa TCC)
└── README.md
```

---

## 7. Banco de Dados e Backend (Supabase)

### 7.1 Por que Supabase?

O Supabase foi escolhido como solução de backend pois oferece:
- **PostgreSQL gerenciado**: banco de dados relacional robusto sem necessidade de servidor próprio
- **Autenticação pronta**: suporte nativo a email/senha, OAuth (Google, GitHub, etc.) e JWT
- **Row Level Security (RLS)**: segurança configurável diretamente no banco, garantindo que cada usuário acesse apenas seus próprios dados
- **Storage**: armazenamento de arquivos (utilizado para fotos de perfil)
- **API REST automática**: cada tabela gera endpoints REST automaticamente
- **SDK JavaScript**: client oficial `@supabase/supabase-js` com suporte a React

### 7.2 Tabelas do Banco de Dados

#### Tabela `profiles`
Armazena os dados do perfil de cada usuário.

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  name        TEXT,
  email       TEXT,
  avatar_url  TEXT,
  eco_points  INTEGER DEFAULT 0,
  level       TEXT DEFAULT 'Iniciante',
  badges      JSONB DEFAULT '[]',
  streak      JSONB DEFAULT '{"current": 0, "longest": 0}',
  is_admin    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos principais:**
- `eco_points`: pontos acumulados pelo usuário em todas as ações
- `level`: calculado automaticamente com base nos EcoPoints (Iniciante, Iniciante Consciente, Reciclador, Eco Warrior, Guardião Verde, Mestre Ambiental)
- `badges`: array JSON com as badges conquistadas (id, nome, data)
- `streak`: sequência de dias consecutivos de uso
- `avatar_url`: URL pública da foto de perfil armazenada no Storage

#### Tabela `waste_classifications`
Armazena cada classificação de resíduo realizada.

```sql
CREATE TABLE waste_classifications (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id),
  category     TEXT NOT NULL,        -- Plástico, Vidro, Papel, Metal, Orgânico, Eletrônico
  confidence   FLOAT,                -- Confiança do modelo (0.0 a 1.0)
  points       INTEGER DEFAULT 0,    -- Pontos ganhos nesta classificação
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela `user_game_actions`
Registra ações de gamificação (jogos, quiz, etc.).

```sql
CREATE TABLE user_game_actions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id),
  game_type  TEXT,                -- 'eco_catcher', 'quiz', etc.
  points     INTEGER DEFAULT 0,
  data       JSONB DEFAULT '{}',  -- Dados extras (score, tempo, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7.3 Trigger de Criação de Perfil

Quando um novo usuário se registra via Supabase Auth, um trigger cria automaticamente seu registro na tabela `profiles`:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 7.4 Row Level Security (RLS)

Cada tabela possui políticas de segurança que garantem que usuários só acessem seus próprios dados:

```sql
-- Profiles: leitura pública, escrita apenas pelo próprio usuário
CREATE POLICY "Users can read all profiles"     ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"    ON profiles FOR UPDATE USING (auth.uid() = id);

-- Classificações: acesso apenas pelo próprio usuário
CREATE POLICY "Users can see own classifications" ON waste_classifications
  FOR ALL USING (auth.uid() = user_id);

-- Ações de jogo: idem
CREATE POLICY "Users can see own game actions" ON user_game_actions
  FOR ALL USING (auth.uid() = user_id);
```

### 7.5 Sistema de Níveis

O nível do usuário é calculado automaticamente com base na quantidade de EcoPoints:

| EcoPoints | Nível |
|---|---|
| 0 – 49 | Iniciante |
| 50 – 199 | Iniciante Consciente |
| 200 – 499 | Reciclador |
| 500 – 999 | Eco Warrior |
| 1000 – 1999 | Guardião Verde |
| 2000+ | Mestre Ambiental |

### 7.6 Storage — Bucket `avatars`

As fotos de perfil são armazenadas no Supabase Storage no bucket `avatars`. O fluxo de upload:

1. Usuário seleciona arquivo no componente `Profile.js`
2. `uploadAvatar(userId, file)` em `supabaseService.js` envia o arquivo com nome único (`{userId}-{random}.{ext}`)
3. A URL pública é obtida e salva no campo `avatar_url` da tabela `profiles`
4. O `UserContext` é atualizado para refletir o novo avatar em toda a aplicação (Navbar + Perfil)

---

## 8. Frontend — React

### 8.1 Entry Point e Configuração Global

O `index.js` inicializa a aplicação e adiciona um listener global para suprimir erros de `AbortError` (comuns no React 18 StrictMode com o Supabase):

```javascript
window.addEventListener('unhandledrejection', (e) => {
  const reason = e?.reason;
  if (reason?.name === 'AbortError' || /signal is aborted/i.test(reason?.message)) {
    e.preventDefault();
  }
});
```

### 8.2 Roteamento (App.js)

O roteamento usa o React Router v6 com rotas aninhadas e proteção:

```
/login          → Login (pública)
/admin          → AdminDashboard (requer isAdmin = true)
/               → Home
/dashboard      → Dashboard
/classificar-residuos → WasteClassifier
/monitoramento  → Environmental
/gamificacao    → Gamification
/eco-catcher    → EcoCatcher
/educacao       → Education
/recompensas    → Rewards
/historico      → History
/calculadora-carbono → CarbonCalculator
/perfil         → Profile
/guia           → Guide
```

Todas as rotas exceto `/login` são envolvidas pelo `ProtectedRoute`, que verifica se há usuário no `UserContext`. Se não houver, redireciona para `/login`.

### 8.3 UserContext — Estado Global

O `UserContext` gerencia o estado de autenticação em toda a aplicação:

**Estado:**
- `user`: objeto com dados completos do perfil (name, email, ecoPoints, level, badges, avatar_url, etc.)
- `token`: JWT de autenticação do Supabase
- `loading`: indica se a sessão está sendo verificada
- `isAdmin`: calculado a partir de `user?.isAdmin`

**Métodos:**
- `updateUser(userData, token)`: atualiza o estado e salva em `localStorage`/`sessionStorage`
- `logout()`: chama `supabase.auth.signOut()` e limpa tudo
- `addEcoPoints(points, action)`: adiciona pontos localmente e sincroniza com o Supabase
- `spendEcoPoints(points, action)`: subtrai pontos (para resgates)

**Inicialização com timeout:**
O contexto aguarda até 15 segundos para a sessão carregar. Se o Supabase não responder, usa os dados do `localStorage` como fallback, garantindo que o usuário nunca fique travado numa tela de carregamento infinita.

### 8.4 Camada de Serviços

#### `supabaseService.js`
Funções diretas ao Supabase, organizadas por módulo:

- **Auth**: `signUp`, `signIn`, `signInWithGoogle`, `signOut`, `getSession`, `onAuthStateChange`
- **Perfis**: `getCurrentProfile`, `getProfile`, `updateProfile`, `uploadAvatar`, `addPointsToProfile`, `subtractPointsFromProfile`
- **Gamificação**: `getGamificationProfile`, `getRanking`, `registerAction`, `getBadges`
- **Resíduos**: `saveClassification`, `getClassificationHistory`

#### `api.js`
Camada de abstração que exporta objetos de API padronizados:

- `environmentalAPI`: dados ambientais (atualmente mock; integra OpenWeatherMap quando chave configurada)
- `wasteAPI`: classificação e histórico de resíduos
- `gamificationAPI`: perfil, ranking, badges e ações
- `userAPI`: login, registro, atualização de perfil, upload de avatar, pontos

---

## 9. Páginas e Funcionalidades Detalhadas

### 9.1 Home (`/`)

A página inicial é um **landing page** que apresenta a plataforma:

**Hero Section:**
- Background com gradiente claro (`from-stone-50 to-surface-50`)
- Três blobs decorativos com `blur` para profundidade visual
- Globo 3D (NASA WorldWind) posicionado absolutamente à direita, ocupando 75vw com max de 960px (apenas desktop)
- No mobile: globo renderizado em seção separada abaixo do hero, em tamanho aumentado (500x500px)
- Texto com tagline, logotipo animado + título "EcoSphere", botões "Começar Agora" e "Testar IA Grátis"

**Seção Features (FeaturesBento):**
- Grade de 5 cards com as funcionalidades: Monitoramento Ambiental (card grande), IA para Resíduos, Gamificação, Educação, Calculadora de Carbono, Histórico
- Animação `whileHover` via Framer Motion

**Seção Impacto da Comunidade:**
- Cards com estatísticas animadas usando `react-countup` (Usuários Ativos: 2.847, Ações Sustentáveis: 15.392, CO₂ Evitado: 8.2 ton)
- Fundo com gradiente verde (`from-eco-600 to-eco-700`) e padrão de pontos decorativo

**CTA Final:**
- Card com logotipo + "Pronto para fazer a diferença?" + botão "Começar Jornada Sustentável"

---

### 9.2 Login (`/login`)

**Layout em duas colunas (desktop):**
- **Coluna esquerda**: logotipo gigante + título "EcoSphere" + 4 cards de features em grade 2x2
- **Coluna direita**: formulário com design glassmorphism

**Fundo:**
- `LoginGlobeBackground`: globo 3D da NASA com opacidade 35% e blur
- Blobs decorativos brancos semi-transparentes

**Formulário Glassmorphism:**
- Background: `bg-white/10 backdrop-blur-2xl`
- Toggle animado Login/Registrar (pill com `spring stiffness: 400`)
- Campos: Nome (apenas no cadastro), Email, Senha, Confirmar Senha (apenas no cadastro)
- Indicador de força da senha (5 níveis: Muito Fraca → Muito Forte) com barra animada
- Botão principal branco `bg-white text-stone-900` (destaque total sobre o fundo colorido)
- Separador "OU CONTINUE COM" + botão Google

**Tratamento de erros:**
- Validação client-side (campos obrigatórios, formato de email, senhas iguais, força mínima de senha)
- Mensagens específicas por tipo de erro (credenciais inválidas, email não confirmado, email já cadastrado, timeout)
- Notificações flutuantes com animação (Framer Motion `AnimatePresence`)

---

### 9.3 Dashboard (`/dashboard`)

Painel principal do usuário com visão geral de suas atividades:

**Header:**
- Ícone com gradiente eco + título "Visão Geral" + status "Sistema Online" pulsante

**Cards de Métricas (4 cards):**
- EcoPoints Acumulados
- Ações Validadas (classificações)
- Conquistas (badges)
- Nível de Perfil

**Atalhos Rápidos (2 cards):**
- Quiz Diário (abre modal DailyQuiz)
- Calculadora de Carbono (navega para `/calculadora-carbono`)

**Impacto Coletivo da Plataforma:**
- Card branco com 4 métricas: Classificações Feitas (12.5k+), CO2 Economizado (31.4t), Árvores Equivalentes (1.4k), Usuários Ativos (3.8k)

**Gráficos (Chart.js):**
- **Gráfico de linha**: evolução dos EcoPoints ao longo do tempo
- **Gráfico de rosca (Doughnut)**: distribuição de ações (Classificações, Jogos, Quiz)
- **Gráfico de barras**: ações diárias da semana
- **Gráfico de barras**: meta semanal de progresso

---

### 9.4 Classificador de Resíduos com IA (`/classificar-residuos`)

Módulo central do projeto, que utiliza aprendizado de máquina para identificar o tipo de resíduo.

**Tecnologia:**
- **TensorFlow.js**: biblioteca de machine learning que roda diretamente no navegador, sem enviar dados para servidor externo
- **Modelo treinado**: localizado em `public/models/waste-classifier/model.json` (formato Teachable Machine / LayersModel)
- **Fallback**: se o modelo não carregar, usa classificação simulada baseada em regras para fins de demonstração

**6 Categorias de Resíduos:**
| Categoria | Lixeira | Pontos | Exemplos |
|---|---|---|---|
| Plástico | Vermelha | 30 pts | Garrafas PET, sacolas, embalagens |
| Metal | Amarela | 40 pts | Latas, alumínio, ferro |
| Vidro | Verde | 35 pts | Garrafas, potes, frascos |
| Papel | Azul | 25 pts | Jornais, caixas, papelão |
| Orgânico | Marrom | 20 pts | Restos de comida, folhas |
| Eletrônico | Laranja | 60 pts | Pilhas, celulares, chips |

**Fluxo de uso:**
1. Usuário abre a câmera ou faz upload de imagem
2. Modelo TensorFlow.js realiza inferência (classificação) na imagem
3. Resultado exibido: categoria identificada, percentual de confiança, cor da lixeira correta, dicas de descarte e pontos ganhos
4. Ao confirmar: classificação salva no Supabase (`waste_classifications`) + EcoPoints adicionados ao perfil

**Interface:**
- Área de drop/upload com drag-and-drop
- Preview da imagem com botão de remover
- Card de resultado com ícone da categoria, barra de confiança, dicas e pontos
- Histórico das últimas classificações

---

### 9.5 Monitoramento Ambiental (`/monitoramento`)

Painel de dados climáticos e ambientais com suporte a dados reais via OpenWeatherMap.

**Seleção de localização:**
- Seletor de estado (10 estados brasileiros com modal de busca em grid)
- Seletor de cidade (dropdown por estado)
- Seletor de bairro (dropdown por cidade)

**Integração OpenWeatherMap:**
- Se `REACT_APP_OPENWEATHER_API_KEY` estiver configurada, busca dados reais da API
- Fallback inteligente: dados simulados realistas quando a API não está disponível ou falha

**Card Principal — Temperatura:**
- Temperatura em destaque (`text-8xl font-black`)
- Descrição do tempo e sensação térmica
- Card de Nascer/Pôr do Sol com responsividade total

**Cards de Métricas (4 cards):**
- Umidade Relativa
- Velocidade do Vento
- Visibilidade
- Pressão Atmosférica

**Cards de Índices:**
- **Qualidade do Ar (AQI)**: valor numérico + status colorido + barra de progresso
- **Índice UV**: valor + nível de risco + recomendações de proteção

**Previsão para 7 dias:**
- Cards por dia com temperatura máxima/mínima e ícone de condição climática

**Gráficos:**
- Gráfico de linha: evolução da temperatura ao longo do dia
- Gráfico de rosca: distribuição da qualidade do ar

---

### 9.6 Gamificação (`/gamificacao`)

Sistema completo de engajamento com múltiplas abas:

**Cabeçalho:**
- 4 cards de métricas: EcoPoints Totais, Badges Conquistadas, Posição no Ranking, Nível Atual

**Abas de Navegação:**
- Visão Geral, Quiz Eco, Eco Catcher, Badges, Ranking, Missões

**Aba Overview:**
- Jogos rápidos: Quiz Eco (até 305 EcoPoints) e Eco Catcher
- Últimas conquistas: badges conquistadas recentemente

**Aba Quiz Eco:**
- 5 perguntas aleatórias sobre sustentabilidade e meio ambiente
- Banco de 30+ questões em `quizQuestions.js`
- Pontuação proporcional ao número de acertos (máx. 305 pts)
- Tela de resultado com score, feedback e ação de pontos pendentes

**Aba Eco Catcher (Minijogo):**
- Jogo de reflexo onde o usuário move um cesto para coletar itens recicláveis
- 15 segundos por partida
- Controles: setas do teclado ou A/D
- Itens normais: +10 a +50 pts; itens ruins (lixo orgânico): -15 pts
- HUD com score e timer (vermelho quando abaixo de 5s)
- Tela de resultado com troféu, pontuação final e botões de ação

**Aba Badges:**
- Grade de todas as badges possíveis (7 badges)
- Destaque visual para badges conquistadas vs bloqueadas
- Selo de check dourado nas conquistadas
- Pontos associados a cada badge

**Aba Ranking:**
- Top 10 jogadores com pontuação
- Destaque especial para o usuário atual
- Medalhas para os 3 primeiros (ouro, prata, bronze)
- Badge "Você" para identificação

**Aba Missões:**
- 3 missões ativas com barra de progresso animada
- Botão "Continuar Missão" ou "Missão Concluída"
- Recompensas em EcoPoints por conclusão

---

### 9.7 Loja de Recompensas (`/recompensas`)

Sistema de resgate de EcoPoints por recompensas reais e digitais.

**Header:**
- Card com saldo atual de EcoPoints em destaque (`text-5xl font-black`)
- Badge "Pronto para usar"

**Categorias:**
- Descontos, Ingressos, Assinaturas, Produtos, Experiências, Doações
- Navegação em pill com ícones coloridos

**Grid de Recompensas:**
- Cards com ícone, nome, descrição, custo em EcoPoints
- Botão "Resgatar Agora" (rosa `bg-pink-600`) quando pode pagar
- Botão cinza "Faltam X pts" quando não tem saldo suficiente
- Botão desabilitado quando indisponível

**Modal de Confirmação:**
- Resumo: nome da recompensa, custo, saldo atual, saldo após resgate
- Botão "Confirmar" rosa e "Cancelar"
- Desconto do saldo via `spendEcoPoints` no UserContext

**Modal de Notificação:**
- Sucesso (verde) ou erro (vermelho) após tentativa de resgate

---

### 9.8 Educação Ambiental (`/educacao`)

Módulo de conteúdo educacional dividido em 4 abas:

**Aba Cursos:**
- 3 cursos: Reciclagem Básica (Iniciante), Sustentabilidade Urbana (Intermediário), Mudanças Climáticas (Avançado)
- Cards com gradiente colorido, ícone, nível, duração e barra de progresso
- Botão "Começar Agora" (verde) ou "Continuar Trilha" (azul)
- Ao clicar: abre `InteractiveCourse` (modal com slides de conteúdo)

**Aba Artigos:**
- 4 artigos com imagens reais, tempo de leitura, categoria colorida, título e resumo
- Layout horizontal (imagem + texto) em cards com hover
- Link "Ler Artigo Completo" com seta animada

**Aba Desafios:**
- 3 desafios com duração, recompensa em EcoPoints e lista de tarefas
- Botão "Participar do Desafio" / "Em Andamento" / "Concluído"
- Cards com indicador de progresso para desafios ativos

**Aba Dicas Práticas:**
- 6 dicas organizadas por categoria (Reciclagem, Energia, Água, Mobilidade, Alimentação, Compras)
- Cards com ícone colorido, título e lista de itens práticos

---

### 9.9 Histórico (`/historico`)

Registro de todas as ações do usuário na plataforma:

**Cards de Estatísticas:**
- Total de Classificações, EcoPoints Totais, Taxa de Acerto, Streak Atual

**Distribuição por Tipo:**
- Gráfico de rosca com percentual de cada categoria de resíduo classificada

**Lista de Histórico:**
- Cada classificação com: ícone da categoria, nome, data/hora, pontos ganhos e confiança do modelo

---

### 9.10 Perfil (`/perfil`)

Gerenciamento de dados pessoais do usuário:

**Cards de Estatísticas:**
- EcoPoints, Nível, Badges, Classificações

**Aba Dados Pessoais:**
- Upload de foto de perfil com preview, hover com câmera, upload para Supabase Storage
- Campos: Nome, Email, Telefone, Data de Nascimento, Cidade, Estado (select), Biografia
- Inputs modernos com `bg-stone-50`, foco índigo

**Aba Preferências:**
- 8 tags de Interesses Ambientais (Reciclagem, Energia Solar, Compostagem, etc.)
- 3 configurações de Notificações com checkboxes

**Aba Segurança:**
- Trocar senha (Senha Atual + Nova Senha + Confirmação)
- Card de dicas de segurança (fundo âmbar)

**Botão "Salvar Alterações":**
- Cor índigo (`bg-indigo-600`), sincroniza localmente e com Supabase

---

### 9.11 Calculadora de Carbono (`/calculadora-carbono`)

Quiz interativo que calcula a pegada de carbono do usuário:

**Fluxo:**
- Perguntas progressivas sobre: tipo de transporte, consumo de energia, hábitos alimentares, compras
- Cada resposta contribui para o cálculo da emissão de CO₂
- Resultado final: toneladas de CO₂/ano + comparação com média nacional + dicas personalizadas
- EcoPoints ganhos por completar o quiz

---

### 9.12 Eco Catcher (`/eco-catcher`)

Página dedicada ao minijogo Eco Catcher (versão expandida da aba na Gamificação):

**Tela de início:**
- Instruções com teclas de controle estilizadas (`<kbd>`)
- Botão "Começar Jogo!" em destaque

**Jogo:**
- Canvas/div com 15 segundos de duração
- Itens caindo (plástico, papel, vidro, metal, bateria)
- 15% de chance de item "ruim" (chama, -15 pts)
- Controles: setas do teclado ou A/D
- HUD: score + timer (vermelho abaixo de 5s)

**Tela de resultado:**
- Troféu dourado com ícone Sparkles
- Pontuação final em destaque
- Botões: "Jogar Novamente" e "Ver Dashboard"

---

### 9.13 Guia (`/guia`)

Tour passo a passo de todas as funcionalidades da plataforma:

**Estrutura:**
- Slides navegáveis com ícone grande, título, descrição e lista de objetivos
- Barra de progresso
- Botões Anterior/Próximo

---

### 9.14 Admin Dashboard (`/admin`)

Painel exclusivo para usuários com `isAdmin = true`:

- Acesso via `AdminProtectedRoute`
- Visualização de dados da plataforma
- Protegido pelo campo `is_admin` na tabela `profiles`

---

## 10. Componentes Reutilizáveis

### 10.1 Navbar

Barra de navegação global sticky:

- **Logo**: EcoGlobeLogo (Lottie) + "EcoSphere" em gradiente
- **Navegação central**: links para todas as páginas com ícones SVG personalizados
- **Área do usuário**:
  - Sino de notificações com badge numérico + painel flutuante com dicas ecológicas e histórico de pontos
  - Badge de EcoPoints com Sparkles
  - Avatar + dropdown (Meu Perfil, Sair)
  - Link Admin (apenas para admins)
- **Mobile**: hambúrguer com menu deslizante + link Meu Perfil + saldo + sair
- **Fundo**: `bg-white/90 backdrop-blur-lg border-b` (consistente em todas as páginas)

### 10.2 ChatBot (EcoBot)

Assistente virtual flutuante:

- Botão fixo canto inferior direito (ícone Bot / X)
- Painel expandível com histórico de mensagens
- Quick actions: Ver EcoPoints, Classificar Resíduo, Ver Recompensas, Monitoramento
- `processLocalMessage`: responde a saudações, perguntas sobre reciclagem, dicas de economia de água/energia, navegação e comandos de ação
- Redireciona para páginas quando o usuário pede ajuda sobre funcionalidades específicas

### 10.3 AppIcon

Sistema unificado de ícones:

```javascript
// Uso:
<AppIcon name="trophy" size={24} className="text-amber-500" />
```

Mapa de 40+ ícones, incluindo: globe, recycle, trophy, leaf, target, sparkles, user, brain, flame, award, gift, camera, thermometer, mountain, bot, star, trending, e mais.
Para `globe`/`earth`, renderiza automaticamente o `EcoGlobeLogo` animado.

### 10.4 EcoGlobeLogo

Logotipo animado da plataforma:
- Tenta renderizar `Globe.lottie` via `DotLottieReact`
- Fallback: imagem PNG `globo-icon.png`
- Aceita `size`, `className` e `style` (para filtros de cor)

### 10.5 DailyQuiz

Modal de quiz diário:
- 5 perguntas aleatórias do banco `quizQuestions.js`
- Pontuação proporcional ao número de acertos
- Integrado ao Dashboard como atalho rápido

### 10.6 InteractiveCourse

Modal de curso interativo:
- Slides com progresso
- Conteúdo por aula (texto, ícone, lista de pontos)
- Botão "Próxima Aula" / "Concluir Curso"
- EcoPoints ao completar

### 10.7 WorldWindGlobeBase

Engine do globo 3D:
- Baseado no SDK `@nasaworldwind/worldwind`
- Canvas WebGL com renderização de camadas (atmosfera, satélite, estrelas)
- Rotação automática configurável (`rotationSpeed`)
- Desabilita zoom e interação (`disableZoom`, `pointer-events-none`)
- Suporte a múltiplas instâncias com `canvasId` único

---

## 11. Sistema de Design (UI/UX)

### 11.1 Paleta de Cores (Tailwind Config)

```javascript
colors: {
  eco: {               // Verde principal da marca
    50:  '#f0fdf4',
    100: '#dcfce7',
    ...
    600: '#16a34a',   // Cor primária
    700: '#15803d',
    ...
  },
  surface: {           // Neutros de fundo
    50:  '#fafaf9',   // Fundo principal da app
    100: '#f5f5f4',
    ...
  }
}
```

### 11.2 Identidade Visual por Seção

Cada módulo da plataforma tem uma cor de destaque consistente:

| Módulo | Cor | Uso |
|---|---|---|
| Home / Geral | Verde (`eco`, `teal`) | Botões, logos, acentos |
| Dashboard | Eco + Violeta | Gráficos, Quiz |
| IA Resíduos | Eco + Azul | Identificação |
| Monitoramento | Azul + Ciano | Temperatura, vento |
| Gamificação | Âmbar + Laranja | EcoPoints, badges |
| Recompensas | Rosa (`pink`) | Botões CTA |
| Educação | Verde + Azul | Cursos, artigos |
| Perfil | Índigo + Roxo | Formulários, inputs |
| Login | Eco + Teal (gradiente) | Fundo e elementos |

### 11.3 Padrão de Cards

Todos os cards principais seguem o padrão:
```
bg-white rounded-3xl shadow-soft border border-stone-100
hover:shadow-lg hover:border-[cor]-200
transition-all duration-300
```

### 11.4 Padrão de Headers de Página

Todas as páginas internas seguem o mesmo header:
- Ícone com gradiente colorido + título em `font-black text-4xl`
- Subtítulo com Sparkles
- Badge de status pulsante (ex: "Sistema Online", "Gamificação Ativa")

### 11.5 Padrão de Tabs de Navegação

```
bg-stone-100/80 backdrop-blur p-2 rounded-2xl border border-stone-200
```
Tab ativa: `bg-white text-stone-800 shadow-sm border border-stone-200`

### 11.6 Tipografia

- **Fonte**: Plus Jakarta Sans (importada via Google Fonts)
- **Títulos**: `font-black` + `tracking-tight`
- **Labels de formulário**: `text-xs font-bold uppercase tracking-wider text-stone-400`
- **Corpo**: `font-medium text-stone-500`

### 11.7 Animações (Framer Motion)

Padrão de entrada de elementos:
```javascript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.1 }}
```

Hover em cards:
```javascript
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```

---

## 12. Módulo de Inteligência Artificial

### 12.1 Arquitetura

O módulo de IA do EcoSphere funciona completamente **no lado do cliente (browser)**, sem necessidade de servidor de inferência. Isso garante:
- **Privacidade**: as imagens do usuário nunca saem do dispositivo
- **Velocidade**: sem latência de rede para a inferência
- **Offline**: funciona sem conexão à internet (após carregar o modelo)
- **Escalabilidade**: o servidor não precisa processar requisições de IA

### 12.2 TensorFlow.js

O modelo é carregado pelo hook `useWasteClassifier`:

```javascript
const model = await tf.loadLayersModel('/models/waste-classifier/model.json');
```

O TensorFlow.js realiza:
1. Carregamento do modelo (weights em binário, arquitetura em JSON)
2. Pré-processamento da imagem (redimensionamento para 224x224, normalização)
3. Inferência (forward pass na rede neural)
4. Interpretação dos resultados (argmax das probabilidades)

### 12.3 Modelo Treinado

O modelo foi criado com o **Google Teachable Machine**, que usa transfer learning sobre o MobileNetV2:
- Entrada: imagem 224x224 RGB
- Saída: 6 classes (Plástico, Metal, Vidro, Papel, Orgânico, Eletrônico)
- Arquitetura base: MobileNetV2 (eficiente para dispositivos com recursos limitados)

### 12.4 Modo Simulado (Fallback)

Se o modelo não carregar (arquivo ausente ou erro de rede), o sistema entra em modo simulado:
- Classifica aleatoriamente entre as 6 categorias
- Gera confiança realista (entre 65% e 95%)
- Exibe aviso visual ao usuário
- Mantém todas as funcionalidades (salva no banco, distribui pontos)

---

## 13. Sistema de Gamificação

### 13.1 EcoPoints

Os EcoPoints são a moeda virtual da plataforma. Cada ação gera uma quantidade específica:

| Ação | Pontos |
|---|---|
| Classificar Plástico | 30 pts |
| Classificar Papel | 25 pts |
| Classificar Metal | 40 pts |
| Classificar Vidro | 35 pts |
| Classificar Orgânico | 20 pts |
| Classificar Eletrônico | 60 pts |
| Eco Quiz (5 acertas) | 305 pts |
| Eco Catcher (variável) | Até ~200 pts |
| Completar Desafio | 150-250 pts |
| Completar Curso | A definir |
| Calculadora de Carbono | A definir |

### 13.2 Sistema de Badges

7 badges progressivas:

| # | Badge | Requisito | Pontos |
|---|---|---|---|
| 1 | Bem-vindo | Primeira ação | 10 |
| 2 | Primeiro Passo | 1ª classificação | 25 |
| 3 | Reciclador | 10 classificações | 50 |
| 4 | Eco Warrior | 50 classificações | 100 |
| 5 | Guardião Verde | 100 classificações | 200 |
| 6 | Mestre Ambiental | 500 classificações | 500 |
| 7 | Gamer Ecológico | 100+ pts em jogos | 50 |

### 13.3 Ranking

- Top 10 usuários por EcoPoints
- Atualizado em tempo real via Supabase
- Medalhas para 1º, 2º e 3º lugar
- Badge "Você" para o usuário atual

### 13.4 Fluxo de Pontuação

1. Usuário realiza ação (classificação, quiz, jogo)
2. `registerAction(userId, { type, points })` chamado em `supabaseService.js`
3. EcoPoints somados ao perfil via `addPointsToProfile()`
4. Nível recalculado com `getLevelForPoints(newPoints)`
5. Badges verificadas e novas adicionadas se critérios atendidos
6. `UserContext` atualizado via `addEcoPoints()`
7. Evento `ecoPointsUpdated` disparado para sincronizar componentes
8. Histórico salvo em `user_game_actions`

---

## 14. Autenticação e Segurança

### 14.1 Fluxo de Autenticação

**Registro:**
1. Usuário preenche nome, email e senha
2. `supabaseAuth.signUp()` cria conta no Supabase Auth
3. Trigger `handle_new_user()` cria registro em `profiles` automaticamente
4. UserContext atualizado com os dados do novo usuário
5. Redirecionamento para `/` (ou aguarda confirmação de email)

**Login:**
1. `supabaseAuth.signIn()` valida credenciais
2. Supabase retorna JWT + dados do usuário
3. `getCurrentProfile()` busca dados completos do perfil
4. UserContext salvo em `sessionStorage` + `localStorage`
5. Redirecionamento para `/`

**Google OAuth:**
1. `supabaseAuth.signInWithOAuth({ provider: 'google' })` redireciona ao Google
2. Após autorização, Supabase processa o callback
3. `onAuthStateChange` detecta a nova sessão
4. Mesmo fluxo de carregamento de perfil

**Persistência de Sessão:**
- `onAuthStateChange` listener mantém a sessão atualizada
- `localStorage` mantém dados mesmo ao fechar o browser
- Timeout de 15s para evitar travamento se Supabase não responder

### 14.2 Proteção de Rotas

```javascript
// ProtectedRoute.js
if (!user && !loading) return <Navigate to="/login" />;
if (loading) return <LoadingScreen />;
return children;
```

### 14.3 Row Level Security

Toda a segurança de dados é garantida pelo RLS do Supabase:
- Políticas configuradas para que cada usuário só acesse seus próprios registros
- Válido mesmo se alguém tentar acessar a API do Supabase diretamente

---

## 15. Responsividade

### 15.1 Estratégia Mobile-First

A plataforma foi desenvolvida com abordagem mobile-first usando os breakpoints do Tailwind CSS:

| Breakpoint | Prefixo | Largura |
|---|---|---|
| Mobile | (sem prefixo) | < 640px |
| Small | `sm:` | ≥ 640px |
| Medium | `md:` | ≥ 768px |
| Large | `lg:` | ≥ 1024px |
| XL | `xl:` | ≥ 1280px |

### 15.2 Ajustes por Breakpoint

**Navbar:**
- Mobile: hambúrguer com menu deslizante (inclui Meu Perfil e EcoPoints)
- Desktop: barra horizontal completa com todos os itens

**Home:**
- Mobile: hero compacto (`min-h-[80vh]`) + globo 3D abaixo em tamanho grande (500px)
- Desktop: hero tela cheia + globo 3D absoluto à direita (75vw max 960px)

**Grids:**
- Mobile: 1 coluna (`grid-cols-1`)
- Tablet: 2 colunas (`md:grid-cols-2`)
- Desktop: 3-4 colunas (`lg:grid-cols-3 xl:grid-cols-4`)

**Cards de métricas:**
- Mobile: 2 colunas (`grid-cols-2`)
- Desktop: 4 colunas (`lg:grid-cols-4`)

**Login:**
- Mobile: apenas formulário (coluna de features oculta)
- Desktop: layout em duas colunas

**Paddings de seções:**
- Mobile: `p-5 sm:p-6`
- Desktop: `md:p-8 lg:p-16`

---

## 16. Variáveis de Ambiente

Arquivo: `frontend/.env`

```bash
# Supabase (OBRIGATÓRIO)
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# Google OAuth (opcional - para login com Google)
REACT_APP_GOOGLE_CLIENT_ID=seu_client_id_google.apps.googleusercontent.com

# OpenWeatherMap (opcional - dados reais de clima)
REACT_APP_OPENWEATHER_API_KEY=sua_chave_openweather_aqui

# Serviço de IA externo (opcional - classificação por servidor Flask)
REACT_APP_AI_SERVICE_URL=http://localhost:5000
```

---

## 17. Como Executar o Projeto

### 17.1 Pré-requisitos

- Node.js 18+ e npm 8+
- Conta no Supabase (https://supabase.com) — plano gratuito suficiente

### 17.2 Configuração do Supabase

1. Criar novo projeto no Supabase
2. No SQL Editor, executar as migrations **em ordem**:
   - `supabase/migrations/001_ecosphere_schema.sql`
   - `supabase/migrations/002_fix_handle_new_user.sql`
   - `supabase/migrations/003_admin_role.sql`
3. Em **Storage → Buckets**: criar bucket `avatars` (marcar como **Public**)
4. Em **Storage → Policies**: permitir INSERT/UPDATE para usuários autenticados
5. Em **Settings → API**: copiar `URL` e `anon key`
6. (Opcional) Em **Authentication → Providers**: ativar Google OAuth

### 17.3 Configuração do Frontend

```bash
# 1. Clonar o repositório
git clone https://github.com/Brun05ouza/Tcc-EcoSphere.git
cd Tcc-EcoSphere/frontend

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as credenciais do Supabase

# 4. Copiar o asset Lottie (opcional)
cp ../Globe.lottie public/Globe.lottie

# 5. Iniciar em modo desenvolvimento
npm start

# 6. Build para produção
npm run build
```

A aplicação estará disponível em `http://localhost:3000`

---

## 18. Fluxos de Usuário

### 18.1 Fluxo Principal — Classificação de Resíduo

```
Login → Dashboard → "Classificar Resíduo" → 
Capturar foto/Upload → IA processa → 
Resultado mostrado → Confirmar → 
EcoPoints adicionados → Histórico atualizado → 
Badge verificada (se atingiu meta)
```

### 18.2 Fluxo de Gamificação

```
Entrar na plataforma → Acessar /gamificacao → 
Jogar Eco Catcher ou Quiz → 
Fim do jogo → Score exibido → 
Confirmar pontos → EcoPoints + user_game_actions salvos → 
Level e badges recalculados → Ranking atualizado
```

### 18.3 Fluxo de Recompensa

```
Acumular EcoPoints → Acessar /recompensas → 
Selecionar categoria → Escolher recompensa → 
Verificar saldo suficiente → Confirmar resgate → 
spendEcoPoints() → Saldo deduzido → Notificação de sucesso
```

### 18.4 Fluxo de Foto de Perfil

```
Acessar /perfil → Clicar em "Alterar Foto" → 
Selecionar imagem (JPG/PNG/WebP, max 5MB) → 
uploadAvatar() → Supabase Storage → 
URL pública obtida → updateProfile(avatar_url) → 
UserContext atualizado → Navbar + Perfil refletem nova foto
```

---

## 19. Resultados e Considerações Finais

### 19.1 Funcionalidades Implementadas

✅ Autenticação completa (email/senha + Google OAuth)  
✅ Classificação de resíduos com TensorFlow.js (IA no browser)  
✅ Monitoramento ambiental com dados reais (OpenWeatherMap)  
✅ Sistema de gamificação completo (pontos, badges, ranking, missões)  
✅ Minijogo Eco Catcher com mecânicas avançadas  
✅ Quiz ecológico com banco de questões  
✅ Módulo educacional (cursos, artigos, desafios, dicas)  
✅ Loja de recompensas com resgate de pontos  
✅ Calculadora de pegada de carbono  
✅ Upload de foto de perfil (Supabase Storage)  
✅ Assistente virtual EcoBot  
✅ Painel administrativo  
✅ Design responsivo (mobile + desktop)  
✅ Globo 3D interativo (NASA WorldWind)  
✅ Animações fluidas (Framer Motion)  
✅ Persistência de dados na nuvem (Supabase)  

### 19.2 Diferenciais Técnicos

1. **IA Client-Side**: o modelo de classificação roda inteiramente no navegador via TensorFlow.js, sem servidor de inferência, garantindo privacidade e reduzindo custos de infraestrutura

2. **BaaS (Backend as a Service)**: o uso do Supabase elimina a necessidade de desenvolver e manter um servidor backend customizado, permitindo que o foco esteja nas funcionalidades da aplicação

3. **Arquitetura SPA performática**: React 18 com lazy loading implícito, Context API para estado global e React Router v6 para navegação sem recarregamento

4. **Design System coerente**: paleta de cores consistente, componentes padronizados, animações uniformes e experiência de usuário unificada em todas as páginas

5. **Segurança por RLS**: toda a proteção de dados é implementada diretamente no banco de dados PostgreSQL via políticas RLS, sendo à prova de falhas mesmo se o front-end for comprometido

### 19.3 Possíveis Melhorias Futuras

- Implementar notificações push (PWA)
- Adicionar modo offline completo (Service Workers)
- Treinar modelo de IA com dataset maior e mais diversificado
- Implementar compartilhamento social de conquistas
- Adicionar mapa interativo de pontos de coleta de reciclagem
- Desenvolver app mobile nativo (React Native)
- Implementar sistema de grupos/times de amigos
- Integrar APIs de mercado para recompensas reais automáticas

---

## 20. Referências Tecnológicas

- **React Documentation**: https://react.dev
- **Supabase Documentation**: https://supabase.com/docs
- **TensorFlow.js**: https://www.tensorflow.org/js
- **Teachable Machine (Google)**: https://teachablemachine.withgoogle.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion
- **NASA WorldWind**: https://worldwind.arc.nasa.gov
- **OpenWeatherMap API**: https://openweathermap.org/api
- **Lucide Icons**: https://lucide.dev
- **Chart.js**: https://www.chartjs.org/docs
- **React Router**: https://reactrouter.com/en/main
- **CRACO**: https://craco.js.org

---

*Documentação gerada em Março de 2026 para o Trabalho de Conclusão de Curso.*  
*Repositório: https://github.com/Brun05ouza/Tcc-EcoSphere*
