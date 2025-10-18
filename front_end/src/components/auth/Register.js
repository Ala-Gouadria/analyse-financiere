import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Mail, Lock, User } from 'lucide-react';
import { authService } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
    return strength;
  };

  const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return { label: 'Très faible', color: '#ef4444' };
    if (strength <= 2) return { label: 'Faible', color: '#f59e0b' };
    if (strength <= 3) return { label: 'Moyen', color: '#eab308' };
    if (strength <= 4) return { label: 'Fort', color: '#84cc16' };
    return { label: 'Très fort', color: '#10b981' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return false;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Adresse email invalide');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    if (passwordStrength < 3) {
      setError('Le mot de passe est trop faible');
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
      
      const result = await authService.register(formData);
      
      if (result.success) {
        login(result.data.token, result.data.user);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  return (
    <div className="auth-container">
      <div className="auth-card-wrapper">
        <Card className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <UserPlus size={32} />
            </div>
            <h1>Créer un compte</h1>
            <p>Rejoignez notre plateforme d'analyse financière</p>
          </div>

          {error && (
            <ErrorMessage 
              message={error}
              onClose={() => setError('')}
            />
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={16} />
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="votre@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock size={16} />
                Mot de passe
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Votre mot de passe"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: strengthInfo.color
                      }}
                    />
                  </div>
                  <span 
                    className="strength-label"
                    style={{ color: strengthInfo.color }}
                  >
                    {strengthInfo.label}
                  </span>
                </div>
              )}

              <div className="password-requirements">
                <p>Le mot de passe doit contenir :</p>
                <ul>
                  <li className={formData.password.length >= 6 ? 'valid' : ''}>
                    Au moins 6 caractères
                  </li>
                  <li className={formData.password.match(/[a-z]/) ? 'valid' : ''}>
                    Une lettre minuscule
                  </li>
                  <li className={formData.password.match(/[A-Z]/) ? 'valid' : ''}>
                    Une lettre majuscule
                  </li>
                  <li className={formData.password.match(/[0-9]/) ? 'valid' : ''}>
                    Un chiffre
                  </li>
                </ul>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <Lock size={16} />
                Confirmer le mot de passe
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirmer votre mot de passe"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="error-text">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <Button
              type="submit"
              className="auth-button"
              disabled={loading}
              icon={loading ? <LoadingSpinner size="small" /> : <UserPlus size={16} />}
              fullWidth
            >
              {loading ? 'Création du compte...' : 'Créer un compte'}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Déjà un compte ?{' '}
              <Link to="/login" className="auth-link">
                Se connecter
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;