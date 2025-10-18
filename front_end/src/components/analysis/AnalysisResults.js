import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react';
import { reportsService } from '../../services/reports';
import RiskIndicator from './RiskIndicator';
import Card from '../ui/Button';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const AnalysisResults = ({ analysis, onBack }) => {
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const result = await reportsService.exportAnalysisReport({
        analysisId: analysis.id,
        format
      });
      
      // Créer un lien de téléchargement
      const blob = new Blob([format === 'pdf' ? result : JSON.stringify(result)], {
        type: format === 'pdf' ? 'application/pdf' : 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analyse_${analysis.project_name}_${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Erreur lors de l\'export: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#7c2d12'
    };
    return colors[level] || '#6b7280';
  };

  return (
    <div className="analysis-results">
      {/* Header */}
      <div className="results-header">
        <Button 
          variant="outline" 
          onClick={onBack}
          icon={<ArrowLeft size={16} />}
        >
          Retour
        </Button>
        <div className="header-actions">
          <Button
            variant="outline"
            onClick={() => setShowExportModal(true)}
            icon={<Download size={16} />}
            disabled={exporting}
          >
            {exporting ? 'Export...' : 'Exporter'}
          </Button>
        </div>
      </div>

      {/* Résumé principal */}
      <Card className="results-summary">
        <div className="summary-header">
          <div className="summary-title">
            <h2>Rapport d'analyse</h2>
            <p>Généré le {new Date(analysis.analysis_date).toLocaleDateString('fr-FR')}</p>
          </div>
          <RiskIndicator level={analysis.risk_level} showLabel size="large" />
        </div>
        
        <div className="summary-content">
          <p className="summary-text">{analysis.summary}</p>
          
          {analysis.calculated_metrics && (
            <div className="metrics-grid">
              <div className="metric-item">
                <DollarSign size={20} className="metric-icon" />
                <div className="metric-content">
                  <span className="metric-value">
                    {analysis.calculated_metrics.profit_margin?.toFixed(1)}%
                  </span>
                  <span className="metric-label">Marge bénéficiaire</span>
                </div>
              </div>
              
              <div className="metric-item">
                <TrendingUp size={20} className="metric-icon" />
                <div className="metric-content">
                  <span className="metric-value">
                    {analysis.calculated_metrics.cash_runway_months}
                  </span>
                  <span className="metric-label">Mois de trésorerie</span>
                </div>
              </div>
              
              <div className="metric-item">
                <Users size={20} className="metric-icon" />
                <div className="metric-content">
                  <span className="metric-value">
                    {analysis.calculated_metrics.revenue_per_employee?.toFixed(0)}€
                  </span>
                  <span className="metric-label">Revenu/employé</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Analyse des risques */}
      <Card className="risks-section">
        <h3>
          <AlertTriangle size={20} className="section-icon" />
          Risques identifiés
        </h3>
        <div className="risks-list">
          {analysis.risks && analysis.risks.length > 0 ? (
            analysis.risks.map((risk, index) => (
              <div key={index} className="risk-item">
                <div className="risk-indicator">
                  <div 
                    className="risk-dot" 
                    style={{ backgroundColor: getRiskColor(risk.level) }}
                  />
                </div>
                <div className="risk-content">
                  <div className="risk-header">
                    <h4>{risk.description}</h4>
                    <span className={`risk-level ${risk.level}`}>
                      {risk.level.toUpperCase()}
                    </span>
                  </div>
                  <p className="risk-impact">Impact: {risk.impact}</p>
                  <p className="risk-probability">Probabilité: {risk.probability}</p>
                  <p className="risk-mitigation">
                    <strong>Atténuation:</strong> {risk.mitigation}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-risks">Aucun risque identifié</p>
          )}
        </div>
      </Card>

      {/* Recommandations */}
      <Card className="recommendations-section">
        <h3>
          <CheckCircle size={20} className="section-icon" />
          Recommandations
        </h3>
        <div className="recommendations-list">
          {analysis.recommendations && analysis.recommendations.length > 0 ? (
            analysis.recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <div className="rec-header">
                  <h4>{rec.title}</h4>
                  <span className={`priority-badge ${rec.priority}`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <p className="rec-description">{rec.description}</p>
                <div className="rec-details">
                  <span className="rec-category">Catégorie: {rec.category}</span>
                  <span className="rec-impact">Impact: {rec.expected_impact}</span>
                  <span className="rec-timeline">Délai: {rec.timeline}</span>
                </div>
                {rec.action_steps && rec.action_steps.length > 0 && (
                  <div className="action-steps">
                    <h5>Étapes d'action:</h5>
                    <ul>
                      {rec.action_steps.map((step, stepIndex) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="no-recommendations">Aucune recommandation disponible</p>
          )}
        </div>
      </Card>

      {/* Prévisions */}
      {analysis.forecast && (
        <Card className="forecast-section">
          <h3>Prévisions et perspectives</h3>
          <div className="forecast-content">
            <div className="forecast-item">
              <h4>3 prochains mois</h4>
              <p><strong>Tendance revenus:</strong> {analysis.forecast.next_3_months?.revenue_trend}</p>
              <p><strong>Perspective rentabilité:</strong> {analysis.forecast.next_3_months?.profitability_outlook}</p>
              <p><strong>Projection trésorerie:</strong> {analysis.forecast.next_3_months?.cash_flow_projection}</p>
            </div>
            
            {analysis.forecast.growth_opportunities && analysis.forecast.growth_opportunities.length > 0 && (
              <div className="opportunities-item">
                <h4>Opportunités de croissance</h4>
                <ul>
                  {analysis.forecast.growth_opportunities.map((opp, index) => (
                    <li key={index}>{opp}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysis.forecast.warnings && analysis.forecast.warnings.length > 0 && (
              <div className="warnings-item">
                <h4>Avertissements</h4>
                <ul>
                  {analysis.forecast.warnings.map((warning, index) => (
                    <li key={index} className="warning-text">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modal d'export */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Exporter le rapport"
      >
        <div className="export-options">
          <p>Choisissez le format d'export:</p>
          <div className="export-buttons">
            <Button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              icon={<Download size={16} />}
            >
              PDF
            </Button>
            <Button
              onClick={() => handleExport('json')}
              disabled={exporting}
              icon={<Download size={16} />}
            >
              JSON
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AnalysisResults;