import React from 'react';
import { Globe2 } from 'lucide-react';
import './Loading.css';

function LoadingScreen({ message = 'Carregando...', fullScreen = true, size }) {
  const displaySize = size ?? (fullScreen ? 64 : 32);
  const symbol = (
    <span className="app-loading__symbol" style={{ width: displaySize, height: displaySize }} aria-hidden="true">
      <span className="app-loading__ring" />
      <Globe2 size={displaySize * .52} strokeWidth={1.5} />
    </span>
  );
  if (!fullScreen) return symbol;
  return (
    <div className="app-loading" role="status" aria-live="polite">
      {symbol}
      {message && <p>{message}</p>}
    </div>
  );
}
export default LoadingScreen;
