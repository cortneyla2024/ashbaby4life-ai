'use client';

import { useState, useCallback } from 'react';

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'concept' | 'person' | 'place' | 'event' | 'document';
  description: string;
  tags: string[];
  connections: string[];
  position?: { x: number; y: number };
  size?: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'related' | 'part-of' | 'causes' | 'similar';
  strength: number;
  createdAt: Date;
}

export const useKnowledgeGraph = () => {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([
    {
      id: '1',
      label: 'Machine Learning',
      type: 'concept',
      description: 'A subset of artificial intelligence that enables computers to learn and improve from experience',
      tags: ['AI', 'technology', 'algorithms'],
      connections: ['2', '3'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      label: 'Neural Networks',
      type: 'concept',
      description: 'Computing systems inspired by biological neural networks',
      tags: ['AI', 'deep-learning', 'algorithms'],
      connections: ['1', '4'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      label: 'Data Science',
      type: 'concept',
      description: 'Interdisciplinary field that uses scientific methods to extract knowledge from data',
      tags: ['analytics', 'statistics', 'programming'],
      connections: ['1', '5'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [connections, setConnections] = useState<KnowledgeConnection[]>([
    {
      id: '1',
      sourceId: '1',
      targetId: '2',
      type: 'related',
      strength: 0.8,
      createdAt: new Date()
    },
    {
      id: '2',
      sourceId: '1',
      targetId: '3',
      type: 'related',
      strength: 0.7,
      createdAt: new Date()
    }
  ]);

  const [loading, setLoading] = useState(false);

  const addNode = useCallback(async (node: Omit<KnowledgeNode, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newNode: KnowledgeNode = {
        ...node,
        id: `node-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setNodes(prev => [...prev, newNode]);
      return newNode;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNode = useCallback(async (id: string, updates: Partial<KnowledgeNode>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setNodes(prev => prev.map(node =>
        node.id === id ? { ...node, ...updates, updatedAt: new Date() } : node
      ));
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNode = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setNodes(prev => prev.filter(node => node.id !== id));
      setConnections(prev => prev.filter(conn => conn.sourceId !== id && conn.targetId !== id));
    } finally {
      setLoading(false);
    }
  }, []);

  const addConnection = useCallback(async (connection: Omit<KnowledgeConnection, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newConnection: KnowledgeConnection = {
        ...connection,
        id: `conn-${Date.now()}`,
        createdAt: new Date()
      };
      setConnections(prev => [...prev, newConnection]);
      return newConnection;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchNodes = useCallback((query: string) => {
    return nodes.filter(node =>
      node.label.toLowerCase().includes(query.toLowerCase()) ||
      node.description.toLowerCase().includes(query.toLowerCase()) ||
      node.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }, [nodes]);

  const getNodeConnections = useCallback((nodeId: string) => {
    return connections.filter(conn => conn.sourceId === nodeId || conn.targetId === nodeId);
  }, [connections]);

  const getRelatedNodes = useCallback((nodeId: string) => {
    const nodeConnections = getNodeConnections(nodeId);
    const relatedIds = nodeConnections.map(conn => 
      conn.sourceId === nodeId ? conn.targetId : conn.sourceId
    );
    return nodes.filter(node => relatedIds.includes(node.id));
  }, [nodes, getNodeConnections]);

  return {
    nodes,
    connections,
    loading,
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    searchNodes,
    getNodeConnections,
    getRelatedNodes
  };
};
