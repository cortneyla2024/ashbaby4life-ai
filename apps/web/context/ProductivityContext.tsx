import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  completedAt?: Date;
  tags: string[];
  projectId?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  tasks: Task[];
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface TimeEntry {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  description?: string;
  tags: string[];
}

interface ProductivityContextType {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  timeEntries: TimeEntry[];
  setTimeEntries: (entries: TimeEntry[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  startTimeTracking: (taskId: string) => Promise<TimeEntry>;
  stopTimeTracking: (timeEntryId: string) => Promise<void>;
  getProductivityStats: () => Promise<any>;
}

const ProductivityContext = createContext<ProductivityContextType | undefined>(undefined);

export const useProductivity = () => {
  const context = useContext(ProductivityContext);
  if (!context) {
    throw new Error('useProductivity must be used within a ProductivityProvider');
  }
  return context;
};

interface ProductivityProviderProps {
  children: ReactNode;
}

export const ProductivityProvider: React.FC<ProductivityProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        )
      );
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newProject: Project = {
        ...project,
        id: `project-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId
            ? { ...project, ...updates, updatedAt: new Date() }
            : project
        )
      );
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startTimeTracking = useCallback(async (taskId: string): Promise<TimeEntry> => {
    try {
      const newTimeEntry: TimeEntry = {
        id: `time-${Date.now()}`,
        taskId,
        startTime: new Date(),
        tags: [],
      };
      
      setTimeEntries(prev => [...prev, newTimeEntry]);
      return newTimeEntry;
    } catch (error) {
      console.error('Failed to start time tracking:', error);
      throw error;
    }
  }, []);

  const stopTimeTracking = useCallback(async (timeEntryId: string): Promise<void> => {
    try {
      setTimeEntries(prev =>
        prev.map(entry =>
          entry.id === timeEntryId
            ? { ...entry, endTime: new Date() }
            : entry
        )
      );
    } catch (error) {
      console.error('Failed to stop time tracking:', error);
      throw error;
    }
  }, []);

  const getProductivityStats = useCallback(async (): Promise<any> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const totalTasks = tasks.length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      return {
        totalTasks,
        completedTasks,
        completionRate,
        activeProjects: projects.filter(project => project.status === 'active').length,
        totalTimeTracked: timeEntries.reduce((total, entry) => {
          if (entry.endTime) {
            return total + (entry.endTime.getTime() - entry.startTime.getTime());
          }
          return total;
        }, 0),
      };
    } catch (error) {
      console.error('Failed to get productivity stats:', error);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [tasks, projects, timeEntries]);

  const value: ProductivityContextType = {
    tasks,
    setTasks,
    projects,
    setProjects,
    timeEntries,
    setTimeEntries,
    isLoading,
    setIsLoading,
    createTask,
    updateTask,
    deleteTask,
    createProject,
    updateProject,
    deleteProject,
    startTimeTracking,
    stopTimeTracking,
    getProductivityStats,
  };

  return (
    <ProductivityContext.Provider value={value}>
      {children}
    </ProductivityContext.Provider>
  );
};
