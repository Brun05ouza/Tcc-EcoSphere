import { useEffect } from 'react';

export const useEnterKey = (callback, dependencies = []) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        callback(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, dependencies);
};

export const useEscapeKey = (callback, dependencies = []) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        callback(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, dependencies);
};

export default useEnterKey;