import React, { useState } from 'react';
import { Eye, EyeOff, Search, Calendar, DollarSign, User } from 'lucide-react';

const Input = ({
  type = 'text',
  size = 'medium',
  variant = 'default',
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Déterminer le type d'input
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Classes CSS
  const sizeClasses = {
    small: 'input-sm',
    medium: 'input-md',
    large: 'input-lg'
  };

  const variantClasses = {
    default: 'input-default',
    filled: 'input-filled',
    outline: 'input-outline'
  };

  const classes = [
    'input',
    sizeClasses[size],
    variantClasses[variant],
    error ? 'input-error' : '',
    disabled ? 'input-disabled' : '',
    loading ? 'input-loading' : '',
    fullWidth ? 'input-full-width' : '',
    icon ? `input-with-icon input-icon-${iconPosition}` : '',
    className
  ].filter(Boolean).join(' ');

  // Icônes prédéfinies
  const predefinedIcons = {
    search: Search,
    calendar: Calendar,
    dollar: DollarSign,
    user: User
  };

  const IconComponent = typeof icon === 'string' ? predefinedIcons[icon] : icon;

  return (
    <div className="input-container">
      {label && (
        <label className="input-label">
          {label}
          {props.required && <span className="input-required">*</span>}
        </label>
      )}
      
      <div className="input-wrapper">
        {IconComponent && iconPosition === 'left' && (
          <span className="input-icon left">
            <IconComponent size={16} />
          </span>
        )}
        
        <input
          type={inputType}
          className={classes}
          disabled={disabled || loading}
          {...props}
        />
        
        {IconComponent && iconPosition === 'right' && (
          <span className="input-icon right">
            <IconComponent size={16} />
          </span>
        )}
        
        {/* Toggle pour les mots de passe */}
        {type === 'password' && (
          <button
            type="button"
            className="input-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        
        {/* Indicateur de chargement */}
        {loading && (
          <span className="input-loading-indicator">
            <div className="loading-spinner"></div>
          </span>
        )}
      </div>
      
      {(error || helperText) && (
        <div className={`input-message ${error ? 'error' : 'helper'}`}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};

// Composants d'input spécialisés
export const TextInput = (props) => <Input type="text" {...props} />;
export const EmailInput = (props) => <Input type="email" {...props} />;
export const PasswordInput = (props) => <Input type="password" {...props} />;
export const NumberInput = (props) => <Input type="number" {...props} />;
export const SearchInput = (props) => <Input type="text" icon="search" {...props} />;
export const DateInput = (props) => <Input type="date" icon="calendar" {...props} />;

// Input avec validation en temps réel
export const ValidatedInput = ({ validate, onValidation, ...props }) => {
  const [localError, setLocalError] = useState('');

  const handleBlur = (event) => {
    if (validate) {
      const error = validate(event.target.value);
      setLocalError(error);
      onValidation?.(!error, error);
    }
  };

  return (
    <Input
      {...props}
      error={localError}
      onBlur={handleBlur}
    />
  );
};

// Groupe d'inputs
export const InputGroup = ({ children, className = '', ...props }) => (
  <div className={`input-group ${className}`} {...props}>
    {children}
  </div>
);

export default Input;