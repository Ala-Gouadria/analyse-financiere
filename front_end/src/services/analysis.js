import api from './api';

export const analysisService = {
  // Analyser les données financières
  async analyzeFinancialData(data) {
    const response = await api.post('/analysis/analyze', data);
    return response.data;
  },

  // Obtenir l'historique des analyses d'un projet
  async getAnalysisHistory(projectId) {
    const response = await api.get(`/analysis/project/${projectId}`);
    return response.data;
  },

  // Obtenir une analyse spécifique
  async getAnalysis(analysisId) {
    const response = await api.get(`/analysis/${analysisId}`);
    return response.data;
  },

  // Simulation d'analyse (scénarios hypothétiques)
  async simulateAnalysis(data) {
    const response = await api.post('/analysis/simulate', data);
    return response.data;
  },

  // Obtenir les tendances
  async getTrends(projectId, period) {
    const response = await api.get(`/analysis/trends/${projectId}`, {
      params: { period }
    });
    return response.data;
  }
};