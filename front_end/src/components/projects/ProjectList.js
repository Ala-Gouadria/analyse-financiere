import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import { projectService } from '../../services/projects';
import { useAuth } from '../../context/AuthContext';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filter, setFilter] = useState('all'); // 'all', 'with-data', 'without-data'

  const { user } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await projectService.getProjects();
      setProjects(result.data.projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleSaveProject = (savedProject) => {
    if (editingProject) {
      // Mettre à jour le projet existant
      setProjects(prev => 
        prev.map(p => p.id === savedProject.id ? savedProject : p)
      );
    } else {
      // Ajouter le nouveau projet
      setProjects(prev => [savedProject, ...prev]);
    }
    setShowForm(false);
    setEditingProject(null);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }

    try {
      await projectService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Erreur lors de la suppression du projet');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  // Filtrer et rechercher les projets
  const filteredProjects = projects.filter(project => {
    // Filtre de recherche
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par statut de données
    const matchesFilter = filter === 'all' || 
                         (filter === 'with-data' && project.has_data) ||
                         (filter === 'without-data' && !project.has_data);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: projects.length,
    withData: projects.filter(p => p.has_data).length,
    withoutData: projects.filter(p => !p.has_data).length
  };

  if (loading) {
    return (
      <div className="project-list">
        <div className="loading-container">
          <LoadingSpinner text="Chargement des projets..." />
        </div>
      </div>
    );
  }

  return (
    <div className="project-list">
      {/* En-tête avec statistiques et contrôles */}
      <div className="projects-header">
        <div className="header-content">
          <h1>Mes Projets</h1>
          <p>Gérez vos projets d'analyse financière</p>
        </div>
        
        <Button
          onClick={handleCreateProject}
          icon={<Plus size={16} />}
        >
          Nouveau Projet
        </Button>
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          onClose={() => setError('')}
          onRetry={loadProjects}
        />
      )}

      {/* Statistiques rapides */}
      <div className="projects-stats">
        <Card className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Projets</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value success">{stats.withData}</div>
          <div className="stat-label">Avec Données</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value warning">{stats.withoutData}</div>
          <div className="stat-label">Sans Données</div>
        </Card>
      </div>

      {/* Contrôles de filtrage et recherche */}
      <Card className="projects-controls">
        <div className="controls-row">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="controls-group">
            <div className="filter-group">
              <Filter size={16} />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tous les projets</option>
                <option value="with-data">Avec données</option>
                <option value="without-data">Sans données</option>
              </select>
            </div>

            <div className="view-toggle">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="small"
                onClick={() => setViewMode('grid')}
                icon={<Grid size={16} />}
              >
                Grille
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="small"
                onClick={() => setViewMode('list')}
                icon={<List size={16} />}
              >
                Liste
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Formulaire de création/édition */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          onSave={handleSaveProject}
          onCancel={handleCancelForm}
        />
      )}

      {/* Liste des projets */}
      {filteredProjects.length === 0 ? (
        <Card className="empty-state">
          <div className="empty-content">
            <div className="empty-icon">
              <Plus size={48} />
            </div>
            <h3>Aucun projet trouvé</h3>
            <p>
              {searchTerm || filter !== 'all' 
                ? 'Aucun projet ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre premier projet d\'analyse financière.'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <Button
                onClick={handleCreateProject}
                icon={<Plus size={16} />}
              >
                Créer un projet
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className={`projects-container ${viewMode}`}>
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;