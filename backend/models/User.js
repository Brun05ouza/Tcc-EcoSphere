const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  ecoPoints: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    default: 'Iniciante'
  },
  badges: [{
    id: Number,
    name: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  wasteClassifications: [{
    type: String,
    confidence: Number,
    points: Number,
    date: { type: Date, default: Date.now }
  }],
  missions: [{
    id: Number,
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivity: Date
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook', 'github'],
    default: 'local'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);