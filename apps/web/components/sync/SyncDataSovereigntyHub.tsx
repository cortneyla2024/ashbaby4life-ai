'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud, Lock, Shield, Upload, Download, RefreshCw, Settings,
  Database, Key, Eye, EyeOff, Wifi, WifiOff, HardDrive,
  CheckCircle, AlertCircle, Clock, Zap, Users, Globe
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSyncData } from '@/hooks/useSyncData';
import { useNotifications } from '@/hooks/useNotifications';

interface SyncNode {
  id: string;
  name: string;
  type: 'local' | 'remote' | 'p2p';
  status: 'online' | 'offline' | 'syncing' | 'error';
  lastSync: Date;
  dataSize: number;
  encryptionLevel: 'none' | 'basic' | 'advanced' | 'zero-knowledge';
  location: string;
  metadata: {
    version: string;
    protocol: string;
    latency: number;
    bandwidth: number;
  };
}

interface DataVault {
  id: string;
  name: string;
  type: 'personal' | 'shared' | 'public';
  encryption: 'none' | 'aes-256' | 'zero-knowledge';
  size: number;
  lastModified: Date;
  accessCount: number;
  permissions: {
    read: string[];
    write: string[];
    admin: string[];
  };
  metadata: {
    description: string;
    tags: string[];
    version: string;
  };
}

interface SyncStatus {
  totalNodes: number;
  onlineNodes: number;
  syncingNodes: number;
  errorNodes: number;
  totalDataSize: number;
  encryptedDataSize: number;
  lastGlobalSync: Date;
  syncProgress: number;
}

