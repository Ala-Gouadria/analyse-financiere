import api from './api';

export const financialDataService = {
  // Ajouter des données financières
  async addFinancialData(data) {
    const response = await api.post('/projects/:projectId/financial-data', data);
    return response.data;
  },

  // Récupérer les données financières d'un projet
  async getFinancialData(projectId) {
    const response = await api.get(`/projects/${projectId}/financial-data`);
    return response.data;
  },

  // Mettre à jour des données financières
  async updateFinancialData(id, data) {
    const response = await api.put(`/financial-data/${id}`, data);
    return response.data;
  },

  // Supprimer des données financières
  async deleteFinancialData(id) {
    const response = await api.delete(`/financial-data/${id}`);
    return response.data;
  },

  // Obtenir les statistiques financières
  async getFinancialStats(projectId) {
    const response = await api.get(`/projects/${projectId}/financial-stats`);
    return response.data;
  },

  // Importer des données en lot
  async importFinancialData(projectId, data) {
    const response = await api.post(`/projects/${projectId}/financial-data/import`, data);
    return response.data;
  }
};