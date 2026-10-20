import React from 'react';
import './WeatherBanner.css';

export function resolveWeatherScene(descricao = '') {
  const d = String(descricao).toLowerCase();
  if (/chuva|garoa|pancada|trovoada|tempestade|rain/.test(d)) return 'rainy';
  if (/nublado|neblina|nuvem|parcialmente|cloud/.test(d)) return 'cloudy';
  if (/limpo|ensolarado|sol|clear|sun/.test(d)) return 'sunny';
  return 'cloudy';
}

function SkyCloud({ layer }) {
  return (
    <svg className={`weather-sky__cloud weather-sky__cloud--${layer}`} viewBox="0 0 480 200" fill="none">
      <path d="M88 178C42 178 18 155 18 124S43 69 78 72C91 30 121 15 157 22C184 26 202 46 208 70C231 53 261 57 278 78C292 65 310 63 328 68C353 74 368 94 369 115C403 106 442 119 451 143C460 168 438 178 409 178H88Z" fill="currentColor" />
    </svg>
  );
}

export default function WeatherSceneBackground({ descricao }) {
  const scene = resolveWeatherScene(descricao);
  return (
    <div className={`weather-sky weather-sky--${scene}`} aria-hidden="true">
      <div className="weather-sky__glow" />
      <div className="weather-sky__sun" />
      <SkyCloud layer="back" />
      <SkyCloud layer="middle" />
      <SkyCloud layer="front" />
      {scene === 'rainy' && (
        <div className="weather-sky__rain">
          {Array.from({ length: 18 }, (_, i) => (
            <i key={i} style={{ left: `${40 + i * 3.5}%`, animationDelay: `${-i * 0.19}s`, animationDuration: `${0.9 + (i % 4) * 0.18}s` }} />
          ))}
        </div>
      )}
      <div className="weather-sky__shade" />
    </div>
  );
}
