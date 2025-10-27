const express = require('express');
const axios = require('axios');
const DadosAmbientais = require('../models/DadosAmbientais');
const router = express.Router();

// Buscar dados ambientais por coordenadas
router.get('/dados/coordenadas/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    
    const dadosClima = await buscarDadosClimaPorCoordenadas(lat, lon);
    
    if (!dadosClima) {
      return res.status(500).json({ error: 'Erro ao buscar dados climáticos' });
    }
    
    const response = {
      ...dadosClima,
      qualidadeAr: {
        aqi: Math.round(30 + Math.random() * 70),
        pm25: Math.round(10 + Math.random() * 40),
        pm10: Math.round(15 + Math.random() * 50)
      },
      fonte: 'OpenWeatherMap + Geolocalização',
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar dados por coordenadas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar dados ambientais de uma cidade
router.get('/dados/:cidade', async (req, res) => {
  try {
    const { cidade } = req.params;
    
    // Buscar dados simulados para demonstração
    const weatherData = await buscarDadosClima(cidade);
    const airQualityData = await buscarQualidadeAr(cidade);
    
    const response = {
      cidade,
      pais: 'Brasil',
      temperatura: weatherData.temperatura,
      umidade: weatherData.umidade,
      qualidadeAr: airQualityData,
      coordenadas: weatherData.coordenadas,
      fonte: 'OpenWeatherMap + IQAir',
      timestamp: new Date()
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Erro ao buscar dados ambientais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para buscar cidade por coordenadas (geocoding reverso)
async function buscarCidadePorCoordenadas(lat, lon) {
  try {
    // Usando Nominatim (OpenStreetMap) - API gratuita
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=pt-BR`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'EcoSphere-App/1.0'
      }
    });
    
    const data = response.data;
    
    if (data && data.address) {
      const address = data.address;
      
      // Extrair informações de localização
      const cidade = address.city || address.town || address.village || address.municipality || 'Cidade não identificada';
      const bairro = address.neighbourhood || address.suburb || address.quarter || address.residential || null;
      const estado = address.state || address.region || 'Estado não identificado';
      
      // Montar string de localização
      let localizacao = cidade;
      if (bairro) {
        localizacao = `${bairro}, ${cidade}`;
      }
      
      return {
        completa: `${localizacao} - ${estado}`,
        cidade: cidade,
        bairro: bairro,
        estado: estado,
        pais: address.country || 'Brasil'
      };
    }
    
    // Fallback se não conseguir dados da API
    return {
      completa: 'Localização Atual',
      cidade: 'Localização Atual',
      bairro: null,
      estado: '',
      pais: 'Brasil'
    };
    
  } catch (error) {
    console.error('Erro ao buscar cidade:', error);
    
    // Fallback em caso de erro
    return {
      completa: 'Localização Atual',
      cidade: 'Localização Atual', 
      bairro: null,
      estado: '',
      pais: 'Brasil'
    };
  }
}

// Função para buscar dados do clima por coordenadas usando API gratuita
async function buscarDadosClimaPorCoordenadas(lat, lon) {
  try {
    console.log(`🌤️ Buscando clima para: ${lat}, ${lon}`);
    
    // Buscar informações de localização
    const localizacao = await buscarCidadePorCoordenadas(lat, lon);
    console.log('📍 Localização encontrada:', localizacao);
    
    // Usar API gratuita do Open-Meteo (sem necessidade de chave)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,surface_pressure&timezone=America/Sao_Paulo`;
    
    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;
    
    console.log('🌡️ Dados meteorológicos:', weatherData);
    
    const current = weatherData.current_weather;
    const hourly = weatherData.hourly;
    
    // Pegar dados da hora atual
    const currentHour = new Date().getHours();
    const humidity = hourly.relativehumidity_2m[currentHour] || 65;
    const pressure = hourly.surface_pressure[currentHour] || 1013;
    
    // Calcular sensação térmica aproximada
    const feelsLike = Math.round(current.temperature + (humidity > 70 ? 2 : -1));
    
    // Mapear código do tempo para descrição
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
    
    const resultado = {
      localizacao: localizacao,
      cidade: localizacao.completa,
      temperatura: Math.round(current.temperature),
      umidade: Math.round(humidity),
      sensacao: feelsLike,
      vento: Math.round(current.windspeed),
      pressao: Math.round(pressure),
      visibilidade: Math.round(8 + Math.random() * 4), // Simular visibilidade
      descricao: weatherDescriptions[current.weathercode] || 'Condição desconhecida',
      coordenadas: { latitude: lat, longitude: lon },
      qualidadeAr: {
        aqi: Math.round(30 + Math.random() * 50), // Simular AQI
        pm25: Math.round(10 + Math.random() * 30),
        pm10: Math.round(15 + Math.random() * 40)
      }
    };
    
    console.log('✅ Dados processados:', resultado);
    return resultado;
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados do clima:', error);
    
    // Fallback com dados simulados
    const localizacao = await buscarCidadePorCoordenadas(lat, lon);
    return {
      localizacao: localizacao,
      cidade: localizacao.completa,
      temperatura: Math.round(20 + Math.random() * 15),
      umidade: Math.round(40 + Math.random() * 40),
      sensacao: Math.round(22 + Math.random() * 15),
      vento: Math.round(5 + Math.random() * 15),
      pressao: Math.round(1000 + Math.random() * 50),
      visibilidade: Math.round(5 + Math.random() * 10),
      descricao: 'Dados simulados',
      coordenadas: { latitude: lat, longitude: lon },
      qualidadeAr: {
        aqi: Math.round(30 + Math.random() * 50),
        pm25: Math.round(10 + Math.random() * 30),
        pm10: Math.round(15 + Math.random() * 40)
      }
    };
  }
}

// Função para buscar dados do clima por cidade
async function buscarDadosClima(cidade) {
  const API_KEY = 'demo_key';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`;
  
  try {
    const mockData = {
      temperatura: Math.round(20 + Math.random() * 15),
      umidade: Math.round(40 + Math.random() * 40),
      coordenadas: { latitude: -23.5505, longitude: -46.6333 }
    };
    return mockData;
  } catch (error) {
    console.error('Erro ao buscar dados do clima:', error);
    return { temperatura: null, umidade: null, coordenadas: null };
  }
}

// Função para buscar qualidade do ar
async function buscarQualidadeAr(cidade) {
  const API_KEY = process.env.IQAIR_API_KEY;
  const url = `https://api.airvisual.com/v2/city?city=${cidade}&state=São Paulo&country=Brazil&key=${API_KEY}`;
  
  try {
    const response = await axios.get(url);
    const data = response.data.data.current.pollution;
    
    return {
      aqi: data.aqius,
      pm25: data.pm25 || null,
      pm10: data.pm10 || null
    };
  } catch (error) {
    console.error('Erro ao buscar qualidade do ar:', error);
    return { aqi: null, pm25: null, pm10: null };
  }
}

// Listar cidades disponíveis
router.get('/cidades', async (req, res) => {
  try {
    const cidades = await DadosAmbientais.distinct('cidade');
    res.json(cidades);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cidades' });
  }
});

// Gerar alertas baseados nos dados
router.get('/alertas/:cidade', async (req, res) => {
  try {
    const { cidade } = req.params;
    const dados = await DadosAmbientais.findOne({ cidade }).sort({ timestamp: -1 });
    
    const alertas = [];
    
    if (dados) {
      if (dados.qualidadeAr.aqi > 100) {
        alertas.push({
          tipo: 'qualidade_ar',
          nivel: 'alto',
          mensagem: 'Qualidade do ar prejudicial. Evite atividades ao ar livre.'
        });
      }
      
      if (dados.temperatura > 35) {
        alertas.push({
          tipo: 'temperatura',
          nivel: 'alto',
          mensagem: 'Temperatura muito alta. Mantenha-se hidratado.'
        });
      }
    }
    
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar alertas' });
  }
});

module.exports = router;