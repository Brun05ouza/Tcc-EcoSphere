import { getLevelForPoints } from './mappers.js';
import { query } from './db.js';

export const MISSION_CATALOG = [
  { id: 'classificar-5',        title: 'Classificar 5 resíduos',    type: 'classifications', threshold: 5,   reward: 100 },
  { id: 'ganhar-100-ecopoints', title: 'Ganhar 100 EcoPoints',      type: 'eco_points',       threshold: 100, reward: 50  },
  { id: 'primeira-badge',       title: 'Conquistar primeira badge', type: 'badges_count',     threshold: 1,   reward: 25  },
];

function normalizeStoredMissions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry) return null;
      if (typeof entry === 'string') return { id: entry, completedAt: null };
      if (entry.id) return { id: entry.id, completedAt: entry.completedAt || null };
      return null;
    })
    .filter(Boolean);
}

function getProgress(mission, metrics) {
  if (mission.type === 'classifications') return metrics.totalClassifications;
  if (mission.type === 'eco_points') return metrics.ecoPoints;
  if (mission.type === 'badges_count') return metrics.badgesCount;
  return 0;
}

async function fetchMissionSnapshot(userId) {
  const [profileRes, classificationsRes] = await Promise.all([
    query(
      `select id, eco_points, level, missions,
              jsonb_array_length(coalesce(badges, '[]'::jsonb))::int as badges_count
       from profiles
       where id = $1`,
      [userId]
    ),
    query(
      'select count(*)::int as total from waste_classifications where user_id = $1',
      [userId]
    ),
  ]);

  const profile = profileRes.rows[0];
  if (!profile) return null;

  return {
    profile,
    metrics: {
      totalClassifications: classificationsRes.rows[0]?.total || 0,
      ecoPoints: profile.eco_points || 0,
      badgesCount: profile.badges_count || 0,
    },
  };
}

/**
 * Verifica elegibilidade e concede missões ainda não concluídas.
 * O perfil é relido para considerar badges e pontos concedidos na ação corrente.
 * @returns {Promise<Array<{id: string, title: string, reward: number, completedAt: string}>>}
 */
export async function checkAndAwardMissions(userId) {
  const snapshot = await fetchMissionSnapshot(userId);
  if (!snapshot) return [];

  const { profile, metrics } = snapshot;
  const completed = normalizeStoredMissions(profile.missions);
  const completedIds = new Set(completed.map((mission) => mission.id));
  const newlyCompleted = [];
  const completedAt = new Date().toISOString();
  let rewardTotal = 0;

  for (const mission of MISSION_CATALOG) {
    if (completedIds.has(mission.id)) continue;
    if (getProgress(mission, metrics) < mission.threshold) continue;

    completed.push({ id: mission.id, completedAt });
    completedIds.add(mission.id);
    rewardTotal += mission.reward;
    newlyCompleted.push({
      id: mission.id,
      title: mission.title,
      reward: mission.reward,
      completedAt,
    });
  }

  if (newlyCompleted.length === 0) return [];

  const nextPoints = metrics.ecoPoints + rewardTotal;
  const nextLevel = getLevelForPoints(nextPoints);

  await query(
    `update profiles
     set missions = $1::jsonb,
         eco_points = $2,
         level = $3,
         updated_at = now()
     where id = $4`,
    [JSON.stringify(completed), nextPoints, nextLevel, userId]
  );

  return newlyCompleted;
}

/** Catálogo estático + progresso ao vivo ou travado para missões concluídas. */
export async function buildMissionsStatus(userId) {
  const snapshot = await fetchMissionSnapshot(userId);
  if (!snapshot) return [];

  const { profile, metrics } = snapshot;
  const completed = normalizeStoredMissions(profile.missions);
  const byId = new Map(completed.map((mission) => [mission.id, mission]));

  return MISSION_CATALOG.map((mission) => {
    const stored = byId.get(mission.id);
    const progress = stored
      ? mission.threshold
      : Math.min(Math.max(0, getProgress(mission, metrics)), mission.threshold);

    return {
      id: mission.id,
      title: mission.title,
      reward: mission.reward,
      progress,
      total: mission.threshold,
      completed: Boolean(stored),
      completedAt: stored?.completedAt || null,
    };
  });
}
