"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Skill {
  id: string;
  name: string;
  masteryLevel: number;
  aiLearningPlan?: string;
  resources: any[];
  createdAt: string;
}

interface SkillCardProps {
  skill: Skill;
  onUpdate: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, onUpdate }) => {
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const generateLearningPlan = async() => {
    setGeneratingPlan(true);
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(`/api/growth/skills/${skill.id}/plan`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        onUpdate(); // Refresh the skills list
      }
    } catch (error) {
      console.error("Error generating learning plan:", error);
    } finally {
      setGeneratingPlan(false);
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

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white">{skill.name}</h3>
        <span className="text-sm text-gray-400">
          {skill.resources.length} resources
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Mastery Level</span>
          <span className="text-sm font-medium text-white">{skill.masteryLevel}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(skill.masteryLevel)}`}
            style={{ width: `${skill.masteryLevel}%` }}
          ></div>
        </div>
      </div>

      {skill.aiLearningPlan ? (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">AI Learning Plan</h4>
          <div className="text-sm text-gray-400 line-clamp-3">
            {skill.aiLearningPlan.substring(0, 150)}...
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <button
            onClick={generateLearningPlan}
            disabled={generatingPlan}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            {generatingPlan ? "Generating..." : "Generate AI Learning Plan"}
          </button>
        </div>
      )}

      <div className="flex space-x-2">
        <Link
          href={`/skills/${skill.id}`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm text-center transition-colors"
        >
          View Details
        </Link>
        <button
          onClick={() => { /* TODO: Add edit functionality */ }}
          className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default SkillCard;
