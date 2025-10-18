import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

const RiskIndicator = ({ level, showLabel = false, size = 'medium' }) => {
  const getRiskConfig = (riskLevel) => {
    const configs = {
      low: {
        color: '#10b981',
        bgColor: '#dcfce7',
        borderColor: '#bbf7d0',
        icon: CheckCircle,
        label: 'Faible'
      },
      medium: {
        color: '#f59e0b',
        bgColor: '#fef3c7',
        borderColor: '#fde68a',
        icon: Info,
        label: 'Moyen'
      },
      high: {
        color: '#ef4444',
        bgColor: '#fee2e2',
        borderColor: '#fecaca',
        icon: AlertTriangle,
        label: 'Élevé'
      },
      critical: {
        color: '#7c2d12',
        bgColor: '#fef2e8',
        borderColor: '#fed7aa',
        icon: XCircle,
        label: 'Critique'
      }
    };
    
    return configs[riskLevel] || configs.medium;
  };

  const config = getRiskConfig(level);
  const IconComponent = config.icon;
  
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const iconSizes = {
    small: 14,
    medium: 16,
    large: 24
  };

  return (
    <div className="risk-indicator">
      <div 
        className={`risk-badge ${sizeClasses[size]}`}
        style={{
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          color: config.color
        }}
        title={config.label}
      >
        <IconComponent size={iconSizes[size]} />
      </div>
      {showLabel && (
        <span 
          className="risk-label"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
};

export default RiskIndicator;