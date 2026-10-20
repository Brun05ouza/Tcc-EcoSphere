import React from 'react';
import { Cloud, Droplets, Wind, Eye, Gauge, Sun, ArrowUpRight } from 'lucide-react';
import './WeatherMetrics.css';

const hasNumber = (value) => value != null && value !== '' && Number.isFinite(Number(value));
const format = (value) => hasNumber(value) ? Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '—';

function Scale({ value, max, labels, type }) {
  const uvBounds = [0, 2, 5, 7, 10, 12];
  const upperIndex = uvBounds.findIndex((upper, index) => index > 0 && Number(value) <= upper);
  const band = upperIndex === -1 ? 4 : Math.max(0, upperIndex - 1);
  const fraction = type === 'uv'
    ? (band + (Number(value) - uvBounds[band]) / (uvBounds[band + 1] - uvBounds[band])) / 5
    : Number(value) / max;
  const position = Math.min(98, Math.max(2, fraction * 100));
  return (
    <div className={`environment-scale environment-scale--${type}`}>
      <div className="environment-scale__track" aria-hidden="true">
        {(type === 'air' ? labels.slice(1) : labels).map((label) => <span key={label} />)}
        {hasNumber(value) && <i style={{ left: `${position}%` }} />}
      </div>
      <div className="environment-scale__labels">{labels.map(label => <span key={label}>{label}</span>)}</div>
    </div>
  );
}

export default function WeatherMetrics({ data, airQuality, uvLevel, loading }) {
  const qualitative = data.qualidadeAr?.mode === 'qualitative';
  const airAvailable = !qualitative && hasNumber(data.qualidadeAr?.aqi);
  const uvAvailable = hasNumber(data.uv);
  const metrics = [
    { icon: Droplets, label: 'Umidade relativa', value: data.umidade, unit: '%', tone: 'blue' },
    { icon: Wind, label: 'Velocidade do vento', value: data.vento, unit: 'km/h', tone: 'teal' },
    { icon: Eye, label: 'Visibilidade', value: data.visibilidade, unit: 'km', tone: 'violet' },
    { icon: Gauge, label: 'Pressão atmosférica', value: data.pressao, unit: 'hPa', tone: 'amber' },
  ];
  return (
    <section className="environment-metrics" aria-label="Indicadores ambientais" aria-busy={loading}>
      <div className="environment-metrics__strip">
        {metrics.map(({ icon: Icon, label, value, unit, tone }) => (
          <article className="environment-metric" key={label}>
            <div className={`environment-icon environment-icon--${tone}`}><Icon size={19} aria-hidden="true" /></div>
            <h3>{label}</h3>
            <p className="environment-metric__value">{format(value)}{hasNumber(value) && <span>{unit}</span>}</p>
          </article>
        ))}
      </div>

      <div className="environment-metrics__details">
        <article className="environment-detail">
          <div className="environment-detail__heading">
            <h3><Cloud size={18} aria-hidden="true" />Qualidade do ar</h3>
            <span className="environment-detail__source">{qualitative ? 'Qualitativo' : 'Índice europeu'}</span>
          </div>
          <div className="environment-detail__reading">
            <p className={`environment-detail__number ${qualitative ? 'environment-detail__number--text' : ''}`}>
              {qualitative ? data.qualidadeAr.label || '—' : format(data.qualidadeAr?.aqi)}
              {airAvailable && <span>EAQI</span>}
            </p>
            {(qualitative || airAvailable) && <span className={`environment-status ${airQuality.color}`}><i />{airQuality.status}</span>}
          </div>
          {airAvailable ? <>
            <Scale value={data.qualidadeAr.aqi} max={100} labels={['0', '20', '40', '60', '80', '100+']} type="air" />
            <p className="environment-detail__note"><ArrowUpRight size={14} aria-hidden="true" />Quanto menor o índice, melhor a qualidade do ar.</p>
          </> : <p className="environment-detail__note environment-detail__note--fallback">
            {qualitative ? data.qualidadeAr.note || 'Classificação da fonte alternativa. Não comparável à escala EAQI.' : 'Dados de qualidade do ar indisponíveis nesta consulta.'}
          </p>}
        </article>

        <article className="environment-detail">
          <div className="environment-detail__heading">
            <h3><Sun size={18} aria-hidden="true" />Índice UV</h3>
            <span className="environment-detail__source">Radiação solar</span>
          </div>
          <div className="environment-detail__reading">
            <p className="environment-detail__number">{format(data.uv)}{uvAvailable && <span>UV</span>}</p>
            {uvAvailable && <span className={`environment-status ${uvLevel.color}`}><i />{uvLevel.level}</span>}
          </div>
          {uvAvailable ? <>
            <Scale value={data.uv} max={12} labels={['0–2', '3–5', '6–7', '8–10', '11+']} type="uv" />
            <p className="environment-detail__note"><Sun size={14} aria-hidden="true" />Do baixo ao extremo: intensidade da radiação ultravioleta.</p>
          </> : <p className="environment-detail__note environment-detail__note--fallback">Índice UV indisponível nesta fonte de dados.</p>}
        </article>
      </div>
    </section>
  );
}
