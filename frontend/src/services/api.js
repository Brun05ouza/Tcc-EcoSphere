const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const AUTH_TIMEOUT_MS = 15000;

function getToken() {
  try {
    return sessionStorage.getItem('token') || null;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);
  const token = getToken();

  try {
    const headers = {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const error = new Error(data?.message || 'Erro na requisicao');
      error.status = response.status;
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Tempo esgotado. Verifique se a API local esta rodando em http://localhost:4000.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const environmentalAPI = {
  getDadosAmbientais: async (cidade) => ({ data: { cidade, temperatura: 25, qualidadeAr: 'Boa' } }),
  getCidades: async () => ({ data: ['Sao Paulo', 'Rio de Janeiro', 'Belo Horizonte'] }),
  getAlertas: async () => ({ data: [] }),
};

export const wasteAPI = {
  classifyImage: async (formData) => {
    const url = process.env.REACT_APP_AI_SERVICE_URL;
    if (url) {
      const res = await fetch(`${url}/classify`, { method: 'POST', body: formData });
      const json = await res.json();
      return { data: json };
    }
    return { data: { type: 'Plastico', confidence: 0.85, points: 50 } };
  },
  saveClassification: async (data) => ({ data: await request('/waste/classifications', {
    method: 'POST',
    body: JSON.stringify(data),
  }) }),
  getHistorico: async () => ({ data: await request('/waste/classifications') }),
  registrarDescarte: async (data) => {
    const result = await request('/users/me/points', {
      method: 'POST',
      body: JSON.stringify({ points: data?.points || 50 }),
    });
    return { data: { message: 'Descarte registrado', user: result.user } };
  },
};

export const gamificationAPI = {
  getProfile: async () => ({ data: await request('/gamification/profile') }),
  getRanking: async () => ({ data: await request('/gamification/ranking') }),
  registrarAcao: async (acao) => ({ data: await request('/gamification/actions', {
    method: 'POST',
    body: JSON.stringify(acao),
  }) }),
  getBadges: async () => ({ data: await request('/gamification/badges') }),
};

export const userAPI = {
  login: async (credentials) => ({ data: await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }) }),
  register: async (userData) => ({ data: await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }) }),
  googleLogin: async () => {
    throw new Error('Login com Google precisa ser reconfigurado fora do Supabase.');
  },
  getSession: async () => {
    const token = getToken();
    if (!token) return null;
    const data = await request('/auth/me');
    return { token, user: data.user };
  },
  getProfile: async () => ({ data: await request('/users/me') }),
  updateProfile: async (data) => ({ data: await request('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }) }),
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return { data: await request('/users/me/avatar', {
      method: 'POST',
      body: formData,
    }) };
  },
  addPoints: async (data) => ({ data: await request('/users/me/points', {
    method: 'POST',
    body: JSON.stringify(data),
  }) }),
  spendPoints: async (data) => ({ data: await request('/users/me/spend-points', {
    method: 'POST',
    body: JSON.stringify(data),
  }) }),
};

export const adminAPI = {
  getAllUsers: async () => request('/admin/users'),
  setEcoPoints: async (userId, points) => request(`/admin/users/${userId}/points`, {
    method: 'PATCH',
    body: JSON.stringify({ points }),
  }),
  toggleAdmin: async (userId, isAdmin) => request(`/admin/users/${userId}/admin`, {
    method: 'PATCH',
    body: JSON.stringify({ isAdmin }),
  }),
  createUser: async (email, password, name) => request('/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  }),
  deleteUser: async (userId) => request(`/admin/users/${userId}`, { method: 'DELETE' }),
  getStats: async () => request('/admin/stats'),
};

export default { environmentalAPI, wasteAPI, gamificationAPI, userAPI, adminAPI };
