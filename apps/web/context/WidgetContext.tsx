'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WidgetContextType {
  widgets: any[];
  addWidget: (widget: any) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: any) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<any[]>([]);

  const addWidget = (widget: any) => {
    setWidgets(prev => [...prev, widget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const updateWidget = (id: string, updates: any) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  return (
    <WidgetContext.Provider value={{ widgets, addWidget, removeWidget, updateWidget }}>
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidgets() {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
}
