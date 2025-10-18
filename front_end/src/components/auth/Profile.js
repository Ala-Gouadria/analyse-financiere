import React, { useState } from 'react';
import { User, Mail, Save, Edit3, X } from 'lucide-react';
import { authService } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: user?.email || ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setError('L\'email est requis');
      return;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Adresse email invalide');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await authService.updateProfile(formData);
      
      if (result.success) {
        setSuccess('Profil mis à jour avec succès');
        setIsEditing(false);
        // Mettre à jour le contexte avec les nouvelles données
        // (à implémenter selon ton contexte)
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: user?.email || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Mon Profil</h1>
        <p>Gérez vos informations personnelles</p>
      </div>

      <div className="profile-content">
        <Card className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-icon">
              <User size={32} />
            </div>
            <div className="profile-info">
              <h2>{user?.email}</h2>
              <p>Membre depuis {user?.createdAt ? formatDate(user.createdAt) : '--'}</p>
            </div>
          </div>

          {error && (
            <ErrorMessage 
              message={error}
              onClose={() => setError('')}
            />
          )}

          {success && (
            <div className="success-message">
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={16} />
                Adresse email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                />
              ) : (
                <p className="profile-value">{user?.email}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                ID Utilisateur
              </label>
              <p className="profile-value">{user?.id}</p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Date d'inscription
              </label>
              <p className="profile-value">
                {user?.createdAt ? formatDate(user.createdAt) : '--'}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Nombre de projets
              </label>
              <p className="profile-value">{user?.projectsCount || 0}</p>
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <div className="edit-actions">
                  <Button
                    type="submit"
                    disabled={loading}
                    icon={loading ? <LoadingSpinner size="small" /> : <Save size={16} />}
                  >
                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                    icon={<X size={16} />}
                  >
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  icon={<Edit3 size={16} />}
                >
                  Modifier le profil
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card className="account-actions-card">
          <h3>Actions du compte</h3>
          <div className="account-actions">
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                  logout();
                }
              }}
              className="logout-button"
            >
              Se déconnecter
            </Button>
            
            <div className="danger-zone">
              <h4>Zone dangereuse</h4>
              <p>Ces actions sont irréversibles</p>
              <Button
                variant="danger"
                onClick={() => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                    // Implémenter la suppression du compte
                    alert('Fonctionnalité de suppression à implémenter');
                  }
                }}
              >
                Supprimer le compte
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;