import { useCallback, useEffect, useState } from 'react';
import {
  loadLocalModel,
  unloadLocalModel,
  classifyElement,
  classifyByFileNameSimulated,
  classifyByColorSimulated,
  calculatePointsFromConfidence,
  isMockModelEnabled,
  isUsingMockModel,
  isSimulatedEnabled,
} from '../services/localClassifier';
import { getWasteClass, getBinColor } from '../data/wasteKnowledge';

export const useWasteClassifier = () => {
  const [status, setStatus] = useState('loading'); // loading | ready | unavailable
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    unloadLocalModel();
    setStatus('loading');
    setError(null);
    setReloadToken((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      setStatus('loading');
      setError(null);
      try {
        const loaded = await loadLocalModel();
        if (!cancelled) {
          setStatus('ready');
          if (loaded?.mock) {
            // Esperado sem model.json — não poluir o console como erro
            setError(null);
          }
        }
      } catch (err) {
        console.warn('[useWasteClassifier] modelo bloqueado:', err?.message || err);
        if (!cancelled) {
          setError(err?.message || 'Modelo indisponível');
          setStatus('unavailable');
        }
      }
    };

    boot();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  useEffect(() => () => {
    // Não dispose no unmount do hook se a página só remonta — unload só no reload explícito
  }, []);

  const classifyImageElement = useCallback(async (imageElement, fileName) => {
    if (isSimulatedEnabled()) {
      const byName = classifyByFileNameSimulated(fileName);
      if (byName) return byName;
    }

    try {
      return await classifyElement(imageElement);
    } catch (err) {
      if (isSimulatedEnabled()) {
        const byColor = classifyByColorSimulated(imageElement);
        if (byColor) return byColor;
      }
      throw err;
    }
  }, []);

  const calculatePoints = useCallback((confidence, userCorrected = false) => {
    if (userCorrected) return 2;
    return calculatePointsFromConfidence(confidence);
  }, []);

  return {
    status,
    loading: status === 'loading',
    modelReady: status === 'ready',
    modelUnavailable: status === 'unavailable',
    error,
    reload,
    classifyImageElement,
    calculatePoints,
    isMock: isMockModelEnabled() || isUsingMockModel(),
    getWasteClass,
    getBinColor,
  };
};
