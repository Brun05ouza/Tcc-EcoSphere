import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import LoadingScreen from './ui/LoadingScreen';

const AdminProtectedRoute = ({ children }) => {
  const { token, isAdmin, loading } = useUser();

  if (loading) {
    return <LoadingScreen message="Carregando..." />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
