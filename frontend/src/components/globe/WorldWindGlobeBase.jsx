import React, { useRef, useEffect, useState } from 'react';

/**
 * Componente base do globo 3D NASA WebWorldWind.
 * Responsável por criar o WorldWindow, layers, animação e cleanup.
 */
function WorldWindGlobeBase({
  canvasId = 'wwd-canvas-globe',
  initialLat = -15,
  initialLon = -47,
  initialRange = 4e6,
  rotationSpeed = 0.15,
  withAtmosphere = true,
  withCompass = false,
  maxDpr = 2,
  disableZoom = false,
  onError = null,
  onReady = null,
  className = '',
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const rafRef = useRef(null);
  const wwdRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const headingRef = useRef(0);

  useEffect(() => {
    let WorldWind;
    let mounted = true;

    const init = async () => {
      try {
        WorldWind = (await import('@nasaworldwind/worldwind')).default;
        if (!WorldWind || !mounted) return;

        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        WorldWind.configuration.baseUrl = '/worldwind/';

        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error('Canvas ref not available');
        }

        const wwd = new WorldWind.WorldWindow(canvasId);
        wwdRef.current = wwd;

        wwd.addLayer(new WorldWind.BMNGOneImageLayer());
        if (withAtmosphere) {
          wwd.addLayer(new WorldWind.AtmosphereLayer());
        }
        if (withCompass) {
          wwd.addLayer(new WorldWind.CompassLayer());
        }

        const nav = wwd.navigator;
        if (nav.lookAtLocation) {
          nav.lookAtLocation.latitude = initialLat;
          nav.lookAtLocation.longitude = initialLon;
          nav.lookAtLocation.altitude = 0;
          nav.range = initialRange;
        }

        const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
        }

        const animate = () => {
          if (!mounted || !wwdRef.current || document.hidden) {
            rafRef.current = requestAnimationFrame(animate);
            return;
          }
          headingRef.current += rotationSpeed;
          const nav = wwdRef.current.navigator;
          if (nav.lookAtLocation) {
            nav.lookAtLocation.longitude = initialLon + (headingRef.current % 360);
          }
          wwdRef.current.redraw();
          rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);

        resizeObserverRef.current = new ResizeObserver(() => {
          if (!containerRef.current || !canvasRef.current || !wwdRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
          canvasRef.current.width = rect.width * dpr;
          canvasRef.current.height = rect.height * dpr;
          wwdRef.current.redraw();
        });
        if (containerRef.current) {
          resizeObserverRef.current.observe(containerRef.current);
        }

        if (disableZoom && canvas) {
          canvas.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
        }

        onReady?.(wwd);
      } catch (err) {
        if (mounted) {
          setError(err);
          onError?.(err);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.unobserve(containerRef.current);
        resizeObserverRef.current = null;
      }
      wwdRef.current = null;
    };
  }, [canvasId, initialLat, initialLon, initialRange, rotationSpeed, withAtmosphere, withCompass, maxDpr, disableZoom, onError, onReady]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-stone-800/80 rounded-xl ${className}`}>
        <div className="text-center text-stone-400 text-sm p-4">
          Visualização indisponível
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full h-full relative ${className}`}>
      <canvas
        ref={canvasRef}
        id={canvasId}
        className="globeCanvas block w-full h-full"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}

export default WorldWindGlobeBase;
