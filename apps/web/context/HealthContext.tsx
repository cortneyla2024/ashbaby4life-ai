'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

interface HealthMetric {
  id: string;
  type: 'heart_rate' | 'blood_pressure' | 'weight' | 'steps' | 'sleep' | 'mood' | 'medication' | 'symptoms';
  value: number | string;
  unit?: string;
  timestamp: Date;
  notes?: string;
}

interface HealthGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  completed: boolean;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  startDate: Date;
  endDate?: Date;
  active: boolean;
  notes?: string;
}

interface Appointment {
  id: string;
  title: string;
  provider: string;
  date: Date;
  duration: number;
  type: 'checkup' | 'consultation' | 'procedure' | 'therapy';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface HealthState {
  metrics: HealthMetric[];
  goals: HealthGoal[];
  medications: Medication[];
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  selectedDate: Date;
  filters: {
    metricTypes: string[];
    dateRange: { start: Date; end: Date };
  };
}

type HealthAction =
  | { type: 'ADD_METRIC'; payload: HealthMetric }
  | { type: 'UPDATE_METRIC'; payload: { id: string; updates: Partial<HealthMetric> } }
  | { type: 'DELETE_METRIC'; payload: string }
  | { type: 'ADD_GOAL'; payload: HealthGoal }
  | { type: 'UPDATE_GOAL'; payload: { id: string; updates: Partial<HealthGoal> } }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_MEDICATION'; payload: Medication }
  | { type: 'UPDATE_MEDICATION'; payload: { id: string; updates: Partial<Medication> } }
  | { type: 'DELETE_MEDICATION'; payload: string }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: { id: string; updates: Partial<Appointment> } }
  | { type: 'DELETE_APPOINTMENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_DATE'; payload: Date }
  | { type: 'UPDATE_FILTERS'; payload: Partial<HealthState['filters']> }
  | { type: 'LOAD_DATA'; payload: { metrics: HealthMetric[]; goals: HealthGoal[]; medications: Medication[]; appointments: Appointment[] } };

const initialState: HealthState = {
  metrics: [],
  goals: [],
  medications: [],
  appointments: [],
  isLoading: false,
  error: null,
  selectedDate: new Date(),
  filters: {
    metricTypes: [],
    dateRange: { start: new Date(), end: new Date() }
  }
};

