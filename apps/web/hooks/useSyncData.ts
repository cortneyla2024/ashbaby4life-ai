import { useState, useCallback, useEffect } from 'react';

interface SyncData {
  id: string;
  userId: string;
  type: 'health' | 'finance' | 'education' | 'productivity' | 'social';
  data: any;
  lastSynced: Date;
  status: 'synced' | 'pending' | 'failed';
  version: number;
}

interface SyncNode {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'syncing' | 'error';
  lastSeen: Date;
  dataSize?: number;
  encryptionLevel?: string;
  location?: string;
  lastSync?: Date;
  metadata?: {
    protocol?: string;
    latency?: number;
  };
}

interface DataVault {
  id: string;
  name: string;
  type: string;
  size: number;
  encrypted: boolean;
  lastBackup: Date;
  encryption?: string;
  accessCount?: number;
  lastModified?: Date;
  metadata?: {
    description?: string;
    tags?: string[];
  };
}

interface SyncStatus {
  isConnected: boolean;
  lastSync: Date;
  syncProgress: number;
  errors: string[];
  onlineNodes?: number;
  totalNodes?: number;
  syncingNodes?: number;
  errorNodes?: number;
  totalDataSize?: number;
  encryptedDataSize?: number;
  lastGlobalSync?: Date;
}

interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // in minutes
  syncTypes: string[];
  encryptionEnabled: boolean;
  cloudBackup: boolean;
}

export const useSyncData = () => {
  const [syncData, setSyncData] = useState<SyncData[]>([]);
  const [nodes, setNodes] = useState<SyncNode[]>([]);
  const [vaults, setVaults] = useState<DataVault[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    lastSync: new Date(),
    syncProgress: 0,
    errors: []
  });
  const [settings, setSettings] = useState<SyncSettings>({
    autoSync: true,
    syncInterval: 30,
    syncTypes: ['health', 'finance', 'education'],
    encryptionEnabled: true,
    cloudBackup: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchSyncData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/sync/data', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sync data');
      }

      const data = await response.json();
      setSyncData(data.syncData);
      setLastSync(data.lastSync ? new Date(data.lastSync) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sync data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/sync/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sync settings');
      }

      const data = await response.json();
      setSettings(data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sync settings');
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<SyncSettings>) => {
    try {
      const response = await fetch('/api/sync/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update sync settings');
      }

      const data = await response.json();
      setSettings(data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sync settings');
    }
  }, []);

  const syncNow = useCallback(async (types?: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/sync/now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ types }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync data');
      }

      const data = await response.json();
      setSyncData(data.syncData);
      setLastSync(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync data');
    } finally {
      setLoading(false);
    }
  }, []);

  const getDataByType = useCallback((type: string) => {
    return syncData.filter(item => item.type === type);
  }, [syncData]);

  const getFailedSyncs = useCallback(() => {
    return syncData.filter(item => item.status === 'failed');
  }, [syncData]);

  const getPendingSyncs = useCallback(() => {
    return syncData.filter(item => item.status === 'pending');
  }, [syncData]);

  const startSync = useCallback(async () => {
    setLoading(true);
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSyncStatus(prev => ({ ...prev, isConnected: true, syncProgress: 100 }));
    } catch (err) {
      setError('Failed to start sync');
    } finally {
      setLoading(false);
    }
  }, []);

  const stopSync = useCallback(async () => {
    setSyncStatus(prev => ({ ...prev, isConnected: false, syncProgress: 0 }));
  }, []);

  const createVault = useCallback(async (vaultData: Omit<DataVault, 'id'>) => {
    const newVault: DataVault = {
      ...vaultData,
      id: Date.now().toString()
    };
    setVaults(prev => [...prev, newVault]);
    return newVault;
  }, []);

  const encryptData = useCallback(async (data: any) => {
    // Mock implementation
    return { encrypted: true, data: btoa(JSON.stringify(data)) };
  }, []);

  const decryptData = useCallback(async (encryptedData: any) => {
    // Mock implementation
    return JSON.parse(atob(encryptedData.data));
  }, []);

  const backupData = useCallback(async () => {
    // Mock implementation
    console.log('Backing up data...');
  }, []);

  const restoreData = useCallback(async () => {
    // Mock implementation
    console.log('Restoring data...');
  }, []);

  useEffect(() => {
    fetchSyncData();
    fetchSettings();
  }, [fetchSyncData, fetchSettings]);

  return {
    syncData,
    settings,
    loading,
    error,
    lastSync,
    nodes,
    vaults,
    syncStatus,
    fetchSyncData,
    fetchSettings,
    updateSettings,
    syncNow,
    startSync,
    stopSync,
    createVault,
    encryptData,
    decryptData,
    backupData,
    restoreData,
    getDataByType,
    getFailedSyncs,
    getPendingSyncs,
  };
};
