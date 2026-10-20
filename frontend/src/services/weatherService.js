import { beginRequest } from './loadingActivity';

const REQUEST_TIMEOUT_MS = 15000;

const weatherCodeDescription = {
  0: 'Ceu limpo',
  1: 'Principalmente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina com geada',
  51: 'Garoa fraca',
  53: 'Garoa moderada',
  55: 'Garoa intensa',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  80: 'Pancadas fracas',
  81: 'Pancadas moderadas',
  82: 'Pancadas fortes',
  95: 'Trovoadas',
  96: 'Trovoadas com granizo',
  99: 'Trovoadas fortes',
};

const OWM_AQI_LABELS = {
  1: 'Boa',
  2: 'Razoavel',
  3: 'Moderada',
  4: 'Ruim',
  5: 'Muito Ruim',
};

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

/** Permite testes forçarem falha do Open-Meteo sem alterar o código permanente. */
export const OPEN_METEO = {
  geocodeBase: 'https://geocoding-api.open-meteo.com/v1/search',
  forecastBase: 'https://api.open-meteo.com/v1/forecast',
  airBase: 'https://air-quality-api.open-meteo.com/v1/air-quality',
};

function weatherCodeIcon(code) {
  if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) return 'cloud-rain';
  if ([2, 3, 45, 48, 51, 53, 55].includes(code)) return 'cloud';
  return 'sun';
}

