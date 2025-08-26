import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  modules: Module[];
  progress: number; // 0-100
  enrolledAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Module {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number; // in minutes
  order: number;
  isCompleted: boolean;
  completedAt?: Date;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number; // in minutes
  passingScore: number;
  attempts: number;
  bestScore: number;
  lastAttemptAt?: Date;
}

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

interface LearningContextType {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  currentCourse: Course | null;
  setCurrentCourse: (course: Course | null) => void;
  quizzes: Quiz[];
  setQuizzes: (quizzes: Quiz[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  enrollCourse: (courseId: string) => Promise<void>;
  completeModule: (courseId: string, moduleId: string) => Promise<void>;
  updateProgress: (courseId: string, progress: number) => Promise<void>;
  takeQuiz: (quizId: string, answers: Record<string, any>) => Promise<number>;
  getLearningStats: () => Promise<any>;
  searchCourses: (query: string, filters?: any) => Promise<Course[]>;
  createCustomCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Course>;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};

interface LearningProviderProps {
  children: ReactNode;
}

export const LearningProvider: React.FC<LearningProviderProps> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const enrollCourse = useCallback(async (courseId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCourses(prev =>
        prev.map(course =>
          course.id === courseId
            ? { ...course, enrolledAt: new Date(), progress: 0 }
            : course
        )
      );
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeModule = useCallback(async (courseId: string, moduleId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCourses(prev =>
        prev.map(course =>
          course.id === courseId
            ? {
                ...course,
                modules: course.modules.map(module =>
                  module.id === moduleId
                    ? { ...module, isCompleted: true, completedAt: new Date() }
                    : module
                ),
                progress: calculateProgress(course.modules.map(module =>
                  module.id === moduleId
                    ? { ...module, isCompleted: true }
                    : module
                )),
                updatedAt: new Date(),
              }
            : course
        )
      );
    } catch (error) {
      console.error('Failed to complete module:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProgress = useCallback(async (courseId: string, progress: number): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCourses(prev =>
        prev.map(course =>
          course.id === courseId
            ? { ...course, progress, updatedAt: new Date() }
            : course
        )
      );
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const takeQuiz = useCallback(async (quizId: string, answers: Record<string, any>): Promise<number> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const quiz = quizzes.find(q => q.id === quizId);
      if (!quiz) throw new Error('Quiz not found');
      
      let correctAnswers = 0;
      let totalQuestions = quiz.questions.length;
      
      quiz.questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (Array.isArray(question.correctAnswer)) {
          if (Array.isArray(userAnswer) && 
              userAnswer.length === question.correctAnswer.length &&
              userAnswer.every(ans => question.correctAnswer.includes(ans))) {
            correctAnswers++;
          }
        } else if (userAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      });
      
      const score = (correctAnswers / totalQuestions) * 100;
      
      // Update quiz attempts
      setQuizzes(prev =>
        prev.map(quiz =>
          quiz.id === quizId
            ? {
                ...quiz,
                attempts: quiz.attempts + 1,
                bestScore: Math.max(quiz.bestScore, score),
                lastAttemptAt: new Date(),
              }
            : quiz
        )
      );
      
      return score;
    } catch (error) {
      console.error('Failed to take quiz:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [quizzes]);

  const getLearningStats = useCallback(async (): Promise<any> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const enrolledCourses = courses.filter(course => course.enrolledAt);
      const completedCourses = courses.filter(course => course.completedAt);
      const totalProgress = courses.reduce((sum, course) => sum + course.progress, 0);
      const averageProgress = courses.length > 0 ? totalProgress / courses.length : 0;
      
      return {
        totalCourses: courses.length,
        enrolledCourses: enrolledCourses.length,
        completedCourses: completedCourses.length,
        averageProgress,
        totalStudyTime: courses.reduce((sum, course) => sum + course.duration, 0),
        certificatesEarned: completedCourses.length,
      };
    } catch (error) {
      console.error('Failed to get learning stats:', error);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [courses]);

  const searchCourses = useCallback(async (query: string, filters?: any): Promise<Course[]> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock search results
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Sample Course',
          description: 'A sample course for testing',
          instructor: 'Sample Instructor',
          duration: 120,
          difficulty: 'beginner',
          category: 'technology',
          tags: ['sample', 'test'],
          modules: [],
          progress: 0,
          enrolledAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      return mockCourses;
    } catch (error) {
      console.error('Failed to search courses:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCustomCourse = useCallback(async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCourse: Course = {
        ...course,
        id: `course-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setCourses(prev => [...prev, newCourse]);
      return newCourse;
    } catch (error) {
      console.error('Failed to create custom course:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateProgress = (modules: Module[]): number => {
    if (modules.length === 0) return 0;
    const completedModules = modules.filter(module => module.isCompleted).length;
    return (completedModules / modules.length) * 100;
  };

  const value: LearningContextType = {
    courses,
    setCourses,
    currentCourse,
    setCurrentCourse,
    quizzes,
    setQuizzes,
    isLoading,
    setIsLoading,
    enrollCourse,
    completeModule,
    updateProgress,
    takeQuiz,
    getLearningStats,
    searchCourses,
    createCustomCourse,
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
};
