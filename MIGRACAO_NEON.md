# EcoSphere com Neon

Este projeto foi adaptado para usar Neon PostgreSQL por meio de uma API Node.js/Express.

## 1. Banco Neon

Execute o script abaixo no SQL Editor do Neon:

```sql
-- arquivo: neon/schema.sql
```

O schema cria:

- `profiles`
- `waste_classifications`
- `user_game_actions`

O primeiro usuario cadastrado pela tela de registro vira administrador automaticamente.

## 2. API

```powershell
cd api-service
npm install
Copy-Item .env.example .env
npm run dev
```

Configure `api-service/.env`:

```env
DATABASE_URL=postgresql://usuario:senha@host/neondb?sslmode=require
JWT_SECRET=troque-por-um-segredo-longo-e-aleatorio
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
```

## 3. Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm start
```

Configure `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:4000
```

## Observacoes

- Neon substitui o banco Postgres, mas nao substitui Supabase Auth nem Supabase Storage. Por isso a API agora cuida de login, JWT e persistencia.
- Login com Google precisa de uma nova integracao OAuth propria, porque antes ele dependia do Supabase.
- Avatar e salvo como data URL no banco para manter a migracao simples. Em producao, prefira storage externo como S3, Cloudinary ou UploadThing.
