import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Play,
  Download,
  Clock
} from 'lucide-react';
import { analysisService } from '../../services/analysis';
import { projectService } from '../../services/projects';
import RiskIndicator from './RiskIndicator';
import AnalysisResults from './AnalysisResults';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../common/LoadingSpinner';

const AnalysisDashboard = ({ projectId }) => {
  const [analyses, setAnalyses] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analysesData, projectData] = await Promise.all([
        analysisService.getAnalysisHistory(projectId),
        projectService.getProject(projectId)
      ]);
      setAnalyses(analysesData.data.analyses || []);
      setProject(projectData.data.project);
    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const result = await analysisService.analyzeFinancialData({ projectId });
      setAnalyses(prev => [result.data.analysis, ...prev]);
      setSelectedAnalysis(result.data.analysis);
    } catch (error) {
      console.error('Error during analysis:', error);
      alert('Erreur lors de l\'analyse: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskStats = () => {
    const stats = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    analyses.forEach(analysis => {
      if (stats[analysis.risk_level] !== undefined) {
        stats[analysis.risk_level]++;
      }
    });

    return stats;
  };

  if (loading) return <LoadingSpinner />;

  const riskStats = getRiskStats();
  const latestAnalysis = analyses[0];

  return (
    <div className="analysis-dashboard">
      {/* Header avec métriques */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Analyse Financière</h1>
          <p>{project?.name} - Dernière analyse: {latestAnalysis ? new Date(latestAnalysis.analysis_date).toLocaleDateString('fr-FR') : 'Aucune'}</p>
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={analyzing}
          icon={analyzing ? <LoadingSpinner size="small" /> : <Play size={16} />}
        >
          {analyzing ? 'Analyse en cours...' : 'Lancer l\'analyse'}
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon success">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <h3>{analyses.length}</h3>
            <p>Analyses effectuées</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon warning">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{riskStats.medium + riskStats.high + riskStats.critical}</h3>
            <p>Risques identifiés</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon danger">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3>{riskStats.critical}</h3>
            <p>Risques critiques</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon info">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>
              {latestAnalysis ? 
                new Date(latestAnalysis.analysis_date).toLocaleDateString('fr-FR') : 
                '--/--/----'
              }
            </h3>
            <p>Dernière analyse</p>
          </div>
        </Card>
      </div>

      {/* Indicateur de risque principal */}
      {latestAnalysis && (
        <Card className="risk-overview">
          <div className="risk-header">
            <h2>Niveau de risque actuel</h2>
            <RiskIndicator level={latestAnalysis.risk_level} showLabel />
          </div>
          <div className="risk-summary">
            <p>{latestAnalysis.summary}</p>
          </div>
        </Card>
      )}

      {/* Résultats détaillés */}
      {selectedAnalysis && (
        <AnalysisResults 
          analysis={selectedAnalysis} 
          onBack={() => setSelectedAnalysis(null)}
        />
      )}

      {/* Historique des analyses */}
      {analyses.length > 0 && !selectedAnalysis && (
        <Card className="analysis-history">
          <div className="history-header">
            <h2>Historique des analyses</h2>
            <Button variant="outline" icon={<Download size={16} />}>
              Exporter
            </Button>
          </div>
          <div className="history-list">
            {analyses.map((analysis) => (
              <div 
                key={analysis.id} 
                className="history-item"
                onClick={() => setSelectedAnalysis(analysis)}
              >
                <div className="analysis-info">
                  <div className="analysis-date">
                    {new Date(analysis.analysis_date).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="analysis-summary">
                    {analysis.summary?.substring(0, 100)}...
                  </div>
                </div>
                <div className="analysis-risk">
                  <RiskIndicator level={analysis.risk_level} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {analyses.length === 0 && !selectedAnalysis && (
        <Card className="empty-state">
          <BarChart3 size={48} className="empty-icon" />
          <h3>Aucune analyse effectuée</h3>
          <p>Lancez votre première analyse pour obtenir des insights sur vos données financières.</p>
          <Button onClick={handleAnalyze} icon={<Play size={16} />}>
            Première analyse
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AnalysisDashboard;