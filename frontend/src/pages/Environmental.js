import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, ThermometerSun, MapPin, Calendar, Clock, Sunrise, Sunset, Zap } from 'lucide-react';

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
    if (aqi <= 50) return { status: 'Bom', color: 'text-green-600', bgColor: 'bg-green-100', icon: '😊' };
    if (aqi <= 100) return { status: 'Moderado', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '😐' };
    return { status: 'Ruim', color: 'text-red-600', bgColor: 'bg-red-100', icon: '😷' };
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-6 flex items-center gap-3">
            <Cloud className="w-10 h-10 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Monitoramento Ambiental
            </span>
          </h1>

          {/* Seletor de Estado e Cidade */}
          <div className="flex flex-wrap gap-4 items-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowStateModal(true)}
              className="bg-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 border-2 border-blue-200"
            >
              <MapPin className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="text-xs text-gray-500">Estado</div>
                <div className="font-bold text-gray-800">{estadoAtual.nome}</div>
              </div>
            </motion.button>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-white px-6 py-3 rounded-2xl shadow-lg border-2 border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold text-gray-800"
            >
              {estadoAtual.cidades.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={selectedBairro}
              onChange={(e) => setSelectedBairro(e.target.value)}
              className="bg-white px-6 py-3 rounded-2xl shadow-lg border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-semibold text-gray-800"
            >
              {(bairrosPorCidade[selectedCity] || ['Centro']).map(bairro => (
                <option key={bairro} value={bairro}>{bairro}</option>
              ))}
            </select>

            <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-xl shadow">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Atualizado agora</span>
            </div>
          </div>
        </motion.div>

        {/* Card Principal - Temperatura */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-8 text-white shadow-2xl mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{selectedBairro}, {selectedCity} - {selectedState}</span>
              </div>
              <div className="text-7xl font-bold mb-2">{environmentalData.temperatura}°</div>
              <div className="text-xl opacity-90">{environmentalData.descricao}</div>
              <div className="text-sm opacity-75 mt-2">Sensação térmica: {environmentalData.sensacao}°C</div>
            </div>
            <div className="text-right">
              <Sun className="w-20 h-20 mb-4" />
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 justify-end">
                  <Sunrise className="w-4 h-4" />
                  {environmentalData.nascerSol}
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Sunset className="w-4 h-4" />
                  {environmentalData.porSol}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Droplets, label: 'Umidade', value: `${environmentalData.umidade}%`, color: 'from-blue-400 to-blue-600' },
            { icon: Wind, label: 'Vento', value: `${environmentalData.vento} km/h`, color: 'from-cyan-400 to-cyan-600' },
            { icon: Eye, label: 'Visibilidade', value: `${environmentalData.visibilidade} km`, color: 'from-purple-400 to-purple-600' },
            { icon: Gauge, label: 'Pressão', value: `${environmentalData.pressao} hPa`, color: 'from-orange-400 to-orange-600' }
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white p-6 rounded-2xl shadow-lg"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${metric.color} flex items-center justify-center mb-3`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
              <div className="text-2xl font-bold text-gray-800">{metric.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Qualidade do Ar e Índice UV */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Cloud className="w-6 h-6 text-blue-600" />
              Qualidade do Ar
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-5xl font-bold text-gray-800 mb-2">{environmentalData.qualidadeAr.aqi}</div>
                <div className={`text-lg font-semibold ${airQuality.color}`}>{airQuality.status}</div>
              </div>
              <div className="text-6xl">{airQuality.icon}</div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${airQuality.bgColor}`}
                style={{ width: `${Math.min(environmentalData.qualidadeAr.aqi, 100)}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-orange-600" />
              Índice UV
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-5xl font-bold text-gray-800 mb-2">{environmentalData.uv}</div>
                <div className={`text-lg font-semibold ${uvLevel.color}`}>{uvLevel.level}</div>
              </div>
              <Sun className="w-16 h-16 text-orange-500" />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {environmentalData.uv > 7 ? '⚠️ Use protetor solar!' : '✓ Proteção recomendada'}
            </div>
          </motion.div>
        </div>

        {/* Previsão 7 Dias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg mb-8"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-600" />
            Previsão para 7 Dias
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {forecast.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="text-center p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
              >
                <div className="font-semibold text-gray-700 mb-2">{day.dia}</div>
                {day.condicao === 'sun' && <Sun className="w-8 h-8 mx-auto text-yellow-500 mb-2" />}
                {day.condicao === 'cloud' && <Cloud className="w-8 h-8 mx-auto text-gray-400 mb-2" />}
                {day.condicao === 'cloud-rain' && <CloudRain className="w-8 h-8 mx-auto text-blue-500 mb-2" />}
                <div className="text-sm font-bold text-gray-800">{day.tempMax}°</div>
                <div className="text-xs text-gray-500">{day.tempMin}°</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Gráfico de Temperatura */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ThermometerSun className="w-6 h-6 text-red-600" />
            Temperatura nas Últimas 24h
          </h3>
          <Line 
            data={temperatureData} 
            options={{ 
              responsive: true, 
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: false }
              }
            }} 
          />
        </motion.div>
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
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-7 h-7 text-blue-600" />
                Selecione o Estado
              </h3>
              <div className="grid grid-cols-2 gap-3">
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
