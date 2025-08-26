import { configureStore, createSlice } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    }
  }
});

// Theme slice
const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    currentTheme: 'light',
    systemPreference: 'light',
    availableThemes: ['light', 'dark', 'system', 'high-contrast', 'sepia', 'ocean', 'forest', 'sunset']
  },
  reducers: {
    setTheme: (state, action) => {
      state.currentTheme = action.payload;
    },
    setSystemPreference: (state, action) => {
      state.systemPreference = action.payload;
    }
  }
});

// Settings slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      animations: true,
      reducedMotion: false
    },
    notifications: {
      enabled: true,
      sound: true,
      desktop: false,
      email: false
    },
    privacy: {
      dataCollection: false,
      analytics: false,
      telemetry: true,
      localOnly: true
    },
    general: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    },
    ai: {
      model: 'steward-v5',
      temperature: 0.7,
      maxTokens: 2048,
      enableSuggestions: true
    },
    performance: {
      cacheEnabled: true,
      compression: true,
      lazyLoading: true
    }
  },
  reducers: {
    updateSettings: (state, action) => {
      const { category, settings } = action.payload;
      state[category] = { ...state[category], ...settings };
    },
    resetSettings: (state, action) => {
      const category = action.payload;
      if (category) {
        state[category] = settingsSlice.getInitialState()[category];
      } else {
        return settingsSlice.getInitialState();
      }
    }
  }
});

// Connectors slice
const connectorsSlice = createSlice({
  name: 'connectors',
  initialState: {
    items: [],
    activeConnectors: [],
    loading: false,
    error: null
  },
  reducers: {
    setConnectors: (state, action) => {
      state.items = action.payload;
    },
    addConnector: (state, action) => {
      state.items.push(action.payload);
    },
    updateConnector: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.items.findIndex(connector => connector.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    removeConnector: (state, action) => {
      state.items = state.items.filter(connector => connector.id !== action.payload);
    },
    setActiveConnectors: (state, action) => {
      state.activeConnectors = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

// AI slice
const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    conversations: [],
    currentConversation: null,
    loading: false,
    error: null,
    suggestions: [],
    modelInfo: null
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },
    updateConversation: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.conversations.findIndex(conv => conv.id === id);
      if (index !== -1) {
        state.conversations[index] = { ...state.conversations[index], ...updates };
      }
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      const conversation = state.conversations.find(conv => conv.id === conversationId);
      if (conversation) {
        conversation.messages.push(message);
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
    setModelInfo: (state, action) => {
      state.modelInfo = action.payload;
    }
  }
});

// Telemetry slice
const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState: {
    events: [],
    performance: {},
    errors: [],
    userActivity: [],
    systemMetrics: {},
    enabled: true,
    retentionDays: 30
  },
  reducers: {
    addEvent: (state, action) => {
      state.events.unshift(action.payload);
      // Keep only recent events
      if (state.events.length > 1000) {
        state.events = state.events.slice(0, 1000);
      }
    },
    setPerformance: (state, action) => {
      state.performance = { ...state.performance, ...action.payload };
    },
    addError: (state, action) => {
      state.errors.unshift(action.payload);
      if (state.errors.length > 100) {
        state.errors = state.errors.slice(0, 100);
      }
    },
    addUserActivity: (state, action) => {
      state.userActivity.unshift(action.payload);
      if (state.userActivity.length > 500) {
        state.userActivity = state.userActivity.slice(0, 500);
      }
    },
    setSystemMetrics: (state, action) => {
      state.systemMetrics = { ...state.systemMetrics, ...action.payload };
    },
    setEnabled: (state, action) => {
      state.enabled = action.payload;
    },
    clearTelemetry: (state) => {
      state.events = [];
      state.errors = [];
      state.userActivity = [];
    }
  }
});

// Notifications slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    settings: {
      enabled: true,
      sound: true,
      desktop: false,
      email: false
    }
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
      // Keep only recent notifications
      if (state.items.length > 100) {
        state.items = state.items.slice(0, 100);
      }
    },
    markAsRead: (state, action) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(item => item.read = true);
      state.unreadCount = 0;
    },
    removeNotification: (state, action) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    }
  }
});

// Loading slice
const loadingSlice = createSlice({
  name: 'loading',
  initialState: {
    global: false,
    specific: {}
  },
  reducers: {
    setGlobalLoading: (state, action) => {
      state.global = action.payload;
    },
    setSpecificLoading: (state, action) => {
      const { key, loading } = action.payload;
      if (loading) {
        state.specific[key] = true;
      } else {
        delete state.specific[key];
      }
    },
    clearAllLoading: (state) => {
      state.global = false;
      state.specific = {};
    }
  }
});

// Persist configuration
const persistConfig = {
  key: 'careconnect-root',
  storage,
  whitelist: ['auth', 'theme', 'settings', 'connectors', 'ai', 'telemetry', 'notifications']
};

// Root reducer
const rootReducer = {
  auth: authSlice.reducer,
  theme: themeSlice.reducer,
  settings: settingsSlice.reducer,
  connectors: connectorsSlice.reducer,
  ai: aiSlice.reducer,
  telemetry: telemetrySlice.reducer,
  notifications: notificationsSlice.reducer,
  loading: loadingSlice.reducer
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['telemetry.events', 'telemetry.errors', 'telemetry.userActivity']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

// Create persistor
const persistor = persistStore(store);

// Export actions
export const authActions = authSlice.actions;
export const themeActions = themeSlice.actions;
export const settingsActions = settingsSlice.actions;
export const connectorsActions = connectorsSlice.actions;
export const aiActions = aiSlice.actions;
export const telemetryActions = telemetrySlice.actions;
export const notificationsActions = notificationsSlice.actions;
export const loadingActions = loadingSlice.actions;

// Export selectors
export const selectAuth = (state) => state.auth;
export const selectTheme = (state) => state.theme;
export const selectSettings = (state) => state.settings;
export const selectConnectors = (state) => state.connectors;
export const selectAI = (state) => state.ai;
export const selectTelemetry = (state) => state.telemetry;
export const selectNotifications = (state) => state.notifications;
export const selectLoading = (state) => state.loading;

// Export store and persistor
export { store, persistor };
export default store;
