import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { Thermometer, CalendarDays, Cloud, CloudRain, Sun, ArrowDown, ArrowUp } from 'lucide-react';
import './WeatherForecast.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);
const numeric = value => value != null && value !== '' && Number.isFinite(Number(value));
const format = value => numeric(value) ? `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}°` : '—';
const conditions = {
  sun: { Icon: Sun, label: 'Ensolarado' },
  cloud: { Icon: Cloud, label: 'Nublado' },
  'cloud-rain': { Icon: CloudRain, label: 'Chuvoso' },
};

export default function WeatherForecast({ hours = [], forecast = [], temperature, loading }) {
  const samples = hours.filter(item => numeric(item.temp));
  const points = samples.length ? samples : numeric(temperature) ? [{ label: 'Agora', temp: temperature }] : [];
  const values = points.map(item => Number(item.temp));
  const min = values.length ? Math.min(...values) : null;
  const max = values.length ? Math.max(...values) : null;
  const days = forecast.slice(0, 7);
  const limits = days.flatMap(day => [day.tempMin, day.tempMax]).filter(numeric).map(Number);
  const low = limits.length ? Math.min(...limits) : 0;
  const span = limits.length ? Math.max(...limits) - low || 1 : 1;
  const chartData = {
    labels: points.map(item => /^\d{1,2}$/.test(String(item.label)) ? `${item.label}h` : item.label),
    datasets: [{
      label: 'Temperatura', data: values, borderColor: '#4c819c', borderWidth: 2.5,
      backgroundColor: context => {
        const { ctx, chartArea } = context.chart;
        if (!chartArea) return 'rgba(76, 129, 156, .08)';
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(102, 162, 184, .24)');
        gradient.addColorStop(1, 'rgba(102, 162, 184, .01)');
        return gradient;
      },
      fill: true, tension: .3, cubicInterpolationMode: 'monotone',
      pointRadius: points.length === 1 ? 4 : 0, pointHoverRadius: 5, pointHitRadius: 22,
      pointBackgroundColor: '#4c819c', pointHoverBorderColor: '#fff', pointHoverBorderWidth: 2,
    }],
  };

  return (
    <section className="weather-outlook" aria-label="Temperatura e previsão" aria-busy={loading}>
      <article className="weather-outlook__panel weather-temperature">
        <header className="weather-outlook__header">
          <h3><Thermometer size={18} aria-hidden="true" />Temperatura por hora</h3>
          <span>{points.length > 1 ? 'Variação no período' : 'Leitura atual'}</span>
        </header>
        <div className="weather-temperature__summary">
          <div><span>Menor no período</span><strong><ArrowDown size={14} aria-hidden="true" />{format(min)}</strong></div>
          <div><span>Maior no período</span><strong><ArrowUp size={14} aria-hidden="true" />{format(max)}</strong></div>
        </div>
        <div className="weather-temperature__chart">
          {points.length ? <Line data={chartData} aria-label={`Temperatura por hora: ${points.map(point => `${point.label}: ${format(point.temp)}`).join(', ')}`} role="img" options={{
            responsive: true, maintainAspectRatio: false, animation: false,
            interaction: { mode: 'index', intersect: false },
            layout: { padding: { top: 10, right: 8 } },
            plugins: {
              legend: { display: false },
              tooltip: { backgroundColor: '#284a60', padding: 12, displayColors: false, cornerRadius: 9,
                callbacks: { label: context => ` ${format(context.parsed.y)}C` } },
            },
            scales: {
              y: { min: Math.floor(min - 2), max: Math.ceil(max + 2), border: { display: false },
                grid: { color: '#edf2f4', drawTicks: false },
                ticks: { padding: 12, maxTicksLimit: 5, color: '#87969e', font: { size: 12 }, callback: value => `${value}°` } },
              x: { offset: points.length === 1, border: { display: false }, grid: { display: false },
                ticks: { padding: 10, color: '#87969e', font: { size: 12 }, maxTicksLimit: 6, maxRotation: 0 } },
            },
          }} /> : <p className="weather-outlook__empty">Temperatura por hora indisponível.</p>}
        </div>
        <p className="weather-outlook__footnote">{points.length > 1 ? 'Horários e temperaturas disponíveis nesta consulta.' : 'Sem dados suficientes para mostrar a variação por hora.'}</p>
      </article>

      <article className="weather-outlook__panel weather-days">
        <header className="weather-outlook__header">
          <h3><CalendarDays size={18} aria-hidden="true" />Previsão do tempo</h3>
          <span>{days.length ? `${days.length} ${days.length === 1 ? 'dia' : 'dias'}` : 'Sem dados'}</span>
        </header>
        <div className="weather-days__legend"><span>Dia</span><span>Mín. / Máx.</span></div>
        {days.length ? <ul className="weather-days__list">
          {days.map((day, index) => {
            const condition = conditions[day.condicao];
            const Icon = condition?.Icon || Cloud;
            const validRange = numeric(day.tempMin) && numeric(day.tempMax) && Number(day.tempMax) >= Number(day.tempMin);
            const start = validRange ? (Number(day.tempMin) - low) / span * 100 : 0;
            const end = validRange ? (Number(day.tempMax) - low) / span * 100 : 0;
            return <li key={`${day.dia}-${index}`}>
              <span className="weather-days__day">{day.dia}</span>
              <Icon size={18} className={`weather-days__icon weather-days__icon--${day.condicao}`} role="img" aria-label={condition?.label || 'Condição não informada'} />
              <span className="weather-days__min" aria-label={`Mínima: ${format(day.tempMin)}`}>{format(day.tempMin)}</span>
              <div className="weather-days__range" aria-hidden="true">{validRange && <i style={{ left: `${start}%`, width: `${end - start}%` }} />}</div>
              <span className="weather-days__max" aria-label={`Máxima: ${format(day.tempMax)}`}>{format(day.tempMax)}</span>
            </li>;
          })}
        </ul> : <p className="weather-outlook__empty">A previsão dos próximos dias está indisponível nesta fonte.</p>}
        {days.length > 0 && <p className="weather-outlook__footnote">Faixa de temperatura de cada dia, em °C.</p>}
      </article>
    </section>
  );
}
