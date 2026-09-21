import { getLevelForPoints } from './mappers.js';
import { query } from './db.js';

export const BADGE_CATALOG = [
  { id: 'bem-vindo',        name: 'Bem-vindo',        type: 'first_action',    threshold: 1,   bonus: 10  },
  { id: 'primeiro-passo',   name: 'Primeiro Passo',   type: 'classifications', threshold: 1,   bonus: 25  },
  { id: 'reciclador',       name: 'Reciclador',       type: 'classifications', threshold: 10,  bonus: 50  },
  { id: 'eco-warrior',      name: 'Eco Warrior',      type: 'classifications', threshold: 50,  bonus: 100 },
  { id: 'guardiao-verde',   name: 'Guardião Verde',   type: 'classifications', threshold: 100, bonus: 200 },
  { id: 'mestre-ambiental', name: 'Mestre Ambiental', type: 'classifications', threshold: 500, bonus: 500 },
  { id: 'gamer-ecologico',  name: 'Gamer Ecológico',  type: 'game_points',     threshold: 100, bonus: 50  },
];

function normalizeStoredBadges(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry) return null;
      if (typeof entry === 'string') return { id: entry, unlockedAt: null };
      if (entry.id) return { id: entry.id, unlockedAt: entry.unlockedAt || null };
      return null;
    })
    .filter(Boolean);
}

function isEligible(badge, { totalActions, totalClassifications, totalGamePoints }) {
  if (badge.type === 'first_action') {
    return totalActions >= badge.threshold;
  }
  if (badge.type === 'classifications') {
    return totalClassifications >= badge.threshold;
  }
  if (badge.type === 'game_points') {
    return totalGamePoints >= badge.threshold;
  }
  return false;
}

/**
 * Verifica elegibilidade e concede badges novas.
 * Busca o perfil de novo no banco (não reutiliza snapshot antigo).
 * @returns {Promise<Array<{id: string, name: string, bonus: number}>>}
 */
export async function checkAndAwardBadges(userId) {
  const { rows: profileRows } = await query(
    'select id, eco_points, level, badges from profiles where id = $1',
    [userId]
  );
  const profile = profileRows[0];
  if (!profile) return [];

  const [classificationsRes, gamePointsRes, gameActionsRes] = await Promise.all([
    query(
      'select count(*)::int as total from waste_classifications where user_id = $1',
      [userId]
    ),
    query(
      'select coalesce(sum(points), 0)::int as total from user_game_actions where user_id = $1',
      [userId]
    ),
    query(
      'select count(*)::int as total from user_game_actions where user_id = $1',
      [userId]
    ),
  ]);

  const totalClassifications = classificationsRes.rows[0]?.total || 0;
  const totalGamePoints = gamePointsRes.rows[0]?.total || 0;
  const totalGameActions = gameActionsRes.rows[0]?.total || 0;
  const totalActions = totalClassifications + totalGameActions;

  const owned = normalizeStoredBadges(profile.badges);
  const ownedIds = new Set(owned.map((b) => b.id));
  const metrics = { totalActions, totalClassifications, totalGamePoints };

  const newlyAwarded = [];
  const unlockedAt = new Date().toISOString();
  let bonusTotal = 0;

  for (const badge of BADGE_CATALOG) {
    if (ownedIds.has(badge.id)) continue;
    if (!isEligible(badge, metrics)) continue;

    owned.push({ id: badge.id, unlockedAt });
    ownedIds.add(badge.id);
    bonusTotal += badge.bonus;
    newlyAwarded.push({
      id: badge.id,
      name: badge.name,
      bonus: badge.bonus,
    });
  }

  if (newlyAwarded.length === 0) {
    return [];
  }

  const nextPoints = (profile.eco_points || 0) + bonusTotal;
  const nextLevel = getLevelForPoints(nextPoints);

  await query(
    `update profiles
     set badges = $1::jsonb,
         eco_points = $2,
         level = $3,
         updated_at = now()
     where id = $4`,
    [JSON.stringify(owned), nextPoints, nextLevel, userId]
  );

  return newlyAwarded;
}

/** Catálogo estático + status do usuário autenticado. */
export function buildBadgesStatus(profileBadges) {
  const owned = normalizeStoredBadges(profileBadges);
  const byId = new Map(owned.map((b) => [b.id, b]));

  return BADGE_CATALOG.map((badge) => {
    const unlocked = byId.get(badge.id);
    return {
      id: badge.id,
      name: badge.name,
      bonus: badge.bonus,
      earned: Boolean(unlocked),
      unlockedAt: unlocked?.unlockedAt || null,
    };
  });
}
