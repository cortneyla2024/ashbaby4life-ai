import React from 'react';
import { useTelemetry } from '../hooks/useTelemetry';

// Icons
import { 
    AlertIcon, 
    RefreshIcon, 
    HomeIcon, 
    BugIcon 
} from '../assets/icons';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null, 
            errorInfo: null,
            errorId: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { 
            hasError: true,
            errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo
        });

        // Track error with telemetry
        if (this.props.onError) {
            this.props.onError(error, errorInfo, this.state.errorId);
        }
    }

    handleRetry = () => {
        this.setState({ 
            hasError: false, 
            error: null, 
            errorInfo: null,
            errorId: null 
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleReportError = () => {
        const { error, errorInfo, errorId } = this.state;
        
        // Create error report
        const errorReport = {
            id: errorId,
            message: error?.message,
            stack: error?.stack,
            componentStack: errorInfo?.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Log to console for development
        console.log('Error Report:', errorReport);

        // In a real app, you would send this to your error reporting service
        // Example: Sentry.captureException(error, { extra: errorReport });
        
        // Show feedback to user
        alert('Error report generated. Thank you for helping us improve!');
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorFallback
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    errorId={this.state.errorId}
                    onRetry={this.handleRetry}
                    onGoHome={this.handleGoHome}
                    onReportError={this.handleReportError}
                    fallback={this.props.fallback}
                />
            );
        }

        return this.props.children;
    }
}

const ErrorFallback = ({ 
    error, 
    errorInfo, 
    errorId, 
    onRetry, 
    onGoHome, 
    onReportError,
    fallback 
}) => {
    // Use custom fallback if provided
    if (fallback) {
        return fallback({ error, errorInfo, errorId, onRetry, onGoHome, onReportError });
    }

    return (
        <div className="error-boundary">
            <div className="error-container">
                <div className="error-icon">
                    <AlertIcon />
                </div>
                
                <h1 className="error-title">Something went wrong</h1>
                
                <p className="error-message">
                    We're sorry, but something unexpected happened. Our team has been notified.
                </p>

                {errorId && (
                    <div className="error-id">
                        Error ID: <code>{errorId}</code>
                    </div>
                )}

                {process.env.NODE_ENV === 'development' && error && (
                    <details className="error-details">
                        <summary>Error Details (Development)</summary>
                        <div className="error-stack">
                            <h4>Error Message:</h4>
                            <pre>{error.message}</pre>
                            
                            <h4>Error Stack:</h4>
                            <pre>{error.stack}</pre>
                            
                            {errorInfo && (
                                <>
                                    <h4>Component Stack:</h4>
                                    <pre>{errorInfo.componentStack}</pre>
                                </>
                            )}
                        </div>
                    </details>
                )}

                <div className="error-actions">
                    <button 
                        className="error-action primary"
                        onClick={onRetry}
                    >
                        <RefreshIcon />
                        Try Again
                    </button>
                    
                    <button 
                        className="error-action secondary"
                        onClick={onGoHome}
                    >
                        <HomeIcon />
                        Go Home
                    </button>
                    
                    <button 
                        className="error-action secondary"
                        onClick={onReportError}
                    >
                        <BugIcon />
                        Report Issue
                    </button>
                </div>

                <div className="error-help">
                    <p>
                        If this problem persists, please contact our support team with the Error ID above.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Hook for functional components
export const useErrorBoundary = () => {
    const { trackEvent } = useTelemetry();

    const handleError = (error, errorInfo, errorId) => {
        trackEvent('error_boundary_caught', {
            errorId,
            errorMessage: error?.message,
            errorStack: error?.stack,
            componentStack: errorInfo?.componentStack,
            url: window.location.href,
            timestamp: new Date().toISOString()
        });
    };

    return { handleError };
};

export default ErrorBoundary;
