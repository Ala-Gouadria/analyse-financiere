import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  ...props
}) => {
  const modalRef = useRef(null);

  // Fermer avec la touche Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Empêcher le scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Gérer le clic sur l'overlay
  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  // Empêcher la fermeture si le modal n'est pas ouvert
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'modal-small',
    medium: 'modal-medium',
    large: 'modal-large',
    xlarge: 'modal-xlarge',
    full: 'modal-full'
  };

  const classes = [
    'modal',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        ref={modalRef}
        className={classes}
        {...props}
      >
        {/* En-tête du modal */}
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && (
              <h2 id="modal-title" className="modal-title">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <Button
                variant="ghost"
                size="small"
                onClick={onClose}
                className="modal-close-button"
                aria-label="Fermer"
              >
                <X size={20} />
              </Button>
            )}
          </div>
        )}

        {/* Contenu du modal */}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Composants pour structurer le contenu du modal
export const ModalHeader = ({ children, className = '', ...props }) => (
  <div className={`modal-header ${className}`} {...props}>
    {children}
  </div>
);

export const ModalBody = ({ children, className = '', ...props }) => (
  <div className={`modal-body ${className}`} {...props}>
    {children}
  </div>
);

export const ModalFooter = ({ children, className = '', ...props }) => (
  <div className={`modal-footer ${className}`} {...props}>
    {children}
  </div>
);

// Hook personnalisé pour gérer les modals
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return {
    isOpen,
    open,
    close,
    toggle
  };
};

export default Modal;