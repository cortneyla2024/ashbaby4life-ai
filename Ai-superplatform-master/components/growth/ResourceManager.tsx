"use client";

import React, { useState, useEffect } from "react";

interface LearningResource {
  id: string;
  title: string;
  url?: string;
  notes?: string;
  type: string;
  isCompleted: boolean;
  aiSummary?: string;
  createdAt: string;
}

interface ResourceManagerProps {
  skillId: string;
  skillName: string;
}

const ResourceManager: React.FC<ResourceManagerProps> = ({ skillId, skillName }) => {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    url: "",
    notes: "",
    type: "ARTICLE",
  });
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
  }, [skillId]);

  const fetchResources = async() => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/growth/skills", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const skill = data.skills.find((s: any) => s.id === skillId);
        if (skill) {
          setResources(skill.resources);
        }
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async(e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/growth/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newResource,
          skillId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResources([data.resource, ...resources]);
        setNewResource({ title: "", url: "", notes: "", type: "ARTICLE" });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Error adding resource:", error);
    }
  };

  const generateSummary = async(resourceId: string) => {
    setGeneratingSummary(resourceId);
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(`/api/growth/resources/${resourceId}/summarize`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchResources(); // Refresh to get the updated resource with summary
      }
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setGeneratingSummary(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return "🎥";
      case "BOOK": return "📚";
      case "COURSE": return "🎓";
      default: return "📄";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Learning Resources</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showAddForm ? "Cancel" : "Add Resource"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-800 rounded-lg p-6">
          <form onSubmit={handleAddResource} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Resource Title
              </label>
              <input
                type="text"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Python for Beginners Tutorial"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL (optional)
              </label>
              <input
                type="url"
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/resource"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                value={newResource.type}
                onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ARTICLE">Article</option>
                <option value="VIDEO">Video</option>
                <option value="BOOK">Book</option>
                <option value="COURSE">Course</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={newResource.notes}
                onChange={(e) => setNewResource({ ...newResource, notes: e.target.value })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Any additional notes about this resource..."
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Resource
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {resources.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Resources Yet</h3>
          <p className="text-gray-400 mb-6">
            Start building your learning library by adding resources for {skillName}!
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Add Your First Resource
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getTypeIcon(resource.type)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{resource.title}</h3>
                    <p className="text-sm text-gray-400 capitalize">{resource.type.toLowerCase()}</p>
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        View Resource →
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={resource.isCompleted}
                    onChange={() => { /* TODO: Add completion toggle */ }}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-400">Completed</span>
                </div>
              </div>

              {resource.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-300">{resource.notes}</p>
                </div>
              )}

              {resource.aiSummary ? (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">AI Summary</h4>
                  <div className="text-sm text-gray-400 bg-gray-700 rounded-lg p-3">
                    {resource.aiSummary}
                  </div>
                </div>
              ) : resource.url && (
                <div className="mb-4">
                  <button
                    onClick={() => generateSummary(resource.id)}
                    disabled={generatingSummary === resource.id}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    {generatingSummary === resource.id ? "Generating..." : "Generate AI Summary"}
                  </button>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Added {new Date(resource.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceManager;
