import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const environmentalAPI = {
  getDadosAmbientais: (cidade) => api.get(`/environmental/dados/${cidade}`),
  getCidades: () => api.get('/environmental/cidades'),
  getAlertas: (cidade) => api.get(`/environmental/alertas/${cidade}`),
};

export const wasteAPI = {
  classifyImage: (formData) => api.post('/waste/classify', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  saveClassification: (data) => api.post('/waste/classification', data),
  getHistorico: () => api.get('/waste/historico'),
  registrarDescarte: (data) => api.post('/waste/registrar', data),
};

export const gamificationAPI = {
  getProfile: () => api.get('/gamification/profile'),
  getRanking: () => api.get('/gamification/ranking'),
  registrarAcao: (acao) => api.post('/gamification/action', acao),
  getBadges: () => api.get('/gamification/badges'),
};

export const userAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleLogin: (googleData) => api.post('/auth/google', googleData),
  getProfile: (token) => api.get('/users/profile', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateProfile: (data) => api.put('/users/profile', data),
  addPoints: (data) => api.post('/users/points', data),
};

// Interceptor para lidar com respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;