import React from 'react';
import WorldWindGlobeBase from './WorldWindGlobeBase';

/**
 * Globo 3D como background da página de Login.
 * pointer-events: none para não capturar cliques.
 */
function LoginGlobeBackground({
  opacity = 0.35,
  blur = '4px',
  zoom = 35e6,
}) {
  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          opacity,
          filter: blur ? `blur(${blur})` : undefined,
        }}
      >
        <WorldWindGlobeBase
          canvasId="wwd-canvas-login"
          initialLat={0}
          initialLon={-47}
          initialRange={zoom}
          rotationSpeed={0.1}
          withAtmosphere={true}
          withCompass={false}
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-br from-eco-900/70 via-teal-900/60 to-eco-900/70"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
}

export default LoginGlobeBackground;
