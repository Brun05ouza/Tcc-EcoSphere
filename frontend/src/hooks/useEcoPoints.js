import { useState, useEffect, useCallback } from 'react';
import { gamificationAPI } from '../services/api';

export const useEcoPoints = () => {
  const [ecoPoints, setEcoPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar EcoPoints da API
  const loadEcoPoints = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 useEcoPoints: Carregando EcoPoints...');
      
      const response = await gamificationAPI.getProfile();
      const newPoints = response.data.ecoPoints || 0;
      
      console.log('💰 useEcoPoints: EcoPoints carregados:', newPoints);
      setEcoPoints(newPoints);
      
      // Atualizar localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.ecoPoints = newPoints;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return newPoints;
    } catch (err) {
      console.error('❌ useEcoPoints: Erro ao carregar EcoPoints:', err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar EcoPoints
  const addEcoPoints = useCallback(async (points, type = 'manual', data = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🎮 useEcoPoints: Adicionando ${points} pontos do tipo ${type}`);
      
      const payload = {
        type: type,
        points: points,
        data: data
      };
      
      const response = await gamificationAPI.registrarAcao(payload);
      const newPoints = response.data.ecoPoints;
      
      console.log('💰 useEcoPoints: Novos EcoPoints:', newPoints);
      setEcoPoints(newPoints);
      
      // Atualizar localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.ecoPoints = newPoints;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Disparar evento global
      const event = new CustomEvent('ecoPointsUpdated', {
        detail: { newPoints, addedPoints: points, type }
      });
      window.dispatchEvent(event);
      
      return response.data;
    } catch (err) {
      console.error('❌ useEcoPoints: Erro ao adicionar pontos:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Escutar eventos de atualização
  useEffect(() => {
    const handleEcoPointsUpdate = (event) => {
      console.log('📡 useEcoPoints: Evento recebido:', event.detail);
      if (event.detail && event.detail.newPoints !== undefined) {
        setEcoPoints(event.detail.newPoints);
      }
    };

    window.addEventListener('ecoPointsUpdated', handleEcoPointsUpdate);
    
    return () => {
      window.removeEventListener('ecoPointsUpdated', handleEcoPointsUpdate);
    };
  }, []);

  // Carregar EcoPoints iniciais
  useEffect(() => {
    // Tentar carregar do localStorage primeiro
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.ecoPoints !== undefined) {
        setEcoPoints(user.ecoPoints);
      }
    }
    
    // Depois carregar da API para garantir sincronização
    loadEcoPoints();
  }, [loadEcoPoints]);

  return {
    ecoPoints,
    loading,
    error,
    loadEcoPoints,
    addEcoPoints,
    setEcoPoints
  };
};

export default useEcoPoints;