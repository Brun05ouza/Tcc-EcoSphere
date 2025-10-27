const mongoose = require('mongoose');

const dadosAmbientaisSchema = new mongoose.Schema({
  cidade: { type: String, required: true },
  pais: { type: String, required: true },
  temperatura: { type: Number },
  umidade: { type: Number },
  qualidadeAr: {
    aqi: Number,
    pm25: Number,
    pm10: Number,
    co: Number,
    no2: Number,
    o3: Number
  },
  coordenadas: {
    latitude: Number,
    longitude: Number
  },
  fonte: { type: String, required: true }, // API utilizada
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DadosAmbientais', dadosAmbientaisSchema);