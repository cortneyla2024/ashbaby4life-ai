'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';

// Types
interface SyncNode {
  id: string;
  name: string;
  address: string;
  port: number;
  publicKey: string;
  isOnline: boolean;
  lastSeen: Date;
  capabilities: string[];
  dataHash: string;
}

interface SyncData {
  id: string;
  type: 'user' | 'file' | 'conversation' | 'health' | 'finance' | 'learning' | 'creative' | 'social';
  data: any;
  hash: string;
  timestamp: Date;
  version: number;
  encrypted: boolean;
  signature: string;
}

interface SyncSession {
  id: string;
  nodeId: string;
  startTime: Date;
  endTime?: Date;
  status: 'connecting' | 'connected' | 'syncing' | 'completed' | 'failed';
  dataTransferred: number;
  errors: string[];
}

interface EncryptionKey {
  id: string;
  name: string;
  publicKey: string;
  privateKey?: string;
  algorithm: 'AES-256' | 'RSA-2048' | 'ChaCha20-Poly1305';
  createdAt: Date;
  expiresAt?: Date;
}

interface P2PConnection {
  id: string;
  nodeId: string;
  type: 'direct' | 'relay' | 'tunnel';
  status: 'connecting' | 'connected' | 'disconnected' | 'failed';
  latency: number;
  bandwidth: number;
  lastPing: Date;
}

interface SyncState {
  nodes: SyncNode[];
  localNode: SyncNode | null;
  connections: P2PConnection[];
  syncSessions: SyncSession[];
  encryptionKeys: EncryptionKey[];
  syncData: SyncData[];
  isOnline: boolean;
  isSyncing: boolean;
  isLoading: boolean;
  syncProgress: number;
  lastSync: Date | null;
  error: string | null;
  settings: {
    autoSync: boolean;
    syncInterval: number;
    encryptionEnabled: boolean;
    p2pEnabled: boolean;
    maxConnections: number;
    dataRetention: number;
  };
}

type SyncAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NODES'; payload: SyncNode[] }
  | { type: 'ADD_NODE'; payload: SyncNode }
  | { type: 'UPDATE_NODE'; payload: SyncNode }
  | { type: 'REMOVE_NODE'; payload: string }
  | { type: 'SET_LOCAL_NODE'; payload: SyncNode }
  | { type: 'SET_CONNECTIONS'; payload: P2PConnection[] }
  | { type: 'ADD_CONNECTION'; payload: P2PConnection }
  | { type: 'UPDATE_CONNECTION'; payload: P2PConnection }
  | { type: 'REMOVE_CONNECTION'; payload: string }
  | { type: 'SET_SYNC_SESSIONS'; payload: SyncSession[] }
  | { type: 'ADD_SYNC_SESSION'; payload: SyncSession }
  | { type: 'UPDATE_SYNC_SESSION'; payload: SyncSession }
  | { type: 'SET_ENCRYPTION_KEYS'; payload: EncryptionKey[] }
  | { type: 'ADD_ENCRYPTION_KEY'; payload: EncryptionKey }
  | { type: 'REMOVE_ENCRYPTION_KEY'; payload: string }
  | { type: 'SET_SYNC_DATA'; payload: SyncData[] }
  | { type: 'ADD_SYNC_DATA'; payload: SyncData }
  | { type: 'UPDATE_SYNC_DATA'; payload: SyncData }
  | { type: 'REMOVE_SYNC_DATA'; payload: string }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'SET_SYNC_PROGRESS'; payload: number }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'SET_SETTINGS'; payload: Partial<SyncState['settings']> };

// Initial state
const initialState: SyncState = {
  nodes: [],
  localNode: null,
  connections: [],
  syncSessions: [],
  encryptionKeys: [],
  syncData: [],
  isOnline: false,
  isSyncing: false,
  isLoading: false,
  syncProgress: 0,
  lastSync: null,
  error: null,
  settings: {
    autoSync: true,
    syncInterval: 300000, // 5 minutes
    encryptionEnabled: true,
    p2pEnabled: true,
    maxConnections: 10,
    dataRetention: 30, // days
  },
};

