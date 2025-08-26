"use client";

import React, { useState, useEffect } from "react";
import SkillCard from "./SkillCard";

interface Skill {
  id: string;
  name: string;
  masteryLevel: number;
  aiLearningPlan?: string;
  resources: any[];
  createdAt: string;
}

const SkillDashboard: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", masteryLevel: 0 });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async() => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/growth/skills", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async(e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/growth/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newSkill),
      });

      if (response.ok) {
        const data = await response.json();
        setSkills([data.skill, ...skills]);
        setNewSkill({ name: "", masteryLevel: 0 });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Error adding skill:", error);
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
        <h2 className="text-2xl font-bold text-white">My Skills</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showAddForm ? "Cancel" : "Add Skill"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-800 rounded-lg p-6">
          <form onSubmit={handleAddSkill} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Skill Name
              </label>
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Python Programming"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Mastery Level (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={newSkill.masteryLevel}
                onChange={(e) => setNewSkill({ ...newSkill, masteryLevel: parseInt(e.target.value) })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Skill
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

      {skills.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Skills Yet</h3>
          <p className="text-gray-400 mb-6">
            Start your learning journey by adding your first skill!
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Add Your First Skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} onUpdate={fetchSkills} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillDashboard;
