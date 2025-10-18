import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';
import { authService } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await authService.login(formData);
      
      if (result.success) {
        login(result.data.token, result.data.user);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card-wrapper">
        <Card className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <LogIn size={32} />
            </div>
            <h1>Connexion</h1>
            <p>Connectez-vous à votre compte</p>
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
            </div>

            <Button
              type="submit"
              className="auth-button"
              disabled={loading}
              icon={loading ? <LoadingSpinner size="small" /> : <LogIn size={16} />}
              fullWidth
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Pas de compte ?{' '}
              <Link to="/register" className="auth-link">
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="demo-credentials">
            <h4>Compte de démonstration :</h4>
            <p><strong>Email:</strong> demo@example.com</p>
            <p><strong>Mot de passe:</strong> Demo123456</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;