function getCurrentHourIndex(times = []) {
  const now = Date.now();
  return times.reduce((closest, time, index) => {
    const currentDistance = Math.abs(new Date(time).getTime() - now);
    const closestDistance = Math.abs(new Date(times[closest]).getTime() - now);
    return currentDistance < closestDistance ? index : closest;
  }, 0);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function getOpenWeatherKey() {
  const key = process.env.REACT_APP_OPENWEATHER_API_KEY;
  if (!key || key === 'sua_chave_openweathermap_aqui') return null;
  return key;
}

function eaqiToLabel(aqi) {
  if (aqi == null || Number.isNaN(Number(aqi))) return null;
  const value = Number(aqi);
  if (value <= 20) return 'Boa';
  if (value <= 40) return 'Razoavel';
  if (value <= 60) return 'Moderada';
  if (value <= 80) return 'Ruim';
  return 'Muito Ruim';
}

async function geocodeOpenMeteo(city, bairro) {
  const queries = [];
  const cityName = String(city || '').trim();
  const neighborhood = String(bairro || '').trim();
  if (neighborhood && cityName) queries.push(`${neighborhood}, ${cityName}`);
  if (cityName) queries.push(cityName);
  if (neighborhood && neighborhood.toLowerCase() !== cityName.toLowerCase()) {
    queries.push(neighborhood);
  }

  let lastError = new Error('Cidade nao encontrada na base meteorologica.');

  for (const query of queries) {
    try {
      const geocodeResponse = await fetchWithTimeout(
        `${OPEN_METEO.geocodeBase}?name=${encodeURIComponent(query)}&count=5&language=pt&format=json&country_code=BR`
      );
      if (!geocodeResponse.ok) {
        lastError = new Error('Nao foi possivel localizar a cidade.');
        continue;
      }

      const geocode = await geocodeResponse.json();
      const results = Array.isArray(geocode.results) ? geocode.results : [];
      if (!results.length) continue;

      const normalizedCity = cityName.toLowerCase();
      const normalizedNeighborhood = neighborhood.toLowerCase();
      const place =
        (normalizedNeighborhood
          && results.find((r) => String(r.name || '').toLowerCase() === normalizedNeighborhood))
        || (normalizedNeighborhood
          && results.find((r) => String(r.name || '').toLowerCase().includes(normalizedNeighborhood)))
        || results.find((r) => String(r.name || '').toLowerCase() === normalizedCity)
        || results.find((r) => String(r.name || '').toLowerCase().includes(normalizedCity))
        || results[0];

      if (place?.latitude != null && place?.longitude != null) {
        return place;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

async function fetchFromOpenMeteo(city, bairro) {
  const place = await geocodeOpenMeteo(city, bairro);

  const weatherParams = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    timezone: 'auto',
    forecast_days: '7',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m,visibility',
    hourly: 'temperature_2m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max',
  });
  const airParams = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    timezone: 'auto',
    current: 'european_aqi,pm10,pm2_5,uv_index',
  });

  const weatherResponse = await fetchWithTimeout(`${OPEN_METEO.forecastBase}?${weatherParams.toString()}`);
  if (!weatherResponse.ok) throw new Error('Erro ao buscar dados climaticos.');

  let air = null;
  try {
    const airResponse = await fetchWithTimeout(`${OPEN_METEO.airBase}?${airParams.toString()}`);
    if (airResponse.ok) air = await airResponse.json();
  } catch (airErr) {
    console.warn('Open-Meteo air-quality indisponivel:', airErr?.message || airErr);
  }

  const weather = await weatherResponse.json();
  const current = weather.current || {};
  const daily = weather.daily || {};
  const airCurrent = air?.current || {};
  const eaqi = airCurrent.european_aqi != null ? Math.round(airCurrent.european_aqi) : null;

  const environmentalData = {
    temperatura: Math.round(current.temperature_2m ?? 0),
    umidade: Math.round(current.relative_humidity_2m ?? 0),
    qualidadeAr: {
      mode: eaqi != null ? 'eaqi' : 'qualitative',
      aqi: eaqi,
      label: eaqiToLabel(eaqi),
      note: eaqi != null ? 'Indice europeu de qualidade do ar (Open-Meteo)' : 'Qualidade do ar indisponivel nesta consulta',
    },
    visibilidade: Number(((current.visibility ?? 0) / 1000).toFixed(1)),
    vento: Math.round(current.wind_speed_10m ?? 0),
    pressao: Math.round(current.pressure_msl ?? 0),
    sensacao: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 0),
    descricao: weatherCodeDescription[current.weather_code] || 'Condicao indisponivel',
    uv: airCurrent.uv_index != null
      ? Math.round(airCurrent.uv_index)
      : (daily.uv_index_max?.[0] != null ? Math.round(daily.uv_index_max[0]) : null),
    nascerSol: daily.sunrise?.[0]
      ? new Date(daily.sunrise[0]).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '--:--',
    porSol: daily.sunset?.[0]
      ? new Date(daily.sunset[0]).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '--:--',
    pm25: airCurrent.pm2_5 ?? null,
    pm10: airCurrent.pm10 ?? null,
  };

  const forecast = (daily.time || []).map((date, index) => ({
    dia: DAYS[new Date(`${date}T12:00:00`).getDay()],
    tempMax: Math.round(daily.temperature_2m_max?.[index] ?? 0),
    tempMin: Math.round(daily.temperature_2m_min?.[index] ?? 0),
    condicao: weatherCodeIcon(daily.weather_code?.[index]),
  }));

  const hourlyIndex = getCurrentHourIndex(weather.hourly?.time || []);
  const start = Math.max(0, hourlyIndex - 3);
  const temperatureHours = (weather.hourly?.time || [])
    .slice(start, start + 6)
    .map((time, index) => ({
      label: new Date(time).toLocaleTimeString('pt-BR', { hour: '2-digit' }),
      temp: Math.round(weather.hourly.temperature_2m[start + index] ?? 0),
    }));

  const placeLabel = [place.name, place.admin1].filter(Boolean).join(', ');

  return {
    environmentalData,
    forecast,
    temperatureHours,
    source: 'open-meteo',
    placeLabel,
    resolvedName: place.name,
  };
}

