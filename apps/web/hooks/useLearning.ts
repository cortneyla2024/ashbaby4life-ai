'use client';

import { useState, useCallback } from 'react';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'quiz' | 'video' | 'document' | 'interactive';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  tags: string[];
  isCompleted: boolean;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export const useLearning = () => {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(false);

  const addModule = useCallback(async (module: Omit<LearningModule, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newModule: LearningModule = {
        ...module,
        id: `module-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setModules(prev => [...prev, newModule]);
      return newModule;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateModule = useCallback(async (id: string, updates: Partial<LearningModule>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setModules(prev => prev.map(module =>
        module.id === id ? { ...module, ...updates, updatedAt: new Date() } : module
      ));
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteModule = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setModules(prev => prev.filter(module => module.id !== id));
    } finally {
      setLoading(false);
    }
  }, []);

  const searchModules = useCallback((query: string) => {
    return modules.filter(module =>
      module.title.toLowerCase().includes(query.toLowerCase()) ||
      module.description.toLowerCase().includes(query.toLowerCase()) ||
      module.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }, [modules]);

  return {
    modules,
    loading,
    addModule,
    updateModule,
    deleteModule,
    searchModules
  };
};
