'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Puzzle, Download, Star, Eye, Code, Shield, Settings, Search,
  Filter, Plus, Package, Users, Zap, Clock, TrendingUp, CheckCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePluginMarketplace } from '@/hooks/usePluginMarketplace';
import { useNotifications } from '@/hooks/useNotifications';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  category: 'productivity' | 'entertainment' | 'health' | 'finance' | 'education' | 'social' | 'utility';
  tags: string[];
  price: number;
  rating: number;
  reviewCount: number;
  downloadCount: number;
  size: number;
  status: 'active' | 'inactive' | 'beta' | 'deprecated';
  lastUpdated: Date;
}

interface PluginInstallation {
  id: string;
  pluginId: string;
  userId: string;
  status: 'installing' | 'active' | 'inactive' | 'error';
  installedAt: Date;
  lastUsed: Date;
}

export const PluginMarketplaceHub: React.FC = () => {
  const { user } = useAuth();
  const {
    plugins,
    installedPlugins,
    installPlugin,
    uninstallPlugin,
    updatePlugin,
    loading
  } = usePluginMarketplace();
  const { showNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'browse' | 'installed' | 'develop'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'downloads' | 'newest' | 'price'>('rating');

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = 
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedPlugins = [...filteredPlugins].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return b.downloadCount - a.downloadCount;
      case 'newest':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case 'price':
        return a.price - b.price;
      default:
        return 0;
    }
  });

  const handleInstallPlugin = useCallback(async (pluginId: string) => {
    try {
      await installPlugin(pluginId);
      showNotification('Plugin installed successfully', 'success');
    } catch (error) {
      showNotification('Failed to install plugin', 'error');
    }
  }, [installPlugin, showNotification]);

  const handleUninstallPlugin = useCallback(async (pluginId: string) => {
    try {
      await uninstallPlugin(pluginId);
      showNotification('Plugin uninstalled successfully', 'success');
    } catch (error) {
      showNotification('Failed to uninstall plugin', 'error');
    }
  }, [uninstallPlugin, showNotification]);

  const handleUpdatePlugin = useCallback(async (pluginId: string) => {
    try {
      await updatePlugin(pluginId);
      showNotification('Plugin updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update plugin', 'error');
    }
  }, [updatePlugin, showNotification]);

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
          Plugin & Micro-App Marketplace
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover, install, and manage plugins with SDK, permission scopes, and ratings
        </p>
      </div>

      {/* Marketplace Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Plugins</h3>
            <Puzzle className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {plugins.length}
          </p>
          <div className="flex items-center mt-2">
            <Package className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-sm text-blue-600 dark:text-blue-400">Available</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Installed</h3>
            <Download className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {installedPlugins.length}
          </p>
          <div className="flex items-center mt-2">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 dark:text-green-400">Active</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Downloads</h3>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {plugins.reduce((total, plugin) => total + plugin.downloadCount, 0).toLocaleString()}
          </p>
          <div className="flex items-center mt-2">
            <Users className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-sm text-purple-600 dark:text-purple-400">Downloads</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</h3>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(plugins.reduce((total, plugin) => total + plugin.rating, 0) / plugins.length).toFixed(1)}
          </p>
          <div className="flex items-center mt-2">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm text-yellow-600 dark:text-yellow-400">Stars</span>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Categories</option>
          <option value="productivity">Productivity</option>
          <option value="entertainment">Entertainment</option>
          <option value="health">Health</option>
          <option value="finance">Finance</option>
          <option value="education">Education</option>
          <option value="social">Social</option>
          <option value="utility">Utility</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="rating">Top Rated</option>
          <option value="downloads">Most Downloaded</option>
          <option value="newest">Newest</option>
          <option value="price">Price</option>
        </select>
        <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
          <Plus className="w-4 h-4 mr-2" />
          Develop Plugin
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'browse', label: 'Browse Plugins', icon: Puzzle, count: plugins.length },
            { id: 'installed', label: 'Installed', icon: Download, count: installedPlugins.length },
            { id: 'develop', label: 'Develop', icon: Code, count: 0 }
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
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPlugins.map((plugin) => (
              <motion.div
                key={plugin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      plugin.category === 'productivity' ? 'bg-blue-100 dark:bg-blue-900' :
                      plugin.category === 'entertainment' ? 'bg-purple-100 dark:bg-purple-900' :
                      plugin.category === 'health' ? 'bg-green-100 dark:bg-green-900' :
                      plugin.category === 'finance' ? 'bg-yellow-100 dark:bg-yellow-900' :
                      plugin.category === 'education' ? 'bg-indigo-100 dark:bg-indigo-900' :
                      plugin.category === 'social' ? 'bg-pink-100 dark:bg-pink-900' :
                      'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Puzzle className={`w-5 h-5 ${
                        plugin.category === 'productivity' ? 'text-blue-600 dark:text-blue-400' :
                        plugin.category === 'entertainment' ? 'text-purple-600 dark:text-purple-400' :
                        plugin.category === 'health' ? 'text-green-600 dark:text-green-400' :
                        plugin.category === 'finance' ? 'text-yellow-600 dark:text-yellow-400' :
                        plugin.category === 'education' ? 'text-indigo-600 dark:text-indigo-400' :
                        plugin.category === 'social' ? 'text-pink-600 dark:text-pink-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{plugin.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{plugin.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {plugin.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {plugin.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {plugin.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{plugin.downloadCount.toLocaleString()} downloads</span>
                    <span>{(plugin.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    plugin.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    plugin.status === 'beta' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    plugin.status === 'deprecated' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {plugin.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={plugin.author.avatar}
                      alt={plugin.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {plugin.author.name}
                    </span>
                    {plugin.author.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {plugin.price === 0 ? (
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Free</span>
                    ) : (
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${plugin.price}
                      </span>
                    )}
                    <button
                      onClick={() => handleInstallPlugin(plugin.id)}
                      className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      Install
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'installed' && (
          <div className="space-y-6">
            {installedPlugins.length === 0 ? (
              <div className="text-center py-12">
                <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No plugins installed</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Browse the marketplace to discover and install plugins
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {installedPlugins.map((installation) => {
                  const plugin = plugins.find(p => p.id === installation.pluginId);
                  if (!plugin) return null;
                  
                  return (
                    <motion.div
                      key={installation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            plugin.category === 'productivity' ? 'bg-blue-100 dark:bg-blue-900' :
                            plugin.category === 'entertainment' ? 'bg-purple-100 dark:bg-purple-900' :
                            plugin.category === 'health' ? 'bg-green-100 dark:bg-green-900' :
                            plugin.category === 'finance' ? 'bg-yellow-100 dark:bg-yellow-900' :
                            plugin.category === 'education' ? 'bg-indigo-100 dark:bg-indigo-900' :
                            plugin.category === 'social' ? 'bg-pink-100 dark:bg-pink-900' :
                            'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <Puzzle className={`w-5 h-5 ${
                              plugin.category === 'productivity' ? 'text-blue-600 dark:text-blue-400' :
                              plugin.category === 'entertainment' ? 'text-purple-600 dark:text-purple-400' :
                              plugin.category === 'health' ? 'text-green-600 dark:text-green-400' :
                              plugin.category === 'finance' ? 'text-yellow-600 dark:text-yellow-400' :
                              plugin.category === 'education' ? 'text-indigo-600 dark:text-indigo-400' :
                              plugin.category === 'social' ? 'text-pink-600 dark:text-pink-400' :
                              'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{plugin.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">v{plugin.version}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          installation.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          installation.status === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                          installation.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {installation.status}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Installed</span>
                          <span className="text-gray-900 dark:text-white">
                            {new Date(installation.installedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Last Used</span>
                          <span className="text-gray-900 dark:text-white">
                            {new Date(installation.lastUsed).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleUpdatePlugin(plugin.id)}
                          className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleUninstallPlugin(plugin.id)}
                          className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Uninstall
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'develop' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Plugin Development</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Getting Started</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Code className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Download SDK</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Read Documentation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Join Community</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Resources</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">API Reference</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Examples</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Security Guidelines</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
