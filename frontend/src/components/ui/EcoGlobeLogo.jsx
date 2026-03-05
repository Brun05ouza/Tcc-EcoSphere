import React, { useState, useCallback } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const GLOBE_LOTTIE_SRC = `${process.env.PUBLIC_URL || ''}/Globe.lottie`;
const GLOBO_FALLBACK = require('../../assets/icons/globo-icon.png');

/**
 * Ícone principal do EcoSphere: globo animado (Lottie).
 * Fallback para imagem estática se o .lottie não carregar.
 * @param {number} size - Tamanho em px (largura e altura)
 * @param {string} className - Classes Tailwind adicionais
 * @param {object} style - Estilos inline (ex: filter para tema claro/escuro)
 */
function EcoGlobeLogo({ size = 48, className = '', style = {} }) {
  const [useFallback, setUseFallback] = useState(false);

  const containerStyle = {
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  const handleRef = useCallback((dotLottie) => {
    if (dotLottie) {
      dotLottie.addEventListener('error', () => setUseFallback(true));
    }
  }, []);

  if (useFallback) {
    return (
      <img
        src={GLOBO_FALLBACK}
        alt="EcoSphere"
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={style}
      />
    );
  }

  return (
    <div style={containerStyle} className={className}>
      <DotLottieReact
        src={GLOBE_LOTTIE_SRC}
        loop
        autoplay
        renderConfig={{ autoResize: true }}
        dotLottieRefCallback={handleRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default EcoGlobeLogo;
