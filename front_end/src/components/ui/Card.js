import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'medium',
  shadow = 'medium',
  border = true,
  hover = false,
  onClick,
  ...props
}) => {
  const paddingClasses = {
    none: 'card-padding-none',
    small: 'card-padding-small',
    medium: 'card-padding-medium',
    large: 'card-padding-large'
  };

  const shadowClasses = {
    none: 'card-shadow-none',
    small: 'card-shadow-small',
    medium: 'card-shadow-medium',
    large: 'card-shadow-large'
  };

  const classes = [
    'card',
    paddingClasses[padding],
    shadowClasses[shadow],
    border ? 'card-border' : 'card-no-border',
    hover ? 'card-hover' : '',
    onClick ? 'card-clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

// Variantes de cartes prédéfinies
export const CompactCard = (props) => <Card padding="small" {...props} />;
export const SpaciousCard = (props) => <Card padding="large" {...props} />;
export const ElevatedCard = (props) => <Card shadow="large" {...props} />;
export const FlatCard = (props) => <Card shadow="none" border={false} {...props} />;
export const InteractiveCard = (props) => <Card hover onClick={props.onClick} {...props} />;

// Composants de structure de carte
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`card-body ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`card-title ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`card-description ${className}`} {...props}>
    {children}
  </p>
);

export default Card;