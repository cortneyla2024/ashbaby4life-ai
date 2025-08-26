import { useState, useCallback, useEffect } from 'react';

interface Notebook {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  isPublic: boolean;
  collaborators: string[];
  lastModified: Date;
  color?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category: string;
}

interface TimeBlock {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  category: string;
  description?: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  milestones: Milestone[];
}

interface VideoCall {
  id: string;
  title: string;
  participants: string[];
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  meetingUrl?: string;
  notes?: string;
}

interface Whiteboard {
  id: string;
  title: string;
  content: string;
  collaborators: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date;
}

export const useProductivity = () => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [videoCalls, setVideoCalls] = useState<VideoCall[]>([]);
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
    status: 'all',
    searchQuery: ''
  });

  // Notebook functions
  const createNotebook = useCallback(async (notebook: Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/productivity/notebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(notebook),
      });

      if (!response.ok) {
        throw new Error('Failed to create notebook');
      }

      const data = await response.json();
      setNotebooks(prev => [...prev, data.notebook]);
      return data.notebook;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notebook');
      throw err;
    }
  }, []);

  const updateNotebook = useCallback(async (id: string, updates: Partial<Notebook>) => {
    try {
      const response = await fetch(`/api/productivity/notebooks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update notebook');
      }

      const data = await response.json();
      setNotebooks(prev => prev.map(notebook => 
        notebook.id === id ? { ...notebook, ...data.notebook } : notebook
      ));
      return data.notebook;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notebook');
      throw err;
    }
  }, []);

  const deleteNotebook = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/productivity/notebooks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete notebook');
      }

      setNotebooks(prev => prev.filter(notebook => notebook.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notebook');
      throw err;
    }
  }, []);

  // Task functions
  const createTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/productivity/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const data = await response.json();
      setTasks(prev => [...prev, data.task]);
      return data.task;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/productivity/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const data = await response.json();
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...data.task } : task
      ));
      return data.task;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/productivity/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  }, []);

  const toggleTaskComplete = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      await updateTask(id, { completed: !task.completed });
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
    }
  }, [tasks, updateTask]);

  // Time block functions
  const createTimeBlock = useCallback(async (timeBlock: Omit<TimeBlock, 'id'>) => {
    try {
      const response = await fetch('/api/productivity/timeblocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(timeBlock),
      });

      if (!response.ok) {
        throw new Error('Failed to create time block');
      }

      const data = await response.json();
      setTimeBlocks(prev => [...prev, data.timeBlock]);
      return data.timeBlock;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create time block');
      throw err;
    }
  }, []);

  const updateTimeBlock = useCallback(async (id: string, updates: Partial<TimeBlock>) => {
    try {
      const response = await fetch(`/api/productivity/timeblocks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update time block');
      }

      const data = await response.json();
      setTimeBlocks(prev => prev.map(timeBlock => 
        timeBlock.id === id ? { ...timeBlock, ...data.timeBlock } : timeBlock
      ));
      return data.timeBlock;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update time block');
      throw err;
    }
  }, []);

  const deleteTimeBlock = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/productivity/timeblocks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete time block');
      }

      setTimeBlocks(prev => prev.filter(timeBlock => timeBlock.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete time block');
      throw err;
    }
  }, []);

  // Goal functions
  const createGoal = useCallback(async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/productivity/goals', {
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
      const response = await fetch(`/api/productivity/goals/${id}`, {
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
      const response = await fetch(`/api/productivity/goals/${id}`, {
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

  // Fetch functions
  const fetchNotebooks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/productivity/notebooks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notebooks');
      }

      const data = await response.json();
      setNotebooks(data.notebooks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notebooks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/productivity/tasks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTimeBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/productivity/timeblocks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch time blocks');
      }

      const data = await response.json();
      setTimeBlocks(data.timeBlocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch time blocks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/productivity/goals', {
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

  // Filter functions
  const getFilteredTasks = useCallback(() => {
    return tasks.filter(task => {
      const matchesCategory = filters.category === 'all' || task.category === filters.category;
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'completed' && task.completed) ||
        (filters.status === 'pending' && !task.completed);
      const matchesSearch = !filters.searchQuery || 
        task.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      return matchesCategory && matchesPriority && matchesStatus && matchesSearch;
    });
  }, [tasks, filters]);

  const getFilteredGoals = useCallback(() => {
    return goals.filter(goal => {
      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'completed' && goal.completed) ||
        (filters.status === 'pending' && !goal.completed);
      const matchesSearch = !filters.searchQuery || 
        goal.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        goal.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [goals, filters]);

  // Load data on mount
  useEffect(() => {
    fetchNotebooks();
    fetchTasks();
    fetchTimeBlocks();
    fetchGoals();
  }, [fetchNotebooks, fetchTasks, fetchTimeBlocks, fetchGoals]);

  return {
    // State
    notebooks,
    tasks,
    timeBlocks,
    goals,
    videoCalls,
    whiteboards,
    loading,
    error,
    filters,
    
    // Notebook functions
    createNotebook,
    updateNotebook,
    deleteNotebook,
    
    // Task functions
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    
    // Time block functions
    createTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    
    // Goal functions
    createGoal,
    updateGoal,
    deleteGoal,
    
    // Fetch functions
    fetchNotebooks,
    fetchTasks,
    fetchTimeBlocks,
    fetchGoals,
    
    // Filter functions
    setFilters,
    getFilteredTasks,
    getFilteredGoals,
  };
};