export const SyncDataSovereigntyHub: React.FC = () => {
  const { user } = useAuth();
  const {
    nodes,
    vaults,
    syncStatus,
    startSync,
    stopSync,
    createVault,
    encryptData,
    decryptData,
    backupData,
    restoreData,
    loading
  } = useSyncData();
  const { showNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'nodes' | 'vaults' | 'sync' | 'security'>('nodes');
  const [selectedNode, setSelectedNode] = useState<SyncNode | null>(null);
  const [selectedVault, setSelectedVault] = useState<DataVault | null>(null);
  const [showCreateVault, setShowCreateVault] = useState(false);

  const handleStartSync = useCallback(async () => {
    try {
      await startSync();
      showNotification('Sync started successfully', 'success');
    } catch (error) {
      showNotification('Failed to start sync', 'error');
    }
  }, [startSync, showNotification]);

  const handleStopSync = useCallback(async () => {
    try {
      await stopSync();
      showNotification('Sync stopped', 'info');
    } catch (error) {
      showNotification('Failed to stop sync', 'error');
    }
  }, [stopSync, showNotification]);

  const handleCreateVault = useCallback(async (vaultData: Partial<DataVault>) => {
    try {
      const vaultToCreate = {
        name: vaultData.name || 'New Vault',
        type: vaultData.type || 'personal',
        size: vaultData.size || 0,
        encrypted: true,
        lastBackup: new Date()
      };
      await createVault(vaultToCreate);
      setShowCreateVault(false);
      showNotification('Vault created successfully', 'success');
    } catch (error) {
      showNotification('Failed to create vault', 'error');
    }
  }, [createVault, showNotification]);

  const handleBackupData = useCallback(async () => {
    try {
      await backupData();
      showNotification('Data backup completed', 'success');
    } catch (error) {
      showNotification('Backup failed', 'error');
    }
  }, [backupData, showNotification]);

  const handleRestoreData = useCallback(async () => {
    try {
      await restoreData();
      showNotification('Data restored successfully', 'success');
    } catch (error) {
      showNotification('Restore failed', 'error');
    }
  }, [restoreData, showNotification]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Sync & Data Sovereignty
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          P2P sync, encryption, and zero-knowledge vault for complete data control
        </p>
      </div>

      {/* Sync Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Nodes</h3>
            <Wifi className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {syncStatus.onlineNodes}/{syncStatus.totalNodes}
          </p>
          <div className="flex items-center mt-2">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Data Size</h3>
            <Database className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(syncStatus.totalDataSize / 1024 / 1024).toFixed(1)} GB
          </p>
          <div className="flex items-center mt-2">
            <Shield className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-sm text-blue-600 dark:text-blue-400">Encrypted</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Sync Progress</h3>
            <RefreshCw className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {syncStatus.syncProgress}%
          </p>
          <div className="flex items-center mt-2">
            <Clock className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-sm text-purple-600 dark:text-purple-400">In progress</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Data Vaults</h3>
            <Lock className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {vaults.length}
          </p>
          <div className="flex items-center mt-2">
            <Key className="w-4 h-4 text-orange-500 mr-1" />
            <span className="text-sm text-orange-600 dark:text-orange-400">Secured</span>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={handleStartSync}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Start Sync
        </button>
        <button
          onClick={handleStopSync}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
        >
          <WifiOff className="w-4 h-4 mr-2" />
          Stop Sync
        </button>
        <button
          onClick={() => setShowCreateVault(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          <Lock className="w-4 h-4 mr-2" />
          Create Vault
        </button>
        <button
          onClick={handleBackupData}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
        >
          <Upload className="w-4 h-4 mr-2" />
          Backup Data
        </button>
        <button
          onClick={handleRestoreData}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
        >
          <Download className="w-4 h-4 mr-2" />
          Restore Data
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'nodes', label: 'Sync Nodes', icon: Wifi, count: syncStatus.totalNodes },
            { id: 'vaults', label: 'Data Vaults', icon: Lock, count: vaults.length },
            { id: 'sync', label: 'Sync Status', icon: RefreshCw, count: syncStatus.syncingNodes },
            { id: 'security', label: 'Security', icon: Shield, count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'nodes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nodes.map((node) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      node.status === 'online' ? 'bg-green-100 dark:bg-green-900' :
                      node.status === 'syncing' ? 'bg-yellow-100 dark:bg-yellow-900' :
                      node.status === 'error' ? 'bg-red-100 dark:bg-red-900' :
                      'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {node.type === 'local' ? (
                        <HardDrive className={`w-5 h-5 ${
                          node.status === 'online' ? 'text-green-600 dark:text-green-400' :
                          node.status === 'syncing' ? 'text-yellow-600 dark:text-yellow-400' :
                          node.status === 'error' ? 'text-red-600 dark:text-red-400' :
                          'text-gray-400'
                        }`} />
                      ) : node.type === 'remote' ? (
                        <Cloud className={`w-5 h-5 ${
                          node.status === 'online' ? 'text-green-600 dark:text-green-400' :
                          node.status === 'syncing' ? 'text-yellow-600 dark:text-yellow-400' :
                          node.status === 'error' ? 'text-red-600 dark:text-red-400' :
                          'text-gray-400'
                        }`} />
                      ) : (
                        <Users className={`w-5 h-5 ${
                          node.status === 'online' ? 'text-green-600 dark:text-green-400' :
                          node.status === 'syncing' ? 'text-yellow-600 dark:text-yellow-400' :
                          node.status === 'error' ? 'text-red-600 dark:text-red-400' :
                          'text-gray-400'
                        }`} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{node.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{node.type}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    node.status === 'online' ? 'bg-green-500' :
                    node.status === 'syncing' ? 'bg-yellow-500' :
                    node.status === 'error' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`}></div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      node.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      node.status === 'syncing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      node.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {node.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Data Size</span>
                    <span className="text-gray-900 dark:text-white">
                      {(node.dataSize / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Encryption</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      node.encryptionLevel === 'zero-knowledge' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      node.encryptionLevel === 'advanced' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      node.encryptionLevel === 'basic' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {node.encryptionLevel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Location</span>
                    <span className="text-gray-900 dark:text-white">{node.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Last Sync</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(node.lastSync).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'vaults' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaults.map((vault) => (
              <motion.div
                key={vault.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      vault.type === 'personal' ? 'bg-blue-100 dark:bg-blue-900' :
                      vault.type === 'shared' ? 'bg-green-100 dark:bg-green-900' :
                      'bg-purple-100 dark:bg-purple-900'
                    }`}>
                      <Lock className={`w-5 h-5 ${
                        vault.type === 'personal' ? 'text-blue-600 dark:text-blue-400' :
                        vault.type === 'shared' ? 'text-green-600 dark:text-green-400' :
                        'text-purple-600 dark:text-purple-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{vault.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{vault.type}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Size</span>
                    <span className="text-gray-900 dark:text-white">
                      {(vault.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Encryption</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      vault.encryption === 'zero-knowledge' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      vault.encryption === 'aes-256' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {vault.encryption}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Access Count</span>
                    <span className="text-gray-900 dark:text-white">{vault.accessCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Last Modified</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(vault.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {vault.metadata.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {vault.metadata.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Global Sync Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Sync Progress</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {syncStatus.syncProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${syncStatus.syncProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Online Nodes:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {syncStatus.onlineNodes}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Syncing Nodes:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {syncStatus.syncingNodes}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Error Nodes:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {syncStatus.errorNodes}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total Nodes:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {syncStatus.totalNodes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Data Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Data Size</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {(syncStatus.totalDataSize / 1024 / 1024).toFixed(1)} GB
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Encrypted Data</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {(syncStatus.encryptedDataSize / 1024 / 1024).toFixed(1)} GB
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Encryption Rate</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {((syncStatus.encryptedDataSize / syncStatus.totalDataSize) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Global Sync</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(syncStatus.lastGlobalSync).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Encryption Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Zero-Knowledge Vaults</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {vaults.filter(v => v.encryption === 'zero-knowledge').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">AES-256 Vaults</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {vaults.filter(v => v.encryption === 'aes-256').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Unencrypted Vaults</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {vaults.filter(v => v.encryption === 'none').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Network Security</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">P2P Connections</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {nodes.filter(n => n.type === 'p2p' && n.status === 'online').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Secure Protocols</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {nodes.filter(n => n.metadata.protocol.includes('https') || n.metadata.protocol.includes('wss')).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Average Latency</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {(nodes.reduce((sum, n) => sum + n.metadata.latency, 0) / nodes.length).toFixed(0)}ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