// Reducer
function syncReducer(state: SyncState, action: SyncAction): SyncState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_NODES':
      return { ...state, nodes: action.payload };
    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.payload] };
    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload.id ? action.payload : node
        ),
      };
    case 'REMOVE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter((node) => node.id !== action.payload),
      };
    case 'SET_LOCAL_NODE':
      return { ...state, localNode: action.payload };
    case 'SET_CONNECTIONS':
      return { ...state, connections: action.payload };
    case 'ADD_CONNECTION':
      return { ...state, connections: [...state.connections, action.payload] };
    case 'UPDATE_CONNECTION':
      return {
        ...state,
        connections: state.connections.map((conn) =>
          conn.id === action.payload.id ? action.payload : conn
        ),
      };
    case 'REMOVE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter((conn) => conn.id !== action.payload),
      };
    case 'SET_SYNC_SESSIONS':
      return { ...state, syncSessions: action.payload };
    case 'ADD_SYNC_SESSION':
      return { ...state, syncSessions: [...state.syncSessions, action.payload] };
    case 'UPDATE_SYNC_SESSION':
      return {
        ...state,
        syncSessions: state.syncSessions.map((session) =>
          session.id === action.payload.id ? action.payload : session
        ),
      };
    case 'SET_ENCRYPTION_KEYS':
      return { ...state, encryptionKeys: action.payload };
    case 'ADD_ENCRYPTION_KEY':
      return { ...state, encryptionKeys: [...state.encryptionKeys, action.payload] };
    case 'REMOVE_ENCRYPTION_KEY':
      return {
        ...state,
        encryptionKeys: state.encryptionKeys.filter((key) => key.id !== action.payload),
      };
    case 'SET_SYNC_DATA':
      return { ...state, syncData: action.payload };
    case 'ADD_SYNC_DATA':
      return { ...state, syncData: [...state.syncData, action.payload] };
    case 'UPDATE_SYNC_DATA':
      return {
        ...state,
        syncData: state.syncData.map((data) =>
          data.id === action.payload.id ? action.payload : data
        ),
      };
    case 'REMOVE_SYNC_DATA':
      return {
        ...state,
        syncData: state.syncData.filter((data) => data.id !== action.payload),
      };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };
    case 'SET_SYNC_PROGRESS':
      return { ...state, syncProgress: action.payload };
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

// Context
interface SyncContextType {
  state: SyncState;
  dispatch: React.Dispatch<SyncAction>;
  // Node management
  initializeLocalNode: () => Promise<void>;
  discoverNodes: () => Promise<SyncNode[]>;
  connectToNode: (nodeId: string) => Promise<void>;
  disconnectFromNode: (nodeId: string) => Promise<void>;
  // Data synchronization
  startSync: (nodeId?: string) => Promise<void>;
  stopSync: () => void;
  syncData: (data: any, type: SyncData['type']) => Promise<void>;
  getSyncStatus: () => Promise<{ isOnline: boolean; lastSync: Date | null; progress: number }>;
  // Encryption
  generateKeyPair: (name: string, algorithm?: EncryptionKey['algorithm']) => Promise<EncryptionKey>;
  encryptData: (data: any, keyId: string) => Promise<string>;
  decryptData: (encryptedData: string, keyId: string) => Promise<any>;
  // P2P networking
  startP2P: () => Promise<void>;
  stopP2P: () => void;
  getNetworkStatus: () => Promise<{ connections: number; bandwidth: number; latency: number }>;
  // Utility
  exportSyncData: (format: 'json' | 'csv') => Promise<string>;
  importSyncData: (data: string, format: 'json' | 'csv') => Promise<void>;
  clearSyncData: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

// Provider
export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(syncReducer, initialState);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const p2pRef = useRef<any>(null);

