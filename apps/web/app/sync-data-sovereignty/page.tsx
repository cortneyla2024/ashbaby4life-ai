'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  Shield,
  Lock,
  Unlock,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Database,
  Network,
  Wifi,
  WifiOff,
  HardDrive,
  Key,
  Eye,
  EyeOff,
  Copy,
  Share,
  Trash2,
  Plus,
  Edit,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Users,
  Globe,
  MapPin,
  Bell,
  BellOff,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Cpu,
  HardDrive as StorageIcon,
  Wifi as NetworkIcon,
  Shield as SecurityIcon,
  Lock as EncryptionIcon
} from 'lucide-react';

interface SyncNode {
  id: string;
  name: string;
  type: 'local' | 'remote' | 'p2p';
  status: 'online' | 'offline' | 'syncing' | 'error';
  lastSync: Date;
  dataSize: number;
  encryptionStatus: 'encrypted' | 'unencrypted' | 'pending';
  syncProgress?: number;
  ipAddress?: string;
  location?: string;
}

interface DataVault {
  id: string;
  name: string;
  type: 'personal' | 'shared' | 'public';
  size: number;
  itemCount: number;
  encryptionLevel: 'none' | 'basic' | 'advanced' | 'zero-knowledge';
  lastAccessed: Date;
  permissions: string[];
  isActive: boolean;
}

interface SyncSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'paused';
  nodesInvolved: string[];
  dataTransferred: number;
  encryptionUsed: boolean;
  errors?: string[];
}

interface EncryptionKey {
  id: string;
  name: string;
  type: 'master' | 'vault' | 'session';
  algorithm: string;
  strength: number;
  createdAt: Date;
  lastUsed: Date;
  isActive: boolean;
  fingerprint: string;
}

