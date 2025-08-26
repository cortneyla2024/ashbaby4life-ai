import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTelemetry } from '../hooks/useTelemetry';

// Icons
import { CloseIcon, ArrowLeftIcon } from '../assets/icons';

const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'medium',
    showBackdrop = true,
    closeOnBackdrop = true,
    closeOnEscape = true,
    showCloseButton = true,
    showBackButton = false,
    onBack,
    className = '',
    ...props 
}) => {
    const modalRef = useRef(null);
    const { trackEvent } = useTelemetry();

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && closeOnEscape && isOpen) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, closeOnEscape]);

    // Focus management
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }
    }, [isOpen]);

    const handleClose = () => {
        trackEvent('modal_closed', { title, size });
        onClose?.();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && closeOnBackdrop) {
            handleClose();
        }
    };

    const handleBack = () => {
        trackEvent('modal_back_clicked', { title });
        onBack?.();
    };

    const getSizeClass = () => {
        switch (size) {
            case 'small':
                return 'modal-small';
            case 'large':
                return 'modal-large';
            case 'fullscreen':
                return 'modal-fullscreen';
            case 'medium':
            default:
                return 'modal-medium';
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div 
            className={`modal-backdrop ${showBackdrop ? 'with-backdrop' : ''}`}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            <div 
                ref={modalRef}
                className={`modal ${getSizeClass()} ${className}`}
                role="document"
                {...props}
            >
                {/* Modal Header */}
                {(title || showCloseButton || showBackButton) && (
                    <div className="modal-header">
                        {showBackButton && (
                            <button
                                className="modal-back-button"
                                onClick={handleBack}
                                aria-label="Go back"
                            >
                                <ArrowLeftIcon />
                            </button>
                        )}
                        
                        {title && (
                            <h2 id="modal-title" className="modal-title">
                                {title}
                            </h2>
                        )}
                        
                        {showCloseButton && (
                            <button
                                className="modal-close-button"
                                onClick={handleClose}
                                aria-label="Close modal"
                            >
                                <CloseIcon />
                            </button>
                        )}
                    </div>
                )}

                {/* Modal Body */}
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );

    // Use portal to render modal at the end of body
    return createPortal(modalContent, document.body);
};

// Modal Components
Modal.Header = ({ children, className = '', ...props }) => (
    <div className={`modal-header ${className}`} {...props}>
        {children}
    </div>
);

Modal.Body = ({ children, className = '', ...props }) => (
    <div className={`modal-body ${className}`} {...props}>
        {children}
    </div>
);

Modal.Footer = ({ children, className = '', ...props }) => (
    <div className={`modal-footer ${className}`} {...props}>
        {children}
    </div>
);

Modal.Title = ({ children, className = '', ...props }) => (
    <h2 className={`modal-title ${className}`} {...props}>
        {children}
    </h2>
);

Modal.CloseButton = ({ onClose, className = '', ...props }) => (
    <button
        className={`modal-close-button ${className}`}
        onClick={onClose}
        aria-label="Close modal"
        {...props}
    >
        <CloseIcon />
    </button>
);

export default Modal;
