import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentProfile } from '../services/supabaseService';
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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const profile = await getCurrentProfile();
          setUser(profile);
          setToken(session.access_token);
          sessionStorage.setItem('token', session.access_token);
          sessionStorage.setItem('user', JSON.stringify(profile));
          localStorage.setItem('user', JSON.stringify(profile));
        } catch (err) {
          console.error('Erro ao carregar perfil:', err);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      } else {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await getCurrentProfile();
          setUser(profile);
          setToken(session.access_token);
          sessionStorage.setItem('token', session.access_token);
          sessionStorage.setItem('user', JSON.stringify(profile));
          localStorage.setItem('user', JSON.stringify(profile));
        } catch (err) {
          console.error('Erro ao carregar perfil:', err);
        }
      } else {
        setUser(null);
        setToken(null);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('user');
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const updateUser = (newUserData, authToken) => {
    setUser(newUserData);
    setToken(authToken);
    if (authToken) sessionStorage.setItem('token', authToken);
    if (newUserData) {
      sessionStorage.setItem('user', JSON.stringify(newUserData));
      localStorage.setItem('user', JSON.stringify(newUserData));
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
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

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        loading,
        updateUser,
        logout,
        addEcoPoints,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
