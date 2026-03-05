import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import LoadingScreen from './ui/LoadingScreen';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useUser();

  if (loading) {
    return <LoadingScreen message="Carregando..." />;
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;