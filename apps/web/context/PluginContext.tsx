'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: 'wellness' | 'productivity' | 'entertainment' | 'education' | 'social' | 'utility';
  status: 'active' | 'inactive' | 'error' | 'updating';
  permissions: string[];
  dependencies: string[];
  entryPoint: string;
  config: Record<string, any>;
  metadata: {
    icon: string;
    tags: string[];
    website?: string;
    repository?: string;
    license: string;
    minVersion: string;
    maxVersion?: string;
  };
  stats: {
    downloads: number;
    rating: number;
    reviews: number;
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface PluginRegistry {
  id: string;
  name: string;
  url: string;
  description: string;
  plugins: Plugin[];
  isOfficial: boolean;
  lastSync: Date;
}

interface PluginInstallation {
  id: string;
  pluginId: string;
  version: string;
  status: 'installing' | 'installed' | 'failed' | 'updating' | 'uninstalling';
  installPath: string;
  config: Record<string, any>;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface SDKModule {
  id: string;
  name: string;
  description: string;
  version: string;
  type: 'api' | 'component' | 'hook' | 'utility';
  exports: string[];
  documentation: string;
  examples: string[];
  dependencies: string[];
}

interface CodeSandbox {
  id: string;
  name: string;
  description: string;
  code: string;
  language: 'javascript' | 'typescript' | 'python' | 'html' | 'css';
  template: string;
  isPublic: boolean;
  isRunning: boolean;
  output: string;
  errors: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface PluginState {
  plugins: Plugin[];
  installedPlugins: PluginInstallation[];
  registries: PluginRegistry[];
  sdkModules: SDKModule[];
  sandboxes: CodeSandbox[];
  activeSandbox: CodeSandbox | null;
  isLoading: boolean;
  error: string | null;
  settings: {
    autoUpdate: boolean;
    allowThirdParty: boolean;
    sandboxEnabled: boolean;
    maxSandboxes: number;
    pluginTimeout: number;
  };
}

type PluginAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PLUGINS'; payload: Plugin[] }
  | { type: 'ADD_PLUGIN'; payload: Plugin }
  | { type: 'UPDATE_PLUGIN'; payload: Plugin }
  | { type: 'REMOVE_PLUGIN'; payload: string }
  | { type: 'SET_INSTALLED_PLUGINS'; payload: PluginInstallation[] }
  | { type: 'ADD_INSTALLED_PLUGIN'; payload: PluginInstallation }
  | { type: 'UPDATE_INSTALLED_PLUGIN'; payload: PluginInstallation }
  | { type: 'REMOVE_INSTALLED_PLUGIN'; payload: string }
  | { type: 'SET_REGISTRIES'; payload: PluginRegistry[] }
  | { type: 'ADD_REGISTRY'; payload: PluginRegistry }
  | { type: 'UPDATE_REGISTRY'; payload: PluginRegistry }
  | { type: 'REMOVE_REGISTRY'; payload: string }
  | { type: 'SET_SDK_MODULES'; payload: SDKModule[] }
  | { type: 'ADD_SDK_MODULE'; payload: SDKModule }
  | { type: 'UPDATE_SDK_MODULE'; payload: SDKModule }
  | { type: 'REMOVE_SDK_MODULE'; payload: string }
  | { type: 'SET_SANDBOXES'; payload: CodeSandbox[] }
  | { type: 'ADD_SANDBOX'; payload: CodeSandbox }
  | { type: 'UPDATE_SANDBOX'; payload: CodeSandbox }
  | { type: 'REMOVE_SANDBOX'; payload: string }
  | { type: 'SET_ACTIVE_SANDBOX'; payload: CodeSandbox | null }
  | { type: 'SET_SETTINGS'; payload: Partial<PluginState['settings']> };

// Initial state
const initialState: PluginState = {
  plugins: [],
  installedPlugins: [],
  registries: [
    {
      id: 'official',
      name: 'Official Registry',
      url: 'https://registry.careconnect.com',
      description: 'Official CareConnect plugin registry',
      plugins: [],
      isOfficial: true,
      lastSync: new Date(),
    },
  ],
  sdkModules: [
    {
      id: 'core-api',
      name: 'Core API',
      description: 'Core API for plugin development',
      version: '1.0.0',
      type: 'api',
      exports: ['usePlugin', 'useSDK', 'registerPlugin'],
      documentation: 'Core API documentation...',
      examples: ['Basic plugin example', 'Advanced plugin example'],
      dependencies: [],
    },
    {
      id: 'ui-components',
      name: 'UI Components',
      description: 'Reusable UI components',
      version: '1.0.0',
      type: 'component',
      exports: ['Button', 'Modal', 'Form', 'Table'],
      documentation: 'UI Components documentation...',
      examples: ['Button usage', 'Modal usage'],
      dependencies: ['core-api'],
    },
  ],
  sandboxes: [],
  activeSandbox: null,
  isLoading: false,
  error: null,
  settings: {
    autoUpdate: true,
    allowThirdParty: false,
    sandboxEnabled: true,
    maxSandboxes: 10,
    pluginTimeout: 30000, // 30 seconds
  },
};

// Reducer
function pluginReducer(state: PluginState, action: PluginAction): PluginState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PLUGINS':
      return { ...state, plugins: action.payload };
    case 'ADD_PLUGIN':
      return { ...state, plugins: [...state.plugins, action.payload] };
    case 'UPDATE_PLUGIN':
      return {
        ...state,
        plugins: state.plugins.map((plugin) =>
          plugin.id === action.payload.id ? action.payload : plugin
        ),
      };
    case 'REMOVE_PLUGIN':
      return {
        ...state,
        plugins: state.plugins.filter((plugin) => plugin.id !== action.payload),
      };
    case 'SET_INSTALLED_PLUGINS':
      return { ...state, installedPlugins: action.payload };
    case 'ADD_INSTALLED_PLUGIN':
      return { ...state, installedPlugins: [...state.installedPlugins, action.payload] };
    case 'UPDATE_INSTALLED_PLUGIN':
      return {
        ...state,
        installedPlugins: state.installedPlugins.map((installation) =>
          installation.id === action.payload.id ? action.payload : installation
        ),
      };
    case 'REMOVE_INSTALLED_PLUGIN':
      return {
        ...state,
        installedPlugins: state.installedPlugins.filter((installation) => installation.id !== action.payload),
      };
    case 'SET_REGISTRIES':
      return { ...state, registries: action.payload };
    case 'ADD_REGISTRY':
      return { ...state, registries: [...state.registries, action.payload] };
    case 'UPDATE_REGISTRY':
      return {
        ...state,
        registries: state.registries.map((registry) =>
          registry.id === action.payload.id ? action.payload : registry
        ),
      };
    case 'REMOVE_REGISTRY':
      return {
        ...state,
        registries: state.registries.filter((registry) => registry.id !== action.payload),
      };
    case 'SET_SDK_MODULES':
      return { ...state, sdkModules: action.payload };
    case 'ADD_SDK_MODULE':
      return { ...state, sdkModules: [...state.sdkModules, action.payload] };
    case 'UPDATE_SDK_MODULE':
      return {
        ...state,
        sdkModules: state.sdkModules.map((module) =>
          module.id === action.payload.id ? action.payload : module
        ),
      };
    case 'REMOVE_SDK_MODULE':
      return {
        ...state,
        sdkModules: state.sdkModules.filter((module) => module.id !== action.payload),
      };
    case 'SET_SANDBOXES':
      return { ...state, sandboxes: action.payload };
    case 'ADD_SANDBOX':
      return { ...state, sandboxes: [...state.sandboxes, action.payload] };
    case 'UPDATE_SANDBOX':
      return {
        ...state,
        sandboxes: state.sandboxes.map((sandbox) =>
          sandbox.id === action.payload.id ? action.payload : sandbox
        ),
      };
    case 'REMOVE_SANDBOX':
      return {
        ...state,
        sandboxes: state.sandboxes.filter((sandbox) => sandbox.id !== action.payload),
      };
    case 'SET_ACTIVE_SANDBOX':
      return { ...state, activeSandbox: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

// Context
interface PluginContextType {
  state: PluginState;
  dispatch: React.Dispatch<PluginAction>;
  // Plugin management
  installPlugin: (pluginId: string, version?: string) => Promise<void>;
  uninstallPlugin: (pluginId: string) => Promise<void>;
  updatePlugin: (pluginId: string) => Promise<void>;
  enablePlugin: (pluginId: string) => Promise<void>;
  disablePlugin: (pluginId: string) => Promise<void>;
  getPlugin: (pluginId: string) => Plugin | undefined;
  getInstalledPlugin: (pluginId: string) => PluginInstallation | undefined;
  // Registry management
  addRegistry: (registry: Omit<PluginRegistry, 'id' | 'lastSync'>) => Promise<void>;
  removeRegistry: (registryId: string) => Promise<void>;
  syncRegistry: (registryId: string) => Promise<void>;
  // SDK management
  getSDKModule: (moduleId: string) => SDKModule | undefined;
  registerSDKModule: (module: Omit<SDKModule, 'id'>) => Promise<void>;
  // Sandbox management
  createSandbox: (sandbox: Omit<CodeSandbox, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSandbox: (id: string, updates: Partial<CodeSandbox>) => Promise<void>;
  deleteSandbox: (id: string) => Promise<void>;
  runSandbox: (id: string) => Promise<void>;
  stopSandbox: (id: string) => Promise<void>;
  // Utility
  searchPlugins: (query: string, filters?: Record<string, any>) => Plugin[];
  exportPluginConfig: (pluginId: string) => Promise<string>;
  importPluginConfig: (config: string) => Promise<void>;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

// Provider
export function PluginProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(pluginReducer, initialState);

  // Load settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('careconnect_plugin_settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          dispatch({ type: 'SET_SETTINGS', payload: settings });
        }
      } catch (error) {
        console.error('Error loading plugin settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('careconnect_plugin_settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Plugin management
  const installPlugin = async (pluginId: string, version?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const plugin = state.plugins.find((p) => p.id === pluginId);
      if (!plugin) {
        throw new Error('Plugin not found');
      }

      const installation: PluginInstallation = {
        id: `install_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pluginId,
        version: version || plugin.version,
        status: 'installing',
        installPath: `/plugins/${pluginId}`,
        config: plugin.config,
        permissions: plugin.permissions,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: 'ADD_INSTALLED_PLUGIN', payload: installation });

      // Simulate installation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const installedPlugin = { ...installation, status: 'installed' as const };
      dispatch({ type: 'UPDATE_INSTALLED_PLUGIN', payload: installedPlugin });

      // Update plugin status
      const updatedPlugin = { ...plugin, status: 'active' as const };
      dispatch({ type: 'UPDATE_PLUGIN', payload: updatedPlugin });

      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error installing plugin:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to install plugin' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const uninstallPlugin = async (pluginId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const installation = state.installedPlugins.find((i) => i.pluginId === pluginId);
      if (!installation) {
        throw new Error('Plugin not installed');
      }

      const uninstallingPlugin = { ...installation, status: 'uninstalling' as const };
      dispatch({ type: 'UPDATE_INSTALLED_PLUGIN', payload: uninstallingPlugin });

      // Simulate uninstallation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      dispatch({ type: 'REMOVE_INSTALLED_PLUGIN', payload: installation.id });

      // Update plugin status
      const plugin = state.plugins.find((p) => p.id === pluginId);
      if (plugin) {
        const updatedPlugin = { ...plugin, status: 'inactive' as const };
        dispatch({ type: 'UPDATE_PLUGIN', payload: updatedPlugin });
      }

      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error uninstalling plugin:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to uninstall plugin' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updatePlugin = async (pluginId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const installation = state.installedPlugins.find((i) => i.pluginId === pluginId);
      if (!installation) {
        throw new Error('Plugin not installed');
      }

      const updatingPlugin = { ...installation, status: 'updating' as const };
      dispatch({ type: 'UPDATE_INSTALLED_PLUGIN', payload: updatingPlugin });

      // Simulate update
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const updatedPlugin = { ...installation, status: 'installed' as const, updatedAt: new Date() };
      dispatch({ type: 'UPDATE_INSTALLED_PLUGIN', payload: updatedPlugin });

      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error updating plugin:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update plugin' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const enablePlugin = async (pluginId: string) => {
    try {
      const plugin = state.plugins.find((p) => p.id === pluginId);
      if (plugin) {
        const updatedPlugin = { ...plugin, status: 'active' as const };
        dispatch({ type: 'UPDATE_PLUGIN', payload: updatedPlugin });
      }
    } catch (error) {
      console.error('Error enabling plugin:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to enable plugin' });
    }
  };

  const disablePlugin = async (pluginId: string) => {
    try {
      const plugin = state.plugins.find((p) => p.id === pluginId);
      if (plugin) {
        const updatedPlugin = { ...plugin, status: 'inactive' as const };
        dispatch({ type: 'UPDATE_PLUGIN', payload: updatedPlugin });
      }
    } catch (error) {
      console.error('Error disabling plugin:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to disable plugin' });
    }
  };

  const getPlugin = (pluginId: string) => {
    return state.plugins.find((plugin) => plugin.id === pluginId);
  };

  const getInstalledPlugin = (pluginId: string) => {
    return state.installedPlugins.find((installation) => installation.pluginId === pluginId);
  };

  // Registry management
  const addRegistry = async (registry: Omit<PluginRegistry, 'id' | 'lastSync'>) => {
    try {
      const newRegistry: PluginRegistry = {
        ...registry,
        id: `registry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lastSync: new Date(),
      };

      dispatch({ type: 'ADD_REGISTRY', payload: newRegistry });
    } catch (error) {
      console.error('Error adding registry:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add registry' });
    }
  };

  const removeRegistry = async (registryId: string) => {
    try {
      dispatch({ type: 'REMOVE_REGISTRY', payload: registryId });
    } catch (error) {
      console.error('Error removing registry:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove registry' });
    }
  };

  const syncRegistry = async (registryId: string) => {
    try {
      const registry = state.registries.find((r) => r.id === registryId);
      if (!registry) {
        throw new Error('Registry not found');
      }

      // Simulate sync
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const updatedRegistry = { ...registry, lastSync: new Date() };
      dispatch({ type: 'UPDATE_REGISTRY', payload: updatedRegistry });
    } catch (error) {
      console.error('Error syncing registry:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sync registry' });
    }
  };

  // SDK management
  const getSDKModule = (moduleId: string) => {
    return state.sdkModules.find((module) => module.id === moduleId);
  };

  const registerSDKModule = async (module: Omit<SDKModule, 'id'>) => {
    try {
      const newModule: SDKModule = {
        ...module,
        id: `sdk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      dispatch({ type: 'ADD_SDK_MODULE', payload: newModule });
    } catch (error) {
      console.error('Error registering SDK module:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to register SDK module' });
    }
  };

  // Sandbox management
  const createSandbox = async (sandbox: Omit<CodeSandbox, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSandbox: CodeSandbox = {
        ...sandbox,
        id: `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: 'ADD_SANDBOX', payload: newSandbox });
    } catch (error) {
      console.error('Error creating sandbox:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create sandbox' });
    }
  };

  const updateSandbox = async (id: string, updates: Partial<CodeSandbox>) => {
    try {
      const sandbox = state.sandboxes.find((s) => s.id === id);
      if (!sandbox) {
        throw new Error('Sandbox not found');
      }

      const updatedSandbox = { ...sandbox, ...updates, updatedAt: new Date() };
      dispatch({ type: 'UPDATE_SANDBOX', payload: updatedSandbox });
    } catch (error) {
      console.error('Error updating sandbox:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update sandbox' });
    }
  };

  const deleteSandbox = async (id: string) => {
    try {
      dispatch({ type: 'REMOVE_SANDBOX', payload: id });
    } catch (error) {
      console.error('Error deleting sandbox:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete sandbox' });
    }
  };

  const runSandbox = async (id: string) => {
    try {
      const sandbox = state.sandboxes.find((s) => s.id === id);
      if (!sandbox) {
        throw new Error('Sandbox not found');
      }

      const runningSandbox = { ...sandbox, isRunning: true, output: '', errors: [] };
      dispatch({ type: 'UPDATE_SANDBOX', payload: runningSandbox });
      dispatch({ type: 'SET_ACTIVE_SANDBOX', payload: runningSandbox });

      // Simulate code execution
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let output = '';
      let errors: string[] = [];

      try {
        // Simple code execution simulation
        if (sandbox.language === 'javascript' || sandbox.language === 'typescript') {
          // Simulate JavaScript execution
          output = 'Hello from JavaScript sandbox!\n';
          output += 'Code executed successfully.';
        } else if (sandbox.language === 'python') {
          output = 'Hello from Python sandbox!\n';
          output += 'Code executed successfully.';
        } else {
          output = 'Code executed successfully.';
        }
      } catch (error) {
        errors = [error instanceof Error ? error.message : 'Unknown error'];
      }

      const completedSandbox = { ...runningSandbox, isRunning: false, output, errors };
      dispatch({ type: 'UPDATE_SANDBOX', payload: completedSandbox });
      dispatch({ type: 'SET_ACTIVE_SANDBOX', payload: completedSandbox });
    } catch (error) {
      console.error('Error running sandbox:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to run sandbox' });
    }
  };

  const stopSandbox = async (id: string) => {
    try {
      const sandbox = state.sandboxes.find((s) => s.id === id);
      if (sandbox) {
        const stoppedSandbox = { ...sandbox, isRunning: false };
        dispatch({ type: 'UPDATE_SANDBOX', payload: stoppedSandbox });
        
        if (state.activeSandbox?.id === id) {
          dispatch({ type: 'SET_ACTIVE_SANDBOX', payload: null });
        }
      }
    } catch (error) {
      console.error('Error stopping sandbox:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to stop sandbox' });
    }
  };

  // Utility
  const searchPlugins = (query: string, filters?: Record<string, any>): Plugin[] => {
    let results = state.plugins;

    // Search by query
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter((plugin) =>
        plugin.name.toLowerCase().includes(lowerQuery) ||
        plugin.description.toLowerCase().includes(lowerQuery) ||
        plugin.metadata.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        results = results.filter((plugin) => plugin.category === filters.category);
      }
      if (filters.status) {
        results = results.filter((plugin) => plugin.status === filters.status);
      }
      if (filters.minRating) {
        results = results.filter((plugin) => plugin.stats.rating >= filters.minRating);
      }
    }

    return results;
  };

  const exportPluginConfig = async (pluginId: string): Promise<string> => {
    try {
      const installation = state.installedPlugins.find((i) => i.pluginId === pluginId);
      if (!installation) {
        throw new Error('Plugin not installed');
      }

      const config = {
        pluginId,
        version: installation.version,
        config: installation.config,
        permissions: installation.permissions,
        exportDate: new Date().toISOString(),
      };

      return JSON.stringify(config, null, 2);
    } catch (error) {
      console.error('Error exporting plugin config:', error);
      throw new Error('Failed to export plugin config');
    }
  };

  const importPluginConfig = async (config: string) => {
    try {
      const configData = JSON.parse(config);
      
      // Validate config
      if (!configData.pluginId || !configData.version) {
        throw new Error('Invalid plugin config');
      }

      // Find the plugin
      const plugin = state.plugins.find((p) => p.id === configData.pluginId);
      if (!plugin) {
        throw new Error('Plugin not found');
      }

      // Install with imported config
      const installation: PluginInstallation = {
        id: `install_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pluginId: configData.pluginId,
        version: configData.version,
        status: 'installed',
        installPath: `/plugins/${configData.pluginId}`,
        config: configData.config || plugin.config,
        permissions: configData.permissions || plugin.permissions,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: 'ADD_INSTALLED_PLUGIN', payload: installation });
    } catch (error) {
      console.error('Error importing plugin config:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import plugin config' });
    }
  };

  const value: PluginContextType = {
    state,
    dispatch,
    installPlugin,
    uninstallPlugin,
    updatePlugin,
    enablePlugin,
    disablePlugin,
    getPlugin,
    getInstalledPlugin,
    addRegistry,
    removeRegistry,
    syncRegistry,
    getSDKModule,
    registerSDKModule,
    createSandbox,
    updateSandbox,
    deleteSandbox,
    runSandbox,
    stopSandbox,
    searchPlugins,
    exportPluginConfig,
    importPluginConfig,
  };

  return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>;
}

// Hook
export function usePlugin() {
  const context = useContext(PluginContext);
  if (context === undefined) {
    throw new Error('usePlugin must be used within a PluginProvider');
  }
  return context;
}
