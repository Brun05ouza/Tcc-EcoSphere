import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentProfile } from '../services/supabaseService';
import { userAPI } from '../services/api';

const UserContext = createContext();

/** Timeout em ms para evitar travamento se Supabase não responder */
const SESSION_TIMEOUT_MS = 20000;
const PROFILE_TIMEOUT_MS = 18000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tempo esgotado')), ms)
    ),
  ]);
}

function sessionToFallbackUser(session) {
  if (!session?.user) return null;
  return {
    id: session.user.id,
    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
    email: session.user.email,
    picture: session.user.user_metadata?.avatar_url || null,
    ecoPoints: 0,
    level: 'Iniciante',
    badges: [],
    streak: { current: 0, longest: 0 },
    isAdmin: false,
  };
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // Carrega cache instantaneamente para evitar flash de loading
  const cachedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();
  const cachedToken = (() => {
    try { return sessionStorage.getItem('token') || null; } catch { return null; }
  })();

  const [user, setUser] = useState(cachedUser);
  const [token, setToken] = useState(cachedToken);
  // Se já tem cache, não mostra loading
  const [loading, setLoading] = useState(!cachedUser);

  const saveUser = (profile, accessToken) => {
    setUser(profile);
    setToken(accessToken);
    if (accessToken) sessionStorage.setItem('token', accessToken);
    if (profile) {
      sessionStorage.setItem('user', JSON.stringify(profile));
      localStorage.setItem('user', JSON.stringify(profile));
    }
  };

  const clearUser = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const hasSupabase = !!(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY);
    if (!hasSupabase) {
      setLoading(false);
      return;
    }

    const initSession = async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          SESSION_TIMEOUT_MS
        );

        if (session?.user) {
          try {
            const profile = await withTimeout(
              getCurrentProfile(),
              PROFILE_TIMEOUT_MS
            );
            saveUser(profile, session.access_token);
          } catch {
            // Timeout ou erro de rede: usa fallback mas mantém token válido
            const fallback = sessionToFallbackUser(session);
            saveUser(cachedUser || fallback, session.access_token);
          }
        } else {
          clearUser();
        }
      } catch {
        // Não exibe erro para o usuário — usa cache se disponível
        if (!cachedUser) clearUser();
      } finally {
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        clearUser();
        return;
      }
      if (session?.user) {
        try {
          const profile = await withTimeout(getCurrentProfile(), PROFILE_TIMEOUT_MS);
          saveUser(profile, session.access_token);
        } catch {
          const fallback = sessionToFallbackUser(session);
          saveUser(fallback, session.access_token);
        }
      }
    });

    return () => subscription?.unsubscribe();
  }, []); // eslint-disable-line

  const updateUser = (newUserData, authToken) => {
    saveUser(newUserData, authToken);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    clearUser();
  };

  const addEcoPoints = (pointsToAdd, action = 'Ação') => {
    if (user && pointsToAdd > 0) {
      const updatedUser = {
        ...user,
        ecoPoints: (user.ecoPoints || 0) + pointsToAdd,
      };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      userAPI.addPoints({ points: pointsToAdd, action }).catch((error) => {
        console.error('Erro ao salvar pontos no Supabase:', error);
      });
      return updatedUser.ecoPoints;
    }
    return user?.ecoPoints || 0;
  };

  const spendEcoPoints = (pointsToSpend, action = 'Resgate') => {
    const current = user?.ecoPoints || 0;
    if (user && pointsToSpend > 0 && current >= pointsToSpend) {
      const newPoints = current - pointsToSpend;
      const updatedUser = { ...user, ecoPoints: newPoints };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      userAPI.spendPoints({ points: pointsToSpend, action }).catch((error) => {
        console.error('Erro ao descontar pontos no Supabase:', error);
      });
      return newPoints;
    }
    return false;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: !!user?.isAdmin,
        updateUser,
        logout,
        addEcoPoints,
        spendEcoPoints,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
