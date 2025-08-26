import React, { useEffect, useState } from 'react';
import { useTelemetry } from '../hooks/useTelemetry';

// Icons
import { 
    CheckIcon, 
    InfoIcon, 
    WarningIcon, 
    ErrorIcon, 
    CloseIcon,
    BellIcon
} from '../assets/icons';

const Notification = ({ notification, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissing, setIsDismissing] = useState(false);
    const { trackEvent } = useTelemetry();

    const {
        id,
        type = 'info',
        title,
        message,
        duration = 5000,
        persistent = false,
        actions = [],
        metadata = {}
    } = notification;

    // Show notification with animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Auto-dismiss timer
    useEffect(() => {
        if (persistent || duration === 0) return;

        const timer = setTimeout(() => {
            handleDismiss();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, persistent]);

    const handleDismiss = () => {
        setIsDismissing(true);
        trackEvent('notification_dismissed', { 
            id, 
            type, 
            title,
            dismissedBy: 'auto' 
        });

        setTimeout(() => {
            onClose(id);
        }, 300); // Animation duration
    };

    const handleAction = (action) => {
        trackEvent('notification_action_clicked', { 
            id, 
            type, 
            action: action.label 
        });

        if (action.onClick) {
            action.onClick();
        }

        if (action.dismissOnClick !== false) {
            handleDismiss();
        }
    };

    const handleClose = () => {
        setIsDismissing(true);
        trackEvent('notification_dismissed', { 
            id, 
            type, 
            title,
            dismissedBy: 'user' 
        });

        setTimeout(() => {
            onClose(id);
        }, 300);
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckIcon className="notification-icon success" />;
            case 'warning':
                return <WarningIcon className="notification-icon warning" />;
            case 'error':
                return <ErrorIcon className="notification-icon error" />;
            case 'info':
            default:
                return <InfoIcon className="notification-icon info" />;
        }
    };

    const getTypeClass = () => {
        switch (type) {
            case 'success':
                return 'success';
            case 'warning':
                return 'warning';
            case 'error':
                return 'error';
            case 'info':
            default:
                return 'info';
        }
    };

    return (
        <div 
            className={`notification ${getTypeClass()} ${isVisible ? 'visible' : ''} ${isDismissing ? 'dismissing' : ''}`}
            data-notification-id={id}
        >
            <div className="notification-content">
                {/* Icon */}
                <div className="notification-icon-wrapper">
                    {getIcon()}
                </div>

                {/* Content */}
                <div className="notification-body">
                    {title && (
                        <h4 className="notification-title">{title}</h4>
                    )}
                    {message && (
                        <p className="notification-message">{message}</p>
                    )}
                    
                    {/* Actions */}
                    {actions.length > 0 && (
                        <div className="notification-actions">
                            {actions.map((action, index) => (
                                <button
                                    key={index}
                                    className={`notification-action ${action.variant || 'secondary'}`}
                                    onClick={() => handleAction(action)}
                                    disabled={action.disabled}
                                >
                                    {action.icon && <span className="action-icon">{action.icon}</span>}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Metadata */}
                    {metadata.timestamp && (
                        <div className="notification-meta">
                            <span className="notification-time">
                                {new Date(metadata.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Close Button */}
                {!persistent && (
                    <button
                        className="notification-close"
                        onClick={handleClose}
                        aria-label="Close notification"
                    >
                        <CloseIcon />
                    </button>
                )}
            </div>

            {/* Progress Bar for auto-dismiss */}
            {!persistent && duration > 0 && (
                <div className="notification-progress">
                    <div 
                        className="notification-progress-bar"
                        style={{ 
                            animationDuration: `${duration}ms`,
                            animationPlayState: isDismissing ? 'paused' : 'running'
                        }}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default Notification;
