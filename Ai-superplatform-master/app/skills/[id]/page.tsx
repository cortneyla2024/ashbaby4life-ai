"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ResourceManager from "@/components/growth/ResourceManager";

interface Skill {
  id: string;
  name: string;
  masteryLevel: number;
  aiLearningPlan?: string;
  resources: any[];
  createdAt: string;
}

const SkillPage: React.FC = () => {
  const params = useParams();
  const skillId = params.id as string;

  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"plan" | "resources">("plan");

  useEffect(() => {
    fetchSkill();
  }, [skillId]);

  const fetchSkill = async() => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/growth/skills", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const foundSkill = data.skills.find((s: Skill) => s.id === skillId);
        if (foundSkill) {
          setSkill(foundSkill);
        }
      }
    } catch (error) {
      console.error("Error fetching skill:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (level: number) => {
    if (level < 30) {
return "bg-red-500";
}
    if (level < 70) {
return "bg-yellow-500";
}
    return "bg-green-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Skill Not Found</h1>
          <Link href="/dashboard/growth" className="text-purple-400 hover:text-purple-300">
            ← Back to Growth Hub
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
          <Link href="/dashboard/growth" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to Growth Hub
          </Link>
          <h1 className="text-4xl font-bold mb-4">{skill.name}</h1>

          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-300">Mastery Level</span>
              <span className="text-2xl font-bold text-white">{skill.masteryLevel}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(skill.masteryLevel)}`}
                style={{ width: `${skill.masteryLevel}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              {skill.resources.length} learning resources • Created {new Date(skill.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("plan")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "plan"
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              📋 Learning Plan
            </button>
            <button
              onClick={() => setActiveTab("resources")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "resources"
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              📚 Resources
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === "plan" ? (
            <div className="bg-gray-900 rounded-xl p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-3xl font-bold mb-4">AI Learning Plan</h2>
                <p className="text-gray-400">
                  Your personalized learning roadmap for mastering {skill.name}
                </p>
              </div>

              {skill.aiLearningPlan ? (
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                      {skill.aiLearningPlan}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Learning Plan Yet</h3>
                  <p className="text-gray-400 mb-6">
                    Generate an AI-powered learning plan to get started with {skill.name}!
                  </p>
                  <button
                    onClick={() => { /* TODO: Add generate plan functionality */ }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Generate Learning Plan
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl p-8">
              <ResourceManager skillId={skillId} skillName={skill.name} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillPage;
