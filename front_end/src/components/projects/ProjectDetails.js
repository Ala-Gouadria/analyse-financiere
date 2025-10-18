import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  BarChart3, 
  Calendar, 
  TrendingUp,
  FileText,
  Users,
  DollarSign
} from 'lucide-react';
import { projectService } from '../../services/projects';
import { financialDataService } from '../../services/financialData';
import FinancialDataForm from '../financial/FinancialDataForm';
import DataTable from '../financial/DataTable';
import FinancialCharts from '../financial/FinancialCharts';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [financialData, setFinancialData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDataForm, setShowDataForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'data', 'charts', 'analysis'

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [projectResult, financialResult] = await Promise.all([
        projectService.getProject(id),
        financialDataService.getFinancialData(id)
      ]);

      setProject(projectResult.data.project);
      setFinancialData(financialResult.data.financial_data || []);
    } catch (error) {
      console.error('Error loading project details:', error);
      setError('Erreur lors du chargement du projet');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = () => {
    // Navigation vers l'édition du projet
    navigate(`/projects/${id}/edit`);
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
      return;
    }

    try {
      await projectService.deleteProject(id);
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Erreur lors de la suppression du projet');
    }
  };

  const handleAddData = () => {
    setEditingData(null);
    setShowDataForm(true);
  };

  const handleEditData = (data) => {
    setEditingData(data);
    setShowDataForm(true);
  };

  const handleSaveData = (savedData) => {
    if (editingData) {
      // Mettre à jour les données existantes
      setFinancialData(prev => 
        prev.map(item => item.id === savedData.id ? savedData : item)
      );
    } else {
      // Ajouter les nouvelles données
      setFinancialData(prev => [savedData, ...prev]);
    }
    setShowDataForm(false);
    setEditingData(null);
    
    // Recharger les données du projet pour mettre à jour les stats
    loadProjectData();
  };

  const handleCancelDataForm = () => {
    setShowDataForm(false);
    setEditingData(null);
  };

  const calculateProjectStats = () => {
    if (financialData.length === 0) {
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        totalProfit: 0,
        avgProfitMargin: 0,
        dataPoints: 0,
        lastUpdate: null
      };
    }

    const totalRevenue = financialData.reduce((sum, item) => sum + parseFloat(item.revenue), 0);
    const totalExpenses = financialData.reduce((sum, item) => sum + parseFloat(item.expenses), 0);
    const totalProfit = totalRevenue - totalExpenses;
    const avgProfitMargin = financialData.reduce((sum, item) => sum + parseFloat(item.profit_margin), 0) / financialData.length;
    const lastUpdate = financialData[0]?.period;

    return {
      totalRevenue,
      totalExpenses,
      totalProfit,
      avgProfitMargin: Math.round(avgProfitMargin * 100) / 100,
      dataPoints: financialData.length,
      lastUpdate
    };
  };

  if (loading) {
    return (
      <div className="project-details">
        <div className="loading-container">
          <LoadingSpinner text="Chargement du projet..." />
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="project-details">
        <ErrorMessage 
          message={error}
          onClose={() => navigate('/projects')}
          onRetry={loadProjectData}
        />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-details">
        <ErrorMessage 
          message="Projet non trouvé"
          onClose={() => navigate('/projects')}
        />
      </div>
    );
  }

  const stats = calculateProjectStats();

  return (
    <div className="project-details">
      {/* En-tête */}
      <div className="project-header">
        <div className="header-actions">
          <Button
            variant="outline"
            onClick={() => navigate('/projects')}
            icon={<ArrowLeft size={16} />}
          >
            Retour
          </Button>
        </div>

        <div className="project-info">
          <h1>{project.name}</h1>
          {project.description && (
            <p className="project-description">{project.description}</p>
          )}
          <div className="project-meta">
            <span className="meta-item">
              <Calendar size={14} />
              Créé le {new Date(project.created_at).toLocaleDateString('fr-FR')}
            </span>
            <span className="meta-item">
              <BarChart3 size={14} />
              {stats.dataPoints} entrée{stats.dataPoints !== 1 ? 's' : ''} de données
            </span>
          </div>
        </div>

        <div className="header-actions">
          <Button
            variant="outline"
            onClick={handleEditProject}
            icon={<Edit3 size={16} />}
          >
            Modifier
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteProject}
            icon={<Trash2 size={16} />}
          >
            Supprimer
          </Button>
        </div>
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Statistiques rapides */}
      <div className="project-stats-overview">
        <Card className="stat-card">
          <DollarSign size={24} className="stat-icon revenue" />
          <div className="stat-content">
            <div className="stat-value">
              {stats.totalRevenue.toLocaleString('fr-FR', { 
                style: 'currency', 
                currency: 'EUR',
                maximumFractionDigits: 0 
              })}
            </div>
            <div className="stat-label">Revenus totaux</div>
          </div>
        </Card>

        <Card className="stat-card">
          <DollarSign size={24} className="stat-icon expenses" />
          <div className="stat-content">
            <div className="stat-value">
              {stats.totalExpenses.toLocaleString('fr-FR', { 
                style: 'currency', 
                currency: 'EUR',
                maximumFractionDigits: 0 
              })}
            </div>
            <div className="stat-label">Dépenses totales</div>
          </div>
        </Card>

        <Card className="stat-card">
          <TrendingUp size={24} className={`stat-icon ${stats.totalProfit >= 0 ? 'profit' : 'loss'}`} />
          <div className="stat-content">
            <div className={`stat-value ${stats.totalProfit >= 0 ? 'positive' : 'negative'}`}>
              {stats.totalProfit.toLocaleString('fr-FR', { 
                style: 'currency', 
                currency: 'EUR',
                maximumFractionDigits: 0 
              })}
            </div>
            <div className="stat-label">Bénéfice total</div>
          </div>
        </Card>

        <Card className="stat-card">
          <BarChart3 size={24} className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.avgProfitMargin}%</div>
            <div className="stat-label">Marge moyenne</div>
          </div>
        </Card>
      </div>

      {/* Navigation par onglets */}
      <Card className="tabs-navigation">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={16} />
            Aperçu
          </button>
          <button 
            className={`tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <FileText size={16} />
            Données ({stats.dataPoints})
          </button>
          <button 
            className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            <TrendingUp size={16} />
            Graphiques
          </button>
          <button 
            className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            <Users size={16} />
            Analyse IA
          </button>
        </div>
      </Card>

      {/* Contenu des onglets */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            {showDataForm ? (
              <FinancialDataForm
                projectId={id}
                existingData={editingData}
                onSave={handleSaveData}
                onCancel={handleCancelDataForm}
              />
            ) : (
              <>
                {financialData.length === 0 ? (
                  <Card className="empty-data">
                    <div className="empty-content">
                      <BarChart3 size={48} className="empty-icon" />
                      <h3>Aucune donnée financière</h3>
                      <p>Commencez par ajouter vos premières données financières pour analyser votre projet.</p>
                      <Button
                        onClick={handleAddData}
                        icon={<Plus size={16} />}
                      >
                        Ajouter des données
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <>
                    <div className="overview-actions">
                      <Button
                        onClick={handleAddData}
                        icon={<Plus size={16} />}
                      >
                        Ajouter des données
                      </Button>
                      
                      <Button
                        variant="outline"
                        as={Link}
                        to={`/analysis?project=${id}`}
                        icon={<TrendingUp size={16} />}
                      >
                        Lancer l'analyse IA
                      </Button>
                    </div>

                    <FinancialCharts
                      financialData={financialData}
                      projectId={id}
                    />

                    <DataTable
                      financialData={financialData.slice(0, 5)} // Afficher seulement les 5 dernières
                      projectId={id}
                      onEdit={handleEditData}
                      onRefresh={loadProjectData}
                    />

                    {financialData.length > 5 && (
                      <div className="view-all-container">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('data')}
                        >
                          Voir toutes les données ({financialData.length})
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="data-content">
            <div className="data-header">
              <h3>Gestion des données financières</h3>
              <Button
                onClick={handleAddData}
                icon={<Plus size={16} />}
              >
                Ajouter des données
              </Button>
            </div>

            {showDataForm && (
              <FinancialDataForm
                projectId={id}
                existingData={editingData}
                onSave={handleSaveData}
                onCancel={handleCancelDataForm}
              />
            )}

            <DataTable
              financialData={financialData}
              projectId={id}
              onEdit={handleEditData}
              onRefresh={loadProjectData}
            />
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="charts-content">
            <FinancialCharts
              financialData={financialData}
              projectId={id}
            />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="analysis-content">
            <Card className="analysis-promo">
              <div className="promo-content">
                <TrendingUp size={48} className="promo-icon" />
                <h3>Analyse IA Avancée</h3>
                <p>
                  Utilisez notre intelligence artificielle pour analyser vos données financières 
                  et obtenir des insights détaillés sur les risques, opportunités et recommandations.
                </p>
                <Button
                  as={Link}
                  to={`/analysis?project=${id}`}
                  icon={<TrendingUp size={16} />}
                  size="large"
                >
                  Lancer l'analyse Gemini AI
                </Button>
              </div>
            </Card>

            {/* Dernières analyses */}
            <div className="recent-analysis">
              <h4>Analyses récentes</h4>
              <p>Aucune analyse récente. Lancez votre première analyse !</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;