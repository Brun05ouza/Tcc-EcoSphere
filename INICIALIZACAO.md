# 🚀 Guia de Inicialização Rápida - EcoSphere

## Arquitetura atual

- **Frontend** (React) – única aplicação web; consome **Supabase** para auth e banco.
- **Backend** – substituído pelo **Supabase** (Auth + PostgreSQL + RLS). Não é mais necessário rodar o Express localmente.
- **ai-service** (opcional) – serviço Python para classificação de resíduos por servidor. Se não rodar, a classificação usa TensorFlow.js no navegador.

## 🎯 Como iniciar

### 1. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, execute o conteúdo do arquivo `supabase/migrations/001_ecosphere_schema.sql` (tabelas, RLS e trigger de perfil).
3. Em **Authentication > Providers**, ative **Email** e, se quiser, **Google** (configure o Client ID no Google Cloud).
4. Em **Settings > API**, copie **Project URL** e **anon public** key.

### 2. Variáveis de ambiente do frontend

Na pasta `frontend`, crie um arquivo `.env` (pode copiar de `.env.example`):

```env
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

Opcional: `REACT_APP_GOOGLE_CLIENT_ID` para login com Google.

### 3. Iniciar o frontend

**Opção A – Script**

```bash
start.bat
```

**Opção B – Manual**

```bash
cd frontend
npm install
npm start
```

Acesse: **http://localhost:3000**

### 4. (Opcional) ai-service

Se quiser usar o serviço de IA no servidor:

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

No `.env` do frontend, defina:

```env
REACT_APP_AI_SERVICE_URL=http://localhost:8000
```

## 🌐 URLs

- **Frontend**: http://localhost:3000  
- **Supabase**: configurado no dashboard do projeto  
- **ai-service** (opcional): http://localhost:8000  

## 🔧 O que funciona

- Login e registro (email/senha) via Supabase Auth  
- Login com Google (se configurado no Supabase)  
- Perfil, EcoPoints, níveis e badges (Supabase)  
- Classificação de resíduos (TensorFlow.js no navegador ou ai-service)  
- Histórico de classificações e ranking  

## 🆘 Problemas comuns

- **“Não autenticado”** – Confira `REACT_APP_SUPABASE_URL` e `REACT_APP_SUPABASE_ANON_KEY` no `.env` do frontend.  
- **Tabelas não existem** – Rode o SQL de `supabase/migrations/001_ecosphere_schema.sql` no SQL Editor do Supabase.  
- **Google login não redireciona** – Ative o provider Google no Supabase e configure a URL de redirect no Google Cloud.
