import api from './api';

export const authService = {
  // Connexion
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Inscription
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Récupérer le profil utilisateur
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Mettre à jour le profil
  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Déconnexion (gérée côté client)
  logout() {
    localStorage.removeItem('token');
    // Redirection gérée par le contexte
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Récupérer le token
  getToken() {
    return localStorage.getItem('token');
  }
};