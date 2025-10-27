import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Line, Doughnut } from 'react-chartjs-2';
import { useEscapeKey } from '../hooks/useEnterKey';
// Usando Font Awesome via CDN
import 'leaflet/dist/leaflet.css';

const Environmental = () => {
  const [selectedCity, setSelectedCity] = useState('São Paulo');
  const [environmentalData, setEnvironmentalData] = useState({
    temperatura: 28,
    umidade: 65,
    qualidadeAr: { aqi: 75 },
    visibilidade: 8.5,
    vento: 12,
    pressao: 1013,
    sensacao: 31,
    descricao: 'Carregando...'
  });
  const [location, setLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showCepModal, setShowCepModal] = useState(false);
  const [cepInput, setCepInput] = useState('');
  const [cepLoading, setCepLoading] = useState(false);

  // Fechar modais com Escape
  useEscapeKey(() => {
    if (showCepModal) setShowCepModal(false);
    if (showPermissionModal) setShowPermissionModal(false);
  }, [showCepModal, showPermissionModal]);

  const cities = ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza'];

  // Função para solicitar permissão de localização
  const requestLocationPermission = () => {
    setShowPermissionModal(true);
  };

  // Função para obter localização do usuário com múltiplas tentativas
  const getCurrentLocation = () => {
    console.log('🌍 Iniciando geolocalização...');
    setShowPermissionModal(false);
    setLoading(true);
    
    if (!navigator.geolocation) {
      console.log('❌ Geolocalização não suportada');
      alert('Geolocalização não suportada pelo navegador.');
      setLoading(false);
      return;
    }

    console.log('✅ Geolocalização suportada');
    
    // Primeira tentativa com alta precisão
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`📍 Coordenadas obtidas: ${latitude}, ${longitude} (precisão: ${accuracy}m)`);
        
        setLocation({ latitude, longitude, accuracy });
        await fetchWeatherByCoordinates(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.warn('⚠️ Primeira tentativa falhou, tentando com menor precisão...');
        
        // Segunda tentativa com menor precisão
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(`📍 Coordenadas (2ª tentativa): ${latitude}, ${longitude} (precisão: ${accuracy}m)`);
            
            setLocation({ latitude, longitude, accuracy });
            await fetchWeatherByCoordinates(latitude, longitude);
            setLoading(false);
          },
          (error2) => {
            console.error('❌ Erro ao obter localização:', error2);
            setLoading(false);
            
            let errorMessage = 'Não foi possível obter sua localização.';
            switch(error2.code) {
              case error2.PERMISSION_DENIED:
                errorMessage = 'Permissão negada. Verifique as configurações de localização do navegador.';
                break;
              case error2.POSITION_UNAVAILABLE:
                errorMessage = 'Localização indisponível. Tente novamente ou use o botão de teste.';
                break;
              case error2.TIMEOUT:
                errorMessage = 'Tempo limite excedido. Sua conexão pode estar lenta.';
                break;
            }
            
            alert(errorMessage + '\n\nDica: Use o botão "Testar Teresópolis" para simular sua localização.');
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000
      }
    );
  };

  // Função para buscar localização por CEP
  const fetchLocationByCep = async (cep) => {
    try {
      setCepLoading(true);
      
      const cleanCep = cep.replace(/\D/g, '');
      
      if (cleanCep.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }
      
      // Buscar dados do CEP via ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro na consulta do CEP');
      }
      
      const data = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }
      
      // Múltiplas tentativas de busca de coordenadas
      const searchQueries = [
        `${data.localidade}, ${data.uf}, Brasil`,
        `${data.bairro}, ${data.localidade}, ${data.uf}`,
        `${data.logradouro}, ${data.localidade}, ${data.uf}`,
        `${data.localidade}, ${data.uf}`
      ].filter(q => q && !q.includes('undefined') && !q.includes('null'));
      
      let coordinates = null;
      
      for (const query of searchQueries) {
        try {
          const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=pt-BR`, {
            headers: { 'User-Agent': 'EcoSphere-App/1.0' }
          });
          
          const geoData = await geoResponse.json();
          
          if (geoData.length > 0) {
            coordinates = {
              lat: parseFloat(geoData[0].lat),
              lon: parseFloat(geoData[0].lon)
            };
            break;
          }
        } catch (geoError) {
          console.warn('Tentativa de geocodificação falhou:', query);
          continue;
        }
      }
      
      if (!coordinates) {
        // Fallback: usar coordenadas aproximadas baseadas na cidade
        const cityCoords = {
          'Rio de Janeiro': { lat: -22.9068, lon: -43.1729 },
          'São Paulo': { lat: -23.5505, lon: -46.6333 },
          'Teresópolis': { lat: -22.4144, lon: -42.9664 },
          'Brasília': { lat: -15.7942, lon: -47.8822 },
          'Salvador': { lat: -12.9714, lon: -38.5014 }
        };
        
        coordinates = cityCoords[data.localidade] || { lat: -23.5505, lon: -46.6333 };
        console.warn('Usando coordenadas aproximadas para:', data.localidade);
      }
      
      // Buscar dados meteorológicos
      await fetchWeatherByCoordinates(coordinates.lat, coordinates.lon);
      
      // Atualizar localização
      const locationName = data.bairro ? 
        `${data.bairro}, ${data.localidade} - ${data.uf}` : 
        `${data.localidade} - ${data.uf}`;
      
      setCurrentLocation({
        completa: locationName,
        detalhes: {
          cidade: data.localidade,
          bairro: data.bairro || null,
          estado: data.uf,
          coordenadas: `${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`,
          precisao: 'CEP',
          cep: cleanCep
        }
      });
      
      setShowCepModal(false);
      setCepInput('');
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert(`Erro: ${error.message}\n\nTente novamente ou use outro CEP.`);
    } finally {
      setCepLoading(false);
    }
  };

  // Função para buscar cidade por coordenadas
  const fetchLocationName = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=pt-BR`, {
        headers: {
          'User-Agent': 'EcoSphere-App/1.0'
        }
      });
      
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        const cidade = address.city || address.town || address.village || address.municipality || 'Cidade não identificada';
        const bairro = address.neighbourhood || address.suburb || address.quarter || address.residential || null;
        const estado = address.state || address.region || 'Estado não identificado';
        
        // Melhorar detecção de bairro com múltiplas opções
        const bairroDetectado = address.neighbourhood || 
                              address.suburb || 
                              address.quarter || 
                              address.residential || 
                              address.hamlet || 
                              address.village_part || 
                              null;
        
        return {
          completa: bairroDetectado ? `${bairroDetectado}, ${cidade} - ${estado}` : `${cidade} - ${estado}`,
          cidade: cidade,
          bairro: bairroDetectado,
          estado: estado,
          coordenadas: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          precisao: 'GPS'
        };
      }
      
      return {
        completa: 'Localização Atual',
        cidade: 'Localização Atual',
        bairro: null,
        estado: ''
      };
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
      return {
        completa: 'Localização Atual',
        cidade: 'Localização Atual',
        bairro: null,
        estado: ''
      };
    }
  };

  // Função para buscar dados por coordenadas
  const fetchWeatherByCoordinates = async (lat, lon) => {
    try {
      console.log(`🌤️ Buscando dados para: ${lat}, ${lon}`);
      
      // Buscar localização
      const locationData = await fetchLocationName(lat, lon);
      console.log('📍 Localização:', locationData);
      
      // Buscar dados meteorológicos da API Open-Meteo (gratuita)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,surface_pressure&timezone=auto`;
      
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();
      
      console.log('🌡️ Dados meteorológicos:', weatherData);
      
      const current = weatherData.current_weather;
      const hourly = weatherData.hourly;
      
      // Pegar dados da hora atual
      const currentHour = new Date().getHours();
      const humidity = hourly.relativehumidity_2m[currentHour] || 65;
      const pressure = hourly.surface_pressure[currentHour] || 1013;
      
      // Calcular sensação térmica
      const feelsLike = Math.round(current.temperature + (humidity > 70 ? 2 : -1));
      
      // Mapear código do tempo
      const weatherDescriptions = {
        0: 'Céu limpo',
        1: 'Principalmente limpo',
        2: 'Parcialmente nublado',
        3: 'Nublado',
        45: 'Neblina',
        48: 'Geada',
        51: 'Garoa leve',
        61: 'Chuva leve',
        80: 'Pancadas de chuva'
      };
      
      const newData = {
        temperatura: Math.round(current.temperature),
        umidade: Math.round(humidity),
        qualidadeAr: {
          aqi: Math.round(30 + Math.random() * 50)
        },
        visibilidade: Math.round(8 + Math.random() * 4),
        vento: Math.round(current.windspeed),
        pressao: Math.round(pressure),
        sensacao: feelsLike,
        descricao: weatherDescriptions[current.weathercode] || 'Condição desconhecida'
      };
      
      setEnvironmentalData(newData);
      
      setCurrentLocation({
        completa: locationData.completa,
        detalhes: locationData
      });
      
      generateAlerts(newData);
      setLastUpdate(new Date());
      setLoading(false);
      console.log('✅ Dados atualizados com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
      
      // Fallback com dados simulados
      const locationData = await fetchLocationName(lat, lon);
      
      const fallbackData = {
        temperatura: Math.round(20 + Math.random() * 15),
        umidade: Math.round(40 + Math.random() * 40),
        qualidadeAr: {
          aqi: Math.round(30 + Math.random() * 50)
        },
        visibilidade: Math.round(5 + Math.random() * 10),
        vento: Math.round(5 + Math.random() * 15),
        pressao: Math.round(1000 + Math.random() * 50),
        sensacao: Math.round(22 + Math.random() * 15),
        descricao: 'Dados simulados'
      };
      
      setEnvironmentalData(fallbackData);
      
      setCurrentLocation({
        completa: locationData.completa,
        detalhes: locationData
      });
      
      generateAlerts(fallbackData);
      setLastUpdate(new Date());
      setLoading(false);
      
      console.log('⚠️ Usando dados simulados devido ao erro');
    }
  };

  // Função para buscar dados por cidade
  const fetchWeatherByCity = async (city) => {
    try {
      console.log(`🏙️ Buscando dados para cidade: ${city}`);
      setLoading(true);
      
      // Dados simulados realistas por cidade
      const cityData = {
        'São Paulo': { temp: 23, humidity: 65, desc: 'Parcialmente nublado' },
        'Rio de Janeiro': { temp: 28, humidity: 75, desc: 'Ensolarado' },
        'Brasília': { temp: 25, humidity: 45, desc: 'Céu limpo' },
        'Salvador': { temp: 30, humidity: 80, desc: 'Quente e úmido' },
        'Fortaleza': { temp: 29, humidity: 70, desc: 'Ensolarado' }
      };
      
      const baseData = cityData[city] || { temp: 24, humidity: 60, desc: 'Parcialmente nublado' };
      
      const data = {
        temperatura: baseData.temp + Math.round((Math.random() - 0.5) * 4),
        umidade: baseData.humidity + Math.round((Math.random() - 0.5) * 10),
        qualidadeAr: {
          aqi: Math.round(40 + Math.random() * 40)
        },
        visibilidade: Math.round(8 + Math.random() * 4),
        vento: Math.round(8 + Math.random() * 8),
        pressao: Math.round(1010 + Math.random() * 10),
        sensacao: baseData.temp + Math.round((Math.random() - 0.5) * 6),
        descricao: baseData.desc
      };
      
      setEnvironmentalData(data);
      
      // Limpar localização atual quando usar cidade
      setCurrentLocation(null);
      
      generateAlerts(data);
      setLastUpdate(new Date());
      setLoading(false);
      console.log('✅ Dados da cidade atualizados:', data);
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados da cidade:', error);
      setLoading(false);
    }
  };

  // Função para gerar alertas
  const generateAlerts = (data) => {
    const newAlerts = [];
    
    if (data.qualidadeAr?.aqi > 100) {
      newAlerts.push({
        type: 'warning',
        message: 'Qualidade do ar prejudicial - evite atividades ao ar livre',
        level: 'Alto'
      });
    } else if (data.qualidadeAr?.aqi > 50) {
      newAlerts.push({
        type: 'warning',
        message: 'Qualidade do ar moderada - evite exercícios intensos ao ar livre',
        level: 'Médio'
      });
    }
    
    if (data.temperatura > 35) {
      newAlerts.push({
        type: 'warning',
        message: 'Temperatura muito alta - mantenha-se hidratado e evite exposição prolongada ao sol',
        level: 'Alto'
      });
    }
    
    setAlerts(newAlerts);
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchWeatherByCity(selectedCity);
  }, []);

  // Atualizar quando cidade mudar
  useEffect(() => {
    if (selectedCity) {
      fetchWeatherByCity(selectedCity);
    }
  }, [selectedCity]);
  
  const temperatureData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [{
      label: 'Temperatura (°C)',
      data: [22, 20, 25, environmentalData.temperatura, environmentalData.temperatura + 2, environmentalData.temperatura - 2],
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4
    }]
  };

  const airQualityData = {
    labels: ['Bom', 'Moderado', 'Prejudicial'],
    datasets: [{
      data: [30, 45, 25],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
    }]
  };

  const getAirQualityStatus = (aqi) => {
    if (aqi <= 50) return { status: 'Bom', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (aqi <= 100) return { status: 'Moderado', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'Prejudicial', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const airQualityStatus = getAirQualityStatus(environmentalData.qualidadeAr?.aqi || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
              🌡️ Monitoramento Ambiental
            </h1>
            
            {currentLocation && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <i className="bi bi-geo-alt-fill"></i>
                  <div className="text-right">
                    <div className="font-semibold text-sm">{currentLocation.completa}</div>
                    {currentLocation.detalhes?.bairro && (
                      <div className="text-xs opacity-90">
                        {currentLocation.detalhes.bairro}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            >
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={requestLocationPermission}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-lg"
              >
                {loading ? (
                  <>
                    <i className="bi bi-arrow-clockwise animate-spin"></i>
                    Detectando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-geo-alt-fill"></i>
                    Minha Localização
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log('🧪 Teste: Simulando Teresópolis, Várzea');
                  setLoading(true);
                  setTimeout(() => {
                    fetchWeatherByCoordinates(-22.4144, -42.9664);
                  }, 500);
                }}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-lg"
              >
                {loading ? (
                  <>
                    <i className="bi bi-arrow-clockwise animate-spin"></i>
                    Carregando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-play-fill"></i>
                    Testar Teresópolis
                  </>
                )}
              </motion.button>
              
              {currentLocation && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCepModal(true)}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
                >
                  <i className="bi bi-geo-alt"></i>
                  Corrigir por CEP
                </motion.button>
              )}
            </div>
            
            <div className="text-gray-600">
              {loading ? (
                <div className="flex items-center gap-2">
                  <i className="bi bi-arrow-clockwise animate-spin text-blue-600"></i>
                  <span className="font-medium">Detectando localização...</span>
                </div>
              ) : currentLocation ? (
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <i className="bi bi-geo-alt-fill text-green-600"></i>
                    {currentLocation.completa}
                  </div>
                  <div className="text-sm">
                    GPS ativo • Atualizado {lastUpdate.toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <i className="bi bi-building text-gray-500"></i>
                    {selectedCity}
                  </div>
                  <div className="text-sm">Cidade selecionada • Atualizado {lastUpdate.toLocaleTimeString()}</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-xl">
              <div className="flex items-center mb-2">
                <i className="bi bi-exclamation-triangle-fill text-orange-600 mr-2 text-lg"></i>
                <h3 className="font-semibold text-orange-800">Alertas Ambientais</h3>
              </div>
              {alerts.map((alert, index) => (
                <div key={index} className="text-orange-700 text-sm mb-1">
                  • {alert.message} (Nível: {alert.level})
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[
            { icon: "bi bi-thermometer-sun", emoji: "🌡️", title: "Temperatura", value: `${environmentalData.temperatura}°C`, subtitle: `Sensação: ${environmentalData.sensacao}°C`, color: "from-red-500 to-orange-500" },
            { icon: "bi bi-cloud-haze", emoji: "💨", title: "Qualidade do Ar", value: airQualityStatus.status, subtitle: `AQI: ${environmentalData.qualidadeAr?.aqi || 0}`, color: "from-blue-500 to-cyan-500" },
            { icon: "bi bi-droplet-fill", emoji: "💧", title: "Umidade", value: `${environmentalData.umidade}%`, subtitle: environmentalData.umidade > 70 ? 'Alta' : environmentalData.umidade > 40 ? 'Normal' : 'Baixa', color: "from-blue-400 to-blue-600" },
            { icon: "bi bi-wind", emoji: "💨", title: "Vento", value: `${environmentalData.vento} km/h`, subtitle: environmentalData.vento > 20 ? 'Forte' : 'Fraco', color: "from-purple-500 to-pink-500" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 text-xl opacity-20">{stat.emoji}</div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                <i className={`${stat.icon} text-xl text-white`}></i>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
              <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.subtitle}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Temperature Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <i className="bi bi-graph-up text-red-600 mr-2 text-xl"></i>
              Temperatura nas Últimas 24h
            </h3>
            <Line data={temperatureData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </motion.div>

          {/* Air Quality Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <i className="bi bi-pie-chart-fill text-blue-600 mr-2 text-xl"></i>
              Distribuição Qualidade do Ar
            </h3>
            <Doughnut data={airQualityData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
          </motion.div>
        </div>

        {/* Location Details */}
        {currentLocation && currentLocation.detalhes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200 mb-8"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center text-green-700">
              <i className="bi bi-geo-alt-fill mr-2"></i>
              Sua Localização Atual
              {currentLocation.detalhes?.cep && (
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                  Alterado por CEP
                </span>
              )}
            </h3>
            
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <i className="bi bi-building text-blue-600"></i>
                <div>
                  <div className="font-medium">Cidade</div>
                  <div className="text-gray-600">{currentLocation.detalhes.cidade}</div>
                </div>
              </div>
              
              {currentLocation.detalhes.bairro && (
                <div className="flex items-center gap-2">
                  <i className="bi bi-house text-green-600"></i>
                  <div>
                    <div className="font-medium">Bairro</div>
                    <div className="text-gray-600">{currentLocation.detalhes.bairro}</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <i className="bi bi-map text-purple-600"></i>
                <div>
                  <div className="font-medium">Estado</div>
                  <div className="text-gray-600">{currentLocation.detalhes.estado}</div>
                </div>
              </div>
              
              {currentLocation.detalhes.cep && (
                <div className="flex items-center gap-2">
                  <i className="bi bi-mailbox text-orange-600"></i>
                  <div>
                    <div className="font-medium">CEP</div>
                    <div className="text-gray-600 font-mono">{currentLocation.detalhes.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-white/50 rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center text-green-700">
                  <i className="bi bi-check-circle-fill mr-2"></i>
                  Localização detectada via {currentLocation.detalhes?.precisao || 'GPS'}
                  {currentLocation.detalhes?.precisao === 'CEP' && (
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                      Precisa
                    </span>
                  )}
                </div>
                {currentLocation.detalhes?.coordenadas && (
                  <div className="text-gray-500">
                    {currentLocation.detalhes.coordenadas}
                  </div>
                )}
              </div>
              
              {location?.accuracy && (
                <div className="mt-2 text-xs text-gray-600">
                  Precisão: ±{Math.round(location.accuracy)}m
                  {location.accuracy > 100 && (
                    <span className="text-orange-600 ml-2">
                      ⚠️ Baixa precisão - use o botão "Corrigir" se necessário
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Current Weather Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-6 rounded-2xl shadow-lg mb-8"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <i className="bi bi-cloud-sun text-blue-600 mr-2 text-xl"></i>
            Condições Atuais
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <i className="bi bi-speedometer2 text-2xl text-gray-600 mb-2 block"></i>
              <div className="text-lg font-bold">{environmentalData.pressao} hPa</div>
              <div className="text-sm text-gray-600">Pressão</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <i className="bi bi-eye text-2xl text-gray-600 mb-2 block"></i>
              <div className="text-lg font-bold">{environmentalData.visibilidade} km</div>
              <div className="text-sm text-gray-600">Visibilidade</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <i className="bi bi-thermometer text-2xl text-gray-600 mb-2 block"></i>
              <div className="text-lg font-bold">{environmentalData.sensacao}°C</div>
              <div className="text-sm text-gray-600">Sensação Térmica</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <i className="bi bi-cloud text-2xl text-gray-600 mb-2 block"></i>
              <div className="text-lg font-bold">{environmentalData.descricao}</div>
              <div className="text-sm text-gray-600">Condição</div>
            </div>
          </div>
        </motion.div>

        {/* Environmental Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-green-600 to-blue-600 p-8 rounded-2xl text-white"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <i className="bi bi-lightbulb-fill text-2xl mr-2"></i>
            Dicas Baseadas no Clima Atual
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { 
                icon: environmentalData.temperatura > 30 ? "🌡️" : "🌤️", 
                title: environmentalData.temperatura > 30 ? "Temperatura Alta" : "Temperatura Agradável", 
                tip: environmentalData.temperatura > 30 ? "Use roupas leves e mantenha-se hidratado" : "Aproveite para atividades ao ar livre" 
              },
              { 
                icon: environmentalData.qualidadeAr?.aqi > 100 ? "😷" : "🍃", 
                title: "Qualidade do Ar", 
                tip: environmentalData.qualidadeAr?.aqi > 100 ? "Evite exercícios intensos ao ar livre" : "Qualidade do ar boa para atividades externas" 
              },
              { 
                icon: environmentalData.umidade > 70 ? "💧" : "☀️", 
                title: "Umidade", 
                tip: environmentalData.umidade > 70 ? "Alta umidade - mantenha ambientes ventilados" : "Umidade baixa - hidrate-se bem" 
              }
            ].map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm p-4 rounded-xl"
              >
                <div className="text-2xl mb-2">{tip.icon}</div>
                <h4 className="font-semibold mb-2">{tip.title}</h4>
                <p className="text-sm text-white/80">{tip.tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Modal de Correção por CEP */}
        {showCepModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCepModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="bi bi-geo-alt-fill text-2xl text-orange-600"></i>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Corrigir Localização
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Digite seu CEP para obter a localização exata e dados meteorológicos precisos da sua região.
                </p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    CEP (apenas números)
                  </label>
                  <input
                    type="text"
                    value={cepInput.length === 8 ? cepInput.replace(/(\d{5})(\d{3})/, '$1-$2') : cepInput}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 8) {
                        setCepInput(value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && cepInput.length === 8 && !cepLoading) {
                        fetchLocationByCep(cepInput);
                      }
                    }}
                    placeholder="12345-678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg font-mono"
                    maxLength="9"
                    autoFocus
                  />
                  {cepInput.length > 0 && cepInput.length < 8 && (
                    <p className="text-sm text-red-500 mt-1">CEP deve ter 8 dígitos</p>
                  )}
                  {cepInput.length === 8 && (
                    <p className="text-sm text-green-600 mt-1">✓ Pressione Enter para buscar</p>
                  )}
                </div>
                
                <div className="bg-orange-50 p-3 rounded-xl mb-6">
                  <div className="text-sm text-orange-700">
                    <strong>Exemplos válidos:</strong>
                    <div className="mt-1 text-xs">
                      • 01310-100 (São Paulo, SP)<br/>
                      • 20040-020 (Rio de Janeiro, RJ)<br/>
                      • 25953-360 (Teresópolis, RJ)
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCepModal(false);
                      setCepInput('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={cepLoading}
                  >
                    Cancelar
                  </button>
                  
                  <button
                    onClick={() => fetchLocationByCep(cepInput)}
                    disabled={cepInput.length !== 8 || cepLoading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cepLoading ? (
                      <>
                        <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                        Buscando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search mr-2"></i>
                        Buscar
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center text-sm text-green-700">
                    <i className="bi bi-shield-check mr-2"></i>
                    Seus dados são usados apenas para localização
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Modal de Permissão de Localização */}
        {showPermissionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPermissionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="bi bi-geo-alt-fill text-2xl text-blue-600"></i>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Permitir Acesso à Localização?
                </h3>
                
                <p className="text-gray-600 mb-6">
                  O EcoSphere precisa acessar sua localização para fornecer dados meteorológicos precisos da sua região, incluindo cidade e bairro.
                </p>
                
                <div className="bg-blue-50 p-3 rounded-xl mb-4">
                  <div className="text-sm text-blue-700">
                    <strong>O que detectamos:</strong>
                    <ul className="mt-1 text-xs">
                      <li>• Cidade e bairro exatos</li>
                      <li>• Dados meteorológicos locais</li>
                      <li>• Alertas ambientais personalizados</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPermissionModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    onClick={getCurrentLocation}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    Permitir
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center text-sm text-green-700">
                    <i className="bi bi-shield-check mr-2"></i>
                    Sua localização é usada apenas para dados meteorológicos
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Environmental;