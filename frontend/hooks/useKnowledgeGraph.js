import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import { useTelemetry } from './useTelemetry';
import { useLocalStorage } from './useLocalStorage';

const useKnowledgeGraph = () => {
  const [knowledgeNodes, setKnowledgeNodes] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphView, setGraphView] = useState('network'); // network, list, timeline

  // Hooks
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const { trackEvent } = useTelemetry();
  const { getItem, setItem } = useLocalStorage();

  // Load knowledge graph data
  const loadKnowledgeGraph = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/knowledge/graph', {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load knowledge graph');
      }

      const data = await response.json();
      
      setKnowledgeNodes(data.nodes || []);
      setRelationships(data.relationships || []);
      setStats(data.stats || {});

      trackEvent('knowledge_graph_loaded', { 
        nodeCount: data.nodes?.length || 0,
        relationshipCount: data.relationships?.length || 0
      });

    } catch (error) {
      console.error('Error loading knowledge graph:', error);
      setError(error.message);
      showNotification('Error loading knowledge graph', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, trackEvent, showNotification]);

  // Search knowledge graph
  const searchKnowledge = useCallback(async (query, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        q: query,
        ...filters
      });

      const response = await fetch(`/api/knowledge/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results || []);

      trackEvent('knowledge_search', { 
        query, 
        results: data.results?.length || 0,
        filters 
      });

      return data.results;

    } catch (error) {
      console.error('Error searching knowledge:', error);
      setError(error.message);
      showNotification('Search failed', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, trackEvent, showNotification]);

  // Get node context
  const getNodeContext = useCallback(async (nodeId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/knowledge/node/${nodeId}/context`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get node context');
      }

      const data = await response.json();
      setSelectedNode(data);

      trackEvent('node_context_loaded', { nodeId });

      return data;

    } catch (error) {
      console.error('Error getting node context:', error);
      setError(error.message);
      showNotification('Error loading node context', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, trackEvent, showNotification]);

  // Add knowledge node
  const addKnowledgeNode = useCallback(async (nodeData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/knowledge/node', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nodeData)
      });

      if (!response.ok) {
        throw new Error('Failed to add knowledge node');
      }

      const data = await response.json();
      
      // Add to local state
      setKnowledgeNodes(prev => [...prev, data.node]);
      
      // Update relationships if any
      if (data.relationships) {
        setRelationships(prev => [...prev, ...data.relationships]);
      }

      showNotification('Knowledge node added successfully', 'success');
      trackEvent('knowledge_node_added', { 
        nodeId: data.node.id,
        nodeType: data.node.type 
      });

      return data.node;

    } catch (error) {
      console.error('Error adding knowledge node:', error);
      setError(error.message);
      showNotification('Error adding knowledge node', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, showNotification, trackEvent]);

  // Update knowledge node
  const updateKnowledgeNode = useCallback(async (nodeId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/knowledge/node/${nodeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update knowledge node');
      }

      const data = await response.json();
      
      // Update in local state
      setKnowledgeNodes(prev => prev.map(node => 
        node.id === nodeId ? { ...node, ...data.node } : node
      ));

      showNotification('Knowledge node updated successfully', 'success');
      trackEvent('knowledge_node_updated', { nodeId });

      return data.node;

    } catch (error) {
      console.error('Error updating knowledge node:', error);
      setError(error.message);
      showNotification('Error updating knowledge node', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, showNotification, trackEvent]);

  // Delete knowledge node
  const deleteKnowledgeNode = useCallback(async (nodeId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/knowledge/node/${nodeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete knowledge node');
      }

      // Remove from local state
      setKnowledgeNodes(prev => prev.filter(node => node.id !== nodeId));
      setRelationships(prev => prev.filter(rel => 
        rel.source_id !== nodeId && rel.target_id !== nodeId
      ));

      showNotification('Knowledge node deleted successfully', 'success');
      trackEvent('knowledge_node_deleted', { nodeId });

    } catch (error) {
      console.error('Error deleting knowledge node:', error);
      setError(error.message);
      showNotification('Error deleting knowledge node', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, showNotification, trackEvent]);

  // Process file for knowledge
  const processFileForKnowledge = useCallback(async (fileId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/knowledge/process/file/${fileId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to process file for knowledge');
      }

      const data = await response.json();
      
      // Add new nodes to local state
      if (data.nodes) {
        setKnowledgeNodes(prev => [...prev, ...data.nodes]);
      }
      
      // Add new relationships
      if (data.relationships) {
        setRelationships(prev => [...prev, ...data.relationships]);
      }

      showNotification('File processed for knowledge successfully', 'success');
      trackEvent('file_processed_for_knowledge', { 
        fileId,
        nodesCreated: data.nodes?.length || 0
      });

      return data;

    } catch (error) {
      console.error('Error processing file for knowledge:', error);
      setError(error.message);
      showNotification('Error processing file for knowledge', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, showNotification, trackEvent]);

  // Process text for knowledge
  const processTextForKnowledge = useCallback(async (text, metadata = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/knowledge/process/text', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, metadata })
      });

      if (!response.ok) {
        throw new Error('Failed to process text for knowledge');
      }

      const data = await response.json();
      
      // Add new nodes to local state
      if (data.nodes) {
        setKnowledgeNodes(prev => [...prev, ...data.nodes]);
      }
      
      // Add new relationships
      if (data.relationships) {
        setRelationships(prev => [...prev, ...data.relationships]);
      }

      showNotification('Text processed for knowledge successfully', 'success');
      trackEvent('text_processed_for_knowledge', { 
        nodesCreated: data.nodes?.length || 0
      });

      return data;

    } catch (error) {
      console.error('Error processing text for knowledge:', error);
      setError(error.message);
      showNotification('Error processing text for knowledge', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, showNotification, trackEvent]);

  // Get knowledge insights
  const getKnowledgeInsights = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams(filters);

      const response = await fetch(`/api/knowledge/insights?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get knowledge insights');
      }

      const data = await response.json();
      
      trackEvent('knowledge_insights_loaded', { 
        insightCount: data.insights?.length || 0 
      });

      return data.insights;

    } catch (error) {
      console.error('Error getting knowledge insights:', error);
      setError(error.message);
      showNotification('Error loading knowledge insights', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, trackEvent, showNotification]);

  // Get knowledge recommendations
  const getKnowledgeRecommendations = useCallback(async (nodeId = null) => {
    try {
      setLoading(true);
      setError(null);

      const params = nodeId ? new URLSearchParams({ node_id: nodeId }) : '';

      const response = await fetch(`/api/knowledge/recommendations?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get knowledge recommendations');
      }

      const data = await response.json();
      
      trackEvent('knowledge_recommendations_loaded', { 
        recommendationCount: data.recommendations?.length || 0 
      });

      return data.recommendations;

    } catch (error) {
      console.error('Error getting knowledge recommendations:', error);
      setError(error.message);
      showNotification('Error loading knowledge recommendations', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, trackEvent, showNotification]);

  // Export knowledge graph
  const exportKnowledgeGraph = useCallback(async (format = 'json') => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/knowledge/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export knowledge graph');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge_graph_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification('Knowledge graph exported successfully', 'success');
      trackEvent('knowledge_graph_exported', { format });

    } catch (error) {
      console.error('Error exporting knowledge graph:', error);
      setError(error.message);
      showNotification('Error exporting knowledge graph', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showNotification, trackEvent]);

  // Import knowledge graph
  const importKnowledgeGraph = useCallback(async (file) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/knowledge/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to import knowledge graph');
      }

      const data = await response.json();
      
      // Reload knowledge graph
      await loadKnowledgeGraph();

      showNotification('Knowledge graph imported successfully', 'success');
      trackEvent('knowledge_graph_imported', { 
        nodesImported: data.nodes_imported || 0 
      });

      return data;

    } catch (error) {
      console.error('Error importing knowledge graph:', error);
      setError(error.message);
      showNotification('Error importing knowledge graph', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, showNotification, trackEvent, loadKnowledgeGraph]);

  // Clear search results
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setSelectedNode(null);
  }, []);

  // Get nodes by type
  const getNodesByType = useCallback((type) => {
    return knowledgeNodes.filter(node => node.type === type);
  }, [knowledgeNodes]);

  // Get nodes by tag
  const getNodesByTag = useCallback((tag) => {
    return knowledgeNodes.filter(node => 
      node.tags && node.tags.includes(tag)
    );
  }, [knowledgeNodes]);

  // Get related nodes
  const getRelatedNodes = useCallback((nodeId) => {
    const nodeRelationships = relationships.filter(rel => 
      rel.source_id === nodeId || rel.target_id === nodeId
    );
    
    const relatedIds = nodeRelationships.map(rel => 
      rel.source_id === nodeId ? rel.target_id : rel.source_id
    );
    
    return knowledgeNodes.filter(node => relatedIds.includes(node.id));
  }, [knowledgeNodes, relationships]);

  // Get node path
  const getNodePath = useCallback((sourceId, targetId) => {
    // Simple path finding - in a real implementation, you'd use a graph algorithm
    const sourceNode = knowledgeNodes.find(node => node.id === sourceId);
    const targetNode = knowledgeNodes.find(node => node.id === targetId);
    
    if (!sourceNode || !targetNode) {
      return [];
    }
    
    // Find direct relationships
    const directRelationship = relationships.find(rel => 
      (rel.source_id === sourceId && rel.target_id === targetId) ||
      (rel.source_id === targetId && rel.target_id === sourceId)
    );
    
    if (directRelationship) {
      return [sourceNode, targetNode];
    }
    
    // Find intermediate nodes
    const intermediateNodes = relationships
      .filter(rel => rel.source_id === sourceId || rel.target_id === sourceId)
      .map(rel => rel.source_id === sourceId ? rel.target_id : rel.source_id)
      .map(id => knowledgeNodes.find(node => node.id === id))
      .filter(Boolean);
    
    return [sourceNode, ...intermediateNodes, targetNode];
  }, [knowledgeNodes, relationships]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadKnowledgeGraph();
    }
  }, [user, loadKnowledgeGraph]);

  return {
    // State
    knowledgeNodes,
    relationships,
    loading,
    error,
    stats,
    searchResults,
    selectedNode,
    graphView,

    // Methods
    loadKnowledgeGraph,
    searchKnowledge,
    getNodeContext,
    addKnowledgeNode,
    updateKnowledgeNode,
    deleteKnowledgeNode,
    processFileForKnowledge,
    processTextForKnowledge,
    getKnowledgeInsights,
    getKnowledgeRecommendations,
    exportKnowledgeGraph,
    importKnowledgeGraph,
    clearSearchResults,

    // Utilities
    getNodesByType,
    getNodesByTag,
    getRelatedNodes,
    getNodePath,
    setGraphView,
    setSelectedNode
  };
};

export default useKnowledgeGraph;
