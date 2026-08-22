import { useEffect } from 'react';
import { lockBodyScroll, unlockBodyScroll } from '../utils/bodyScrollLock';

export function useBodyScrollLock(isLocked = false) {
  useEffect(() => {
    if (!isLocked) return undefined;

    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [isLocked]);
}
