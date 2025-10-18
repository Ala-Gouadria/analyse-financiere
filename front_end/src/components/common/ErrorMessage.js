import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import Button from '../ui/Button';

const ErrorMessage = ({ 
  message, 
  title = 'Erreur',
  onClose,
  onRetry,
  type = 'error',
  showIcon = true,
  dismissible = true 
}) => {
  const getTypeConfig = () => {
    const configs = {
      error: {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-400',
        icon: AlertCircle
      },
      warning: {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-400',
        icon: AlertCircle
      },
      info: {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-400',
        icon: AlertCircle
      }
    };
    
    return configs[type] || configs.error;
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <div className={`error-message ${config.bgColor} ${config.borderColor} ${config.textColor}`}>
      <div className="error-content">
        {showIcon && (
          <div className="error-icon">
            <IconComponent className={config.iconColor} size={20} />
          </div>
        )}
        
        <div className="error-text">
          {title && <div className="error-title">{title}</div>}
          <div className="error-description">{message}</div>
        </div>

        <div className="error-actions">
          {onRetry && (
            <Button
              variant="outline"
              size="small"
              onClick={onRetry}
              className="retry-button"
            >
              Réessayer
            </Button>
          )}
          
          {dismissible && onClose && (
            <button
              type="button"
              className="close-button"
              onClick={onClose}
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Variante pour les erreurs de formulaire
export const FormErrorMessage = ({ message, fieldName }) => {
  return (
    <div className="form-error-message">
      <AlertCircle size={14} />
      <span>
        {fieldName && <strong>{fieldName}: </strong>}
        {message}
      </span>
    </div>
  );
};

// Variante pour les erreurs réseau
export const NetworkErrorMessage = ({ onRetry }) => {
  return (
    <ErrorMessage
      title="Problème de connexion"
      message="Impossible de se connecter au serveur. Vérifiez votre connexion internet."
      onRetry={onRetry}
      type="error"
    />
  );
};

// Variante pour les erreurs de permission
export const PermissionErrorMessage = () => {
  return (
    <ErrorMessage
      title="Accès refusé"
      message="Vous n'avez pas les permissions nécessaires pour accéder à cette ressource."
      type="warning"
    />
  );
};

// Variante pour les erreurs de données
export const DataErrorMessage = ({ onRetry }) => {
  return (
    <ErrorMessage
      title="Erreur de données"
      message="Impossible de charger les données. Veuillez réessayer."
      onRetry={onRetry}
      type="error"
    />
  );
};

export default ErrorMessage;