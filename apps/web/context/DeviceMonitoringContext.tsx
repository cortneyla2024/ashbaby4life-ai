'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';

// Types
interface DeviceMetrics {
  cpu: {
    usage: number;
    temperature: number;
    cores: number;
    frequency: number;
  };
  memory: {
    total: number;
    used: number;
    available: number;
    usage: number;
  };
  battery: {
    level: number;
    charging: boolean;
    timeRemaining: number;
    health: number;
  };
  network: {
    type: 'wifi' | 'ethernet' | 'cellular' | 'none';
    speed: number;
    latency: number;
    signalStrength: number;
  };
  storage: {
    total: number;
    used: number;
    available: number;
    usage: number;
  };
  performance: {
    fps: number;
    loadTime: number;
    memoryLeak: boolean;
    errors: number;
  };
}

interface DiagnosticResult {
  id: string;
  type: 'performance' | 'security' | 'health' | 'network' | 'storage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  timestamp: Date;
  resolved: boolean;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  action?: string;
}

interface DeviceMonitoringState {
  metrics: DeviceMetrics;
  diagnostics: DiagnosticResult[];
  alerts: Alert[];
  isMonitoring: boolean;
  monitoringInterval: number;
  lastUpdate: Date | null;
  isLoading: boolean;
  error: string | null;
  settings: {
    autoDiagnose: boolean;
    alertThresholds: {
      cpuUsage: number;
      memoryUsage: number;
      batteryLevel: number;
      storageUsage: number;
    };
    monitoringEnabled: boolean;
  };
}

type DeviceMonitoringAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_METRICS'; payload: Partial<DeviceMetrics> }
  | { type: 'SET_DIAGNOSTICS'; payload: DiagnosticResult[] }
  | { type: 'ADD_DIAGNOSTIC'; payload: DiagnosticResult }
  | { type: 'UPDATE_DIAGNOSTIC'; payload: DiagnosticResult }
  | { type: 'DELETE_DIAGNOSTIC'; payload: string }
  | { type: 'SET_ALERTS'; payload: Alert[] }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'UPDATE_ALERT'; payload: Alert }
  | { type: 'DELETE_ALERT'; payload: string }
  | { type: 'SET_MONITORING'; payload: boolean }
  | { type: 'SET_MONITORING_INTERVAL'; payload: number }
  | { type: 'SET_LAST_UPDATE'; payload: Date }
  | { type: 'SET_SETTINGS'; payload: Partial<DeviceMonitoringState['settings']> };

// Initial state
const initialState: DeviceMonitoringState = {
  metrics: {
    cpu: { usage: 0, temperature: 0, cores: 0, frequency: 0 },
    memory: { total: 0, used: 0, available: 0, usage: 0 },
    battery: { level: 0, charging: false, timeRemaining: 0, health: 0 },
    network: { type: 'none', speed: 0, latency: 0, signalStrength: 0 },
    storage: { total: 0, used: 0, available: 0, usage: 0 },
    performance: { fps: 0, loadTime: 0, memoryLeak: false, errors: 0 },
  },
  diagnostics: [],
  alerts: [],
  isMonitoring: false,
  monitoringInterval: 5000, // 5 seconds
  lastUpdate: null,
  isLoading: false,
  error: null,
  settings: {
    autoDiagnose: true,
    alertThresholds: {
      cpuUsage: 80,
      memoryUsage: 85,
      batteryLevel: 20,
      storageUsage: 90,
    },
    monitoringEnabled: true,
  },
};

