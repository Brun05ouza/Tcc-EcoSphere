export function profileToApp(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    picture: row.avatar_url,
    avatar_url: row.avatar_url,
    ecoPoints: row.eco_points ?? 0,
    level: row.level || 'Iniciante',
    badges: row.badges || [],
    streak: row.streak || { current: 0, longest: 0 },
    isAdmin: !!row.is_admin,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const LEVELS = [
  { min: 2000, level: 'Mestre Ambiental' },
  { min: 1000, level: 'Guardiao Verde' },
  { min: 500, level: 'Eco Warrior' },
  { min: 200, level: 'Reciclador' },
  { min: 50, level: 'Iniciante Consciente' },
  { min: 0, level: 'Iniciante' },
];

export function getLevelForPoints(points) {
  const value = Number(points) || 0;
  return LEVELS.find(({ min }) => value >= min)?.level || 'Iniciante';
}
