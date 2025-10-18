import React, { useState, useEffect } from 'react';
import { Save, X, FileText } from 'lucide-react';
import { projectService } from '../../services/projects';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const ProjectForm = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (project) {
      setIsEditing(true);
      setFormData({
        name: project.name || '',
        description: project.description || ''
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Le nom du projet est requis');
      return false;
    }

    if (formData.name.length < 2) {
      setError('Le nom du projet doit contenir au moins 2 caractères');
      return false;
    }

    if (formData.name.length > 100) {
      setError('Le nom du projet ne peut pas dépasser 100 caractères');
      return false;
    }

    if (formData.description && formData.description.length > 500) {
      setError('La description ne peut pas dépasser 500 caractères');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      let result;
      if (isEditing) {
        result = await projectService.updateProject(project.id, formData);
      } else {
        result = await projectService.createProject(formData);
      }

      if (result.success) {
        onSave(result.data.project);
        // Reset form if not editing
        if (!isEditing) {
          setFormData({
            name: '',
            description: ''
          });
        }
      }
    } catch (error) {
      console.error('Project save error:', error);
      setError(error.response?.data?.error || `Erreur lors de la ${isEditing ? 'modification' : 'création'} du projet`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="project-form">
      <div className="form-header">
        <div className="form-title">
          <FileText size={24} />
          <h2>{isEditing ? 'Modifier le projet' : 'Nouveau projet'}</h2>
        </div>
        
        <Button
          variant="outline"
          onClick={onCancel}
          icon={<X size={16} />}
        >
          Annuler
        </Button>
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          onClose={() => setError('')}
        />
      )}

      <form onSubmit={handleSubmit} className="project-form-content">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Nom du projet *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="Ex: Analyse Startup Tech 2024"
            required
            disabled={loading}
            maxLength={100}
          />
          <div className="char-count">
            {formData.name.length}/100 caractères
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Décrivez votre projet d'analyse financière..."
            rows={4}
            disabled={loading}
            maxLength={500}
          />
          <div className="char-count">
            {formData.description.length}/500 caractères
          </div>
        </div>

        <div className="form-actions">
          <Button
            type="submit"
            disabled={loading}
            icon={loading ? <LoadingSpinner size="small" /> : <Save size={16} />}
          >
            {loading ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Créer le projet')}
          </Button>
          
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                name: '',
                description: ''
              })}
              disabled={loading}
            >
              Effacer
            </Button>
          )}
        </div>
      </form>

      {/* Conseils */}
      <div className="form-tips">
        <h4>Conseils pour un bon projet :</h4>
        <ul>
          <li>Choisissez un nom clair et descriptif</li>
          <li>Incluez l'année ou la période d'analyse</li>
          <li>Décrivez le contexte et les objectifs</li>
          <li>Précisez le secteur d'activité si pertinent</li>
        </ul>
      </div>
    </Card>
  );
};

export default ProjectForm;