import { useState, useCallback, useEffect } from 'react';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  summary: string;
  aiSummary?: string;
  content: string;
  url: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  source: string;
  author?: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  read: boolean;
  bookmarked: boolean;
  isBookmarked: boolean;
  isRead: boolean;
  views: number;
  likes: number;
  comments: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  importance: 'high' | 'medium' | 'low';
}

interface NewsAlert {
  id: string;
  title: string;
  message: string;
  type: 'breaking' | 'update' | 'reminder' | 'alert';
  priority: 'high' | 'medium' | 'low';
  category: string;
  timestamp: Date;
  createdAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
  actionText?: string;
  read: boolean;
  isRead: boolean;
}

interface NewsCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  isSubscribed: boolean;
}

interface NewsSource {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
}

interface NewsPreferences {
  categories: string[];
  sources: string[];
  keywords: string[];
  language: string;
  country: string;
}

export const useNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [alerts, setAlerts] = useState<NewsAlert[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [preferences, setPreferences] = useState<NewsPreferences>({
    categories: ['general', 'technology', 'health', 'science'],
    sources: [],
    keywords: [],
    language: 'en',
    country: 'us'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    source: 'all',
    dateRange: 'all',
    searchQuery: ''
  });

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/news', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      setArticles(data.articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSources = useCallback(async () => {
    try {
      const response = await fetch('/api/news/sources', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSources(data.sources);
      }
    } catch (err) {
      console.error('Failed to fetch news sources:', err);
    }
  }, []);

  const markAsRead = useCallback(async (articleId: string) => {
    try {
      await fetch(`/api/news/articles/${articleId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setArticles(prev => prev.map(article =>
        article.id === articleId ? { ...article, read: true } : article
      ));
    } catch (err) {
      console.error('Failed to mark article as read:', err);
    }
  }, []);

  const bookmarkArticle = useCallback(async (articleId: string) => {
    try {
      const article = articles.find(a => a.id === articleId);
      const newBookmarked = !article?.isBookmarked;

      await fetch(`/api/news/articles/${articleId}/bookmark`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookmarked: newBookmarked }),
      });

      setArticles(prev => prev.map(article =>
        article.id === articleId ? { ...article, isBookmarked: newBookmarked } : article
      ));
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  }, [articles]);

  const subscribeToCategory = useCallback(async (categoryId: string) => {
    try {
      await fetch(`/api/news/categories/${categoryId}/subscribe`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      setCategories(prev => prev.map(category =>
        category.id === categoryId ? { ...category, isSubscribed: !category.isSubscribed } : category
      ));
    } catch (err) {
      console.error('Failed to subscribe to category:', err);
    }
  }, []);

  const updatePreferences = useCallback(async (newPreferences: Partial<NewsPreferences>) => {
    try {
      const response = await fetch('/api/news/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
      });

      if (response.ok) {
        setPreferences(prev => ({ ...prev, ...newPreferences }));
      }
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  }, []);

  const toggleSource = useCallback(async (sourceId: string) => {
    try {
      const source = sources.find(s => s.id === sourceId);
      const newEnabled = !source?.enabled;

      await fetch(`/api/news/sources/${sourceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: newEnabled }),
      });

      setSources(prev => prev.map(source =>
        source.id === sourceId ? { ...source, enabled: newEnabled } : source
      ));
    } catch (err) {
      console.error('Failed to toggle source:', err);
    }
  }, [sources]);

  const searchNews = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/news/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search news');
      }

      const data = await response.json();
      setArticles(data.articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search news');
    } finally {
      setLoading(false);
    }
  }, []);

  const getFilteredArticles = useCallback(() => {
    return articles.filter(article => {
      const matchesCategory = filters.category === 'all' || article.category === filters.category;
      const matchesSource = filters.source === 'all' || article.source === filters.source;
      const matchesSearch = !filters.searchQuery || 
        article.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      return matchesCategory && matchesSource && matchesSearch;
    });
  }, [articles, filters]);

  const getBookmarkedArticles = useCallback(() => {
    return articles.filter(article => article.isBookmarked);
  }, [articles]);

  const getUnreadArticles = useCallback(() => {
    return articles.filter(article => !article.read);
  }, [articles]);

  // Load data on mount
  useEffect(() => {
    fetchNews();
    fetchSources();
  }, [fetchNews, fetchSources]);

  return {
    articles,
    alerts,
    categories,
    sources,
    preferences,
    loading,
    error,
    filters,
    fetchNews,
    markAsRead,
    bookmarkArticle,
    subscribeToCategory,
    updatePreferences,
    toggleSource,
    searchNews,
    setFilters,
    getFilteredArticles,
    getBookmarkedArticles,
    getUnreadArticles,
  };
};
