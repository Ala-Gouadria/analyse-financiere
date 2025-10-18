import api from './api';

export const projectService = {
  // Créer un nouveau projet
  async createProject(data) {
    const response = await api.post('/projects', data);
    return response.data;
  },

  // Récupérer tous les projets de l'utilisateur
  async getProjects() {
    const response = await api.get('/projects');
    return response.data;
  },

  // Récupérer un projet spécifique
  async getProject(projectId) {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Mettre à jour un projet
  async updateProject(projectId, data) {
    const response = await api.put(`/projects/${projectId}`, data);
    return response.data;
  },

  // Supprimer un projet
  async deleteProject(projectId) {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },

  // Obtenir les statistiques des projets
  async getProjectStats(projectId) {
    const response = await api.get(`/projects/${projectId}/stats`);
    return response.data;
  },

  // Dupliquer un projet
  async duplicateProject(projectId) {
    const response = await api.post(`/projects/${projectId}/duplicate`);
    return response.data;
  }
};