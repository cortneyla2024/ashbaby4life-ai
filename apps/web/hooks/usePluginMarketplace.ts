import { useState, useCallback, useEffect } from 'react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  category: string;
  price: number;
  rating: number;
  downloads: number;
  downloadCount: number;
  size: number;
  imageUrl?: string;
  tags: string[];
  features: string[];
  requirements: string[];
  installed: boolean;
  enabled: boolean;
  compatible: boolean;
  lastUpdated: Date;
  installedAt?: Date;
  lastUsed?: Date;
  status: 'active' | 'inactive' | 'deprecated' | 'beta' | 'error';
}

interface PluginCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

interface PluginReview {
  id: string;
  pluginId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: Date;
}

export const usePluginMarketplace = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [categories, setCategories] = useState<PluginCategory[]>([]);
  const [reviews, setReviews] = useState<PluginReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    rating: 0,
    searchQuery: '',
    sortBy: 'popularity'
  });

  const fetchPlugins = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/plugins', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plugins');
      }

      const data = await response.json();
      setPlugins(data.plugins);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plugins');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/plugins/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch plugin categories:', err);
    }
  }, []);

  const installPlugin = useCallback(async (pluginId: string) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}/install`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to install plugin');
      }

      setPlugins(prev => prev.map(plugin =>
        plugin.id === pluginId ? { ...plugin, installed: true } : plugin
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to install plugin');
      throw err;
    }
  }, []);

  const uninstallPlugin = useCallback(async (pluginId: string) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}/uninstall`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to uninstall plugin');
      }

      setPlugins(prev => prev.map(plugin =>
        plugin.id === pluginId ? { ...plugin, installed: false, enabled: false } : plugin
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to uninstall plugin');
      throw err;
    }
  }, []);

  const enablePlugin = useCallback(async (pluginId: string) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}/enable`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to enable plugin');
      }

      setPlugins(prev => prev.map(plugin =>
        plugin.id === pluginId ? { ...plugin, enabled: true } : plugin
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable plugin');
      throw err;
    }
  }, []);

  const disablePlugin = useCallback(async (pluginId: string) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}/disable`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disable plugin');
      }

      setPlugins(prev => prev.map(plugin =>
        plugin.id === pluginId ? { ...plugin, enabled: false } : plugin
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable plugin');
      throw err;
    }
  }, []);

  const updatePlugin = useCallback(async (pluginId: string) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update plugin');
      }

      const data = await response.json();
      setPlugins(prev => prev.map(plugin =>
        plugin.id === pluginId ? { ...plugin, ...data.plugin } : plugin
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plugin');
      throw err;
    }
  }, []);

  const searchPlugins = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/plugins/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search plugins');
      }

      const data = await response.json();
      setPlugins(data.plugins);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search plugins');
    } finally {
      setLoading(false);
    }
  }, []);

  const getPluginReviews = useCallback(async (pluginId: string) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}/reviews`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch plugin reviews:', err);
    }
  }, []);

  const addReview = useCallback(async (pluginId: string, review: {
    rating: number;
    comment: string;
  }) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(review),
      });

      if (!response.ok) {
        throw new Error('Failed to add review');
      }

      const data = await response.json();
      setReviews(prev => [data.review, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add review');
      throw err;
    }
  }, []);

  const getFilteredPlugins = useCallback(() => {
    return plugins.filter(plugin => {
      const matchesCategory = filters.category === 'all' || plugin.category === filters.category;
      const matchesPrice = filters.priceRange === 'all' || 
        (filters.priceRange === 'free' && plugin.price === 0) ||
        (filters.priceRange === 'paid' && plugin.price > 0);
      const matchesRating = plugin.rating >= filters.rating;
      const matchesSearch = !filters.searchQuery || 
        plugin.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        plugin.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()));
      
      return matchesCategory && matchesPrice && matchesRating && matchesSearch;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'popularity':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [plugins, filters]);

  const getInstalledPlugins = useCallback(() => {
    return plugins.filter(plugin => plugin.installed);
  }, [plugins]);

  const getEnabledPlugins = useCallback(() => {
    return plugins.filter(plugin => plugin.enabled);
  }, [plugins]);

  // Load data on mount
  useEffect(() => {
    fetchPlugins();
    fetchCategories();
  }, [fetchPlugins, fetchCategories]);

  return {
    plugins,
    categories,
    reviews,
    loading,
    error,
    filters,
    installedPlugins: getInstalledPlugins().map(plugin => ({ pluginId: plugin.id, ...plugin })),
    enabledPlugins: getEnabledPlugins(),
    fetchPlugins,
    installPlugin,
    uninstallPlugin,
    enablePlugin,
    disablePlugin,
    updatePlugin,
    searchPlugins,
    getPluginReviews,
    addReview,
    setFilters,
    getFilteredPlugins,
    getInstalledPlugins,
    getEnabledPlugins,
  };
};
