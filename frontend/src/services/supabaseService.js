import { adminAPI, userAPI, gamificationAPI, wasteAPI } from './api';

export const auth = {
  async signUp({ email, password, name }) {
    const response = await userAPI.register({ email, password, name });
    sessionStorage.setItem('token', response.data.token);
    return { user: response.data.user, session: { access_token: response.data.token } };
  },
  async signIn(email, password) {
    const response = await userAPI.login({ email, password });
    sessionStorage.setItem('token', response.data.token);
    return { user: response.data.user, session: { access_token: response.data.token } };
  },
  async signInWithGoogle() {
    return userAPI.googleLogin();
  },
  async signOut() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
  },
  async getSession() {
    const session = await userAPI.getSession();
    return { data: { session } };
  },
  onAuthStateChange() {
    return { data: { subscription: { unsubscribe() {} } } };
  },
};

export async function getCurrentProfile() {
  const response = await userAPI.getProfile();
  return response.data;
}

export async function getProfile() {
  const response = await userAPI.getProfile();
  return response.data;
}

export async function updateProfile(_userId, data) {
  const response = await userAPI.updateProfile(data);
  return response.data;
}

export async function uploadAvatar(_userId, file) {
  const response = await userAPI.uploadAvatar(file);
  return response.data;
}

export async function addPointsToProfile(_userId, points) {
  const response = await userAPI.addPoints({ points });
  return response.data.user;
}

export async function subtractPointsFromProfile(_userId, points) {
  const response = await userAPI.spendPoints({ points });
  return response.data.user;
}

export async function getGamificationProfile() {
  const response = await gamificationAPI.getProfile();
  return response.data;
}

export async function getRanking() {
  const response = await gamificationAPI.getRanking();
  return response.data;
}

export async function registerAction(_userId, action) {
  const response = await gamificationAPI.registrarAcao(action);
  return response.data;
}

export async function getBadges() {
  const response = await gamificationAPI.getBadges();
  return response.data;
}

export const adminGetAllUsers = () => adminAPI.getAllUsers();
export const adminSetEcoPoints = (userId, points) => adminAPI.setEcoPoints(userId, points);
export const adminToggleAdmin = (userId, isAdmin) => adminAPI.toggleAdmin(userId, isAdmin);
export const adminCreateUser = (email, password, name) => adminAPI.createUser(email, password, name);
export const adminDeleteUser = (userId) => adminAPI.deleteUser(userId);
export const adminGetStats = () => adminAPI.getStats();

export async function saveClassification(_userId, data) {
  const response = await wasteAPI.saveClassification(data);
  return response.data;
}

export async function getClassificationHistory() {
  const response = await wasteAPI.getHistorico();
  return response.data;
}
