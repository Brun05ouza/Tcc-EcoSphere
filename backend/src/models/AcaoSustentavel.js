const mongoose = require('mongoose');

const acaoSustentavelSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { 
    type: String, 
    enum: ['reciclagem', 'economia_energia', 'plantio', 'transporte_sustentavel', 'reducao_agua'],
    required: true 
  },
  descricao: { type: String, required: true },
  pontosGanhos: { type: Number, required: true },
  localizacao: {
    latitude: Number,
    longitude: Number,
    cidade: String
  },
  imagem: { type: String },
  dataAcao: { type: Date, default: Date.now },
  verificada: { type: Boolean, default: false }
});

module.exports = mongoose.model('AcaoSustentavel', acaoSustentavelSchema);