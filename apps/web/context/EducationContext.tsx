'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  rating: number;
  enrolledStudents: number;
  price: number;
  imageUrl?: string;
  modules: Module[];
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  content: string;
  videoUrl?: string;
  resources: Resource[];
  completed: boolean;
  quiz?: Quiz;
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  description?: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  timeLimit: number; // in minutes
  passingScore: number;
}

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'essay';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  moduleId: string;
  dueDate: Date;
  points: number;
  submitted: boolean;
  grade?: number;
  feedback?: string;
}

interface Progress {
  courseId: string;
  moduleId: string;
  completed: boolean;
  score?: number;
  timeSpent: number; // in minutes
  lastAccessed: Date;
}

interface EducationState {
  courses: Course[];
  enrolledCourses: Course[];
  assignments: Assignment[];
  progress: Progress[];
  isLoading: boolean;
  error: string | null;
  selectedCourse: Course | null;
  selectedModule: Module | null;
  filters: {
    category: string;
    level: string;
    priceRange: { min: number; max: number };
    rating: number;
  };
}

type EducationAction =
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'ENROLL_COURSE'; payload: Course }
  | { type: 'UNENROLL_COURSE'; payload: string }
  | { type: 'UPDATE_COURSE_PROGRESS'; payload: { courseId: string; progress: number } }
  | { type: 'COMPLETE_MODULE'; payload: { courseId: string; moduleId: string } }
  | { type: 'ADD_ASSIGNMENT'; payload: Assignment }
  | { type: 'UPDATE_ASSIGNMENT'; payload: { id: string; updates: Partial<Assignment> } }
  | { type: 'DELETE_ASSIGNMENT'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: Progress }
  | { type: 'SET_SELECTED_COURSE'; payload: Course | null }
  | { type: 'SET_SELECTED_MODULE'; payload: Module | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_FILTERS'; payload: Partial<EducationState['filters']> };

const initialState: EducationState = {
  courses: [],
  enrolledCourses: [],
  assignments: [],
  progress: [],
  isLoading: false,
  error: null,
  selectedCourse: null,
  selectedModule: null,
  filters: {
    category: '',
    level: '',
    priceRange: { min: 0, max: 1000 },
    rating: 0
  }
};

function educationReducer(state: EducationState, action: EducationAction): EducationState {
  switch (action.type) {
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
    case 'ENROLL_COURSE':
      return { 
        ...state, 
        enrolledCourses: [...state.enrolledCourses, action.payload],
        progress: [
          ...state.progress,
          ...action.payload.modules.map(module => ({
            courseId: action.payload.id,
            moduleId: module.id,
            completed: false,
            timeSpent: 0,
            lastAccessed: new Date()
          }))
        ]
      };
    case 'UNENROLL_COURSE':
      return {
        ...state,
        enrolledCourses: state.enrolledCourses.filter(course => course.id !== action.payload),
        progress: state.progress.filter(p => p.courseId !== action.payload)
      };
    case 'UPDATE_COURSE_PROGRESS':
      return {
        ...state,
        enrolledCourses: state.enrolledCourses.map(course =>
          course.id === action.payload.courseId
            ? { ...course, progress: action.payload.progress }
            : course
        )
      };
    case 'COMPLETE_MODULE':
      return {
        ...state,
        progress: state.progress.map(p =>
          p.courseId === action.payload.courseId && p.moduleId === action.payload.moduleId
            ? { ...p, completed: true }
            : p
        )
      };
    case 'ADD_ASSIGNMENT':
      return { ...state, assignments: [...state.assignments, action.payload] };
    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map(assignment =>
          assignment.id === action.payload.id
            ? { ...assignment, ...action.payload.updates }
            : assignment
        )
      };
    case 'DELETE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.filter(assignment => assignment.id !== action.payload)
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: state.progress.map(p =>
          p.courseId === action.payload.courseId && p.moduleId === action.payload.moduleId
            ? action.payload
            : p
        )
      };
    case 'SET_SELECTED_COURSE':
      return { ...state, selectedCourse: action.payload };
    case 'SET_SELECTED_MODULE':
      return { ...state, selectedModule: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
}

interface EducationContextType {
  state: EducationState;
  loadCourses: () => Promise<void>;
  enrollCourse: (courseId: string) => Promise<void>;
  unenrollCourse: (courseId: string) => Promise<void>;
  completeModule: (courseId: string, moduleId: string) => Promise<void>;
  updateProgress: (progress: Progress) => Promise<void>;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  setSelectedCourse: (course: Course | null) => void;
  setSelectedModule: (module: Module | null) => void;
  updateFilters: (filters: Partial<EducationState['filters']>) => void;
  getCourseProgress: (courseId: string) => number;
  getFilteredCourses: () => Course[];
}

const EducationContext = createContext<EducationContextType | undefined>(undefined);

export function EducationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(educationReducer, initialState);

  const loadCourses = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/education/courses');
      if (!response.ok) throw new Error('Failed to load courses');
      
      const courses = await response.json();
      dispatch({ type: 'SET_COURSES', payload: courses });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load courses' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const enrollCourse = async (courseId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const course = state.courses.find(c => c.id === courseId);
      if (!course) throw new Error('Course not found');

      const response = await fetch('/api/education/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });

      if (!response.ok) throw new Error('Failed to enroll in course');

      dispatch({ type: 'ENROLL_COURSE', payload: course });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to enroll in course' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const unenrollCourse = async (courseId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`/api/education/enroll/${courseId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to unenroll from course');

      dispatch({ type: 'UNENROLL_COURSE', payload: courseId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to unenroll from course' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const completeModule = async (courseId: string, moduleId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/education/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, moduleId, completed: true })
      });

      if (!response.ok) throw new Error('Failed to update progress');

      dispatch({ type: 'COMPLETE_MODULE', payload: { courseId, moduleId } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to complete module' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProgress = async (progress: Progress) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/education/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress)
      });

      if (!response.ok) throw new Error('Failed to update progress');

      dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update progress' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addAssignment = async (assignment: Omit<Assignment, 'id'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newAssignment: Assignment = {
        ...assignment,
        id: Date.now().toString()
      };

      const response = await fetch('/api/education/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssignment)
      });

      if (!response.ok) throw new Error('Failed to add assignment');

      dispatch({ type: 'ADD_ASSIGNMENT', payload: newAssignment });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add assignment' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`/api/education/assignments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update assignment');

      dispatch({ type: 'UPDATE_ASSIGNMENT', payload: { id, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update assignment' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteAssignment = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`/api/education/assignments/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete assignment');

      dispatch({ type: 'DELETE_ASSIGNMENT', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete assignment' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setSelectedCourse = (course: Course | null) => {
    dispatch({ type: 'SET_SELECTED_COURSE', payload: course });
  };

  const setSelectedModule = (module: Module | null) => {
    dispatch({ type: 'SET_SELECTED_MODULE', payload: module });
  };

  const updateFilters = (filters: Partial<EducationState['filters']>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  };

  const getCourseProgress = (courseId: string): number => {
    const courseProgress = state.progress.filter(p => p.courseId === courseId);
    if (courseProgress.length === 0) return 0;
    
    const completedModules = courseProgress.filter(p => p.completed).length;
    const totalModules = courseProgress.length;
    
    return Math.round((completedModules / totalModules) * 100);
  };

  const getFilteredCourses = (): Course[] => {
    return state.courses.filter(course => {
      const matchesCategory = !state.filters.category || course.category === state.filters.category;
      const matchesLevel = !state.filters.level || course.level === state.filters.level;
      const matchesPrice = course.price >= state.filters.priceRange.min && course.price <= state.filters.priceRange.max;
      const matchesRating = course.rating >= state.filters.rating;
      
      return matchesCategory && matchesLevel && matchesPrice && matchesRating;
    });
  };

  // Load courses on mount
  useEffect(() => {
    loadCourses();
  }, []);

  const value: EducationContextType = {
    state,
    loadCourses,
    enrollCourse,
    unenrollCourse,
    completeModule,
    updateProgress,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    setSelectedCourse,
    setSelectedModule,
    updateFilters,
    getCourseProgress,
    getFilteredCourses
  };

  return (
    <EducationContext.Provider value={value}>
      {children}
    </EducationContext.Provider>
  );
}

export function useEducation() {
  const context = useContext(EducationContext);
  if (context === undefined) {
    throw new Error('useEducation must be used within an EducationProvider');
  }
  return context;
}
