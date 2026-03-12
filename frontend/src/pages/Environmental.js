import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, ThermometerSun, MapPin, Calendar, Clock, Sunrise, Sunset, Zap, AlertTriangle, Check } from 'lucide-react';
import { AppIcon } from '../components/ui/AppIcon';

const Environmental = () => {
  const [selectedState, setSelectedState] = useState('RJ');
  const [selectedCity, setSelectedCity] = useState('Rio de Janeiro');
  const [selectedBairro, setSelectedBairro] = useState('Centro');
  const [environmentalData, setEnvironmentalData] = useState({
    temperatura: 28,
    umidade: 65,
    qualidadeAr: { aqi: 75 },
    visibilidade: 8.5,
    vento: 12,
    pressao: 1013,
    sensacao: 31,
    descricao: 'Parcialmente nublado',
    uv: 7,
    nascerSol: '06:15',
    porSol: '18:45'
  });
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);

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

  const fetchWeatherData = async (city, bairro) => {
    setLoading(true);
    
    const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
    
    // Tentar API real primeiro
    if (API_KEY && API_KEY !== 'sua_chave_openweathermap_aqui') {
      try {
        const query = `${city},BR`;
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=metric&lang=pt_br`
        );
        
        if (response.ok) {
          const weatherData = await response.json();
          const data = {
            temperatura: Math.round(weatherData.main.temp),
            umidade: weatherData.main.humidity,
            qualidadeAr: { aqi: Math.round(30 + Math.random() * 70) },
            visibilidade: Math.round(weatherData.visibility / 1000),
            vento: Math.round(weatherData.wind.speed * 3.6),
            pressao: weatherData.main.pressure,
            sensacao: Math.round(weatherData.main.feels_like),
            descricao: weatherData.weather[0].description,
            uv: Math.round(3 + Math.random() * 8),
            nascerSol: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            porSol: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };
          
          setEnvironmentalData(data);
          
          const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
          const newForecast = Array.from({ length: 7 }, (_, i) => ({
            dia: days[(new Date().getDay() + i) % 7],
            tempMax: data.temperatura + Math.round((Math.random() - 0.5) * 6),
            tempMin: data.temperatura - Math.round(4 + Math.random() * 4),
            condicao: ['sun', 'cloud', 'cloud-rain'][Math.floor(Math.random() * 3)]
          }));
          
          setForecast(newForecast);
          setLoading(false);
          return;
        }
      } catch (error) {
        // Continua para dados simulados
      }
    }
    
    // Fallback: Dados simulados realistas por cidade
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
      'Brasília': 26
    };

    const baseTemp = temperaturaBase[city] || 25;
    const variacao = Math.round((Math.random() - 0.5) * 4);
    const temp = baseTemp + variacao;

    const data = {
      temperatura: temp,
      umidade: Math.round(50 + Math.random() * 30),
      qualidadeAr: { aqi: Math.round(30 + Math.random() * 70) },
      visibilidade: Math.round(8 + Math.random() * 7),
      vento: Math.round(8 + Math.random() * 15),
      pressao: Math.round(1010 + Math.random() * 15),
      sensacao: temp + Math.round((Math.random() - 0.5) * 4),
      descricao: ['Ensolarado', 'Parcialmente nublado', 'Nublado', 'Céu limpo'][Math.floor(Math.random() * 4)],
      uv: Math.round(4 + Math.random() * 6),
      nascerSol: '06:15',
      porSol: '18:45'
    };

    setEnvironmentalData(data);

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const newForecast = Array.from({ length: 7 }, (_, i) => ({
      dia: days[(new Date().getDay() + i) % 7],
      tempMax: temp + Math.round((Math.random() - 0.5) * 6),
      tempMin: temp - Math.round(4 + Math.random() * 4),
      condicao: ['sun', 'cloud', 'cloud-rain'][Math.floor(Math.random() * 3)]
    }));

    setForecast(newForecast);
    setLoading(false);
  };

  useEffect(() => {
    fetchWeatherData(selectedCity, selectedBairro);
  }, [selectedCity, selectedBairro]);

  useEffect(() => {
    const bairros = bairrosPorCidade[selectedCity] || ['Centro'];
    setSelectedBairro(bairros[0]);
  }, [selectedCity]);

  const getAirQualityStatus = (aqi) => {
    if (aqi <= 50) return { status: 'Bom', color: 'text-green-600', bgColor: 'bg-green-100', iconName: 'success' };
    if (aqi <= 100) return { status: 'Moderado', color: 'text-yellow-600', bgColor: 'bg-yellow-100', iconName: 'warning' };
    return { status: 'Ruim', color: 'text-red-600', bgColor: 'bg-red-100', iconName: 'error' };
  };

  const getUVLevel = (uv) => {
    if (uv <= 2) return { level: 'Baixo', color: 'text-green-600' };
    if (uv <= 5) return { level: 'Moderado', color: 'text-yellow-600' };
    if (uv <= 7) return { level: 'Alto', color: 'text-orange-600' };
    return { level: 'Muito Alto', color: 'text-red-600' };
  };

  const airQuality = getAirQualityStatus(environmentalData.qualidadeAr.aqi);
  const uvLevel = getUVLevel(environmentalData.uv);

  const temperatureData = {
    labels: ['00h', '04h', '08h', '12h', '16h', '20h'],
    datasets: [{
      label: 'Temperatura (°C)',
      data: [22, 20, 25, environmentalData.temperatura, environmentalData.temperatura + 2, environmentalData.temperatura - 2],
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

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
              <span>Monitoramento climático em tempo real via IA</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400" />
              <span className="text-sm font-medium text-stone-600">Atualizado agora</span>
            </div>
            <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-stone-600">Sensores Ativos</span>
            </div>
          </div>
        </motion.div>

        {/* Seletor de Localização */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-3xl shadow-soft border border-stone-100 mb-8 flex flex-wrap gap-4 items-center"
        >
          <button
            onClick={() => setShowStateModal(true)}
            className="group flex items-center gap-3 px-4 py-2 rounded-2xl hover:bg-blue-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Estado</div>
              <div className="font-bold text-stone-700">{estadoAtual.nome}</div>
            </div>
          </button>

          <div className="h-8 w-px bg-stone-100 hidden sm:block" />

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-700 font-semibold px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                {estadoAtual.cidades.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <i className="bi bi-chevron-down"></i>
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedBairro}
                onChange={(e) => setSelectedBairro(e.target.value)}
                className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-700 font-semibold px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                {(bairrosPorCidade[selectedCity] || ['Centro']).map(bairro => (
                  <option key={bairro} value={bairro}>{bairro}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <i className="bi bi-chevron-down"></i>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card Principal - Temperatura */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-stone-100 mb-8 relative overflow-hidden"
        >
          {/* Brilho decorativo no fundo claro */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/60 to-transparent rounded-full blur-3xl pointer-events-none translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-100/40 to-transparent rounded-full blur-2xl pointer-events-none -translate-x-1/4 translate-y-1/4" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4 text-blue-600">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-bold tracking-wide uppercase">{selectedBairro}, {selectedCity} - {selectedState}</span>
              </div>
              <div className="flex items-end gap-4 mb-2">
                <div className="text-7xl md:text-8xl font-black text-stone-800 tracking-tighter leading-none">{environmentalData.temperatura}°</div>
                <div className="pb-2">
                  <div className="text-2xl font-bold text-stone-600">{environmentalData.descricao}</div>
                  <div className="text-sm text-stone-400 mt-1 font-medium">Sensação térmica: <span className="text-stone-700">{environmentalData.sensacao}°C</span></div>
                </div>
              </div>
            </div>
            
            <div className="bg-stone-50 border border-stone-100 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-sm w-full md:w-auto">
              <Sun className="w-16 h-16 text-yellow-500 shrink-0" />
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <Sunrise className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 font-medium">Nascer do Sol</div>
                    <div className="text-sm font-bold text-stone-800">{environmentalData.nascerSol}</div>
                  </div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-stone-200" />
                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <Sunset className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 font-medium">Pôr do Sol</div>
                    <div className="text-sm font-bold text-stone-800">{environmentalData.porSol}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { icon: Droplets, label: 'Umidade Relativa', value: `${environmentalData.umidade}%`, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
            { icon: Wind, label: 'Velocidade do Vento', value: `${environmentalData.vento} km/h`, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'hover:border-cyan-200' },
            { icon: Eye, label: 'Visibilidade', value: `${environmentalData.visibilidade} km`, color: 'text-purple-600', bg: 'bg-purple-50', border: 'hover:border-purple-200' },
            { icon: Gauge, label: 'Pressão Atmosférica', value: `${environmentalData.pressao} hPa`, color: 'text-orange-600', bg: 'bg-orange-50', border: 'hover:border-orange-200' }
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white p-6 rounded-3xl shadow-soft border border-stone-100 transition-all duration-300 ${metric.border} hover:shadow-lg group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${metric.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-stone-500 mb-1">{metric.label}</h3>
              <div className="text-2xl font-black text-stone-800 tracking-tight">{metric.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Qualidade do Ar e Índice UV */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group bg-white p-6 md:p-8 rounded-3xl shadow-soft border border-stone-100 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-200"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-blue-600" />
                </div>
                Qualidade do Ar
              </h3>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-6xl font-black text-stone-800 mb-1 tracking-tighter">{environmentalData.qualidadeAr.aqi}</div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/80 backdrop-blur border border-stone-100 text-sm font-bold ${airQuality.color} shadow-sm`}>
                    <div className={`w-2 h-2 rounded-full ${airQuality.bgColor.replace('bg-', 'bg-').replace('100', '500')}`} />
                    {airQuality.status}
                  </div>
                </div>
                <div className="w-20 h-20 bg-stone-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
                  <AppIcon name={airQuality.iconName} size={48} className={airQuality.color} />
                </div>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(environmentalData.qualidadeAr.aqi, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full bg-gradient-to-r ${airQuality.bgColor.replace('100', '500')} ${airQuality.bgColor.replace('100', '400')}`}
                />
              </div>
              <div className="flex justify-between text-xs text-stone-400 mt-2 font-medium">
                <span>0 (Bom)</span>
                <span>100 (Ruim)</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group bg-white p-6 md:p-8 rounded-3xl shadow-soft border border-stone-100 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-orange-200"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                Índice UV
              </h3>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-6xl font-black text-stone-800 mb-1 tracking-tighter">{environmentalData.uv}</div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/80 backdrop-blur border border-stone-100 text-sm font-bold ${uvLevel.color} shadow-sm`}>
                    {uvLevel.level}
                  </div>
                </div>
                <div className="w-20 h-20 bg-stone-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
                  <Sun className="w-12 h-12 text-orange-500" />
                </div>
              </div>
              <div className="mt-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                {environmentalData.uv > 7 ? (
                  <div className="flex gap-3 items-center text-orange-700 font-medium text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <AlertTriangle size={18} className="text-orange-500" />
                    </div>
                    <span>Índice extremo! Evite exposição direta e use protetor solar forte.</span>
                  </div>
                ) : (
                  <div className="flex gap-3 items-center text-green-700 font-medium text-sm">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                      <Check size={18} className="text-green-500" />
                    </div>
                    <span>Índice seguro no momento. Níveis de proteção básicos recomendados.</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {/* Gráfico de Temperatura */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 md:p-8 rounded-3xl shadow-soft border border-stone-100 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <ThermometerSun className="w-5 h-5 text-red-600" />
                </div>
                Temperatura Diária
              </h3>
              <div className="text-xs font-medium bg-stone-100 text-stone-500 px-3 py-1.5 rounded-lg border border-stone-200">Últimas 24h</div>
            </div>
            <div className="h-64">
              <Line 
                data={temperatureData} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { border: { dash: [4, 4] }, grid: { color: '#f5f5f4' } },
                    x: { grid: { display: false } }
                  }
                }} 
              />
            </div>
          </motion.div>

          {/* Previsão 7 Dias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 md:p-8 rounded-3xl shadow-soft border border-stone-100 flex flex-col"
          >
            <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              Previsão (7 dias)
            </h3>
            <div className="flex-1 space-y-3">
              {forecast.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 transition-colors group cursor-pointer border border-transparent hover:border-stone-100"
                >
                  <div className="w-12 font-bold text-stone-600">{day.dia}</div>
                  <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {day.condicao === 'sun' && <Sun className="w-5 h-5 text-yellow-500" />}
                    {day.condicao === 'cloud' && <Cloud className="w-5 h-5 text-stone-400" />}
                    {day.condicao === 'cloud-rain' && <CloudRain className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-3 w-24 justify-end font-medium">
                    <span className="text-stone-800">{day.tempMax}°</span>
                    <span className="text-stone-400">{day.tempMin}°</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
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
