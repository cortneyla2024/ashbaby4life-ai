// =============================================================================
// CareConnect v5.0 - Main Application Entry Point
// =============================================================================

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './state/store.js';
import App from './components/App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { AIProvider } from './context/AIContext.jsx';
import { TelemetryProvider } from './context/TelemetryContext.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { LoadingProvider } from './context/LoadingContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';

// Import styles
import './styles/main.css';
import './styles/themes.css';
import './styles/components.css';
import './styles/animations.css';

// Import utilities
import { initializeApp } from './utils/initialization.js';
import { setupErrorHandling } from './utils/errorHandling.js';
import { setupPerformanceMonitoring } from './utils/performance.js';
import { setupAnalytics } from './utils/analytics.js';
import { setupServiceWorker } from './utils/serviceWorker.js';

// Import hooks
import { useSession } from './hooks/useSession.js';
import { useAIResponse } from './hooks/useAIResponse.js';
import { useTelemetry } from './hooks/useTelemetry.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';

// =============================================================================
// Application Configuration
// =============================================================================

const APP_CONFIG = {
    name: 'CareConnect v5.0',
    version: '5.0.0',
    environment: process.env.NODE_ENV || 'development',
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    aiUrl: process.env.REACT_APP_AI_URL || 'http://localhost:3002',
    features: {
        voice: true,
        imageProcessing: true,
        realTimeLearning: true,
        notifications: true,
        analytics: true,
        pwa: true
    },
    performance: {
        enableMonitoring: true,
        enableCaching: true,
        enableCompression: true
    },
    security: {
        enableCSP: true,
        enableHSTS: true,
        enableXSSProtection: true
    }
};

// =============================================================================
// Application Initialization
// =============================================================================

async function initializeApplication() {
    try {
        console.log(`🚀 Initializing ${APP_CONFIG.name} v${APP_CONFIG.version}`);
        
        // Initialize core systems
        await initializeApp(APP_CONFIG);
        
        // Setup error handling
        setupErrorHandling();
        
        // Setup performance monitoring
        if (APP_CONFIG.performance.enableMonitoring) {
            setupPerformanceMonitoring();
        }
        
        // Setup analytics
        if (APP_CONFIG.features.analytics) {
            setupAnalytics();
        }
        
        // Setup service worker
        if (APP_CONFIG.features.pwa) {
            setupServiceWorker();
        }
        
        // Initialize React application
        initializeReactApp();
        
        console.log('✅ Application initialized successfully');
        
        // Dispatch app ready event
        window.dispatchEvent(new CustomEvent('app-ready'));
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showErrorScreen(error);
    }
}

// =============================================================================
// React Application Initialization
// =============================================================================

function initializeReactApp() {
    const container = document.getElementById('app');
    
    if (!container) {
        throw new Error('App container not found');
    }
    
    const root = createRoot(container);
    
    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <Provider store={store}>
                    <ThemeProvider>
                        <AuthProvider>
                            <NotificationProvider>
                                <AIProvider>
                                    <TelemetryProvider>
                                        <LoadingProvider>
                                            <SettingsProvider>
                                                <BrowserRouter>
                                                    <App />
                                                </BrowserRouter>
                                            </SettingsProvider>
                                        </LoadingProvider>
                                    </TelemetryProvider>
                                </AIProvider>
                            </NotificationProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </Provider>
            </ErrorBoundary>
        </React.StrictMode>
    );
}

// =============================================================================
// Error Handling
// =============================================================================

function showErrorScreen(error) {
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app');
    const errorBoundary = document.getElementById('error-boundary');
    
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (appContainer) appContainer.style.display = 'none';
    if (errorBoundary) {
        errorBoundary.style.display = 'flex';
        
        // Update error message
        const errorMessage = errorBoundary.querySelector('p');
        if (errorMessage) {
            errorMessage.textContent = `Error: ${error.message || 'Unknown error occurred'}`;
        }
    }
    
    console.error('Application failed to start:', error);
}

// =============================================================================
// Global Event Listeners
// =============================================================================

// Handle beforeunload event
window.addEventListener('beforeunload', (event) => {
    // Save any unsaved data
    const unsavedData = store.getState().app.unsavedData;
    if (unsavedData) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
});

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // App went to background
        console.log('App went to background');
    } else {
        // App came to foreground
        console.log('App came to foreground');
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('App is online');
    // Dispatch online event
    window.dispatchEvent(new CustomEvent('app-online'));
});

window.addEventListener('offline', () => {
    console.log('App is offline');
    // Dispatch offline event
    window.dispatchEvent(new CustomEvent('app-offline'));
});

// Handle resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Dispatch resize event after debounce
        window.dispatchEvent(new CustomEvent('app-resize', {
            detail: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        }));
    }, 250);
});

// =============================================================================
// Development Tools
// =============================================================================

if (APP_CONFIG.environment === 'development') {
    // Enable React DevTools
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
    
    // Enable Redux DevTools
    if (window.__REDUX_DEVTOOLS_EXTENSION__) {
        window.__REDUX_DEVTOOLS_EXTENSION__.connect();
    }
    
    // Development logging
    console.log('🔧 Development mode enabled');
    console.log('📊 App Config:', APP_CONFIG);
}

// =============================================================================
// Performance Monitoring
// =============================================================================

// Monitor long tasks
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
                console.warn('Long task detected:', entry);
            }
        }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
}

// Monitor memory usage
if ('memory' in performance) {
    setInterval(() => {
        const memory = performance.memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
            console.warn('High memory usage detected:', memory);
        }
    }, 30000);
}

// =============================================================================
// Application Start
// =============================================================================

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}

// Export for testing
if (APP_CONFIG.environment === 'test') {
    window.APP_CONFIG = APP_CONFIG;
    window.initializeApplication = initializeApplication;
}

// =============================================================================
// Service Worker Updates
// =============================================================================

// Handle service worker updates
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker updated');
        // Reload the page to use the new service worker
        window.location.reload();
    });
}

// =============================================================================
// Export Default
// =============================================================================

export default {
    config: APP_CONFIG,
    initialize: initializeApplication,
    store,
    hooks: {
        useSession,
        useAIResponse,
        useTelemetry,
        useLocalStorage
    }
};
