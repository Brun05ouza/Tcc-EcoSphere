import React from 'react';
import WorldWindGlobeBase from './WorldWindGlobeBase';

/**
 * Globo 3D solto para Dashboard/Home.
 * Exibido sem card, apenas o globo na área nobre.
 */
function DashboardGlobeCard({ id = "wwd-canvas-dashboard" }) {
  return (
    <div className="relative w-full h-full aspect-square max-w-full max-h-full rounded-xl overflow-hidden select-none pointer-events-none">
      <WorldWindGlobeBase
        canvasId={id}
        initialLat={0}
        initialLon={-47}
        initialRange={20e6}
        rotationSpeed={0.08}
        withAtmosphere={true}
        withCompass={false}
        maxDpr={2}
        disableZoom={true}
      />
    </div>
  );
}

export default DashboardGlobeCard;
