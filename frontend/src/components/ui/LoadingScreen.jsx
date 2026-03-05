import React, { useState, useCallback } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const GLOBE_ANIMATION_SRC = `${process.env.PUBLIC_URL || ''}/GlobeAnimation.lottie`;

/**
 * Loading principal do site: globo animado (Globe Animation.lottie).
 * Uso: tela cheia (fullScreen) ou inline (botões, mensagens).
 * @param {string} message - Texto opcional (ex: "Carregando...")
 * @param {boolean} fullScreen - true = tela cheia centralizada; false = inline
 * @param {number} size - Tamanho do globo em px (default: 80 fullScreen, 32 inline)
 */
function LoadingScreen({ message = 'Carregando...', fullScreen = true, size }) {
  const [useFallback, setUseFallback] = useState(false);
  const displaySize = size ?? (fullScreen ? 80 : 32);

  const handleRef = useCallback((dotLottie) => {
    if (dotLottie) {
      dotLottie.addEventListener('error', () => setUseFallback(true));
    }
  }, []);

  const globe = useFallback ? (
    <div
      className="rounded-full border-2 border-eco-200 border-t-eco-600 animate-spin"
      style={{ width: displaySize, height: displaySize }}
    />
  ) : (
    <DotLottieReact
      src={GLOBE_ANIMATION_SRC}
      loop
      autoplay
      renderConfig={{ autoResize: true }}
      dotLottieRefCallback={handleRef}
      style={{ width: displaySize, height: displaySize }}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">{globe}</div>
          {message && (
            <p className="text-stone-600 font-medium">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return <span className="inline-flex items-center justify-center shrink-0">{globe}</span>;
}

export default LoadingScreen;