const SyncDataSovereignty: React.FC = () => {
  const [view, setView] = useState<'overview' | 'nodes' | 'vaults' | 'sync' | 'encryption' | 'settings'>('overview');
  const [syncNodes, setSyncNodes] = useState<SyncNode[]>([]);
  const [dataVaults, setDataVaults] = useState<DataVault[]>([]);
  const [syncSessions, setSyncSessions] = useState<SyncSession[]>([]);
  const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKey[]>([]);
  const [selectedNode, setSelectedNode] = useState<SyncNode | null>(null);
  const [selectedVault, setSelectedVault] = useState<DataVault | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [totalDataSize, setTotalDataSize] = useState(0);
  const [activeSyncs, setActiveSyncs] = useState(0);

  // Mock data
  const mockSyncNodes: SyncNode[] = [
    {
      id: '1',
      name: 'Local Device',
      type: 'local',
      status: 'online',
      lastSync: new Date(Date.now() - 5 * 60 * 1000),
      dataSize: 1024 * 1024 * 1024 * 50, // 50GB
      encryptionStatus: 'encrypted',
      ipAddress: '192.168.1.100',
      location: 'San Francisco, CA'
    },
    {
      id: '2',
      name: 'Cloud Backup',
      type: 'remote',
      status: 'syncing',
      lastSync: new Date(Date.now() - 2 * 60 * 1000),
      dataSize: 1024 * 1024 * 1024 * 45, // 45GB
      encryptionStatus: 'encrypted',
      syncProgress: 75,
      ipAddress: '10.0.0.1',
      location: 'AWS US-West'
    },
    {
      id: '3',
      name: 'P2P Node - Alice',
      type: 'p2p',
      status: 'online',
      lastSync: new Date(Date.now() - 10 * 60 * 1000),
      dataSize: 1024 * 1024 * 1024 * 20, // 20GB
      encryptionStatus: 'encrypted',
      ipAddress: '203.0.113.45',
      location: 'New York, NY'
    }
  ];

  const mockDataVaults: DataVault[] = [
    {
      id: '1',
      name: 'Personal Documents',
      type: 'personal',
      size: 1024 * 1024 * 1024 * 10, // 10GB
      itemCount: 1250,
      encryptionLevel: 'zero-knowledge',
      lastAccessed: new Date(Date.now() - 30 * 60 * 1000),
      permissions: ['read', 'write', 'delete'],
      isActive: true
    },
    {
      id: '2',
      name: 'Family Photos',
      type: 'shared',
      size: 1024 * 1024 * 1024 * 25, // 25GB
      itemCount: 5000,
      encryptionLevel: 'advanced',
      lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      permissions: ['read', 'write'],
      isActive: true
    },
    {
      id: '3',
      name: 'Public Resources',
      type: 'public',
      size: 1024 * 1024 * 1024 * 5, // 5GB
      itemCount: 500,
      encryptionLevel: 'basic',
      lastAccessed: new Date(Date.now() - 6 * 60 * 60 * 1000),
      permissions: ['read'],
      isActive: true
    }
  ];

  const mockSyncSessions: SyncSession[] = [
    {
      id: '1',
      startTime: new Date(Date.now() - 30 * 60 * 1000),
      endTime: new Date(Date.now() - 25 * 60 * 1000),
      status: 'completed',
      nodesInvolved: ['Local Device', 'Cloud Backup'],
      dataTransferred: 1024 * 1024 * 1024 * 2, // 2GB
      encryptionUsed: true
    },
    {
      id: '2',
      startTime: new Date(Date.now() - 10 * 60 * 1000),
      status: 'running',
      nodesInvolved: ['Local Device', 'P2P Node - Alice'],
      dataTransferred: 1024 * 1024 * 512, // 512MB
      encryptionUsed: true
    }
  ];

  const mockEncryptionKeys: EncryptionKey[] = [
    {
      id: '1',
      name: 'Master Key',
      type: 'master',
      algorithm: 'AES-256-GCM',
      strength: 256,
      createdAt: new Date('2023-01-01'),
      lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isActive: true,
      fingerprint: 'a1b2c3d4e5f6...'
    },
    {
      id: '2',
      name: 'Vault Key - Personal',
      type: 'vault',
      algorithm: 'ChaCha20-Poly1305',
      strength: 256,
      createdAt: new Date('2023-02-15'),
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isActive: true,
      fingerprint: 'f6e5d4c3b2a1...'
    }
  ];

  useEffect(() => {
    setSyncNodes(mockSyncNodes);
    setDataVaults(mockDataVaults);
    setSyncSessions(mockSyncSessions);
    setEncryptionKeys(mockEncryptionKeys);
    
    // Calculate totals
    setTotalDataSize(mockDataVaults.reduce((sum, vault) => sum + vault.size, 0));
    setActiveSyncs(mockSyncSessions.filter(session => session.status === 'running').length);
  }, []);

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'syncing': return 'text-blue-600';
      case 'offline': return 'text-gray-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return CheckCircle;
      case 'syncing': return RefreshCw;
      case 'offline': return WifiOff;
      case 'error': return XCircle;
      default: return AlertCircle;
    }
  };

  const handleToggleNode = (nodeId: string) => {
    setSyncNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, status: node.status === 'online' ? 'offline' : 'online' }
        : node
    ));
  };

  const handleCreateVault = () => {
    const newVault: DataVault = {
      id: Date.now().toString(),
      name: 'New Vault',
      type: 'personal',
      size: 0,
      itemCount: 0,
      encryptionLevel: 'zero-knowledge',
      lastAccessed: new Date(),
      permissions: ['read', 'write'],
      isActive: true
    };
    setDataVaults(prev => [...prev, newVault]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sync & Data Sovereignty</h1>
          <p className="text-gray-600">P2P synchronization, on-device encryption, and zero-knowledge data vaults</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'nodes', label: 'Sync Nodes', icon: Network },
            { key: 'vaults', label: 'Data Vaults', icon: Database },
            { key: 'sync', label: 'Sync Sessions', icon: RefreshCw },
            { key: 'encryption', label: 'Encryption', icon: Shield },
            { key: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                view === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview */}
            {view === 'overview' && (
              <div className="space-y-6">
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Network className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sync Nodes</p>
                        <p className="text-2xl font-bold text-gray-900">{syncNodes.length}</p>
                        <p className="text-xs text-green-600">All online</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Database className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data Vaults</p>
                        <p className="text-2xl font-bold text-gray-900">{dataVaults.length}</p>
                        <p className="text-xs text-blue-600">{formatBytes(totalDataSize)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Active Syncs</p>
                        <p className="text-2xl font-bold text-gray-900">{activeSyncs}</p>
                        <p className="text-xs text-purple-600">In progress</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Encryption</p>
                        <p className="text-2xl font-bold text-gray-900">{encryptionKeys.length}</p>
                        <p className="text-xs text-orange-600">Keys active</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Network Status */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Network Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">P2P Network</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className="text-sm text-green-600 font-medium">Connected</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Peers</span>
                          <span className="text-sm text-gray-900">12 active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Bandwidth</span>
                          <span className="text-sm text-gray-900">2.5 MB/s</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Security Status</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Encryption</span>
                          <span className="text-sm text-green-600 font-medium">Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Zero-Knowledge</span>
                          <span className="text-sm text-green-600 font-medium">Enabled</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Last Audit</span>
                          <span className="text-sm text-gray-900">2 hours ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sync Nodes */}
            {view === 'nodes' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Sync Nodes</h3>
                  <div className="space-y-4">
                    {syncNodes.map((node) => {
                      const StatusIcon = getStatusIcon(node.status);
                      return (
                        <motion.div
                          key={node.id}
                          whileHover={{ scale: 1.01 }}
                          className="border border-gray-200 rounded-lg p-6"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                {node.type === 'local' && <HardDrive className="w-6 h-6 text-gray-600" />}
                                {node.type === 'remote' && <Cloud className="w-6 h-6 text-gray-600" />}
                                {node.type === 'p2p' && <Network className="w-6 h-6 text-gray-600" />}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{node.name}</h4>
                                <p className="text-sm text-gray-600">{node.ipAddress} • {node.location}</p>
                                <p className="text-xs text-gray-500">{formatBytes(node.dataSize)} • {formatTime(node.lastSync)}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className={`flex items-center space-x-2 ${getStatusColor(node.status)}`}>
                                  <StatusIcon className="w-4 h-4" />
                                  <span className="text-sm font-medium capitalize">{node.status}</span>
                                </div>
                                {node.syncProgress && (
                                  <div className="mt-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full" 
                                        style={{ width: `${node.syncProgress}%` }}
                                      ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{node.syncProgress}%</p>
                                  </div>
                                )}
                              </div>
                              
                              <button
                                onClick={() => handleToggleNode(node.id)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  node.status === 'online'
                                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                              >
                                {node.status === 'online' ? 'Disconnect' : 'Connect'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Data Vaults */}
            {view === 'vaults' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Data Vaults</h3>
                    <button
                      onClick={handleCreateVault}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Create Vault
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dataVaults.map((vault) => (
                      <motion.div
                        key={vault.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedVault(vault)}
                        className={`p-6 border rounded-lg cursor-pointer transition-colors ${
                          selectedVault?.id === vault.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vault.type === 'personal' ? 'bg-blue-100 text-blue-800' :
                            vault.type === 'shared' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {vault.type}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-2">{vault.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{formatBytes(vault.size)} • {vault.itemCount} items</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Encryption:</span>
                            <span className={`font-medium ${
                              vault.encryptionLevel === 'zero-knowledge' ? 'text-green-600' :
                              vault.encryptionLevel === 'advanced' ? 'text-blue-600' :
                              vault.encryptionLevel === 'basic' ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              {vault.encryptionLevel}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Last accessed:</span>
                            <span className="text-gray-900">{formatTime(vault.lastAccessed)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sync Sessions */}
            {view === 'sync' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Sync Sessions</h3>
                  <div className="space-y-4">
                    {syncSessions.map((session) => (
                      <motion.div
                        key={session.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">Session {session.id}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                session.status === 'running' ? 'bg-blue-100 text-blue-800' :
                                session.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {session.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {session.nodesInvolved.join(' ↔ ')}
                            </p>
                            <p className="text-xs text-gray-500">
                              Started: {formatTime(session.startTime)}
                              {session.endTime && ` • Ended: ${formatTime(session.endTime)}`}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatBytes(session.dataTransferred)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {session.encryptionUsed ? '🔒 Encrypted' : '🔓 Unencrypted'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Encryption */}
            {view === 'encryption' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Encryption Keys</h3>
                  <div className="space-y-4">
                    {encryptionKeys.map((key) => (
                      <motion.div
                        key={key.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Key className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{key.name}</h4>
                              <p className="text-sm text-gray-600">{key.algorithm} • {key.strength} bits</p>
                              <p className="text-xs text-gray-500">
                                Created: {formatDate(key.createdAt)} • Last used: {formatTime(key.lastUsed)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                key.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {key.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 font-mono">{key.fingerprint}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SyncDataSovereignty;
