const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  cidade: { type: String, required: true },
  ecoPoints: { type: Number, default: 0 },
  nivel: { type: Number, default: 1 },
  badges: [{ type: String }],
  avatar: { type: String, default: '' },
  dataCriacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);