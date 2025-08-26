'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Modal, Badge, Progress } from '@/components/ui';
import { useKnowledgeGraph } from '@/hooks/useKnowledgeGraph';
import { 
  Network, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Share2, 
  Settings,
  Eye,
  Edit,
  Trash2,
  Users,
  FileText,
  BarChart3
} from 'lucide-react';

interface KnowledgeNode {
  id: string;
  label: string;
  type: 'concept' | 'person' | 'place' | 'event' | 'document';
  description?: string;
  metadata?: Record<string, any>;
  connections: string[];
}

interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: 'related' | 'part_of' | 'causes' | 'influences';
  weight: number;
}

const KnowledgeGraphHub: React.FC = () => {
  const { nodes, connections, addNode, addConnection, deleteNode, loading } = useKnowledgeGraph();
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [showAddNode, setShowAddNode] = useState(false);
  const [showAddEdge, setShowAddEdge] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'graph' | 'list' | 'table'>('graph');

  const [newNode, setNewNode] = useState({
    label: '',
    type: 'concept' as const,
    description: ''
  });

  const [newEdge, setNewEdge] = useState({
    source: '',
    target: '',
    type: 'related' as const,
    weight: 1
  });

  const handleAddNode = () => {
    if (newNode.label.trim()) {
      addNode({
        label: newNode.label,
        type: newNode.type,
        description: newNode.description,
        tags: [],
        connections: []
      });
      setNewNode({ label: '', type: 'concept', description: '' });
      setShowAddNode(false);
    }
  };

  const handleAddEdge = () => {
    if (newEdge.source && newEdge.target) {
      addConnection({
        sourceId: newEdge.source,
        targetId: newEdge.target,
        type: newEdge.type,
        strength: newEdge.weight
      });
      setNewEdge({ source: '', target: '', type: 'related', weight: 1 });
      setShowAddEdge(false);
    }
  };

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         node.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || node.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const nodeTypeColors = {
    concept: 'bg-blue-100 text-blue-800',
    person: 'bg-green-100 text-green-800',
    place: 'bg-yellow-100 text-yellow-800',
    event: 'bg-purple-100 text-purple-800',
    document: 'bg-gray-100 text-gray-800'
  };

  const edgeTypeColors = {
    related: 'bg-blue-100 text-blue-800',
    part_of: 'bg-green-100 text-green-800',
    causes: 'bg-red-100 text-red-800',
    influences: 'bg-purple-100 text-purple-800'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Graph Hub</h1>
          <p className="text-gray-600">Visualize and manage your knowledge network</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowAddNode(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Node
          </Button>
          <Button onClick={() => setShowAddEdge(true)} variant="outline">
            <Network className="w-4 h-4 mr-2" />
            Add Edge
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select
          value={filterType}
          onValueChange={setFilterType}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'concept', label: 'Concepts' },
            { value: 'person', label: 'People' },
            { value: 'place', label: 'Places' },
            { value: 'event', label: 'Events' },
            { value: 'document', label: 'Documents' }
          ]}
          className="w-48"
        />
        <div className="flex items-center space-x-1">
          <Button
            variant={viewMode === 'graph' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('graph')}
          >
            <Network className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <Network className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Nodes</p>
                <p className="text-2xl font-bold text-gray-900">{nodes.length}</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <Share2 className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Edges</p>
                <p className="text-2xl font-bold text-gray-900">{connections.length}</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {nodes.filter(n => n.connections.length > 0).length}
                </p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Isolated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {nodes.filter(n => n.connections.length === 0).length}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Graph Visualization */}
      {viewMode === 'graph' && (
        <Card>
          <div className="p-6">
            <div className="h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <Network className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Knowledge Graph Visualization</p>
                <p className="text-sm text-gray-500">Interactive graph view coming soon</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNodes.map((node) => (
            <Card key={node.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{node.label}</h3>
                      <Badge className={nodeTypeColors[node.type]}>
                        {node.type}
                      </Badge>
                    </div>
                    {node.description && (
                      <p className="text-sm text-gray-600 mb-3">{node.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{node.connections.length} connections</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedNode(node)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteNode(node.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Node</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Connections</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes.map((node) => (
                  <tr key={node.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{node.label}</div>
                        {node.description && (
                          <div className="text-sm text-gray-600">{node.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={nodeTypeColors[node.type]}>
                        {node.type}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span>{node.connections.length}</span>
                        <Progress value={(node.connections.length / Math.max(...nodes.map(n => n.connections.length))) * 100} className="w-20" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedNode(node)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteNode(node.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Node Modal */}
      <Modal isOpen={showAddNode} onClose={() => setShowAddNode(false)}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Node</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <Input
                value={newNode.label}
                onChange={(e) => setNewNode({ ...newNode, label: e.target.value })}
                placeholder="Enter node label"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <Select
                value={newNode.type}
                onValueChange={(value) => setNewNode({ ...newNode, type: value as any })}
                options={[
                  { value: 'concept', label: 'Concept' },
                  { value: 'person', label: 'Person' },
                  { value: 'place', label: 'Place' },
                  { value: 'event', label: 'Event' },
                  { value: 'document', label: 'Document' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newNode.description}
                onChange={(e) => setNewNode({ ...newNode, description: e.target.value })}
                placeholder="Enter description"
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowAddNode(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNode}>
              Add Node
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Edge Modal */}
      <Modal isOpen={showAddEdge} onClose={() => setShowAddEdge(false)}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Edge</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Node</label>
              <Select
                value={newEdge.source}
                onValueChange={(value) => setNewEdge({ ...newEdge, source: value })}
                options={[
                  { value: '', label: 'Select source node' },
                  ...nodes.map((node) => ({ value: node.id, label: node.label }))
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Node</label>
              <Select
                value={newEdge.target}
                onValueChange={(value) => setNewEdge({ ...newEdge, target: value })}
                options={[
                  { value: '', label: 'Select target node' },
                  ...nodes.map((node) => ({ value: node.id, label: node.label }))
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Type</label>
              <Select
                value={newEdge.type}
                onValueChange={(value) => setNewEdge({ ...newEdge, type: value as any })}
                options={[
                  { value: 'related', label: 'Related' },
                  { value: 'part_of', label: 'Part Of' },
                  { value: 'causes', label: 'Causes' },
                  { value: 'influences', label: 'Influences' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
              <Input
                type="number"
                min="0"
                max="10"
                value={newEdge.weight}
                onChange={(e) => setNewEdge({ ...newEdge, weight: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowAddEdge(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEdge}>
              Add Edge
            </Button>
          </div>
        </div>
      </Modal>

      {/* Node Details Modal */}
      <Modal isOpen={!!selectedNode} onClose={() => setSelectedNode(null)}>
        {selectedNode && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">{selectedNode.label}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <Badge className={nodeTypeColors[selectedNode.type]}>
                  {selectedNode.type}
                </Badge>
              </div>
              {selectedNode.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-600">{selectedNode.description}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Connections</label>
                <div className="space-y-2">
                  {selectedNode.connections.length > 0 ? (
                    selectedNode.connections.map((connectionId) => {
                      const connectedNode = nodes.find(n => n.id === connectionId);
                      const connection = connections.find(c => 
                        (c.sourceId === selectedNode.id && c.targetId === connectionId) ||
                        (c.sourceId === connectionId && c.targetId === selectedNode.id)
                      );
                      return connectedNode ? (
                        <div key={connectionId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span>{connectedNode.label}</span>
                          {connection && (
                            <Badge className={edgeTypeColors[connection.type]}>
                              {connection.type}
                            </Badge>
                          )}
                        </div>
                      ) : null;
                    })
                  ) : (
                    <p className="text-gray-500">No connections</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setSelectedNode(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default KnowledgeGraphHub;
