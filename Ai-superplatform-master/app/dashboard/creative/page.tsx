"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import RecommendationFeed from "@/components/creative/RecommendationFeed";

interface CreativeProject {
  id: string;
  title: string;
  description?: string;
  type: string;
  assets: any[];
  createdAt: string;
}

const CreativeHubPage: React.FC = () => {
  const [projects, setProjects] = useState<CreativeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    type: "AI_ART_COLLECTION",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async() => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/creative/projects", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async(e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/creative/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newProject),
      });

      if (response.ok) {
        const data = await response.json();
        setProjects([data.project, ...projects]);
        setNewProject({ title: "", description: "", type: "AI_ART_COLLECTION" });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const getProjectIcon = (type: string) => {
    switch (type) {
      case "AI_ART_COLLECTION": return "🎨";
      case "WRITING_PROJECT": return "📝";
      default: return "📄";
    }
  };

  const getProjectTypeLabel = (type: string) => {
    switch (type) {
      case "AI_ART_COLLECTION": return "AI Art Collection";
      case "WRITING_PROJECT": return "Writing Project";
      default: return "Creative Project";
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
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Creative Expression Hub
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Unleash your creativity with AI-assisted art generation, writing tools, and personalized entertainment recommendations.
            Create, inspire, and discover new forms of expression.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects Section */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Your Creative Projects</h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {showCreateForm ? "Cancel" : "New Project"}
                </button>
              </div>

              {showCreateForm && (
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., My Fantasy Art Collection"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description (optional)
                      </label>
                      <textarea
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Describe your project..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Project Type
                      </label>
                      <select
                        value={newProject.type}
                        onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="AI_ART_COLLECTION">🎨 AI Art Collection</option>
                        <option value="WRITING_PROJECT">📝 Writing Project</option>
                      </select>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Create Project
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Projects Yet</h3>
                  <p className="text-gray-400 mb-6">
                    Start your creative journey by creating your first project!
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Create Your First Project
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{getProjectIcon(project.type)}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{project.title}</h3>
                          <p className="text-sm text-gray-400 mb-2">
                            {getProjectTypeLabel(project.type)}
                          </p>
                          {project.description && (
                            <p className="text-sm text-gray-300 mb-3">{project.description}</p>
                          )}
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{project.assets.length} assets</span>
                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-gray-400">→</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="bg-gray-900 rounded-xl p-8">
            <RecommendationFeed />
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-16 bg-gray-900 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-purple-300">Creative Hub Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold mb-2">AI Art Generation</h3>
              <p className="text-gray-400 text-sm">
                Create stunning images with AI assistance using various art styles and prompts
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">Writing Assistant</h3>
              <p className="text-gray-400 text-sm">
                Get AI-powered writing help for stories, poems, and creative content
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-lg font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-gray-400 text-sm">
                Discover personalized movies, books, and music based on your preferences
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-lg font-semibold mb-2">Creative Inspiration</h3>
              <p className="text-gray-400 text-sm">
                Find inspiration and new ideas through AI-curated content and suggestions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeHubPage;
