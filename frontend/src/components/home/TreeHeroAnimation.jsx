import React, { useCallback } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const TREE_LOTTIE_SRC = `${process.env.PUBLIC_URL || ''}/tree.lottie`;

function TreeHeroAnimation({ className = '' }) {
  const handleRef = useCallback((dotLottie) => {
    dotLottie?.setSpeed?.(0.05);
  }, []);

  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden>
      <DotLottieReact
        src={TREE_LOTTIE_SRC}
        loop={false}
        autoplay
        dotLottieRefCallback={handleRef}
        renderConfig={{ autoResize: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default TreeHeroAnimation;
