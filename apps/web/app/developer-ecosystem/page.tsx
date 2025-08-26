'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  GitBranch,
  Package,
  Download,
  Star,
  Eye,
  GitFork,
  Bug,
  Zap,
  Settings,
  Play,
  Square,
  Save,
  Share,
  Search,
  Filter,
  Plus,
  BookOpen,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal
} from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  category: string;
  downloads: number;
  rating: number;
  stars: number;
  forks: number;
  lastUpdated: Date;
  isInstalled: boolean;
  isVerified: boolean;
  tags: string[];
  repository: string;
  documentation: string;
}

interface Module {
  id: string;
  name: string;
  description: string;
  type: 'component' | 'hook' | 'utility' | 'service';
  language: string;
  downloads: number;
  rating: number;
  author: string;
  version: string;
  lastUpdated: Date;
  isInstalled: boolean;
  dependencies: string[];
  repository: string;
}

interface Sandbox {
  id: string;
  name: string;
  description: string;
  language: string;
  template: string;
  isRunning: boolean;
  lastModified: Date;
  isPublic: boolean;
  views: number;
  forks: number;
}

interface Repository {
  id: string;
  name: string;
  description: string;
  owner: string;
  language: string;
  stars: number;
  forks: number;
  issues: number;
  lastCommit: Date;
  isFork: boolean;
  isArchived: boolean;
  topics: string[];
}