async function fetchFromOpenWeatherMap(city, apiKey) {
  const query = encodeURIComponent(`${city},BR`);
  const currentRes = await fetchWithTimeout(
    `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric&lang=pt_br`
  );
  if (!currentRes.ok) throw new Error('OpenWeatherMap indisponivel.');

  const weatherData = await currentRes.json();
  const lat = weatherData.coord?.lat;
  const lon = weatherData.coord?.lon;

  let airLabel = 'Indisponivel';
  let pm25 = null;
  let pm10 = null;
  if (lat != null && lon != null) {
    try {
      const airRes = await fetchWithTimeout(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      if (airRes.ok) {
        const airData = await airRes.json();
        const aqi = airData.list?.[0]?.main?.aqi;
        airLabel = OWM_AQI_LABELS[aqi] || 'Indisponivel';
        pm25 = airData.list?.[0]?.components?.pm2_5 ?? null;
        pm10 = airData.list?.[0]?.components?.pm10 ?? null;
      }
    } catch {
      // Qualidade do ar alternativa é opcional; clima atual já basta.
    }
  }

  let forecast = [];
  let temperatureHours = [];
  try {
    const forecastRes = await fetchWithTimeout(
      `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${apiKey}&units=metric&lang=pt_br`
    );
    if (forecastRes.ok) {
      const forecastData = await forecastRes.json();
      const list = forecastData.list || [];

      temperatureHours = list.slice(0, 6).map((item) => ({
        label: new Date(item.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit' }),
        temp: Math.round(item.main?.temp ?? 0),
      }));

      const byDay = new Map();
      list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const key = date.toISOString().slice(0, 10);
        const entry = byDay.get(key) || {
          dia: DAYS[date.getDay()],
          temps: [],
          weatherIds: [],
        };
        entry.temps.push(item.main?.temp ?? 0);
        entry.weatherIds.push(item.weather?.[0]?.id ?? 800);
        byDay.set(key, entry);
      });

      forecast = Array.from(byDay.values()).slice(0, 7).map((day) => {
        const avgId = day.weatherIds[Math.floor(day.weatherIds.length / 2)] || 800;
        let condicao = 'sun';
        if (avgId >= 200 && avgId < 600) condicao = 'cloud-rain';
        else if (avgId >= 600 && avgId < 800) condicao = 'cloud';
        else if (avgId === 801 || avgId === 802 || avgId === 803 || avgId === 804) condicao = 'cloud';
        return {
          dia: day.dia,
          tempMax: Math.round(Math.max(...day.temps)),
          tempMin: Math.round(Math.min(...day.temps)),
          condicao,
        };
      });
    }
  } catch {
    // Previsão alternativa opcional.
  }

  if (!forecast.length) {
    // Sem inventar 7 dias: UI mostra "previsao indisponivel".
    forecast = [];
  }

  if (!temperatureHours.length) {
    const temp = Math.round(weatherData.main.temp);
    temperatureHours = [{ label: 'Agora', temp }];
  }

  const environmentalData = {
    temperatura: Math.round(weatherData.main.temp),
    umidade: weatherData.main.humidity,
    qualidadeAr: {
      mode: 'qualitative',
      aqi: null,
      label: airLabel,
      note: 'qualidade do ar: fonte alternativa, escala qualitativa (1-5 OpenWeatherMap)',
    },
    // visibility já vem em metros na API 2.5
    visibilidade: Number(((weatherData.visibility ?? 0) / 1000).toFixed(1)),
    // wind.speed em m/s com units=metric → km/h
    vento: Math.round((weatherData.wind?.speed ?? 0) * 3.6),
    pressao: weatherData.main.pressure,
    sensacao: Math.round(weatherData.main.feels_like),
    descricao: weatherData.weather?.[0]?.description || 'Condicao indisponivel',
    // OpenWeatherMap 2.5 nao retorna UV sem endpoint pago/descontinuado; nao fabricar valor
    uv: null,
    nascerSol: weatherData.sys?.sunrise
      ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '--:--',
    porSol: weatherData.sys?.sunset
      ? new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '--:--',
    pm25,
    pm10,
  };

  return {
    environmentalData,
    forecast,
    temperatureHours,
    source: 'openweathermap',
  };
}

