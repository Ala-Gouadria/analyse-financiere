import React from 'react';
import { 
  Edit3, 
  Trash2, 
  BarChart3, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';

const ProjectCard = ({ project, onEdit, onDelete, viewMode = 'grid' }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRiskLevel = (riskLevel) => {
    const levels = {
      low: { color: '#10b981', label: 'Faible', icon: TrendingUp },
      medium: { color: '#f59e0b', label: 'Moyen', icon: AlertTriangle },
      high: { color: '#ef4444', label: 'Élevé', icon: AlertTriangle },
      critical: { color: '#7c2d12', label: 'Critique', icon: AlertTriangle }
    };
    return levels[riskLevel] || levels.medium;
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(project);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(project.id);
  };

  const riskInfo = project.latest_risk_level ? getRiskLevel(project.latest_risk_level) : null;

  if (viewMode === 'list') {
    return (
      <Card className="project-card list-view">
        <div className="project-content">
          <div className="project-main">
            <div className="project-header">
              <h3 className="project-name">
                <Link to={`/projects/${project.id}`} className="project-link">
                  {project.name}
                </Link>
              </h3>
              
              <div className="project-meta">
                <div className="meta-item">
                  <Calendar size={14} />
                  <span>Créé le {formatDate(project.created_at)}</span>
                </div>
                
                {project.data_count > 0 && (
                  <div className="meta-item">
                    <BarChart3 size={14} />
                    <span>{project.data_count} entrée{project.data_count > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {project.description && (
              <p className="project-description">{project.description}</p>
            )}
          </div>

          <div className="project-sidebar">
            {/* Indicateur de risque */}
            {riskInfo && (
              <div 
                className="risk-indicator"
                style={{ borderLeftColor: riskInfo.color }}
                title={`Risque ${riskInfo.label}`}
              >
                <riskInfo.icon size={16} color={riskInfo.color} />
                <span className="risk-label">{riskInfo.label}</span>
              </div>
            )}

            {/* Statut des données */}
            <div className={`data-status ${project.has_data ? 'has-data' : 'no-data'}`}>
              {project.has_data ? 'Données complètes' : 'Aucune donnée'}
            </div>

            {/* Menu d'actions */}
            <div className="project-actions">
              <Button
                variant="outline"
                size="small"
                onClick={handleMenuToggle}
                icon={<MoreVertical size={14} />}
              >
                Actions
              </Button>

              {showMenu && (
                <div className="action-menu">
                  <button className="menu-item" onClick={handleEdit}>
                    <Edit3 size={14} />
                    Modifier
                  </button>
                  <button className="menu-item delete" onClick={handleDelete}>
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Vue grille (par défaut)
  return (
    <Card className="project-card grid-view">
      <div className="project-header">
        <div className="project-title">
          <h3 className="project-name">
            <Link to={`/projects/${project.id}`} className="project-link">
              {project.name}
            </Link>
          </h3>
          
          <div className="project-menu">
            <Button
              variant="ghost"
              size="small"
              onClick={handleMenuToggle}
              icon={<MoreVertical size={16} />}
            />

            {showMenu && (
              <div className="action-menu">
                <button className="menu-item" onClick={handleEdit}>
                  <Edit3 size={14} />
                  Modifier
                </button>
                <button className="menu-item delete" onClick={handleDelete}>
                  <Trash2 size={14} />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>

        {project.description && (
          <p className="project-description">{project.description}</p>
        )}
      </div>

      <div className="project-stats">
        <div className="stat">
          <BarChart3 size={16} className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{project.data_count}</div>
            <div className="stat-label">Entrées</div>
          </div>
        </div>

        <div className="stat">
          <Calendar size={16} className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">
              {formatDate(project.created_at)}
            </div>
            <div className="stat-label">Créé le</div>
          </div>
        </div>
      </div>

      <div className="project-footer">
        {/* Indicateur de risque */}
        {riskInfo && (
          <div 
            className="risk-badge"
            style={{ backgroundColor: riskInfo.color }}
          >
            <riskInfo.icon size={14} />
            <span>Risque {riskInfo.label}</span>
          </div>
        )}

        {/* Statut des données */}
        <div className={`data-badge ${project.has_data ? 'has-data' : 'no-data'}`}>
          {project.has_data ? '📊 Données' : '📝 Vide'}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="project-actions-grid">
        <Button
          variant="primary"
          size="small"
          as={Link}
          to={`/projects/${project.id}`}
          icon={<BarChart3 size={14} />}
          fullWidth
        >
          Voir détails
        </Button>
        
        <Button
          variant="outline"
          size="small"
          as={Link}
          to={`/analysis?project=${project.id}`}
          icon={<TrendingUp size={14} />}
          fullWidth
        >
          Analyser
        </Button>
      </div>
    </Card>
  );
};

export default ProjectCard;