const DeveloperEcosystem: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [sandboxes, setSandboxes] = useState<Sandbox[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [view, setView] = useState<'plugins' | 'modules' | 'sandboxes' | 'repos' | 'sdk'>('plugins');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [activeSandbox, setActiveSandbox] = useState<Sandbox | null>(null);

  // Mock data
  const mockPlugins: Plugin[] = [
    {
      id: '1',
      name: 'AI Chat Assistant',
      description: 'Advanced AI-powered chat assistant with natural language processing',
      author: 'CareConnect Team',
      version: '2.1.0',
      category: 'AI/ML',
      downloads: 15420,
      rating: 4.8,
      stars: 342,
      forks: 89,
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isInstalled: true,
      isVerified: true,
      tags: ['ai', 'chat', 'nlp', 'assistant'],
      repository: 'https://github.com/careconnect/ai-chat-assistant',
      documentation: 'https://docs.careconnect.dev/plugins/ai-chat'
    },
    {
      id: '2',
      name: 'Data Visualization Dashboard',
      description: 'Interactive charts and graphs for data analysis',
      author: 'DataViz Pro',
      version: '1.5.2',
      category: 'Analytics',
      downloads: 8920,
      rating: 4.6,
      stars: 156,
      forks: 34,
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isInstalled: false,
      isVerified: true,
      tags: ['analytics', 'charts', 'dashboard', 'visualization'],
      repository: 'https://github.com/dataviz-pro/dashboard-plugin',
      documentation: 'https://docs.dataviz-pro.dev/dashboard'
    }
  ];

  const mockModules: Module[] = [
    {
      id: '1',
      name: 'useLocalStorage',
      description: 'React hook for managing localStorage with TypeScript support',
      type: 'hook',
      language: 'TypeScript',
      downloads: 25600,
      rating: 4.9,
      author: 'React Utils',
      version: '1.2.0',
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isInstalled: true,
      dependencies: ['react'],
      repository: 'https://github.com/react-utils/use-local-storage'
    },
    {
      id: '2',
      name: 'FormValidator',
      description: 'Lightweight form validation utility with custom rules',
      type: 'utility',
      language: 'JavaScript',
      downloads: 18900,
      rating: 4.7,
      author: 'FormKit',
      version: '2.0.1',
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isInstalled: false,
      dependencies: [],
      repository: 'https://github.com/formkit/form-validator'
    }
  ];

  const mockSandboxes: Sandbox[] = [
    {
      id: '1',
      name: 'React Todo App',
      description: 'Simple todo application built with React and TypeScript',
      language: 'TypeScript',
      template: 'react-ts',
      isRunning: false,
      lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isPublic: true,
      views: 1250,
      forks: 45
    },
    {
      id: '2',
      name: 'Vue.js Calculator',
      description: 'Basic calculator implementation using Vue.js 3',
      language: 'JavaScript',
      template: 'vue',
      isRunning: true,
      lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isPublic: false,
      views: 320,
      forks: 12
    }
  ];

  const mockRepositories: Repository[] = [
    {
      id: '1',
      name: 'careconnect-core',
      description: 'Core platform for CareConnect v5.0 - The Steward',
      owner: 'CareConnect',
      language: 'TypeScript',
      stars: 1250,
      forks: 234,
      issues: 45,
      lastCommit: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isFork: false,
      isArchived: false,
      topics: ['platform', 'typescript', 'react', 'ai']
    },
    {
      id: '2',
      name: 'ai-models',
      description: 'Collection of AI models for on-device inference',
      owner: 'CareConnect',
      language: 'Python',
      stars: 890,
      forks: 156,
      issues: 23,
      lastCommit: new Date(Date.now() - 12 * 60 * 60 * 1000),
      isFork: false,
      isArchived: false,
      topics: ['ai', 'machine-learning', 'python', 'onnx']
    }
  ];

  useEffect(() => {
    setPlugins(mockPlugins);
    setModules(mockModules);
    setSandboxes(mockSandboxes);
    setRepositories(mockRepositories);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const handleInstallPlugin = (pluginId: string) => {
    setPlugins(prev => prev.map(plugin => 
      plugin.id === pluginId 
        ? { ...plugin, isInstalled: true }
        : plugin
    ));
  };

  const handleInstallModule = (moduleId: string) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, isInstalled: true }
        : module
    ));
  };

  const handleRunSandbox = (sandboxId: string) => {
    setSandboxes(prev => prev.map(sandbox => 
      sandbox.id === sandboxId 
        ? { ...sandbox, isRunning: !sandbox.isRunning }
        : sandbox
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Developer Ecosystem</h1>
          <p className="text-gray-600">Open-source plugins, modules, code sandboxes, and developer tools</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8">
          {[
            { key: 'plugins', label: 'Plugins', icon: Package },
            { key: 'modules', label: 'Modules', icon: Code },
            { key: 'sandboxes', label: 'Sandboxes', icon: Play },
            { key: 'repos', label: 'Repositories', icon: GitBranch },
            { key: 'sdk', label: 'SDK', icon: BookOpen }
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
            {/* Plugins View */}
            {view === 'plugins' && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search plugins..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="ai-ml">AI/ML</option>
                      <option value="analytics">Analytics</option>
                      <option value="ui">UI Components</option>
                      <option value="utilities">Utilities</option>
                    </select>
                  </div>
                </div>

                {/* Plugin Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plugins.map((plugin) => (
                    <motion.div
                      key={plugin.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
                            {plugin.isVerified && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{plugin.description}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {plugin.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">v{plugin.version}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span>by {plugin.author}</span>
                        <span>{formatDate(plugin.lastUpdated)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-1">
                          <Download className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{formatNumber(plugin.downloads)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{plugin.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{formatNumber(plugin.stars)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <GitFork className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{formatNumber(plugin.forks)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {plugin.isInstalled ? (
                          <button className="flex-1 bg-green-100 text-green-800 py-2 px-4 rounded-lg font-medium">
                            Installed
                          </button>
                        ) : (
                          <button
                            onClick={() => handleInstallPlugin(plugin.id)}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Install
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Modules View */}
            {view === 'modules' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Code Modules</h3>
                  
                  <div className="space-y-4">
                    {modules.map((module) => (
                      <motion.div
                        key={module.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{module.name}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                module.type === 'hook' ? 'bg-purple-100 text-purple-800' :
                                module.type === 'utility' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {module.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>by {module.author}</span>
                              <span>v{module.version}</span>
                              <span>{module.language}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="flex items-center space-x-1">
                                <Download className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{formatNumber(module.downloads)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm">{module.rating}</span>
                              </div>
                            </div>
                            
                            {module.isInstalled ? (
                              <button className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium">
                                Installed
                              </button>
                            ) : (
                              <button
                                onClick={() => handleInstallModule(module.id)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                              >
                                Install
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sandboxes View */}
            {view === 'sandboxes' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Code Sandboxes</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Create Sandbox
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sandboxes.map((sandbox) => (
                      <motion.div
                        key={sandbox.id}
                        whileHover={{ scale: 1.02 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{sandbox.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{sandbox.description}</p>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                sandbox.language === 'TypeScript' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {sandbox.language}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                sandbox.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {sandbox.isPublic ? 'Public' : 'Private'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-sm text-gray-600">{formatDate(sandbox.lastModified)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{formatNumber(sandbox.views)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <GitFork className="w-4 h-4" />
                              <span>{formatNumber(sandbox.forks)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRunSandbox(sandbox.id)}
                            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                              sandbox.isRunning 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {sandbox.isRunning ? (
                              <>
                                <Square className="w-4 h-4 inline mr-2" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 inline mr-2" />
                                Run
                              </>
                            )}
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Repositories View */}
            {view === 'repos' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Open Source Repositories</h3>
                  
                  <div className="space-y-4">
                    {repositories.map((repo) => (
                      <motion.div
                        key={repo.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{repo.name}</h4>
                              {repo.isFork && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                  Fork
                                </span>
                              )}
                              {repo.isArchived && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                                  Archived
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{repo.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <span>by {repo.owner}</span>
                              <span>{repo.language}</span>
                              <span>Updated {formatDate(repo.lastCommit)}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {repo.topics.map((topic) => (
                                <span key={topic} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span>{formatNumber(repo.stars)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <GitFork className="w-4 h-4" />
                              <span>{formatNumber(repo.forks)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Bug className="w-4 h-4" />
                              <span>{repo.issues}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SDK View */}
            {view === 'sdk' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Developer SDK</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Code className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Plugin SDK</h4>
                          <p className="text-sm text-gray-600">Build custom plugins</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Create powerful plugins that integrate seamlessly with the CareConnect platform.
                      </p>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Get Started
                      </button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">API Reference</h4>
                          <p className="text-sm text-gray-600">Complete API documentation</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Comprehensive documentation for all platform APIs and endpoints.
                      </p>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        View Docs
                      </button>
                    </div>
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

export default DeveloperEcosystem;
