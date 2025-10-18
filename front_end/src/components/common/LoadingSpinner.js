import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary',
  text = 'Chargement...' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
    success: 'text-green-600',
    danger: 'text-red-600'
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`}>
      <div className="spinner-container">
        <svg 
          className="spinner" 
          viewBox="0 0 50 50"
          aria-label={text}
        >
          <circle
            className="spinner-track"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
          />
          <circle
            className="spinner-indicator"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
};

// Variante de spinner pour les boutons
export const ButtonSpinner = ({ size = 'small' }) => {
  return (
    <div className="button-spinner">
      <LoadingSpinner size={size} color="white" text="" />
    </div>
  );
};

// Variante de spinner pour les pages
export const PageSpinner = ({ text = 'Chargement de la page...' }) => {
  return (
    <div className="page-spinner">
      <LoadingSpinner size="xlarge" text={text} />
    </div>
  );
};

// Variante de spinner pour les sections
export const SectionSpinner = ({ text = 'Chargement...' }) => {
  return (
    <div className="section-spinner">
      <LoadingSpinner size="large" text={text} />
    </div>
  );
};

export default LoadingSpinner;