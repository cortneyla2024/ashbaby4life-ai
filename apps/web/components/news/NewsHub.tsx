'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, Bell, TrendingUp, Globe, Filter, Search,
  Bookmark, Share, Play, Volume2, Clock, Eye, Heart,
  MessageCircle, AlertTriangle, CheckCircle, X, Settings,
  RefreshCw, Download, ExternalLink, Zap, Brain, Video
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNews } from '@/hooks/useNews';
import { useAIService } from '@/hooks/useAIService';
import { useNotifications } from '@/hooks/useNotifications';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  url: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  isBookmarked: boolean;
  isRead: boolean;
  views: number;
  likes: number;
  comments: number;
  aiSummary?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  importance: 'high' | 'medium' | 'low';
}

interface Alert {
  id: string;
  type: 'breaking' | 'update' | 'reminder' | 'warning';
  title: string;
  message: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
  actionText?: string;
}

interface NewsCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  isSubscribed: boolean;
}

interface NewsPreferences {
  categories: string[];
  sources: string[];
  updateFrequency: 'realtime' | 'hourly' | 'daily';
  pushNotifications: boolean;
  emailDigest: boolean;
  aiSummaries: boolean;
  autoBookmark: boolean;
}

export const NewsHub: React.FC = () => {
  const { user } = useAuth();
  const {
    articles,
    alerts,
    categories,
    preferences,
    bookmarkArticle,
    markAsRead,
    subscribeToCategory,
    updatePreferences,
    loading
  } = useNews();
  const { summarizeArticle, analyzeSentiment, generateExplainers } = useAIService();
  const { showNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'news' | 'alerts' | 'explainers'>('news');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showPreferences, setShowPreferences] = useState(false);
  const [showArticle, setShowArticle] = useState<NewsArticle | null>(null);
  const [showExplainer, setShowExplainer] = useState<NewsArticle | null>(null);
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const categoriesList: NewsCategory[] = [
    { id: 'health', name: 'Health & Wellness', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-green-500', isSubscribed: true },
    { id: 'technology', name: 'Technology', icon: <Zap className="w-4 h-4" />, color: 'bg-blue-500', isSubscribed: true },
    { id: 'science', name: 'Science', icon: <Brain className="w-4 h-4" />, color: 'bg-purple-500', isSubscribed: false },
    { id: 'finance', name: 'Finance', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-yellow-500', isSubscribed: true },
    { id: 'politics', name: 'Politics', icon: <Globe className="w-4 h-4" />, color: 'bg-red-500', isSubscribed: false },
    { id: 'entertainment', name: 'Entertainment', icon: <Play className="w-4 h-4" />, color: 'bg-pink-500', isSubscribed: false }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const handleBookmark = useCallback(async (article: NewsArticle) => {
    try {
      await bookmarkArticle(article.id);
      showNotification(article.isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks', 'success');
    } catch (error) {
      showNotification('Failed to update bookmark', 'error');
    }
  }, [bookmarkArticle, showNotification]);

  const handleMarkAsRead = useCallback(async (article: NewsArticle) => {
    try {
      await markAsRead(article.id);
      showNotification('Marked as read', 'success');
    } catch (error) {
      showNotification('Failed to mark as read', 'error');
    }
  }, [markAsRead, showNotification]);

  const handleSubscribeCategory = useCallback(async (categoryId: string) => {
    try {
      await subscribeToCategory(categoryId);
      showNotification('Subscription updated', 'success');
    } catch (error) {
      showNotification('Failed to update subscription', 'error');
    }
  }, [subscribeToCategory, showNotification]);

  const handleGenerateSummary = useCallback(async (article: NewsArticle) => {
    try {
      const summary = await summarizeArticle(article.id);
      showNotification('AI summary generated!', 'success');
    } catch (error) {
      showNotification('Failed to generate summary', 'error');
    }
  }, [summarizeArticle, showNotification]);

  const handleGenerateExplainer = useCallback(async (article: NewsArticle) => {
    try {
      const explainer = await generateExplainers(article.id);
      setShowExplainer(article);
      showNotification('Multimedia explainer generated!', 'success');
    } catch (error) {
      showNotification('Failed to generate explainer', 'error');
    }
  }, [generateExplainers, showNotification]);

  const handleShare = useCallback(async (article: NewsArticle) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url
        });
      } else {
        await navigator.clipboard.writeText(article.url);
        showNotification('Link copied to clipboard', 'success');
      }
    } catch (error) {
      showNotification('Failed to share article', 'error');
    }
  }, [showNotification]);

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || colors.low;
  };

  const getAlertIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      breaking: <AlertTriangle className="w-4 h-4" />,
      update: <CheckCircle className="w-4 h-4" />,
      reminder: <Bell className="w-4 h-4" />,
      warning: <AlertTriangle className="w-4 h-4" />
    };
    return icons[type] || <Bell className="w-4 h-4" />;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          News & Alerts
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Stay informed with AI-curated news and real-time alerts
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search news and alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
          >
            <Newspaper className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
          >
            <Globe className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowPreferences(true)}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {categoriesList.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'news', label: 'News Feed', icon: Newspaper, count: filteredArticles.length },
            { id: 'alerts', label: 'Alerts', icon: Bell, count: filteredAlerts.length },
            { id: 'explainers', label: 'AI Explainers', icon: Brain, count: 0 }
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
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'news' && (
            <div className="space-y-6">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-12">
                  <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No articles found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Try adjusting your search or category filters
                  </p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {filteredArticles.map((article) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${
                        viewMode === 'list' ? 'flex' : ''
                      } ${article.read ? 'opacity-75' : ''}`}
                    >
                      {article.imageUrl && (
                        <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className={`w-full object-cover ${viewMode === 'list' ? 'h-32' : 'h-48'}`}
                          />
                          {article.videoUrl && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                          )}
                          {article.audioUrl && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded">
                              <Volume2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      )}

                      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {article.source}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatTimeAgo(article.publishedAt)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleBookmark(article)}
                              className={`p-1 rounded ${article.isBookmarked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleShare(article)}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            >
                              <Share className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                          {article.aiSummary || article.summary}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {article.views}
                            </span>
                            <span className="flex items-center">
                              <Heart className="w-3 h-3 mr-1" />
                              {article.likes}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              {article.comments}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            article.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                            article.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {article.sentiment}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {article.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center space-x-2">
                            {!article.aiSummary && (
                              <button
                                onClick={() => handleGenerateSummary(article)}
                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                AI Summary
                              </button>
                            )}
                            <button
                              onClick={() => handleGenerateExplainer(article)}
                              className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                            >
                              Explain
                            </button>
                            <button
                              onClick={() => setShowArticle(article)}
                              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Read More
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No alerts</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    You're all caught up! No new alerts at the moment.
                  </p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${
                      !alert.isRead ? 'border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {alert.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(alert.priority)}`}>
                              {alert.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatTimeAgo(alert.createdAt)}</span>
                            <span>{alert.category}</span>
                            {alert.expiresAt && (
                              <span>Expires {formatTimeAgo(alert.expiresAt)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {alert.actionUrl && (
                          <button className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                            {alert.actionText || 'Take Action'}
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'explainers' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">AI Explainers</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Generate multimedia explainers for complex topics
                </p>
                <button
                  onClick={() => setShowExplainer(articles[0])}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Generate Explainer
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Article Modal */}
      <AnimatePresence>
        {showArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {showArticle.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{showArticle.source}</span>
                      <span>{formatTimeAgo(showArticle.publishedAt)}</span>
                      <span>{showArticle.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowArticle(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {showArticle.imageUrl && (
                  <img
                    src={showArticle.imageUrl}
                    alt={showArticle.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}

                <div className="prose dark:prose-invert max-w-none mb-6">
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {showArticle.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleBookmark(showArticle)}
                      className={`flex items-center space-x-1 ${showArticle.isBookmarked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                    >
                      <Bookmark className="w-4 h-4" />
                      <span className="text-sm">{showArticle.isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                    </button>
                    <button
                      onClick={() => handleShare(showArticle)}
                      className="flex items-center space-x-1 text-gray-400 hover:text-gray-600"
                    >
                      <Share className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                  <a
                    href={showArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">Read Original</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explainer Modal */}
      <AnimatePresence>
        {showExplainer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowExplainer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      AI Explainer: {showExplainer.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Understanding complex topics made simple
                    </p>
                  </div>
                  <button
                    onClick={() => setShowExplainer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Key Points</h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Simplified explanation of complex concepts</li>
                      <li>• Visual aids and interactive elements</li>
                      <li>• Related topics and further reading</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Visual Explanation</h3>
                    <div className="aspect-video bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">Related Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {showExplainer.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
