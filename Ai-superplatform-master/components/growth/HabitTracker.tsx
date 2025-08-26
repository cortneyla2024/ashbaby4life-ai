"use client";

import React, { useState, useEffect } from "react";

interface Habit {
  id: string;
  name: string;
  frequency: string;
  goal: string;
  logs: HabitLog[];
}

interface HabitLog {
  id: string;
  date: string;
  isCompleted: boolean;
}

const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", frequency: "Daily", goal: "" });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async() => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/growth/habits", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHabits(data.habits);
      }
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async(e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/growth/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newHabit),
      });

      if (response.ok) {
        const data = await response.json();
        setHabits([data.habit, ...habits]);
        setNewHabit({ name: "", frequency: "Daily", goal: "" });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  const toggleHabitLog = async(habitId: string, date: string) => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/growth/habits/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          habitId,
          date,
          isCompleted: true, // Toggle logic would be handled on the server
        }),
      });

      if (response.ok) {
        fetchHabits(); // Refresh habits to get updated logs
      }
    } catch (error) {
      console.error("Error toggling habit log:", error);
    }
  };

  const getDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isHabitCompleted = (habit: Habit, date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return habit.logs.some(log => log.date === dateStr && log.isCompleted);
  };

  const getDayClass = (habit: Habit, date: Date) => {
    const isCompleted = isHabitCompleted(habit, date);
    const isToday = date.toDateString() === new Date().toDateString();
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

    if (isCompleted) {
      return "bg-green-500 hover:bg-green-600";
    }
    if (isToday) {
      return "bg-purple-500 hover:bg-purple-600";
    }
    if (isPast) {
      return "bg-gray-600 hover:bg-gray-500";
    }
    return "bg-gray-700 hover:bg-gray-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Habit Tracker</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showAddForm ? "Cancel" : "Add Habit"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-800 rounded-lg p-6">
          <form onSubmit={handleAddHabit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Habit Name
              </label>
              <input
                type="text"
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Meditate for 10 minutes"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Frequency
              </label>
              <select
                value={newHabit.frequency}
                onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Goal
              </label>
              <textarea
                value={newHabit.goal}
                onChange={(e) => setNewHabit({ ...newHabit, goal: e.target.value })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Why are you building this habit?"
                rows={3}
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Habit
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

      {habits.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Habits Yet</h3>
          <p className="text-gray-400 mb-6">
            Start building positive habits by adding your first one!
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Add Your First Habit
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {habits.map((habit) => (
            <div key={habit.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{habit.name}</h3>
                  <p className="text-sm text-gray-400">{habit.frequency}</p>
                  <p className="text-sm text-gray-300 mt-1">{habit.goal}</p>
                </div>
              </div>

              <div className="grid grid-cols-31 gap-1">
                {daysInMonth.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => toggleHabitLog(habit.id, date.toISOString().split("T")[0])}
                    className={`w-8 h-8 rounded text-xs font-medium text-white transition-colors ${getDayClass(habit, date)}`}
                    title={`${date.toLocaleDateString()} - ${isHabitCompleted(habit, date) ? "Completed" : "Not completed"}`}
                  >
                    {date.getDate()}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex justify-between text-sm text-gray-400">
                <span>Click a day to toggle completion</span>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-600 rounded"></div>
                    <span>Missed</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitTracker;
