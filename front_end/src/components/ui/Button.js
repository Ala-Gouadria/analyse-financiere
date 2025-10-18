import React from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  as: Component = 'button',
  to,
  href,
  className = '',
  ...props
}) => {
  // Déterminer le composant à utiliser
  let Tag = Component;
  if (to) Tag = Link;
  if (href) Tag = 'a';

  // Classes CSS en fonction des props
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success'
  };
  const sizeClasses = {
    small: 'btn-sm',
    medium: 'btn-md',
    large: 'btn-lg'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled || loading ? 'btn-disabled' : '',
    fullWidth ? 'btn-full-width' : '',
    className
  ].filter(Boolean).join(' ');

  // Contenu du bouton
  const buttonContent = (
    <>
      {loading && <LoadingSpinner size="small" color="current" />}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="btn-icon left">{icon}</span>
      )}
      
      <span className="btn-text">{children}</span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="btn-icon right">{icon}</span>
      )}
    </>
  );

  // Props supplémentaires
  const additionalProps = {};
  if (to) additionalProps.to = to;
  if (href) additionalProps.href = href;
  if (disabled || loading) additionalProps.disabled = true;

  return (
    <Tag
      className={classes}
      {...additionalProps}
      {...props}
    >
      {buttonContent}
    </Tag>
  );
};

// Variantes de boutons prédéfinies
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;

// Boutons de taille prédéfinie
export const SmallButton = (props) => <Button size="small" {...props} />;
export const LargeButton = (props) => <Button size="large" {...props} />;

export default Button;