import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const NEBULA_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NEBULA_FRAGMENT = `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec2 uResolution;
  uniform vec2 uParallax;
  varying vec2 vUv;

  vec3 color1 = vec3(0.0078, 0.0235, 0.0902);   // #020617
  vec3 color2 = vec3(0.0392, 0.1020, 0.1647);  // #0a1a2a
  vec3 color3 = vec3(0.0588, 0.2392, 0.1804);   // #0f3d2e
  vec3 glow   = vec3(0.0627, 0.7255, 0.5059);   // #10b981

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    v += 0.5 * noise(p);
    p *= 2.0;
    v += 0.25 * noise(p + uTime * 0.05);
    p *= 2.0;
    v += 0.125 * noise(p - uTime * 0.03);
    return v;
  }

  void main() {
    vec2 uv = vUv + uParallax * 0.03;
    vec2 q = vec2(uv.x * 3.0, uv.y * 2.0);
    float n = fbm(q);
    float n2 = fbm(q + vec2(1.5, 0.5));
    vec3 col = mix(color1, color2, n * 0.6 + 0.2);
    col = mix(col, color3, n2 * 0.4);
    col += glow * (n * n2 * 0.15) * uIntensity;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const DUST_VERTEX = `
  attribute float aSize;
  uniform float uTime;
  varying float vAlpha;
  void main() {
    vec3 pos = position + vec3(sin(position.x * 0.5 + uTime * 0.2) * 0.02, cos(position.y * 0.5 + uTime * 0.15) * 0.02, 0.0);
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    vAlpha = 0.4 + 0.3 * sin(uTime + position.x * 2.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const DUST_FRAGMENT = `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float a = (1.0 - d) * vAlpha;
    gl_FragColor = vec4(0.7, 0.85, 0.9, a * 0.5);
  }
`;

function GalaxyBackground({ className = '', intensity = 1.0, starsCount = 12000, dustCount = 6000 }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const nebulaMeshRef = useRef(null);
  const starsRef = useRef(null);
  const dustRef = useRef(null);
  const rafIdRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const parallaxRef = useRef({ x: 0, y: 0 });
  const targetParallaxRef = useRef({ x: 0, y: 0 });
  const clockRef = useRef(null);
  const pointerHandlerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(w, h);
    // Fundo opaco escuro para o canvas não deixar o bg claro da página aparecer
    renderer.setClearColor(0x020617, 1);
    scene.background = new THREE.Color(0x020617);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const clock = new THREE.Clock();
    clockRef.current = clock;

    const uniforms = {
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uResolution: { value: new THREE.Vector2(w, h) },
      uParallax: { value: new THREE.Vector2(0, 0) },
    };

    const nebulaGeo = new THREE.PlaneGeometry(2, 2);
    const nebulaMat = new THREE.ShaderMaterial({
      vertexShader: NEBULA_VERTEX,
      fragmentShader: NEBULA_FRAGMENT,
      uniforms,
      depthWrite: false,
      transparent: true,
    });
    const nebulaMesh = new THREE.Mesh(nebulaGeo, nebulaMat);
    scene.add(nebulaMesh);
    nebulaMeshRef.current = nebulaMesh;

    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 4;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2 - 1;
      const t = Math.random();
      const c = t > 0.9 ? 1.0 : 0.7 + Math.random() * 0.3;
      starColors[i * 3] = c;
      starColors[i * 3 + 1] = c;
      starColors[i * 3 + 2] = t > 0.95 ? 0.95 : c * 0.9;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.9,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    starsRef.current = stars;

    const dustPositions = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 5;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 2 - 2;
      dustSizes[i] = 0.015 + Math.random() * 0.025;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeo.setAttribute('aSize', new THREE.BufferAttribute(dustSizes, 1));
    const dustUniforms = { uTime: { value: 0 } };
    const dustMat = new THREE.ShaderMaterial({
      vertexShader: DUST_VERTEX,
      fragmentShader: DUST_FRAGMENT,
      uniforms: dustUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);
    dustRef.current = dust;

    const onPointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      targetParallaxRef.current = { x, y };
    };
    pointerHandlerRef.current = onPointerMove;
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      if (nebulaMeshRef.current && nebulaMeshRef.current.material.uniforms.uResolution) {
        nebulaMeshRef.current.material.uniforms.uResolution.value.set(w, h);
      }
    });
    resizeObserver.observe(container);
    resizeObserverRef.current = resizeObserver;

    function animate() {
      rafIdRef.current = requestAnimationFrame(animate);
      if (document.hidden) return;

      const dt = clock.getElapsedTime();
      const p = parallaxRef.current;
      const t = targetParallaxRef.current;
      p.x += (t.x - p.x) * 0.02;
      p.y += (t.y - p.y) * 0.02;

      if (nebulaMeshRef.current && nebulaMeshRef.current.material.uniforms) {
        nebulaMeshRef.current.material.uniforms.uTime.value = dt;
        nebulaMeshRef.current.material.uniforms.uParallax.value.set(p.x, p.y);
      }
      if (dustRef.current && dustRef.current.material.uniforms) {
        dustRef.current.material.uniforms.uTime.value = dt;
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      window.removeEventListener('pointermove', pointerHandlerRef.current);
      if (resizeObserverRef.current && container) {
        resizeObserverRef.current.unobserve(container);
        resizeObserverRef.current = null;
      }
      if (rendererRef.current && container && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
      if (nebulaMeshRef.current) {
        nebulaMeshRef.current.geometry?.dispose();
        nebulaMeshRef.current.material?.dispose();
      }
      if (starsRef.current) {
        starsRef.current.geometry?.dispose();
        starsRef.current.material?.dispose();
      }
      if (dustRef.current) {
        dustRef.current.geometry?.dispose();
        dustRef.current.material?.dispose();
      }
      rendererRef.current?.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      nebulaMeshRef.current = null;
      starsRef.current = null;
      dustRef.current = null;
    };
  }, [intensity, starsCount, dustCount]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden
    />
  );
}

export default GalaxyBackground;
