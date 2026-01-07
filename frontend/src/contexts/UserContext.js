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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const savedToken = sessionStorage.getItem('token');
      const savedUser = sessionStorage.getItem('user');
      
      if (savedToken) {
        setToken(savedToken);
        
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (error) {
            console.error('Erro ao carregar usuário:', error);
          }
        }
        
        try {
          const response = await userAPI.getProfile(savedToken);
          setUser(response.data);
          sessionStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Erro ao buscar perfil:', error);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const updateUser = (newUserData, authToken) => {
    setUser(newUserData);
    setToken(authToken);
    sessionStorage.setItem('token', authToken);
    sessionStorage.setItem('user', JSON.stringify(newUserData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  const addEcoPoints = (pointsToAdd, action = 'Ação') => {
    if (user && pointsToAdd > 0) {
      const updatedUser = {
        ...user,
        ecoPoints: (user.ecoPoints || 0) + pointsToAdd
      };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      
      userAPI.addPoints({ points: pointsToAdd, action }).catch(error => {
        console.error('Erro ao salvar pontos no backend:', error);
      });
      
      return updatedUser.ecoPoints;
    }
    return user?.ecoPoints || 0;
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      token,
      loading,
      updateUser, 
      logout,
      addEcoPoints
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;