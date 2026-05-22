import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const cachedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();
  const cachedToken = (() => {
    try { return sessionStorage.getItem('token') || null; } catch { return null; }
  })();

  const [user, setUser] = useState(cachedUser);
  const [token, setToken] = useState(cachedToken);
  const [loading, setLoading] = useState(!cachedUser && !!cachedToken);

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
    const initSession = async () => {
      if (!cachedToken) {
        setLoading(false);
        return;
      }

      try {
        const session = await userAPI.getSession();
        if (session?.user && session?.token) {
          saveUser(session.user, session.token);
        } else {
          clearUser();
        }
      } catch {
        if (!cachedUser) clearUser();
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []); // eslint-disable-line

  const updateUser = (newUserData, authToken) => {
    saveUser(newUserData, authToken);
  };

  const logout = async () => {
    clearUser();
  };

  const addEcoPoints = (pointsToAdd, action = 'Acao') => {
    if (user && pointsToAdd > 0) {
      const updatedUser = {
        ...user,
        ecoPoints: (user.ecoPoints || 0) + pointsToAdd,
      };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      userAPI.addPoints({ points: pointsToAdd, action }).catch((error) => {
        console.error('Erro ao salvar pontos:', error);
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
        console.error('Erro ao descontar pontos:', error);
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
