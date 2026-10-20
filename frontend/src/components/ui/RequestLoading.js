import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { LoaderCircle } from 'lucide-react';
import { getPendingRequests, subscribeToRequests } from '../../services/loadingActivity';
import './Loading.css';

export default function RequestLoading() {
  const pending = useSyncExternalStore(subscribeToRequests, getPendingRequests, () => 0);
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    let timer;
    if (pending > 0 && !visible) {
      timer = setTimeout(() => {
        shownAt.current = Date.now();
        setVisible(true);
      }, 180);
    } else if (pending === 0 && visible) {
      timer = setTimeout(() => setVisible(false), Math.max(0, 400 - (Date.now() - shownAt.current)));
    }
    return () => clearTimeout(timer);
  }, [pending, visible]);

  if (!visible) return null;
  return (
    <div className="request-loading" role="status" aria-live="polite">
      <LoaderCircle size={17} aria-hidden="true" />
      <span>Carregando dados…</span>
    </div>
  );
}
