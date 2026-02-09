import React, { useRef, useEffect, useState } from 'react';
import './vantaBackground.css';

/**
 * Vanta FOG background animado.
 * Reutilizável para Hero, Login, etc.
 * Performance: desabilita em mobile fraco, pausa quando aba invisível, fallback em erro WebGL.
 */
function VantaBackground({
  className = '',
  overlay = true,
  overlayOpacity = 0.35,
  overlayDark = false,
  disableOnMobile = false,
  minWidth = 320,
  mouseControls = true,
}) {
  const vantaRef = useRef(null);
  const effectRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(!document.hidden);

  useEffect(() => {
    if (failed) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setFailed(true);
      return;
    }

    if (disableOnMobile && window.innerWidth < minWidth) {
      setFailed(true);
      return;
    }

    const el = vantaRef.current;
    if (!el) return;

    let mounted = true;

    const initEffect = async () => {
      if (!mounted || !el) return;

      try {
        const threeModule = await import('three');
        const THREE = threeModule.default || threeModule;
        if (typeof window !== 'undefined') window.THREE = THREE;

        const VANTA = (await import('vanta/dist/vanta.fog.min')).default;

        if (!mounted || effectRef.current) return;

        const fogColors = overlayDark
          ? {
              highlightColor: 0x5eead4,
              midtoneColor: 0x2dd4bf,
              lowlightColor: 0x14b8a6,
              baseColor: 0x0f766e,
            }
          : {
              highlightColor: 0x94a3b8,
              midtoneColor: 0x86efac,
              lowlightColor: 0xbbf7d0,
              baseColor: 0xf0fdf4,
            };

        const effect = VANTA({
          el,
          THREE,
          mouseControls,
          touchControls: false,
          gyroControls: false,
          ...fogColors,
          blurFactor: 0.8,
          speed: 1.0,
          zoom: 1.0,
        });

        if (mounted) {
          effectRef.current = effect;
        } else {
          effect?.destroy?.();
        }
      } catch (err) {
        console.warn('Vanta FOG init failed, using fallback:', err);
        if (mounted) setFailed(true);
      }
    };

    const handleVisibilityChange = () => {
      setVisible(!document.hidden);
    };

    requestAnimationFrame(() => {
      if (el && el.offsetParent !== null) initEffect();
      else setTimeout(initEffect, 100);
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (effectRef.current) {
        effectRef.current.destroy?.();
        effectRef.current = null;
      }
    };
  }, [disableOnMobile, minWidth, mouseControls, overlayDark, failed]);

  /* Reinstanciar ao voltar visível */
  useEffect(() => {
    if (failed || !visible) return;
    if (effectRef.current) return;

    const el = vantaRef.current;
    if (!el) return;

    let mounted = true;

    const reinit = async () => {
      if (!mounted || effectRef.current) return;
      try {
        const threeModule = await import('three');
        const THREE = threeModule.default || threeModule;
        if (typeof window !== 'undefined') window.THREE = THREE;
        const VANTA = (await import('vanta/dist/vanta.fog.min')).default;

        if (!mounted) return;

        const fogColors = overlayDark
          ? {
              highlightColor: 0x5eead4,
              midtoneColor: 0x2dd4bf,
              lowlightColor: 0x14b8a6,
              baseColor: 0x0f766e,
            }
          : {
              highlightColor: 0x94a3b8,
              midtoneColor: 0x86efac,
              lowlightColor: 0xbbf7d0,
              baseColor: 0xf0fdf4,
            };

        const effect = VANTA({
          el,
          THREE,
          mouseControls,
          touchControls: false,
          gyroControls: false,
          ...fogColors,
          blurFactor: 0.8,
          speed: 1.0,
          zoom: 1.0,
        });

        if (mounted) effectRef.current = effect;
        else effect?.destroy?.();
      } catch {
        if (mounted) setFailed(true);
      }
    };

    reinit();
    return () => { mounted = false; };
  }, [visible, failed, mouseControls, overlayDark]);

  /* Destruir ao ficar invisível */
  useEffect(() => {
    if (!visible && effectRef.current) {
      effectRef.current.destroy?.();
      effectRef.current = null;
    }
  }, [visible]);

  const overlayClass = overlayDark ? 'vantaOverlayDark' : 'vantaOverlay';

  if (failed) {
    const fallbackBg = overlayDark
      ? { background: 'linear-gradient(135deg, #16a34a 0%, #14b8a6 50%, #0d9488 100%)' }
      : {};
    return (
      <div className={`vantaWrap vantaFallback ${className}`} aria-hidden style={fallbackBg}>
        {overlay && (
          <div className={overlayClass} style={{ opacity: overlayOpacity }} />
        )}
      </div>
    );
  }

  return (
    <div className={`vantaWrap ${className}`} aria-hidden>
      <div ref={vantaRef} className="vantaWrap" style={{ position: 'absolute', inset: 0 }} />
      {overlay && (
        <div className={overlayClass} style={{ opacity: overlayOpacity }} />
      )}
    </div>
  );
}

export default VantaBackground;
