import jwt from 'jsonwebtoken';
import { query } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, isAdmin: user.is_admin },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Nao autenticado' });

    const payload = jwt.verify(token, JWT_SECRET);
    const { rows } = await query('select * from profiles where id = $1', [payload.sub]);
    if (!rows[0]) return res.status(401).json({ message: 'Usuario nao encontrado' });

    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ message: 'Sessao invalida ou expirada' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ message: 'Acesso negado' });
  next();
}
