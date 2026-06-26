import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { query } from './db.js';
import { requireAdmin, requireAuth, signToken } from './auth.js';
import { getLevelForPoints, profileToApp } from './mappers.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
const port = Number(process.env.PORT || 4000);

const allowedOrigins = new Set([
  process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
]);
// Em desenvolvimento o Create React App pode subir em 3000, 3001, 3002...
// entao liberamos qualquer porta de localhost / 127.0.0.1
const devOriginRegex = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
// Em producao, libera o dominio de producao e os previews da Vercel (*.vercel.app)
const vercelRegex = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;
app.use(cors({
  origin(origin, callback) {
    // Permite ferramentas sem Origin (curl, apps mobile), as origens conhecidas,
    // localhost em qualquer porta e qualquer subdominio *.vercel.app
    if (!origin || allowedOrigins.has(origin) || devOriginRegex.test(origin) || vercelRegex.test(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

function authResponse(row) {
  return {
    token: signToken(row),
    user: profileToApp(row),
  };
}

async function getProfileById(id) {
  const { rows } = await query('select * from profiles where id = $1', [id]);
  return rows[0] || null;
}

app.get('/health', async (_req, res) => {
  await query('select 1');
  res.json({ status: 'ok' });
});

app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: 'Preencha todos os campos' });
  if (password.length < 6) return res.status(400).json({ message: 'Senha precisa ter ao menos 6 caracteres' });

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await query('select id from profiles where email = $1', [normalizedEmail]);
  if (existing.rows[0]) return res.status(409).json({ message: 'Este email ja esta cadastrado' });

  const count = await query('select count(*)::int as total from profiles');
  const firstUserIsAdmin = count.rows[0]?.total === 0;
  const passwordHash = await bcrypt.hash(password, 12);

  const { rows } = await query(
    `insert into profiles (name, email, password_hash, is_admin)
     values ($1, $2, $3, $4)
     returning *`,
    [name, normalizedEmail, passwordHash, firstUserIsAdmin]
  );

  res.status(201).json(authResponse(rows[0]));
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const { rows } = await query('select * from profiles where email = $1', [normalizedEmail]);
  const user = rows[0];
  if (!user) return res.status(401).json({ message: 'Email ou senha incorretos' });

  const valid = await bcrypt.compare(password || '', user.password_hash || '');
  if (!valid) return res.status(401).json({ message: 'Email ou senha incorretos' });

  res.json(authResponse(user));
});

app.get('/auth/me', requireAuth, (req, res) => {
  res.json({ user: profileToApp(req.user) });
});

app.get('/users/me', requireAuth, (req, res) => {
  res.json(profileToApp(req.user));
});

app.put('/users/me', requireAuth, async (req, res) => {
  const { name, email, avatar_url } = req.body || {};
  const updates = [];
  const values = [];

  if (name !== undefined) {
    values.push(name);
    updates.push(`name = $${values.length}`);
  }
  if (email !== undefined) {
    values.push(String(email).trim().toLowerCase());
    updates.push(`email = $${values.length}`);
  }
  if (avatar_url !== undefined) {
    values.push(avatar_url);
    updates.push(`avatar_url = $${values.length}`);
  }

  if (updates.length === 0) return res.json(profileToApp(req.user));
  values.push(req.user.id);
  const { rows } = await query(
    `update profiles set ${updates.join(', ')}, updated_at = now() where id = $${values.length} returning *`,
    values
  );
  res.json(profileToApp(rows[0]));
});

app.post('/users/me/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Nenhum arquivo enviado' });
  const avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  const { rows } = await query(
    'update profiles set avatar_url = $1, updated_at = now() where id = $2 returning *',
    [avatarUrl, req.user.id]
  );
  res.json(profileToApp(rows[0]));
});

app.post('/users/me/points', requireAuth, async (req, res) => {
  const points = Math.max(0, Number(req.body?.points) || 0);
  const newPoints = (req.user.eco_points || 0) + points;
  const { rows } = await query(
    'update profiles set eco_points = $1, level = $2, updated_at = now() where id = $3 returning *',
    [newPoints, getLevelForPoints(newPoints), req.user.id]
  );
  res.json({ user: profileToApp(rows[0]) });
});

app.post('/users/me/spend-points', requireAuth, async (req, res) => {
  const points = Math.max(0, Number(req.body?.points) || 0);
  const newPoints = Math.max(0, (req.user.eco_points || 0) - points);
  const { rows } = await query(
    'update profiles set eco_points = $1, level = $2, updated_at = now() where id = $3 returning *',
    [newPoints, getLevelForPoints(newPoints), req.user.id]
  );
  res.json({ user: profileToApp(rows[0]) });
});

