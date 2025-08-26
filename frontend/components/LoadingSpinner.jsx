import React from 'react';
import { useLoading } from '../hooks/useLoading';

const LoadingSpinner = ({ 
    size = 'medium',
    type = 'spinner',
    text = '',
    overlay = false,
    className = '',
    ...props 
}) => {
    const { isLoading } = useLoading();

    if (!isLoading && !overlay) return null;

    const getSizeClass = () => {
        switch (size) {
            case 'small':
                return 'spinner-small';
            case 'large':
                return 'spinner-large';
            case 'xlarge':
                return 'spinner-xlarge';
            case 'medium':
            default:
                return 'spinner-medium';
        }
    };

    const getTypeClass = () => {
        switch (type) {
            case 'dots':
                return 'spinner-dots';
            case 'pulse':
                return 'spinner-pulse';
            case 'bars':
                return 'spinner-bars';
            case 'spinner':
            default:
                return 'spinner-circle';
        }
    };

    const renderSpinner = () => {
        switch (type) {
            case 'dots':
                return (
                    <div className="dots-spinner">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                );
            
            case 'pulse':
                return (
                    <div className="pulse-spinner">
                        <div className="pulse"></div>
                    </div>
                );
            
            case 'bars':
                return (
                    <div className="bars-spinner">
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </div>
                );
            
            case 'spinner':
            default:
                return (
                    <div className="circle-spinner">
                        <svg viewBox="0 0 50 50" className="spinner-svg">
                            <circle
                                cx="25"
                                cy="25"
                                r="20"
                                fill="none"
                                strokeWidth="4"
                                className="spinner-track"
                            />
                            <circle
                                cx="25"
                                cy="25"
                                r="20"
                                fill="none"
                                strokeWidth="4"
                                className="spinner-indicator"
                            />
                        </svg>
                    </div>
                );
        }
    };

    const content = (
        <div 
            className={`loading-spinner ${getSizeClass()} ${getTypeClass()} ${className}`}
            {...props}
        >
            {renderSpinner()}
            {text && (
                <div className="spinner-text">
                    {text}
                </div>
            )}
        </div>
    );

    if (overlay) {
        return (
            <div className="loading-overlay">
                {content}
            </div>
        );
    }

    return content;
};

// LoadingSpinner Components
LoadingSpinner.Page = ({ text = 'Loading...', ...props }) => (
    <LoadingSpinner
        size="large"
        type="spinner"
        text={text}
        overlay={true}
        className="page-loader"
        {...props}
    />
);

LoadingSpinner.Button = ({ text = '', ...props }) => (
    <LoadingSpinner
        size="small"
        type="dots"
        text={text}
        className="button-loader"
        {...props}
    />
);

LoadingSpinner.Card = ({ text = 'Loading...', ...props }) => (
    <LoadingSpinner
        size="medium"
        type="pulse"
        text={text}
        className="card-loader"
        {...props}
    />
);

LoadingSpinner.Inline = ({ text = '', ...props }) => (
    <LoadingSpinner
        size="small"
        type="dots"
        text={text}
        className="inline-loader"
        {...props}
    />
);

export default LoadingSpinner;