function buildSimulated(city) {
  const temperaturaBase = {
    'Rio de Janeiro': 28,
    'Niterói': 27,
    'Petrópolis': 22,
    'Teresópolis': 20,
    'Cabo Frio': 26,
    'São Paulo': 23,
    'Campinas': 24,
    'Santos': 26,
    'Ribeirão Preto': 27,
    'Belo Horizonte': 25,
    'Uberlândia': 26,
    'Juiz de Fora': 23,
    'Ouro Preto': 21,
    'Porto Alegre': 22,
    'Caxias do Sul': 19,
    'Pelotas': 21,
    'Gramado': 18,
    'Salvador': 29,
    'Feira de Santana': 28,
    'Vitória da Conquista': 24,
    'Ilhéus': 27,
    'Curitiba': 21,
    'Londrina': 24,
    'Maringá': 25,
    'Foz do Iguaçu': 26,
    'Florianópolis': 24,
    'Joinville': 23,
    'Blumenau': 23,
    'Balneário Camboriú': 25,
    'Recife': 29,
    'Olinda': 29,
    'Caruaru': 26,
    'Petrolina': 31,
    'Fortaleza': 30,
    'Juazeiro do Norte': 28,
    'Sobral': 29,
    'Caucaia': 30,
    'Brasília': 26,
  };

  const baseTemp = temperaturaBase[city] || 25;
  const variacao = Math.round((Math.random() - 0.5) * 4);
  const temp = baseTemp + variacao;
  const labels = ['Boa', 'Razoavel', 'Moderada', 'Ruim'];
  const airLabel = labels[Math.floor(Math.random() * labels.length)];

  const environmentalData = {
    temperatura: temp,
    umidade: Math.round(50 + Math.random() * 30),
    qualidadeAr: {
      mode: 'qualitative',
      aqi: null,
      label: airLabel,
      note: 'qualidade do ar simulada (rótulo qualitativo; sem EAQI fictício)',
    },
    visibilidade: Math.round(8 + Math.random() * 7),
    vento: Math.round(8 + Math.random() * 15),
    pressao: Math.round(1010 + Math.random() * 15),
    sensacao: temp + Math.round((Math.random() - 0.5) * 4),
    descricao: ['Ensolarado', 'Parcialmente nublado', 'Nublado', 'Céu limpo'][Math.floor(Math.random() * 4)],
    uv: Math.round(4 + Math.random() * 6),
    nascerSol: '06:15',
    porSol: '18:45',
    pm25: null,
    pm10: null,
  };

  const forecast = Array.from({ length: 7 }, (_, i) => ({
    dia: DAYS[(new Date().getDay() + i) % 7],
    tempMax: temp + Math.round((Math.random() - 0.5) * 6),
    tempMin: temp - Math.round(4 + Math.random() * 4),
    condicao: ['sun', 'cloud', 'cloud-rain'][Math.floor(Math.random() * 3)],
  }));

  const temperatureHours = Array.from({ length: 6 }, (_, i) => {
    const hour = new Date();
    hour.setHours(hour.getHours() - 2 + i, 0, 0, 0);
    return {
      label: hour.toLocaleTimeString('pt-BR', { hour: '2-digit' }),
      temp: temp + Math.round((Math.random() - 0.5) * 3),
    };
  });

  return {
    environmentalData,
    forecast,
    temperatureHours,
    source: 'simulated',
  };
}

/**
 * Cascata: Open-Meteo → OpenWeatherMap (se chave) → dados simulados.
 * @param {string} city
 * @param {string} [_bairro] mantido por compatibilidade com a tela
 */
async function loadWeatherData(city, bairro) {
  try {
    return await fetchFromOpenMeteo(city, bairro);
  } catch (openMeteoError) {
    console.warn('Open-Meteo falhou, tentando fallback:', openMeteoError?.message || openMeteoError);
  }

  const apiKey = getOpenWeatherKey();
  if (apiKey) {
    try {
      const result = await fetchFromOpenWeatherMap(city, apiKey);
      return {
        ...result,
        placeLabel: result.placeLabel || city,
        resolvedName: result.resolvedName || city,
      };
    } catch (owmError) {
      console.warn('OpenWeatherMap falhou, usando dados simulados:', owmError.message);
    }
  }

  return {
    ...buildSimulated(city),
    placeLabel: city,
    resolvedName: city,
  };
}

export async function fetchWeatherData(city, bairro) {
  const finishLoading = beginRequest();
  try {
    return await loadWeatherData(city, bairro);
  } finally {
    finishLoading();
  }
}

export const SOURCE_LABELS = {
  'open-meteo': 'Fonte: Open-Meteo (dados reais)',
  openweathermap: 'Fonte: OpenWeatherMap (alternativa)',
  simulated: 'Dados simulados — APIs externas indisponiveis',
};