app.get('/gamification/profile', requireAuth, async (req, res) => {
  const classifications = await query(
    'select count(*)::int as total from waste_classifications where user_id = $1',
    [req.user.id]
  );
  res.json({
    ecoPoints: req.user.eco_points ?? 0,
    level: req.user.level || 'Iniciante',
    badges: req.user.badges || [],
    streak: req.user.streak || { current: 0, longest: 0 },
    totalClassifications: classifications.rows[0]?.total ?? 0,
    completedMissions: 0,
  });
});

app.get('/gamification/ranking', requireAuth, async (req, res) => {
  const { rows } = await query(
    'select id, name, eco_points, level from profiles order by eco_points desc limit 10'
  );
  res.json(rows.map((row, index) => ({
    position: index + 1,
    name: row.name || 'Anonimo',
    points: row.eco_points ?? 0,
    level: row.level || 'Iniciante',
    isCurrentUser: row.id === req.user.id,
  })));
});

app.post('/gamification/actions', requireAuth, async (req, res) => {
  const points = Math.max(0, Number(req.body?.points) || 0);
  const type = req.body?.type || 'acao';
  await query(
    'insert into user_game_actions (user_id, game_type, points, data) values ($1, $2, $3, $4)',
    [req.user.id, type, points, req.body?.data || {}]
  );
  const newPoints = (req.user.eco_points || 0) + points;
  await query(
    'update profiles set eco_points = $1, level = $2, updated_at = now() where id = $3',
    [newPoints, getLevelForPoints(newPoints), req.user.id]
  );
  res.json({ totalPoints: points, newBadges: [], levelChanged: false });
});

app.get('/gamification/badges', requireAuth, (req, res) => {
  res.json(req.user.badges || []);
});

app.post('/waste/classifications', requireAuth, async (req, res) => {
  const { category, confidence, points } = req.body || {};
  const pointValue = Number(points) || 0;
  await query(
    'insert into waste_classifications (user_id, category, confidence, points) values ($1, $2, $3, $4)',
    [req.user.id, category || 'Plastico', Number(confidence) || 0, pointValue]
  );
  const newPoints = (req.user.eco_points || 0) + pointValue;
  await query(
    'update profiles set eco_points = $1, level = $2, updated_at = now() where id = $3',
    [newPoints, getLevelForPoints(newPoints), req.user.id]
  );
  res.json({ success: true, pointsEarned: pointValue, message: 'Classificacao salva com sucesso' });
});

app.get('/waste/classifications', requireAuth, async (req, res) => {
  const { rows } = await query(
    `select id, category, confidence, points, created_at
     from waste_classifications
     where user_id = $1
     order by created_at desc
     limit 50`,
    [req.user.id]
  );
  res.json(rows.map((row) => ({
    id: row.id,
    category: row.category,
    confidence: row.confidence,
    points: row.points,
    timestamp: row.created_at,
  })));
});

app.get('/admin/users', requireAuth, requireAdmin, async (_req, res) => {
  const { rows } = await query('select * from profiles order by created_at desc');
  res.json(rows.map(profileToApp));
});

app.post('/admin/users', requireAuth, requireAdmin, async (req, res) => {
  const { email, password, name } = req.body || {};
  const passwordHash = await bcrypt.hash(password, 12);
  const { rows } = await query(
    'insert into profiles (email, password_hash, name) values ($1, $2, $3) returning *',
    [String(email).trim().toLowerCase(), passwordHash, name]
  );
  res.status(201).json(profileToApp(rows[0]));
});

app.patch('/admin/users/:id/points', requireAuth, requireAdmin, async (req, res) => {
  const points = Math.max(0, Number(req.body?.points) || 0);
  const { rows } = await query(
    'update profiles set eco_points = $1, level = $2, updated_at = now() where id = $3 returning *',
    [points, getLevelForPoints(points), req.params.id]
  );
  res.json(profileToApp(rows[0]));
});

app.patch('/admin/users/:id/admin', requireAuth, requireAdmin, async (req, res) => {
  const { rows } = await query(
    'update profiles set is_admin = $1, updated_at = now() where id = $2 returning *',
    [!!req.body?.isAdmin, req.params.id]
  );
  res.json(profileToApp(rows[0]));
});

app.delete('/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  await query('delete from profiles where id = $1', [req.params.id]);
  res.json({ success: true });
});

app.get('/admin/stats', requireAuth, requireAdmin, async (_req, res) => {
  const [users, classifications, gameActions, points] = await Promise.all([
    query('select count(*)::int as total from profiles'),
    query('select count(*)::int as total from waste_classifications'),
    query('select count(*)::int as total from user_game_actions'),
    query('select coalesce(sum(eco_points), 0)::int as total from profiles'),
  ]);
  res.json({
    totalUsers: users.rows[0]?.total || 0,
    totalClassifications: classifications.rows[0]?.total || 0,
    totalGameActions: gameActions.rows[0]?.total || 0,
    totalPoints: points.rows[0]?.total || 0,
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

app.listen(port, () => {
  console.log(`EcoSphere API rodando em http://localhost:${port}`);
});
