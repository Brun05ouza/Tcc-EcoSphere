/**
 * Agregados da plataforma e estimativas de impacto.
 *
 * Estimativa aproximada reaproveitada do front (History.js):
 *   2.5 kg de CO2e evitados por classificação de resíduo.
 * Árvores equivalentes alinhadas à dica educacional (Education.js):
 *   ~22 kg de CO2 absorvidos por árvore por ano.
 * Não substitui metodologia de auditoria de carbono / MRV.
 */
export const KG_CO2E_PER_CLASSIFICATION = 2.5;
export const KG_CO2_PER_TREE_PER_YEAR = 22;

export function deriveImpactFromClassifications(totalClassifications) {
  const total = Math.max(0, Number(totalClassifications) || 0);
  const co2SavedKg = Number((total * KG_CO2E_PER_CLASSIFICATION).toFixed(1));
  const treesEquivalent = Math.round(co2SavedKg / KG_CO2_PER_TREE_PER_YEAR);
  return { co2SavedKg, treesEquivalent };
}

/** Contagens brutas compartilhadas por /admin/stats e /platform/stats. */
export async function fetchPlatformCounts(query) {
  const [users, classifications, gameActions, points] = await Promise.all([
    query('select count(*)::int as total from profiles'),
    query('select count(*)::int as total from waste_classifications'),
    query('select count(*)::int as total from user_game_actions'),
    query('select coalesce(sum(eco_points), 0)::int as total from profiles'),
  ]);

  return {
    totalUsers: users.rows[0]?.total || 0,
    totalClassifications: classifications.rows[0]?.total || 0,
    totalGameActions: gameActions.rows[0]?.total || 0,
    totalPoints: points.rows[0]?.total || 0,
  };
}
