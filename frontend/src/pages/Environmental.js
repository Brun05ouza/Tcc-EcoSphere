import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, MapPin, Clock, Zap, RefreshCw, ChevronDown, Building2 } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { fetchWeatherData } from '../services/weatherService';
import WeatherBanner from '../components/WeatherBanner';
import WeatherMetrics from '../components/WeatherMetrics';
import WeatherForecast from '../components/WeatherForecast';
import LoadingScreen from '../components/ui/LoadingScreen';

const Environmental = () => {
  const [selectedState, setSelectedState] = useState('RJ');
  const [selectedCity, setSelectedCity] = useState('Rio de Janeiro');
  const [selectedBairro, setSelectedBairro] = useState('Centro');
  const [environmentalData, setEnvironmentalData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [temperatureHours, setTemperatureHours] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataError, setDataError] = useState('');
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);
  const [displayLocation, setDisplayLocation] = useState(null);
  const [showStateModal, setShowStateModal] = useState(false);

  useBodyScrollLock(showStateModal);

  const estados = [
    { sigla: 'SP', nome: 'São Paulo', cidades: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto'] },
    { sigla: 'RJ', nome: 'Rio de Janeiro', cidades: ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Teresópolis', 'Cabo Frio'] },
    { sigla: 'MG', nome: 'Minas Gerais', cidades: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Ouro Preto'] },
    { sigla: 'RS', nome: 'Rio Grande do Sul', cidades: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Gramado'] },
    { sigla: 'BA', nome: 'Bahia', cidades: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Ilhéus'] },
    { sigla: 'PR', nome: 'Paraná', cidades: ['Curitiba', 'Londrina', 'Maringá', 'Foz do Iguaçu'] },
    { sigla: 'SC', nome: 'Santa Catarina', cidades: ['Florianópolis', 'Joinville', 'Blumenau', 'Balneário Camboriú'] },
    { sigla: 'PE', nome: 'Pernambuco', cidades: ['Recife', 'Olinda', 'Caruaru', 'Petrolina'] },
    { sigla: 'CE', nome: 'Ceará', cidades: ['Fortaleza', 'Juazeiro do Norte', 'Sobral', 'Caucaia'] },
    { sigla: 'DF', nome: 'Distrito Federal', cidades: ['Brasília'] }
  ];

  const bairrosPorCidade = {
    'Rio de Janeiro': ['Centro', 'Copacabana', 'Ipanema', 'Barra da Tijuca', 'Botafogo', 'Tijuca'],
    'Niterói': ['Centro', 'Icaraí', 'São Francisco', 'Pendotiba'],
    'Petrópolis': ['Centro', 'Itaipava', 'Cascatinha', 'Quitandinha'],
    'Teresópolis': ['Centro', 'Alto', 'Várzea', 'Granja Guarani'],
    'Cabo Frio': ['Centro', 'Braga', 'Passagem', 'Tamoios'],
    'São Paulo': ['Centro', 'Vila Mariana', 'Pinheiros', 'Moema', 'Itaim Bibi'],
    'Campinas': ['Centro', 'Cambuí', 'Taquaral', 'Barão Geraldo'],
    'Santos': ['Centro', 'Gonzaga', 'Boqueirão', 'Ponta da Praia'],
    'Ribeirão Preto': ['Centro', 'Jardim Irajá', 'Ribeirânia', 'Alto da Boa Vista']
  };

  const estadoAtual = estados.find(e => e.sigla === selectedState);

  const loadWeather = async (city, bairro) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setDataError('');
    try {
      const result = await fetchWeatherData(city, bairro);
      if (currentRequest !== requestId.current) return;
      setEnvironmentalData(result.environmentalData);
      setDisplayLocation({ city, district: bairro, state: selectedState });
      setForecast(result.forecast || []);
      setTemperatureHours(result.temperatureHours || []);
      setLastUpdated(new Date());
      if (result.source === 'simulated') {
        setDataError('Servicos meteorologicos indisponiveis; exibindo dados simulados.');
      } else {
        setDataError('');
      }
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      setDataError(error.message || 'Nao foi possivel carregar dados climaticos.');
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedCity, selectedBairro);
    return () => { requestId.current += 1; };
  }, [selectedCity, selectedBairro, selectedState]);

  const getAirQualityStatus = (qualidadeAr) => {
    if (qualidadeAr?.mode === 'qualitative') {
      const label = qualidadeAr.label || 'Indisponivel';
      const map = {
        Boa: { status: 'Boa', color: 'text-green-600', bgColor: 'bg-green-100', iconName: 'success' },
        Razoavel: { status: 'Razoavel', color: 'text-lime-600', bgColor: 'bg-lime-100', iconName: 'success' },
        Moderada: { status: 'Moderada', color: 'text-yellow-600', bgColor: 'bg-yellow-100', iconName: 'warning' },
        Ruim: { status: 'Ruim', color: 'text-orange-600', bgColor: 'bg-orange-100', iconName: 'warning' },
        'Muito Ruim': { status: 'Muito Ruim', color: 'text-red-600', bgColor: 'bg-red-100', iconName: 'error' },
        Indisponivel: { status: 'Indisponivel', color: 'text-stone-500', bgColor: 'bg-stone-100', iconName: 'warning' },
      };
      return map[label] || map.Indisponivel;
    }

    const aqi = qualidadeAr?.aqi ?? 0;
    if (aqi <= 20) return { status: 'Bom', color: 'text-green-600', bgColor: 'bg-green-100', iconName: 'success' };
    if (aqi <= 40) return { status: 'Razoavel', color: 'text-lime-600', bgColor: 'bg-lime-100', iconName: 'success' };
    if (aqi <= 60) return { status: 'Moderado', color: 'text-yellow-600', bgColor: 'bg-yellow-100', iconName: 'warning' };
    if (aqi <= 80) return { status: 'Ruim', color: 'text-orange-600', bgColor: 'bg-orange-100', iconName: 'warning' };
    return { status: 'Muito ruim', color: 'text-red-600', bgColor: 'bg-red-100', iconName: 'error' };
  };

  const getUVLevel = (uv) => {
    if (uv <= 2) return { level: 'Baixo', color: 'text-green-600' };
    if (uv <= 5) return { level: 'Moderado', color: 'text-yellow-600' };
    if (uv <= 7) return { level: 'Alto', color: 'text-orange-600' };
    if (uv <= 10) return { level: 'Muito alto', color: 'text-red-600' };
    return { level: 'Extremo', color: 'text-purple-600' };
  };

  const airQuality = getAirQualityStatus(environmentalData?.qualidadeAr);
  const uvAvailable = environmentalData?.uv != null && !Number.isNaN(Number(environmentalData.uv));
  const uvLevel = uvAvailable ? getUVLevel(environmentalData.uv) : null;

  if (!environmentalData) {
    if (loading) return <LoadingScreen message="Carregando dados ambientais…" />;
    return <div className="app-loading" role="alert">
      <p>{dataError || 'Não foi possível carregar os dados ambientais.'}</p>
      <button className="px-5 py-3 rounded-xl bg-eco-600 text-white font-semibold" onClick={() => loadWeather(selectedCity, selectedBairro)}>Tentar novamente</button>
    </div>;
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight">
                Ambiente Global
              </h1>
            </div>
            <p className="text-stone-500 ml-13 flex items-center gap-2">
              <Zap size={16} className="text-blue-500" />
              <span>Monitoramento ambiental em tempo real</span>
            </p>
            {dataError && (
              <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 inline-block">
                {dataError}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400" />
              <span className="text-sm font-medium text-stone-600">
                {lastUpdated ? `Atualizado ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Carregando dados'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Seletor de Localização */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="weather-location-picker bg-white p-4 sm:p-5 rounded-3xl shadow-soft border border-stone-100 mb-8"
        >
          <div className="flex flex-col xl:flex-row xl:items-end gap-4">
            <button
              type="button"
              onClick={() => setShowStateModal(true)}
              className="group flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-stone-100 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-200 transition-all shrink-0"
            >
              <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-left pr-1">
                <div className="text-[11px] font-semibold text-blue-500/80 uppercase tracking-wider">Estado</div>
                <div className="font-bold text-stone-800 leading-tight">{estadoAtual.nome}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-stone-400 ml-auto" />
            </button>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 px-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Cidade
                </span>
                <div className="relative group">
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSelectedBairro((bairrosPorCidade[e.target.value] || ['Centro'])[0]);
                    }}
                    disabled={loading}
                    className="w-full appearance-none bg-stone-50/80 border border-stone-200 text-stone-800 font-semibold pl-4 pr-11 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-eco-500/15 focus:border-eco-500 hover:border-stone-300 transition-all cursor-pointer disabled:opacity-60 shadow-sm"
                  >
                    {estadoAtual.cidades.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none w-7 h-7 rounded-lg bg-white border border-stone-100 flex items-center justify-center text-stone-500 group-focus-within:text-eco-600">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </label>

              <label className="block">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 px-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Bairro
                </span>
                <div className="relative group">
                  <select
                    value={selectedBairro}
                    onChange={(e) => setSelectedBairro(e.target.value)}
                    disabled={loading}
                    className="w-full appearance-none bg-stone-50/80 border border-stone-200 text-stone-800 font-semibold pl-4 pr-11 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-eco-500/15 focus:border-eco-500 hover:border-stone-300 transition-all cursor-pointer disabled:opacity-60 shadow-sm"
                  >
                    {(bairrosPorCidade[selectedCity] || ['Centro']).map((bairro) => (
                      <option key={bairro} value={bairro}>{bairro}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none w-7 h-7 rounded-lg bg-white border border-stone-100 flex items-center justify-center text-stone-500 group-focus-within:text-eco-600">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </label>
            </div>

            <button
              type="button"
              onClick={() => loadWeather(selectedCity, selectedBairro)}
              aria-label={loading ? 'Atualizando clima' : 'Consultar novamente'}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-eco-600 to-teal-600 hover:from-eco-700 hover:to-teal-700 shadow-sm shadow-eco-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98] xl:min-w-[12.5rem]"
            >
              <RefreshCw className={`w-4.5 h-4.5 w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="weather-location-picker__refresh-label">{loading ? 'Atualizando...' : 'Consultar novamente'}</span>
            </button>
          </div>
        </motion.div>

        <WeatherBanner
          data={environmentalData}
          city={displayLocation.city}
          district={displayLocation.district}
          state={displayLocation.state}
          loading={loading}
        />
        <WeatherMetrics
          data={environmentalData}
          airQuality={airQuality}
          uvLevel={uvLevel}
          loading={loading}
        />
        <WeatherForecast
          hours={temperatureHours}
          forecast={forecast}
          temperature={environmentalData.temperatura}
          loading={loading}
        />
      </div>

      {/* Modal de Seleção de Estado */}
      <AnimatePresence>
        {showStateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-7 h-7 text-blue-600" />
                Selecione o Estado
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {estados.map((estado) => (
                  <motion.button
                    key={estado.sigla}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedState(estado.sigla);
                      setSelectedCity(estado.cidades[0]);
                      setSelectedBairro((bairrosPorCidade[estado.cidades[0]] || ['Centro'])[0]);
                      setShowStateModal(false);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedState === estado.sigla
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-bold text-lg text-gray-800">{estado.sigla}</div>
                    <div className="text-sm text-gray-600">{estado.nome}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Environmental;
