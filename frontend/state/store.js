// =============================================================================
// CareConnect v5.0 - Redux Store Configuration
// =============================================================================

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import storageSession from 'redux-persist/lib/storage/session';
import { encryptTransform } from 'redux-persist-transform-encrypt';

// Import reducers
import authReducer from './slices/authSlice.js';
import userReducer from './slices/userSlice.js';
import appReducer from './slices/appSlice.js';
import uiReducer from './slices/uiSlice.js';
import aiReducer from './slices/aiSlice.js';
import modulesReducer from './slices/modulesSlice.js';
import analyticsReducer from './slices/analyticsSlice.js';
import notificationsReducer from './slices/notificationsSlice.js';
import settingsReducer from './slices/settingsSlice.js';
import telemetryReducer from './slices/telemetrySlice.js';

// Import middleware
import { apiMiddleware } from './middleware/apiMiddleware.js';
import { loggerMiddleware } from './middleware/loggerMiddleware.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { analyticsMiddleware } from './middleware/analyticsMiddleware.js';
import { persistenceMiddleware } from './middleware/persistenceMiddleware.js';

// =============================================================================
// Persistence Configuration
// =============================================================================

const encryptor = encryptTransform({
    secretKey: process.env.REACT_APP_REDUX_ENCRYPTION_KEY || 'careconnect-secret-key-2024',
    onError: (error) => {
        console.error('Redux persistence encryption error:', error);
    }
});

// Configuration for different storage types
const persistConfig = {
    key: 'careconnect-root',
    storage,
    transforms: [encryptor],
    whitelist: ['user', 'settings', 'analytics'], // Only persist these reducers
    blacklist: ['auth', 'ui', 'notifications'], // Don't persist these
    timeout: 0, // Disable timeout
    debug: process.env.NODE_ENV === 'development'
};

// Session storage for sensitive data
const sessionPersistConfig = {
    key: 'careconnect-session',
    storage: storageSession,
    transforms: [encryptor],
    whitelist: ['auth'],
    timeout: 0,
    debug: process.env.NODE_ENV === 'development'
};

// =============================================================================
// Root Reducer
// =============================================================================

const rootReducer = combineReducers({
    // Core state
    auth: authReducer,
    user: userReducer,
    app: appReducer,
    ui: uiReducer,
    
    // Feature state
    ai: aiReducer,
    modules: modulesReducer,
    analytics: analyticsReducer,
    notifications: notificationsReducer,
    settings: settingsReducer,
    telemetry: telemetryReducer
});

// =============================================================================
// Persisted Reducers
// =============================================================================

const persistedRootReducer = persistReducer(persistConfig, rootReducer);
const persistedAuthReducer = persistReducer(sessionPersistConfig, authReducer);

// =============================================================================
// Store Configuration
// =============================================================================

const createAppStore = (preloadedState = {}) => {
    const store = configureStore({
        reducer: {
            ...persistedRootReducer,
            auth: persistedAuthReducer
        },
        preloadedState,
        middleware: (getDefaultMiddleware) => {
            const defaultMiddleware = getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [
                        'persist/PERSIST',
                        'persist/REHYDRATE',
                        'persist/PAUSE',
                        'persist/PURGE',
                        'persist/REGISTER',
                        'persist/FLUSH'
                    ],
                    ignoredPaths: ['persist']
                },
                immutableCheck: {
                    ignoredPaths: ['persist']
                }
            });

            return defaultMiddleware.concat([
                apiMiddleware,
                loggerMiddleware,
                errorMiddleware,
                analyticsMiddleware,
                persistenceMiddleware
            ]);
        },
        devTools: process.env.NODE_ENV === 'development' ? {
            name: 'CareConnect v5.0',
            trace: true,
            traceLimit: 25,
            features: {
                pause: true,
                lock: true,
                persist: true,
                export: true,
                import: 'custom',
                jump: true,
                skip: true,
                reorder: true,
                dispatch: true,
                test: true
            }
        } : false,
        enhancers: (defaultEnhancers) => {
            if (process.env.NODE_ENV === 'development') {
                return defaultEnhancers.concat([
                    // Add any custom enhancers here
                ]);
            }
            return defaultEnhancers;
        }
    });

    return store;
};

// =============================================================================
// Store Instance
// =============================================================================

export const store = createAppStore();

// =============================================================================
// Persistor Instance
// =============================================================================

export const persistor = persistStore(store, {
    manualPersist: false,
    debug: process.env.NODE_ENV === 'development'
});

// =============================================================================
// Store Types
// =============================================================================

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// =============================================================================
// Store Utilities
// =============================================================================

// Get state selector
export const getState = (state) => state;

// Get specific slice selector
export const getSlice = (sliceName) => (state) => state[sliceName];

// Get user selector
export const getUser = (state) => state.user;

// Get auth selector
export const getAuth = (state) => state.auth;

// Get settings selector
export const getSettings = (state) => state.settings;

// Get AI state selector
export const getAI = (state) => state.ai;

// Get modules selector
export const getModules = (state) => state.modules;

// Get analytics selector
export const getAnalytics = (state) => state.analytics;

// Get notifications selector
export const getNotifications = (state) => state.notifications;

// Get UI selector
export const getUI = (state) => state.ui;

// Get telemetry selector
export const getTelemetry = (state) => state.telemetry;

// =============================================================================
// Store Actions
// =============================================================================

// Initialize store
export const initializeStore = async () => {
    try {
        // Wait for rehydration
        await new Promise((resolve) => {
            const unsubscribe = persistor.subscribe(() => {
                const { bootstrapped } = persistor.getState();
                if (bootstrapped) {
                    unsubscribe();
                    resolve();
                }
            });
        });

        console.log('✅ Store initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize store:', error);
        return false;
    }
};

// Clear store
export const clearStore = async () => {
    try {
        await persistor.purge();
        console.log('✅ Store cleared successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to clear store:', error);
        return false;
    }
};

// Export store
export const exportStore = () => {
    try {
        const state = store.getState();
        const exportableState = {
            user: state.user,
            settings: state.settings,
            analytics: state.analytics
        };
        
        const dataStr = JSON.stringify(exportableState, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `careconnect-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('✅ Store exported successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to export store:', error);
        return false;
    }
};

// Import store
export const importStore = async (file) => {
    try {
        const text = await file.text();
        const importedState = JSON.parse(text);
        
        // Validate imported state
        if (!importedState.user || !importedState.settings) {
            throw new Error('Invalid backup file format');
        }
        
        // Merge with current state
        const currentState = store.getState();
        const mergedState = {
            ...currentState,
            user: { ...currentState.user, ...importedState.user },
            settings: { ...currentState.settings, ...importedState.settings },
            analytics: { ...currentState.analytics, ...importedState.analytics }
        };
        
        // Update store
        store.dispatch({ type: 'app/importState', payload: mergedState });
        
        console.log('✅ Store imported successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to import store:', error);
        return false;
    }
};

// =============================================================================
// Development Tools
// =============================================================================

if (process.env.NODE_ENV === 'development') {
    // Expose store for debugging
    window.__CARE_CONNECT_STORE__ = store;
    
    // Add store to window for Redux DevTools
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
    
    // Log state changes in development
    store.subscribe(() => {
        const state = store.getState();
        console.log('🔍 State changed:', state);
    });
}

// =============================================================================
// Export Default
// =============================================================================

export default store;
