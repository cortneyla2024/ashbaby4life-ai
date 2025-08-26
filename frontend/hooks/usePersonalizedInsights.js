import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import { useTelemetry } from './useTelemetry';
import { useLocalStorage } from './useLocalStorage';
import { useKnowledgeGraph } from './useKnowledgeGraph';

const usePersonalizedInsights = () => {
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [insightCategories, setInsightCategories] = useState({
    health: [],
    finance: [],
    learning: [],
    creative: [],
    social: [],
    productivity: []
  });

  // Hooks
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const { trackEvent } = useTelemetry();
  const { getItem, setItem } = useLocalStorage();
  const { knowledgeNodes, relationships } = useKnowledgeGraph();

  // Generate personalized insights
  const generateInsights = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filters,
          include_patterns: true,
          include_trends: true,
          include_recommendations: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      
      setInsights(data.insights || []);
      setRecommendations(data.recommendations || []);
      setPatterns(data.patterns || []);
      setTrends(data.trends || []);
      setLastUpdated(new Date().toISOString());

      // Categorize insights
      const categorized = categorizeInsights(data.insights || []);
      setInsightCategories(categorized);

      // Save to local storage
      await setItem('personalized_insights', {
        insights: data.insights,
        recommendations: data.recommendations,
        patterns: data.patterns,
        trends: data.trends,
        lastUpdated: new Date().toISOString()
      });

      trackEvent('insights_generated', { 
        insightCount: data.insights?.length || 0,
        recommendationCount: data.recommendations?.length || 0,
        patternCount: data.patterns?.length || 0,
        trendCount: data.trends?.length || 0
      });

      return data;

    } catch (error) {
      console.error('Error generating insights:', error);
      setError(error.message);
      showNotification('Error generating insights', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, showNotification, trackEvent, setItem]);

  // Get specific type of insights
  const getInsightsByType = useCallback(async (type, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        type,
        ...filters
      });

      const response = await fetch(`/api/insights/type?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get ${type} insights`);
      }

      const data = await response.json();
      
      trackEvent('insights_by_type_loaded', { 
        type, 
        count: data.insights?.length || 0 
      });

      return data.insights;

    } catch (error) {
      console.error(`Error getting ${type} insights:`, error);
      setError(error.message);
      showNotification(`Error loading ${type} insights`, 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, trackEvent, showNotification]);

  // Get health insights
  const getHealthInsights = useCallback(async () => {
    return await getInsightsByType('health');
  }, [getInsightsByType]);

  // Get financial insights
  const getFinancialInsights = useCallback(async () => {
    return await getInsightsByType('finance');
  }, [getInsightsByType]);

  // Get learning insights
  const getLearningInsights = useCallback(async () => {
    return await getInsightsByType('learning');
  }, [getInsightsByType]);

  // Get creative insights
  const getCreativeInsights = useCallback(async () => {
    return await getInsightsByType('creative');
  }, [getInsightsByType]);

  // Get social insights
  const getSocialInsights = useCallback(async () => {
    return await getInsightsByType('social');
  }, [getInsightsByType]);

  // Get productivity insights
  const getProductivityInsights = useCallback(async () => {
    return await getInsightsByType('productivity');
  }, [getInsightsByType]);

  // Get actionable recommendations
  const getActionableRecommendations = useCallback(async (priority = 'all') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        priority,
        actionable: 'true'
      });

      const response = await fetch(`/api/insights/recommendations?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get actionable recommendations');
      }

      const data = await response.json();
      
      trackEvent('actionable_recommendations_loaded', { 
        priority, 
        count: data.recommendations?.length || 0 
      });

      return data.recommendations;

    } catch (error) {
      console.error('Error getting actionable recommendations:', error);
      setError(error.message);
      showNotification('Error loading recommendations', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, trackEvent, showNotification]);

  // Get patterns and trends
  const getPatternsAndTrends = useCallback(async (timeRange = '30d') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        time_range: timeRange,
        include_patterns: 'true',
        include_trends: 'true'
      });

      const response = await fetch(`/api/insights/patterns?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get patterns and trends');
      }

      const data = await response.json();
      
      setPatterns(data.patterns || []);
      setTrends(data.trends || []);
      
      trackEvent('patterns_and_trends_loaded', { 
        timeRange,
        patternCount: data.patterns?.length || 0,
        trendCount: data.trends?.length || 0
      });

      return data;

    } catch (error) {
      console.error('Error getting patterns and trends:', error);
      setError(error.message);
      showNotification('Error loading patterns and trends', 'error');
      return { patterns: [], trends: [] };
    } finally {
      setLoading(false);
    }
  }, [user, trackEvent, showNotification]);

  // Get personalized goals
  const getPersonalizedGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/insights/goals', {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get personalized goals');
      }

      const data = await response.json();
      
      trackEvent('personalized_goals_loaded', { 
        goalCount: data.goals?.length || 0 
      });

      return data.goals;

    } catch (error) {
      console.error('Error getting personalized goals:', error);
      setError(error.message);
      showNotification('Error loading personalized goals', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, trackEvent, showNotification]);

  // Get progress insights
  const getProgressInsights = useCallback(async (goalId = null) => {
    try {
      setLoading(true);
      setError(null);

      const params = goalId ? new URLSearchParams({ goal_id: goalId }) : '';

      const response = await fetch(`/api/insights/progress?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get progress insights');
      }

      const data = await response.json();
      
      trackEvent('progress_insights_loaded', { 
        goalId,
        insightCount: data.insights?.length || 0 
      });

      return data.insights;

    } catch (error) {
      console.error('Error getting progress insights:', error);
      setError(error.message);
      showNotification('Error loading progress insights', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, trackEvent, showNotification]);

  // Mark insight as read
  const markInsightAsRead = useCallback(async (insightId) => {
    try {
      const response = await fetch(`/api/insights/${insightId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark insight as read');
      }

      // Update local state
      setInsights(prev => prev.map(insight => 
        insight.id === insightId ? { ...insight, read: true, read_at: new Date().toISOString() } : insight
      ));

      trackEvent('insight_marked_read', { insightId });

    } catch (error) {
      console.error('Error marking insight as read:', error);
      showNotification('Error marking insight as read', 'error');
    }
  }, [user, showNotification, trackEvent]);

  // Dismiss insight
  const dismissInsight = useCallback(async (insightId) => {
    try {
      const response = await fetch(`/api/insights/${insightId}/dismiss`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to dismiss insight');
      }

      // Remove from local state
      setInsights(prev => prev.filter(insight => insight.id !== insightId));

      trackEvent('insight_dismissed', { insightId });

    } catch (error) {
      console.error('Error dismissing insight:', error);
      showNotification('Error dismissing insight', 'error');
    }
  }, [user, showNotification, trackEvent]);

  // Save insight
  const saveInsight = useCallback(async (insightId) => {
    try {
      const response = await fetch(`/api/insights/${insightId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to save insight');
      }

      // Update local state
      setInsights(prev => prev.map(insight => 
        insight.id === insightId ? { ...insight, saved: true, saved_at: new Date().toISOString() } : insight
      ));

      showNotification('Insight saved successfully', 'success');
      trackEvent('insight_saved', { insightId });

    } catch (error) {
      console.error('Error saving insight:', error);
      showNotification('Error saving insight', 'error');
    }
  }, [user, showNotification, trackEvent]);

  // Share insight
  const shareInsight = useCallback(async (insightId, shareOptions = {}) => {
    try {
      const response = await fetch(`/api/insights/${insightId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shareOptions)
      });

      if (!response.ok) {
        throw new Error('Failed to share insight');
      }

      const data = await response.json();
      
      showNotification('Insight shared successfully', 'success');
      trackEvent('insight_shared', { insightId, shareOptions });

      return data;

    } catch (error) {
      console.error('Error sharing insight:', error);
      showNotification('Error sharing insight', 'error');
      throw error;
    }
  }, [user, showNotification, trackEvent]);

  // Export insights
  const exportInsights = useCallback(async (format = 'json', filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        format,
        ...filters
      });

      const response = await fetch(`/api/insights/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export insights');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personalized_insights_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification('Insights exported successfully', 'success');
      trackEvent('insights_exported', { format, filters });

    } catch (error) {
      console.error('Error exporting insights:', error);
      setError(error.message);
      showNotification('Error exporting insights', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showNotification, trackEvent]);

  // Load cached insights
  const loadCachedInsights = useCallback(async () => {
    try {
      const cached = await getItem('personalized_insights');
      if (cached && cached.lastUpdated) {
        const lastUpdated = new Date(cached.lastUpdated);
        const now = new Date();
        const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);
        
        // Use cached data if less than 24 hours old
        if (hoursSinceUpdate < 24) {
          setInsights(cached.insights || []);
          setRecommendations(cached.recommendations || []);
          setPatterns(cached.patterns || []);
          setTrends(cached.trends || []);
          setLastUpdated(cached.lastUpdated);
          
          const categorized = categorizeInsights(cached.insights || []);
          setInsightCategories(categorized);
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading cached insights:', error);
      return false;
    }
  }, [getItem]);

  // Categorize insights
  const categorizeInsights = useCallback((insightsList) => {
    const categories = {
      health: [],
      finance: [],
      learning: [],
      creative: [],
      social: [],
      productivity: []
    };

    insightsList.forEach(insight => {
      const category = insight.category || 'productivity';
      if (categories[category]) {
        categories[category].push(insight);
      }
    });

    return categories;
  }, []);

  // Get unread insights count
  const getUnreadCount = useCallback(() => {
    return insights.filter(insight => !insight.read).length;
  }, [insights]);

  // Get saved insights
  const getSavedInsights = useCallback(() => {
    return insights.filter(insight => insight.saved);
  }, [insights]);

  // Get priority insights
  const getPriorityInsights = useCallback((priority = 'high') => {
    return insights.filter(insight => insight.priority === priority);
  }, [insights]);

  // Get insights by date range
  const getInsightsByDateRange = useCallback((startDate, endDate) => {
    return insights.filter(insight => {
      const insightDate = new Date(insight.created_at);
      return insightDate >= startDate && insightDate <= endDate;
    });
  }, [insights]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadCachedInsights().then(cached => {
        if (!cached) {
          generateInsights();
        }
      });
    }
  }, [user, loadCachedInsights, generateInsights]);

  // Auto-refresh insights when knowledge graph changes
  useEffect(() => {
    if (user && knowledgeNodes.length > 0) {
      const lastUpdate = lastUpdated ? new Date(lastUpdated) : null;
      const now = new Date();
      
      // Refresh if no insights or insights are older than 6 hours
      if (!lastUpdate || (now - lastUpdate) / (1000 * 60 * 60) > 6) {
        generateInsights();
      }
    }
  }, [user, knowledgeNodes.length, lastUpdated, generateInsights]);

  return {
    // State
    insights,
    recommendations,
    patterns,
    trends,
    loading,
    error,
    lastUpdated,
    insightCategories,

    // Methods
    generateInsights,
    getInsightsByType,
    getHealthInsights,
    getFinancialInsights,
    getLearningInsights,
    getCreativeInsights,
    getSocialInsights,
    getProductivityInsights,
    getActionableRecommendations,
    getPatternsAndTrends,
    getPersonalizedGoals,
    getProgressInsights,
    markInsightAsRead,
    dismissInsight,
    saveInsight,
    shareInsight,
    exportInsights,
    loadCachedInsights,

    // Utilities
    getUnreadCount,
    getSavedInsights,
    getPriorityInsights,
    getInsightsByDateRange,
    categorizeInsights
  };
};

export default usePersonalizedInsights;
