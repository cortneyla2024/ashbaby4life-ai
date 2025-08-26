"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ImageGenerator from "@/components/creative/ImageGenerator";
import WritingAssistant from "@/components/creative/WritingAssistant";

interface CreativeProject {
  id: string;
  title: string;
  description?: string;
  type: string;
  assets: any[];
  createdAt: string;
}

const ProjectPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<CreativeProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async() => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/creative/projects", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const foundProject = data.projects.find((p: CreativeProject) => p.id === projectId);
        if (foundProject) {
          setProject(foundProject);
        } else {
          // Project not found, redirect to creative hub
          router.push("/dashboard/creative");
        }
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
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
      <div className="min-h-screen bg-gray-950 text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <Link href="/dashboard/creative">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
              Back to Creative Hub
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/dashboard/creative">
              <button className="text-gray-400 hover:text-white transition-colors">
                ← Back to Creative Hub
              </button>
            </Link>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{getProjectIcon(project.type)}</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
                <p className="text-gray-400 mb-2">{getProjectTypeLabel(project.type)}</p>
                {project.description && (
                  <p className="text-gray-300 mb-3">{project.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{project.assets.length} assets</span>
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Content */}
        <div className="bg-gray-900 rounded-xl p-8">
          {project.type === "AI_ART_COLLECTION" ? (
            <ImageGenerator projectId={project.id} projectTitle={project.title} />
          ) : project.type === "WRITING_PROJECT" ? (
            <WritingAssistant projectId={project.id} projectTitle={project.title} />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Unknown Project Type</h3>
              <p className="text-gray-400">
                This project type is not supported yet.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/creative">
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                View All Projects
              </button>
            </Link>
            <button
              onClick={() => {
                // In a real app, this would export the project
                console.log("Export project:", project.id);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Export Project
            </button>
            <button
              onClick={() => {
                // In a real app, this would share the project
                console.log("Share project:", project.id);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Share Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
