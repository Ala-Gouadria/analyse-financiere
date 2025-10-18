import api from './api';

export const reportsService = {
  // Exporter les données financières
  async exportFinancialData(data) {
    const response = await api.post('/reports/export-financial-data', data, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Exporter un rapport d'analyse
  async exportAnalysisReport(data) {
    const response = await api.post('/reports/export-analysis', data, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Générer un rapport de performance
  async generatePerformanceReport(data) {
    const response = await api.post('/reports/performance', data);
    return response.data;
  }
};