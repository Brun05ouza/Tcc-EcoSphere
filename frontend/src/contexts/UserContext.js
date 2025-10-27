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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const updateUser = (newUserData, authToken) => {
    setUser(newUserData);
    setToken(authToken);
    sessionStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('token');
  };

  const addEcoPoints = async (pointsToAdd, action = 'Ação') => {
    if (user && pointsToAdd > 0) {
      try {
        const response = await userAPI.addPoints({ points: pointsToAdd, action });
        setUser(response.data.user);
        return response.data.user.ecoPoints;
      } catch (error) {
        console.error('Erro ao adicionar pontos:', error);
        return user.ecoPoints;
      }
    }
    return user?.ecoPoints || 0;
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      token,
      updateUser, 
      logout,
      addEcoPoints
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;