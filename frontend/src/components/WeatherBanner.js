import React from 'react';
import { Cloud, CloudRain, Sun, MapPin, Sunrise, Sunset, RefreshCw } from 'lucide-react';
import WeatherSceneBackground, { resolveWeatherScene } from './WeatherSceneBackground';

export default function WeatherBanner({ data, city, district, state, loading }) {
  const scene = resolveWeatherScene(data.descricao);
  const ConditionIcon = { sunny: Sun, cloudy: Cloud, rainy: CloudRain }[scene];
  return (
    <section className="weather-banner" aria-label="Condições do tempo" aria-busy={loading}>
      <WeatherSceneBackground descricao={data.descricao} />
      <div className="weather-banner__content">
        <div className="weather-banner__topline">
          <div className="weather-banner__location">
            <MapPin size={16} aria-hidden="true" />
            <span>{district}, {city} <span className="weather-banner__state">· {state}</span></span>
          </div>
          <span className="weather-banner__eyebrow">
            {loading ? <><RefreshCw size={12} className="animate-spin" /> Atualizando</> : 'Tempo agora'}
          </span>
        </div>
        <div className="weather-banner__reading">
          <div className="weather-banner__temperature">{data.temperatura}<span>°</span></div>
          <div className="weather-banner__condition">
            <div className="weather-banner__description"><ConditionIcon size={22} aria-hidden="true" /><span>{data.descricao}</span></div>
            <p>Sensação térmica de <strong>{data.sensacao}°C</strong></p>
          </div>
        </div>
        <div className="weather-banner__sun-times">
          <div><Sunrise size={20} aria-hidden="true" /><span>Nascer do sol <strong>{data.nascerSol}</strong></span></div>
          <span className="weather-banner__divider" />
          <div><Sunset size={20} aria-hidden="true" /><span>Pôr do sol <strong>{data.porSol}</strong></span></div>
        </div>
      </div>
    </section>
  );
}
