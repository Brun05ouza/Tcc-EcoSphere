/**
 * API do EcoSphere - implementação via Supabase (backend unificado no Supabase).
 * ai-service continua opcional para classificação por servidor.
 */
import { supabase } from '../lib/supabase';
import {
  auth as supabaseAuth,
  getCurrentProfile,
  getProfile,
  updateProfile,
  addPointsToProfile,
  getGamificationProfile,
  getRanking,
  registerAction,
  getBadges,
  saveClassification,
  getClassificationHistory,
} from './supabaseService';

const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

/** Timeout em ms para auth (evita carregamento infinito se Supabase não responder) */
const AUTH_TIMEOUT_MS = 20000;

function withTimeout(promise, ms, message = 'Tempo esgotado. Verifique sua conexão e as variáveis REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY no .env') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

// --- Environmental: backend não tinha; mock para não quebrar a página
export const environmentalAPI = {
  getDadosAmbientais: async (cidade) => ({ data: { cidade, temperatura: 25, qualidadeAr: 'Boa' } }),
  getCidades: async () => ({ data: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte'] }),
  getAlertas: async (cidade) => ({ data: [] }),
};

// --- Waste: classificação no front (TensorFlow.js); persistência no Supabase
export const wasteAPI = {
  classifyImage: async (formData) => {
    // Opcional: chamar ai-service se REACT_APP_AI_SERVICE_URL estiver definido
    const url = process.env.REACT_APP_AI_SERVICE_URL;
    if (url) {
      const res = await fetch(`${url}/classify`, { method: 'POST', body: formData });
      const json = await res.json();
      return { data: json };
    }
    return { data: { type: 'Plástico', confidence: 0.85, points: 50 } };
  },
  saveClassification: async (data) => {
    const userId = await getUserId();
    if (!userId) throw new Error('Não autenticado');
    const result = await saveClassification(userId, data);
    return { data: result };
  },
  getHistorico: async () => {
    const userId = await getUserId();
    if (!userId) return { data: [] };
    const list = await getClassificationHistory(userId);
    return { data: list };
  },
  registrarDescarte: async (data) => {
    const userId = await getUserId();
    if (!userId) throw new Error('Não autenticado');
    const points = data?.points || 50;
    await addPointsToProfile(userId, points);
    return { data: { message: 'Descarte registrado', points } };
  },
};

// --- Gamification
export const gamificationAPI = {
  getProfile: async () => {
    const userId = await getUserId();
    if (!userId) throw new Error('Não autenticado');
    const profile = await getGamificationProfile(userId);
    return { data: profile };
  },
  getRanking: async () => {
    const userId = await getUserId();
    const ranking = await getRanking(userId || null);
    return { data: ranking };
  },
  registrarAcao: async (acao) => {
    const userId = await getUserId();
    if (!userId) throw new Error('Não autenticado');
    const result = await registerAction(userId, acao);
    return { data: result };
  },
  getBadges: async () => {
    const userId = await getUserId();
    if (!userId) throw new Error('Não autenticado');
    const badges = await getBadges(userId);
    return { data: badges };
  },
};

// --- User / Auth (Supabase Auth)
export const userAPI = {
  login: async (credentials) => {
    const run = async () => {
      const signInResult = await supabaseAuth.signIn(credentials.email, credentials.password);
      if (!signInResult?.user) throw new Error('Resposta inválida do servidor');
      let user;
      try {
        user = await getProfile(signInResult.user.id);
      } catch (profileErr) {
        user = {
          id: signInResult.user.id,
          name: signInResult.user.user_metadata?.name || signInResult.user.email?.split('@')[0],
          email: signInResult.user.email,
          picture: signInResult.user.user_metadata?.avatar_url || null,
          ecoPoints: 0,
          level: 'Iniciante',
          badges: [],
          streak: { current: 0, longest: 0 },
        };
      }
      return {
        data: {
          token: signInResult.session?.access_token ?? null,
          user: { ...user, id: signInResult.user.id },
        },
      };
    };
    return withTimeout(run(), AUTH_TIMEOUT_MS);
  },
  register: async (userData) => {
    const run = async () => {
      const signUpData = await supabaseAuth.signUp({
        email: userData.email,
        password: userData.password,
        name: userData.name,
      });
      if (!signUpData.user) throw new Error('Erro no registro');
      const fallbackUser = {
        id: signUpData.user.id,
        name: userData.name || signUpData.user.user_metadata?.name || signUpData.user.email?.split('@')[0],
        email: signUpData.user.email,
        picture: signUpData.user.user_metadata?.avatar_url || null,
        ecoPoints: 0,
        level: 'Iniciante',
        badges: [],
        streak: { current: 0, longest: 0 },
      };
      try {
        await new Promise((r) => setTimeout(r, 800));
        const profile = await getProfile(signUpData.user.id);
        return {
          data: {
            token: signUpData.session?.access_token ?? null,
            user: { ...profile, id: signUpData.user.id },
          },
        };
      } catch (profileErr) {
        return {
          data: {
            token: signUpData.session?.access_token ?? null,
            user: fallbackUser,
          },
        };
      }
    };
    return withTimeout(run(), AUTH_TIMEOUT_MS);
  },
  googleLogin: async () => {
    await supabaseAuth.signInWithGoogle();
    return { data: { redirect: true } };
  },
  getProfile: async () => {
    const user = await getCurrentProfile();
    return { data: user };
  },
  updateProfile: async (data) => {
    const userId = await getUserId();
    if (!userId) throw new Error('Não autenticado');
    const updated = await updateProfile(userId, data);
    return { data: updated };
  },
  addPoints: async (data) => {
    const userId = await getUserId();
    if (!userId) throw new Error('Não autenticado');
    const updated = await addPointsToProfile(userId, data.points || 0);
    return { data: { user: updated } };
  },
};

export default { environmentalAPI, wasteAPI, gamificationAPI, userAPI };
