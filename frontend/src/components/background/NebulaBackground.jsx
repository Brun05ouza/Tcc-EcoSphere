import React, { useMemo } from 'react';
import './NebulaBackground.css';

/**
 * Fundo de nebulosa espacial suave para o hero da Home.
 * Gradiente verde/azul escuro, nebulosas animadas e partículas tipo estrelas.
 */
function NebulaBackground() {
  const stars = useMemo(() => {
    const count = 80;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      small: Math.random() > 0.5,
      delay: Math.random() * 4,
      driftDuration: 25 + Math.random() * 25,
      driftDelay: Math.random() * 10,
    }));
  }, []);

  return (
    <div className="nebula-wrap" aria-hidden>
      <div className="nebula-base" />
      <div className="nebula-blob nebula-blob-1" />
      <div className="nebula-blob nebula-blob-2" />
      <div className="nebula-blob nebula-blob-3" />
      <div className="stars-layer">
        {stars.map(({ id, left, top, small, delay, driftDuration, driftDelay }) => (
          <div
            key={id}
            className="star-wrapper"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              ['--star-drift-duration']: `${driftDuration}s`,
              ['--star-drift-delay']: `${driftDelay}s`,
            }}
          >
            <div
              className={`star ${small ? 'star--small' : ''}`}
              style={{ animationDelay: `${delay}s` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default NebulaBackground;