// Reducer
function deviceMonitoringReducer(state: DeviceMonitoringState, action: DeviceMonitoringAction): DeviceMonitoringState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_METRICS':
      return { ...state, metrics: { ...state.metrics, ...action.payload } };
    case 'SET_DIAGNOSTICS':
      return { ...state, diagnostics: action.payload };
    case 'ADD_DIAGNOSTIC':
      return { ...state, diagnostics: [...state.diagnostics, action.payload] };
    case 'UPDATE_DIAGNOSTIC':
      return {
        ...state,
        diagnostics: state.diagnostics.map((diagnostic) =>
          diagnostic.id === action.payload.id ? action.payload : diagnostic
        ),
      };
    case 'DELETE_DIAGNOSTIC':
      return {
        ...state,
        diagnostics: state.diagnostics.filter((diagnostic) => diagnostic.id !== action.payload),
      };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'ADD_ALERT':
      return { ...state, alerts: [...state.alerts, action.payload] };
    case 'UPDATE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.payload.id ? action.payload : alert
        ),
      };
    case 'DELETE_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      };
    case 'SET_MONITORING':
      return { ...state, isMonitoring: action.payload };
    case 'SET_MONITORING_INTERVAL':
      return { ...state, monitoringInterval: action.payload };
    case 'SET_LAST_UPDATE':
      return { ...state, lastUpdate: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

// Context
interface DeviceMonitoringContextType {
  state: DeviceMonitoringState;
  dispatch: React.Dispatch<DeviceMonitoringAction>;
  // Monitoring actions
  startMonitoring: () => void;
  stopMonitoring: () => void;
  updateMetrics: () => Promise<void>;
  // Diagnostic actions
  runDiagnostic: (type?: DiagnosticResult['type']) => Promise<DiagnosticResult[]>;
  resolveDiagnostic: (id: string) => Promise<void>;
  clearDiagnostics: () => void;
  // Alert actions
  acknowledgeAlert: (id: string) => void;
  clearAlerts: () => void;
  // Settings actions
  updateSettings: (settings: Partial<DeviceMonitoringState['settings']>) => void;
  // Utility actions
  getSystemInfo: () => Promise<Record<string, any>>;
  exportReport: (format: 'json' | 'csv' | 'pdf') => Promise<string>;
  optimizePerformance: () => Promise<void>;
}

const DeviceMonitoringContext = createContext<DeviceMonitoringContextType | undefined>(undefined);

// Provider
export function DeviceMonitoringProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(deviceMonitoringReducer, initialState);
  const monitoringRef = useRef<NodeJS.Timeout | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('careconnect_device_settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          dispatch({ type: 'SET_SETTINGS', payload: settings });
        }
      } catch (error) {
        console.error('Error loading device settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('careconnect_device_settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Start monitoring when enabled
  useEffect(() => {
    if (state.settings.monitoringEnabled && !state.isMonitoring) {
      startMonitoring();
    } else if (!state.settings.monitoringEnabled && state.isMonitoring) {
      stopMonitoring();
    }
  }, [state.settings.monitoringEnabled]);

  // Cleanup monitoring on unmount
  useEffect(() => {
    return () => {
      if (monitoringRef.current) {
        clearInterval(monitoringRef.current);
      }
    };
  }, []);

  // Get device metrics
  const getDeviceMetrics = async (): Promise<Partial<DeviceMetrics>> => {
    const metrics: Partial<DeviceMetrics> = {};

    try {
      // CPU metrics (simulated)
      if ('hardwareConcurrency' in navigator) {
        metrics.cpu = {
          usage: Math.random() * 100,
          temperature: 40 + Math.random() * 30,
          cores: navigator.hardwareConcurrency,
          frequency: 2000 + Math.random() * 2000,
        };
      }

      // Memory metrics (simulated)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metrics.memory = {
          total: memory.jsHeapSizeLimit,
          used: memory.usedJSHeapSize,
          available: memory.jsHeapSizeLimit - memory.usedJSHeapSize,
          usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
        };
      }

      // Battery metrics
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          metrics.battery = {
            level: battery.level * 100,
            charging: battery.charging,
            timeRemaining: battery.charging ? 0 : Math.random() * 3600,
            health: 80 + Math.random() * 20,
          };
        } catch (error) {
          console.warn('Battery API not available');
        }
      }

      // Network metrics
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        metrics.network = {
          type: connection?.effectiveType === '4g' ? 'cellular' : 'wifi',
          speed: connection?.downlink || 0,
          latency: connection?.rtt || 0,
          signalStrength: Math.random() * 100,
        };
      }

      // Storage metrics (simulated)
      if ('storage' in navigator && 'estimate' in (navigator as any).storage) {
        try {
          const estimate = await (navigator as any).storage.estimate();
          metrics.storage = {
            total: estimate.quota || 0,
            used: estimate.usage || 0,
            available: (estimate.quota || 0) - (estimate.usage || 0),
            usage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0,
          };
        } catch (error) {
          console.warn('Storage API not available');
        }
      }

      // Performance metrics
      metrics.performance = {
        fps: 60 - Math.random() * 10,
        loadTime: performance.now(),
        memoryLeak: false,
        errors: 0,
      };

    } catch (error) {
      console.error('Error getting device metrics:', error);
    }

    return metrics;
  };

  // Monitoring actions
  const startMonitoring = () => {
    if (monitoringRef.current) {
      clearInterval(monitoringRef.current);
    }

    const monitor = async () => {
      try {
        const metrics = await getDeviceMetrics();
        dispatch({ type: 'UPDATE_METRICS', payload: metrics });
        dispatch({ type: 'SET_LAST_UPDATE', payload: new Date() });

        // Check for alerts
        if (state.settings.autoDiagnose) {
          await checkForAlerts(metrics);
        }
      } catch (error) {
        console.error('Error in monitoring loop:', error);
      }
    };

    monitor(); // Run immediately
    monitoringRef.current = setInterval(monitor, state.monitoringInterval);
    dispatch({ type: 'SET_MONITORING', payload: true });
  };

  const stopMonitoring = () => {
    if (monitoringRef.current) {
      clearInterval(monitoringRef.current);
      monitoringRef.current = null;
    }
    dispatch({ type: 'SET_MONITORING', payload: false });
  };

  const updateMetrics = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const metrics = await getDeviceMetrics();
      dispatch({ type: 'UPDATE_METRICS', payload: metrics });
      dispatch({ type: 'SET_LAST_UPDATE', payload: new Date() });
    } catch (error) {
      console.error('Error updating metrics:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update metrics' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Check for alerts based on thresholds
  const checkForAlerts = async (metrics: Partial<DeviceMetrics>) => {
    const alerts: Alert[] = [];

    if (metrics.cpu?.usage && metrics.cpu.usage > state.settings.alertThresholds.cpuUsage) {
      alerts.push({
        id: `alert_${Date.now()}_cpu`,
        type: 'warning',
        title: 'High CPU Usage',
        message: `CPU usage is ${metrics.cpu.usage.toFixed(1)}%`,
        timestamp: new Date(),
        acknowledged: false,
        action: 'Consider closing unnecessary applications',
      });
    }

    if (metrics.memory?.usage && metrics.memory.usage > state.settings.alertThresholds.memoryUsage) {
      alerts.push({
        id: `alert_${Date.now()}_memory`,
        type: 'warning',
        title: 'High Memory Usage',
        message: `Memory usage is ${metrics.memory.usage.toFixed(1)}%`,
        timestamp: new Date(),
        acknowledged: false,
        action: 'Consider restarting applications or the system',
      });
    }

    if (metrics.battery?.level && metrics.battery.level < state.settings.alertThresholds.batteryLevel) {
      alerts.push({
        id: `alert_${Date.now()}_battery`,
        type: 'warning',
        title: 'Low Battery',
        message: `Battery level is ${metrics.battery.level.toFixed(1)}%`,
        timestamp: new Date(),
        acknowledged: false,
        action: 'Connect to power source',
      });
    }

    if (metrics.storage?.usage && metrics.storage.usage > state.settings.alertThresholds.storageUsage) {
      alerts.push({
        id: `alert_${Date.now()}_storage`,
        type: 'warning',
        title: 'Low Storage Space',
        message: `Storage usage is ${metrics.storage.usage.toFixed(1)}%`,
        timestamp: new Date(),
        acknowledged: false,
        action: 'Free up disk space',
      });
    }

    // Add new alerts
    alerts.forEach((alert) => {
      dispatch({ type: 'ADD_ALERT', payload: alert });
    });
  };

  // Diagnostic actions
  const runDiagnostic = async (type?: DiagnosticResult['type']): Promise<DiagnosticResult[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const diagnostics: DiagnosticResult[] = [];
      const timestamp = new Date();

      // Performance diagnostic
      if (!type || type === 'performance') {
        const loadTime = performance.now();
        if (loadTime > 3000) {
          diagnostics.push({
            id: `diag_${Date.now()}_perf`,
            type: 'performance',
            severity: 'medium',
            title: 'Slow Page Load',
            description: `Page load time is ${loadTime.toFixed(0)}ms`,
            recommendation: 'Consider optimizing images and scripts',
            timestamp,
            resolved: false,
          });
        }
      }

      // Security diagnostic
      if (!type || type === 'security') {
        if (!window.isSecureContext) {
          diagnostics.push({
            id: `diag_${Date.now()}_sec`,
            type: 'security',
            severity: 'high',
            title: 'Insecure Connection',
            description: 'Application is not running over HTTPS',
            recommendation: 'Use HTTPS for secure connections',
            timestamp,
            resolved: false,
          });
        }
      }

      // Health diagnostic
      if (!type || type === 'health') {
        const memoryUsage = state.metrics.memory.usage;
        if (memoryUsage > 90) {
          diagnostics.push({
            id: `diag_${Date.now()}_health`,
            type: 'health',
            severity: 'high',
            title: 'High Memory Usage',
            description: `Memory usage is ${memoryUsage.toFixed(1)}%`,
            recommendation: 'Restart the application or clear cache',
            timestamp,
            resolved: false,
          });
        }
      }

      // Network diagnostic
      if (!type || type === 'network') {
        const latency = state.metrics.network.latency;
        if (latency > 100) {
          diagnostics.push({
            id: `diag_${Date.now()}_net`,
            type: 'network',
            severity: 'medium',
            title: 'High Network Latency',
            description: `Network latency is ${latency}ms`,
            recommendation: 'Check your internet connection',
            timestamp,
            resolved: false,
          });
        }
      }

      // Storage diagnostic
      if (!type || type === 'storage') {
        const storageUsage = state.metrics.storage.usage;
        if (storageUsage > 95) {
          diagnostics.push({
            id: `diag_${Date.now()}_storage`,
            type: 'storage',
            severity: 'critical',
            title: 'Critical Storage Space',
            description: `Storage usage is ${storageUsage.toFixed(1)}%`,
            recommendation: 'Immediately free up disk space',
            timestamp,
            resolved: false,
          });
        }
      }

      // Add diagnostics to state
      diagnostics.forEach((diagnostic) => {
        dispatch({ type: 'ADD_DIAGNOSTIC', payload: diagnostic });
      });

      return diagnostics;
    } catch (error) {
      console.error('Error running diagnostic:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to run diagnostic' });
      return [];
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resolveDiagnostic = async (id: string) => {
    try {
      const diagnostic = state.diagnostics.find((d) => d.id === id);
      if (diagnostic) {
        const updatedDiagnostic = { ...diagnostic, resolved: true };
        dispatch({ type: 'UPDATE_DIAGNOSTIC', payload: updatedDiagnostic });
      }
    } catch (error) {
      console.error('Error resolving diagnostic:', error);
    }
  };

  const clearDiagnostics = () => {
    dispatch({ type: 'SET_DIAGNOSTICS', payload: [] });
  };

  // Alert actions
  const acknowledgeAlert = (id: string) => {
    const alert = state.alerts.find((a) => a.id === id);
    if (alert) {
      const updatedAlert = { ...alert, acknowledged: true };
      dispatch({ type: 'UPDATE_ALERT', payload: updatedAlert });
    }
  };

  const clearAlerts = () => {
    dispatch({ type: 'SET_ALERTS', payload: [] });
  };

  // Settings actions
  const updateSettings = (settings: Partial<DeviceMonitoringState['settings']>) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
  };

  // Utility actions
  const getSystemInfo = async (): Promise<Record<string, any>> => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
      },
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      },
    };
  };

  const exportReport = async (format: 'json' | 'csv' | 'pdf'): Promise<string> => {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        metrics: state.metrics,
        diagnostics: state.diagnostics,
        alerts: state.alerts,
        systemInfo: await getSystemInfo(),
      };

      switch (format) {
        case 'json':
          return JSON.stringify(report, null, 2);
        case 'csv':
          const csvRows = [
            'Timestamp,Metric,Value',
            `${report.timestamp},CPU Usage,${report.metrics.cpu.usage}%`,
            `${report.timestamp},Memory Usage,${report.metrics.memory.usage}%`,
            `${report.timestamp},Battery Level,${report.metrics.battery.level}%`,
            `${report.timestamp},Storage Usage,${report.metrics.storage.usage}%`,
          ];
          return csvRows.join('\n');
        case 'pdf':
          // Simple PDF-like format (placeholder)
          return `Device Monitoring Report\nGenerated: ${report.timestamp}\n\nMetrics:\nCPU: ${report.metrics.cpu.usage}%\nMemory: ${report.metrics.memory.usage}%\nBattery: ${report.metrics.battery.level}%`;
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      throw new Error('Failed to export report');
    }
  };

  const optimizePerformance = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Simulate optimization process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear some memory
      if ('gc' in window) {
        (window as any).gc();
      }

      // Update metrics after optimization
      await updateMetrics();

      // Add success alert
      const alert: Alert = {
        id: `alert_${Date.now()}_optimize`,
        type: 'success',
        title: 'Performance Optimized',
        message: 'System performance has been optimized',
        timestamp: new Date(),
        acknowledged: false,
      };

      dispatch({ type: 'ADD_ALERT', payload: alert });
    } catch (error) {
      console.error('Error optimizing performance:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to optimize performance' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value: DeviceMonitoringContextType = {
    state,
    dispatch,
    startMonitoring,
    stopMonitoring,
    updateMetrics,
    runDiagnostic,
    resolveDiagnostic,
    clearDiagnostics,
    acknowledgeAlert,
    clearAlerts,
    updateSettings,
    getSystemInfo,
    exportReport,
    optimizePerformance,
  };

  return <DeviceMonitoringContext.Provider value={value}>{children}</DeviceMonitoringContext.Provider>;
}

// Hook
export function useDeviceMonitoring() {
  const context = useContext(DeviceMonitoringContext);
  if (context === undefined) {
    throw new Error('useDeviceMonitoring must be used within a DeviceMonitoringProvider');
  }
  return context;
}
