import { useState, useCallback, useEffect } from 'react';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate: Date;
  progress: number;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: Date;
  progress: number;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/goals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }

      const data = await response.json();
      setGoals(data.goals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGoal = useCallback(async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(goal),
      });

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      const data = await response.json();
      setGoals(prev => [...prev, data.goal]);
      return data.goal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
      throw err;
    }
  }, []);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update goal');
      }

      const data = await response.json();
      setGoals(prev => prev.map(goal => 
        goal.id === id ? { ...goal, ...data.goal } : goal
      ));
      return data.goal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
      throw err;
    }
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      setGoals(prev => prev.filter(goal => goal.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
      throw err;
    }
  }, []);

  const updateProgress = useCallback(async (id: string, progress: number) => {
    try {
      await updateGoal(id, { progress });
    } catch (err) {
      console.error('Failed to update progress:', err);
      throw err;
    }
  }, [updateGoal]);

  const toggleComplete = useCallback(async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    try {
      await updateGoal(id, { completed: !goal.completed });
    } catch (err) {
      console.error('Failed to toggle completion:', err);
      throw err;
    }
  }, [goals, updateGoal]);

  const addMilestone = useCallback(async (goalId: string, milestone: Omit<Milestone, 'id'>) => {
    try {
      const response = await fetch(`/api/goals/${goalId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(milestone),
      });

      if (!response.ok) {
        throw new Error('Failed to add milestone');
      }

      const data = await response.json();
      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, milestones: [...goal.milestones, data.milestone] }
          : goal
      ));
      return data.milestone;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add milestone');
      throw err;
    }
  }, []);

  const updateMilestone = useCallback(async (goalId: string, milestoneId: string, updates: Partial<Milestone>) => {
    try {
      const response = await fetch(`/api/goals/${goalId}/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update milestone');
      }

      const data = await response.json();
      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { 
              ...goal, 
              milestones: goal.milestones.map(milestone => 
                milestone.id === milestoneId ? { ...milestone, ...data.milestone } : milestone
              )
            }
          : goal
      ));
      return data.milestone;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update milestone');
      throw err;
    }
  }, []);

  const deleteMilestone = useCallback(async (goalId: string, milestoneId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}/milestones/${milestoneId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete milestone');
      }

      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, milestones: goal.milestones.filter(m => m.id !== milestoneId) }
          : goal
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete milestone');
      throw err;
    }
  }, []);

  const getCompletedGoals = useCallback(() => {
    return goals.filter(goal => goal.completed);
  }, [goals]);

  const getPendingGoals = useCallback(() => {
    return goals.filter(goal => !goal.completed);
  }, [goals]);

  const getGoalsByCategory = useCallback((category: string) => {
    return goals.filter(goal => goal.category === category);
  }, [goals]);

  const getGoalsByPriority = useCallback((priority: 'low' | 'medium' | 'high') => {
    return goals.filter(goal => goal.priority === priority);
  }, [goals]);

  // Load goals on mount
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
    toggleComplete,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    getCompletedGoals,
    getPendingGoals,
    getGoalsByCategory,
    getGoalsByPriority,
  };
};

