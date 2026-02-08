import { supabase } from '../lib/supabase';

// --- Helpers: mapear snake_case (DB) <-> camelCase (app) ---
const profileToApp = (row) => {
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const LEVELS = [
  { min: 2000, level: 'Mestre Ambiental' },
  { min: 1000, level: 'Guardião Verde' },
  { min: 500, level: 'Eco Warrior' },
  { min: 200, level: 'Reciclador' },
  { min: 50, level: 'Iniciante Consciente' },
  { min: 0, level: 'Iniciante' },
];

function getLevelForPoints(points) {
  const p = Number(points) || 0;
  for (const { min, level } of LEVELS) {
    if (p >= min) return level;
  }
  return 'Iniciante';
}

const BADGES_DEF = [
  { id: 1, name: 'Bem-vindo', description: 'Primeira ação na plataforma', points: 10 },
  { id: 2, name: 'Primeiro Passo', description: 'Primeira classificação de resíduo', points: 25 },
  { id: 3, name: 'Reciclador', description: '10 classificações corretas', points: 50 },
  { id: 4, name: 'Eco Warrior', description: '50 classificações corretas', points: 100 },
  { id: 5, name: 'Guardião Verde', description: '100 classificações corretas', points: 200 },
  { id: 6, name: 'Mestre Ambiental', description: '500 classificações corretas', points: 500 },
  { id: 7, name: 'Gamer Ecológico', description: '100 pontos em jogos', points: 50 },
];

// --- Auth ---
export const auth = {
  async signUp({ email, password, name }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession() {
    return supabase.auth.getSession();
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// --- Profile ---
export async function getCurrentProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error(userError?.message || 'Não autenticado');
  return getProfile(user.id);
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return profileToApp(data);
}

export async function updateProfile(userId, { name, email }) {
  const updates = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return profileToApp(data);
}

export async function addPointsToProfile(userId, pointsToAdd) {
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('eco_points, level, badges')
    .eq('id', userId)
    .single();
  if (fetchError) throw fetchError;

  const newPoints = (profile.eco_points || 0) + Number(pointsToAdd);
  const newLevel = getLevelForPoints(newPoints);
  const badges = profile.badges || [];

  const { data: updated, error } = await supabase
    .from('profiles')
    .update({
      eco_points: newPoints,
      level: newLevel,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return profileToApp(updated);
}

// --- Gamification ---
export async function getGamificationProfile(userId) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('eco_points, level, badges, streak')
    .eq('id', userId)
    .single();
  if (error) throw error;

  const { count } = await supabase
    .from('waste_classifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    ecoPoints: profile.eco_points ?? 0,
    level: profile.level || 'Iniciante',
    badges: profile.badges || [],
    streak: profile.streak || { current: 0, longest: 0 },
    totalClassifications: count ?? 0,
    completedMissions: 0,
  };
}

export async function getRanking(currentUserId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, eco_points, level')
    .order('eco_points', { ascending: false })
    .limit(10);
  if (error) throw error;

  return (data || []).map((row, index) => ({
    position: index + 1,
    name: row.name || 'Anônimo',
    points: row.eco_points ?? 0,
    level: row.level || 'Iniciante',
    isCurrentUser: row.id === currentUserId,
  }));
}

export async function registerAction(userId, { type, points, data }) {
  const pointsNum = Number(points) || 0;
  if (pointsNum <= 0) return await getGamificationProfile(userId);

  if (type === 'waste_classification') {
    // waste_classification já é salva em saveClassification e soma pontos lá
    return addPointsToProfile(userId, pointsNum).then(profileToApp);
  }

  await supabase.from('user_game_actions').insert({
    user_id: userId,
    game_type: type,
    points: pointsNum,
    data: data || {},
  });

  const profile = await addPointsToProfile(userId, pointsNum);
  const totalClassifications = (
    await supabase.from('waste_classifications').select('*', { count: 'exact', head: true }).eq('user_id', userId)
  ).count;
  const { data: gameRows } = await supabase
    .from('user_game_actions')
    .select('points')
    .eq('user_id', userId);
  const gamePoints = (gameRows || []).reduce((s, r) => s + (r.points || 0), 0);

  const badges = profile.badges || [];
  const newBadges = [];
  if (badges.length === 0) newBadges.push({ id: 1, name: 'Bem-vindo', earnedAt: new Date() });
  if (totalClassifications >= 1 && !badges.some((b) => b.id === 2)) newBadges.push({ id: 2, name: 'Primeiro Passo', earnedAt: new Date() });
  if (totalClassifications >= 10 && !badges.some((b) => b.id === 3)) newBadges.push({ id: 3, name: 'Reciclador', earnedAt: new Date() });
  if (totalClassifications >= 50 && !badges.some((b) => b.id === 4)) newBadges.push({ id: 4, name: 'Eco Warrior', earnedAt: new Date() });
  if (gamePoints >= 100 && !badges.some((b) => b.id === 7)) newBadges.push({ id: 7, name: 'Gamer Ecológico', earnedAt: new Date() });

  if (newBadges.length > 0) {
    const updatedBadges = [...badges, ...newBadges];
    await supabase.from('profiles').update({ badges: updatedBadges }).eq('id', userId);
  }

  const updated = await getGamificationProfile(userId);
  return {
    ecoPoints: updated.ecoPoints,
    level: updated.level,
    newBadges,
    totalPoints: pointsNum,
    levelChanged: false,
  };
}

export async function getBadges(userId) {
  const { data, error } = await supabase.from('profiles').select('badges').eq('id', userId).single();
  if (error) throw error;
  const userBadges = (data?.badges || []);
  return BADGES_DEF.map((badge) => ({
    ...badge,
    earned: userBadges.some((b) => b.id === badge.id),
    earnedAt: userBadges.find((b) => b.id === badge.id)?.earnedAt,
  }));
}

// --- Waste (classificações) ---
export async function saveClassification(userId, { category, confidence, points }) {
  const { error: insertError } = await supabase.from('waste_classifications').insert({
    user_id: userId,
    category,
    confidence: Number(confidence),
    points: Number(points),
  });
  if (insertError) throw insertError;
  await addPointsToProfile(userId, Number(points));
  return { success: true, pointsEarned: Number(points), message: 'Classificação salva com sucesso' };
}

export async function getClassificationHistory(userId) {
  const { data, error } = await supabase
    .from('waste_classifications')
    .select('id, category, confidence, points, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    category: row.category,
    confidence: row.confidence,
    points: row.points,
    timestamp: row.created_at,
  }));
}