function healthReducer(state: HealthState, action: HealthAction): HealthState {
  switch (action.type) {
    case 'ADD_METRIC':
      return { ...state, metrics: [...state.metrics, action.payload] };
    case 'UPDATE_METRIC':
      return {
        ...state,
        metrics: state.metrics.map(metric =>
          metric.id === action.payload.id ? { ...metric, ...action.payload.updates } : metric
        )
      };
    case 'DELETE_METRIC':
      return { ...state, metrics: state.metrics.filter(metric => metric.id !== action.payload) };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(goal =>
          goal.id === action.payload.id ? { ...goal, ...action.payload.updates } : goal
        )
      };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(goal => goal.id !== action.payload) };
    case 'ADD_MEDICATION':
      return { ...state, medications: [...state.medications, action.payload] };
    case 'UPDATE_MEDICATION':
      return {
        ...state,
        medications: state.medications.map(med =>
          med.id === action.payload.id ? { ...med, ...action.payload.updates } : med
        )
      };
    case 'DELETE_MEDICATION':
      return { ...state, medications: state.medications.filter(med => med.id !== action.payload) };
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] };
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(appt =>
          appt.id === action.payload.id ? { ...appt, ...action.payload.updates } : appt
        )
      };
    case 'DELETE_APPOINTMENT':
      return { ...state, appointments: state.appointments.filter(appt => appt.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'UPDATE_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface HealthContextType {
  state: HealthState;
  addMetric: (metric: Omit<HealthMetric, 'id'>) => Promise<void>;
  updateMetric: (id: string, updates: Partial<HealthMetric>) => Promise<void>;
  deleteMetric: (id: string) => Promise<void>;
  addGoal: (goal: Omit<HealthGoal, 'id'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<HealthGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addMedication: (medication: Omit<Medication, 'id'>) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  setSelectedDate: (date: Date) => void;
  updateFilters: (filters: Partial<HealthState['filters']>) => void;
  loadHealthData: () => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(healthReducer, initialState);

  const addMetric = async (metric: Omit<HealthMetric, 'id'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newMetric: HealthMetric = {
        ...metric,
        id: Date.now().toString()
      };
      
      // Save to API
      await fetch('/api/health/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMetric)
      });
      
      dispatch({ type: 'ADD_METRIC', payload: newMetric });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add metric' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateMetric = async (id: string, updates: Partial<HealthMetric>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await fetch(`/api/health/metrics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      dispatch({ type: 'UPDATE_METRIC', payload: { id, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update metric' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteMetric = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await fetch(`/api/health/metrics/${id}`, { method: 'DELETE' });
      dispatch({ type: 'DELETE_METRIC', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete metric' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addGoal = async (goal: Omit<HealthGoal, 'id'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newGoal: HealthGoal = {
        ...goal,
        id: Date.now().toString()
      };
      
      await fetch('/api/health/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal)
      });
      
      dispatch({ type: 'ADD_GOAL', payload: newGoal });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add goal' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateGoal = async (id: string, updates: Partial<HealthGoal>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await fetch(`/api/health/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      dispatch({ type: 'UPDATE_GOAL', payload: { id, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update goal' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteGoal = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await fetch(`/api/health/goals/${id}`, { method: 'DELETE' });
      dispatch({ type: 'DELETE_GOAL', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete goal' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addMedication = async (medication: Omit<Medication, 'id'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newMedication: Medication = {
        ...medication,
        id: Date.now().toString()
      };
      
      await fetch('/api/health/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedication)
      });
      
      dispatch({ type: 'ADD_MEDICATION', payload: newMedication });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add medication' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateMedication = async (id: string, updates: Partial<Medication>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await fetch(`/api/health/medications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      dispatch({ type: 'UPDATE_MEDICATION', payload: { id, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update medication' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteMedication = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await fetch(`/api/health/medications/${id}`, { method: 'DELETE' });
      dispatch({ type: 'DELETE_MEDICATION', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete medication' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newAppointment: Appointment = {
        ...appointment,
        id: Date.now().toString()
      };
      
      await fetch('/api/health/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      });
      
      dispatch({ type: 'ADD_APPOINTMENT', payload: newAppointment });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add appointment' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await fetch(`/api/health/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      dispatch({ type: 'UPDATE_APPOINTMENT', payload: { id, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update appointment' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteAppointment = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await fetch(`/api/health/appointments/${id}`, { method: 'DELETE' });
      dispatch({ type: 'DELETE_APPOINTMENT', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete appointment' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setSelectedDate = (date: Date) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  };

  const updateFilters = (filters: Partial<HealthState['filters']>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  };

  const loadHealthData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [metricsRes, goalsRes, medicationsRes, appointmentsRes] = await Promise.all([
        fetch('/api/health/metrics'),
        fetch('/api/health/goals'),
        fetch('/api/health/medications'),
        fetch('/api/health/appointments')
      ]);

      const [metrics, goals, medications, appointments] = await Promise.all([
        metricsRes.json(),
        goalsRes.json(),
        medicationsRes.json(),
        appointmentsRes.json()
      ]);

      dispatch({
        type: 'LOAD_DATA',
        payload: { metrics, goals, medications, appointments }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load health data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load data on mount
  useEffect(() => {
    loadHealthData();
  }, []);

  const value: HealthContextType = {
    state,
    addMetric,
    updateMetric,
    deleteMetric,
    addGoal,
    updateGoal,
    deleteGoal,
    addMedication,
    updateMedication,
    deleteMedication,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    setSelectedDate,
    updateFilters,
    loadHealthData
  };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}