  // Load settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('careconnect_sync_settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          dispatch({ type: 'SET_SETTINGS', payload: settings });
        }
      } catch (error) {
        console.error('Error loading sync settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('careconnect_sync_settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Auto-sync when enabled
  useEffect(() => {
    if (state.settings.autoSync && state.isOnline) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      syncIntervalRef.current = setInterval(() => {
        startSync();
      }, state.settings.syncInterval);
    } else if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [state.settings.autoSync, state.settings.syncInterval, state.isOnline]);

  // Initialize local node
  const initializeLocalNode = async () => {
    try {
      const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const publicKey = await generatePublicKey();
      
      const localNode: SyncNode = {
        id: nodeId,
        name: 'Local Node',
        address: '127.0.0.1',
        port: 8080,
        publicKey,
        isOnline: true,
        lastSeen: new Date(),
        capabilities: ['sync', 'encrypt', 'p2p'],
        dataHash: '',
      };

      dispatch({ type: 'SET_LOCAL_NODE', payload: localNode });
      dispatch({ type: 'SET_ONLINE', payload: true });
    } catch (error) {
      console.error('Error initializing local node:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize local node' });
    }
  };

  // Generate public key (simulated)
  const generatePublicKey = async (): Promise<string> => {
    // Simulate key generation
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Discover nodes (simulated)
  const discoverNodes = async (): Promise<SyncNode[]> => {
    try {
      // Simulate node discovery
      const discoveredNodes: SyncNode[] = [
        {
          id: 'node_remote_1',
          name: 'Remote Node 1',
          address: '192.168.1.100',
          port: 8080,
          publicKey: 'remote_key_1',
          isOnline: true,
          lastSeen: new Date(),
          capabilities: ['sync', 'encrypt'],
          dataHash: 'hash_1',
        },
        {
          id: 'node_remote_2',
          name: 'Remote Node 2',
          address: '192.168.1.101',
          port: 8080,
          publicKey: 'remote_key_2',
          isOnline: false,
          lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
          capabilities: ['sync'],
          dataHash: 'hash_2',
        },
      ];

      dispatch({ type: 'SET_NODES', payload: discoveredNodes });
      return discoveredNodes;
    } catch (error) {
      console.error('Error discovering nodes:', error);
      return [];
    }
  };

  // Connect to node
  const connectToNode = async (nodeId: string) => {
    try {
      const node = state.nodes.find((n) => n.id === nodeId);
      if (!node) {
        throw new Error('Node not found');
      }

      const connection: P2PConnection = {
        id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nodeId,
        type: 'direct',
        status: 'connecting' as const,
        latency: 0,
        bandwidth: 0,
        lastPing: new Date(),
      };

      dispatch({ type: 'ADD_CONNECTION', payload: connection });

      // Simulate connection
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const connectedConnection = { ...connection, status: 'connected' as const, latency: 50, bandwidth: 1000000 };
      dispatch({ type: 'UPDATE_CONNECTION', payload: connectedConnection });
    } catch (error) {
      console.error('Error connecting to node:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to node' });
    }
  };

  // Disconnect from node
  const disconnectFromNode = async (nodeId: string) => {
    try {
      const connection = state.connections.find((c) => c.nodeId === nodeId);
      if (connection) {
        const disconnectedConnection = { ...connection, status: 'disconnected' as const };
        dispatch({ type: 'UPDATE_CONNECTION', payload: disconnectedConnection });
        
        // Remove connection after a delay
        setTimeout(() => {
          dispatch({ type: 'REMOVE_CONNECTION', payload: connection.id });
        }, 1000);
      }
    } catch (error) {
      console.error('Error disconnecting from node:', error);
    }
  };

  // Start sync
  const startSync = async (nodeId?: string) => {
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      dispatch({ type: 'SET_SYNC_PROGRESS', payload: 0 });

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session: SyncSession = {
        id: sessionId,
        nodeId: nodeId || 'local',
        startTime: new Date(),
        status: 'syncing' as const,
        dataTransferred: 0,
        errors: [],
      };

      dispatch({ type: 'ADD_SYNC_SESSION', payload: session });

      // Simulate sync progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        dispatch({ type: 'SET_SYNC_PROGRESS', payload: i });
        
        const updatedSession = {
          ...session,
          dataTransferred: i * 1024, // 1KB per 10%
        };
        dispatch({ type: 'UPDATE_SYNC_SESSION', payload: updatedSession });
      }

      const completedSession = {
        ...session,
        endTime: new Date(),
        status: 'completed' as const,
        dataTransferred: 10240, // 10KB total
      };
      dispatch({ type: 'UPDATE_SYNC_SESSION', payload: completedSession });

      dispatch({ type: 'SET_LAST_SYNC', payload: new Date() });
      dispatch({ type: 'SET_SYNCING', payload: false });
    } catch (error) {
      console.error('Error during sync:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Sync failed' });
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  // Stop sync
  const stopSync = () => {
    dispatch({ type: 'SET_SYNCING', payload: false });
    dispatch({ type: 'SET_SYNC_PROGRESS', payload: 0 });
  };

  // Sync data
  const syncData = async (data: any, type: SyncData['type']) => {
    try {
      const dataId = `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const hash = await generateHash(JSON.stringify(data));
      
      let processedData = data;
      let encrypted = false;
      let signature = '';

      // Encrypt if enabled
      if (state.settings.encryptionEnabled && state.encryptionKeys.length > 0) {
        const key = state.encryptionKeys[0];
        processedData = await encryptData(data, key.id);
        encrypted = true;
      }

      // Generate signature
      signature = await generateSignature(JSON.stringify(processedData));

      const syncDataItem: SyncData = {
        id: dataId,
        type,
        data: processedData,
        hash,
        timestamp: new Date(),
        version: 1,
        encrypted,
        signature,
      };

      dispatch({ type: 'ADD_SYNC_DATA', payload: syncDataItem });
    } catch (error) {
      console.error('Error syncing data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sync data' });
    }
  };

  // Generate hash (simulated)
  const generateHash = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Generate signature (simulated)
  const generateSignature = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('').substring(0, 16);
  };

  // Get sync status
  const getSyncStatus = async () => {
    return {
      isOnline: state.isOnline,
      lastSync: state.lastSync,
      progress: state.syncProgress,
    };
  };

  // Generate key pair
  const generateKeyPair = async (name: string, algorithm: EncryptionKey['algorithm'] = 'AES-256'): Promise<EncryptionKey> => {
    try {
      const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const publicKey = await generatePublicKey();
      
      const key: EncryptionKey = {
        id: keyId,
        name,
        publicKey,
        algorithm,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      };

      dispatch({ type: 'ADD_ENCRYPTION_KEY', payload: key });
      return key;
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw new Error('Failed to generate key pair');
    }
  };

  // Encrypt data
  const encryptData = async (data: any, keyId: string): Promise<string> => {
    try {
      const key = state.encryptionKeys.find((k) => k.id === keyId);
      if (!key) {
        throw new Error('Key not found');
      }

      // Simulate encryption
      const dataString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(dataString);
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: new Uint8Array(12) },
        await crypto.subtle.importKey('raw', new Uint8Array(32), 'AES-GCM', false, ['encrypt']),
        dataBuffer
      );

      return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Failed to encrypt data');
    }
  };

  // Decrypt data
  const decryptData = async (encryptedData: string, keyId: string): Promise<any> => {
    try {
      const key = state.encryptionKeys.find((k) => k.id === keyId);
      if (!key) {
        throw new Error('Key not found');
      }

      // Simulate decryption
      const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(12) },
        await crypto.subtle.importKey('raw', new Uint8Array(32), 'AES-GCM', false, ['decrypt']),
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      const decryptedString = decoder.decode(decryptedBuffer);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt data');
    }
  };

  // Start P2P
  const startP2P = async () => {
    try {
      if (!state.settings.p2pEnabled) {
        throw new Error('P2P is disabled');
      }

      // Simulate P2P startup
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Discover and connect to available nodes
      const nodes = await discoverNodes();
      for (const node of nodes.filter((n) => n.isOnline)) {
        await connectToNode(node.id);
      }
    } catch (error) {
      console.error('Error starting P2P:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start P2P' });
    }
  };

  // Stop P2P
  const stopP2P = () => {
    // Disconnect from all nodes
    state.connections.forEach((connection) => {
      disconnectFromNode(connection.nodeId);
    });
  };

  // Get network status
  const getNetworkStatus = async () => {
    const activeConnections = state.connections.filter((c) => c.status === 'connected');
    const totalBandwidth = activeConnections.reduce((sum, conn) => sum + conn.bandwidth, 0);
    const avgLatency = activeConnections.length > 0 
      ? activeConnections.reduce((sum, conn) => sum + conn.latency, 0) / activeConnections.length 
      : 0;

    return {
      connections: activeConnections.length,
      bandwidth: totalBandwidth,
      latency: avgLatency,
    };
  };

  // Export sync data
  const exportSyncData = async (format: 'json' | 'csv'): Promise<string> => {
    try {
      const exportData = {
        nodes: state.nodes,
        syncData: state.syncData,
        syncSessions: state.syncSessions,
        encryptionKeys: state.encryptionKeys.map((key) => ({
          ...key,
          privateKey: undefined, // Don't export private keys
        })),
        timestamp: new Date().toISOString(),
      };

      switch (format) {
        case 'json':
          return JSON.stringify(exportData, null, 2);
        case 'csv':
          const csvRows = [
            'Type,ID,Timestamp,Status',
            ...state.syncData.map((data) => 
              `${data.type},${data.id},${data.timestamp.toISOString()},${data.encrypted ? 'encrypted' : 'plain'}`
            ),
          ];
          return csvRows.join('\n');
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting sync data:', error);
      throw new Error('Failed to export sync data');
    }
  };

  // Import sync data
  const importSyncData = async (data: string, format: 'json' | 'csv'): Promise<void> => {
    try {
      if (format === 'json') {
        const importData = JSON.parse(data);
        if (importData.nodes) {
          dispatch({ type: 'SET_NODES', payload: importData.nodes });
        }
        if (importData.syncData) {
          dispatch({ type: 'SET_SYNC_DATA', payload: importData.syncData });
        }
      }
      // CSV import would be more complex and depends on the specific format
    } catch (error) {
      console.error('Error importing sync data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import sync data' });
    }
  };

  // Clear sync data
  const clearSyncData = () => {
    dispatch({ type: 'SET_SYNC_DATA', payload: [] });
    dispatch({ type: 'SET_SYNC_SESSIONS', payload: [] });
  };

  const value: SyncContextType = {
    state,
    dispatch,
    initializeLocalNode,
    discoverNodes,
    connectToNode,
    disconnectFromNode,
    startSync,
    stopSync,
    syncData,
    getSyncStatus,
    generateKeyPair,
    encryptData,
    decryptData,
    startP2P,
    stopP2P,
    getNetworkStatus,
    exportSyncData,
    importSyncData,
    clearSyncData,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

// Hook
export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
