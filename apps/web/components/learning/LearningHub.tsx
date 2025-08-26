'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Users, Award, Play, Pause, CheckCircle, Clock,
  Plus, Search, Filter, Download, Settings, Star, MessageCircle,
  Video, FileText, Headphones, Target, TrendingUp, Calendar,
  UserCheck, UserPlus, MessageSquare, Phone, Mail
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLearning, LearningModule } from '@/hooks/useLearning';
import { useNotifications } from '@/hooks/useNotifications';

// LearningModule interface is imported from the hook

interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number;
  attempts: number;
  bestScore: number;
  isCompleted: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

interface Certificate {
  id: string;
  title: string;
  description: string;
  issuedDate: Date;
  expiryDate?: Date;
  moduleId: string;
  score: number;
  isVerified: boolean;
  certificateUrl?: string;
}

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  expertise: string[];
  rating: number;
  totalStudents: number;
  hourlyRate: number;
  isAvailable: boolean;
  bio: string;
  languages: string[];
}

interface TutoringSession {
  id: string;
  mentorId: string;
  studentId: string;
  subject: string;
  duration: number; // in minutes
  scheduledFor: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  rating?: number;
  feedback?: string;
}

export const LearningHub: React.FC = () => {
  const { user } = useAuth();
  const {
    modules,
    addModule,
    loading
  } = useLearning();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'modules' | 'quizzes' | 'certificates' | 'mentors' | 'sessions'>('modules');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Mock data - in a real app, these would come from hooks or API calls
  const quizzes: Quiz[] = [];
  const certificates: Certificate[] = [];
  const mentors: Mentor[] = [];
  const sessions: TutoringSession[] = [];

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const completedModules = modules.filter(m => m.isCompleted);
  const inProgressModules = modules.filter(m => m.progress > 0 && !m.isCompleted);
    const totalCertificates = 0;
  const averageScore = 0;

  const handleEnrollModule = useCallback(async (moduleId: string) => {
    try {
      // Mock implementation - in a real app, this would call an API
      console.log('Enrolling in module:', moduleId);
      addNotification({
        type: 'success',
        title: 'Module Enrollment',
        message: 'Successfully enrolled in module!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Module Enrollment',
        message: 'Failed to enroll in module'
      });
    }
  }, [addNotification]);

  const handleStartQuiz = useCallback(async (quizId: string) => {
    try {
      // Mock implementation - in a real app, this would call an API
      console.log('Starting quiz:', quizId);
      addNotification({
        type: 'success',
        title: 'Quiz',
        message: 'Quiz started!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Quiz',
        message: 'Failed to start quiz'
      });
    }
  }, [addNotification]);

  const handleBookSession = useCallback(async (mentorId: string, session: Partial<TutoringSession>) => {
    try {
      // Mock implementation - in a real app, this would call an API
      console.log('Booking session with mentor:', mentorId, session);
      setShowBookingModal(false);
      addNotification({
        type: 'success',
        title: 'Session Booking',
        message: 'Session booked successfully!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Session Booking',
        message: 'Failed to book session'
      });
    }
  }, [addNotification]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Learning & Mentorship
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Master new skills with micro-learning and connect with expert mentors
        </p>
      </div>

      {/* Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Modules</h3>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {completedModules.length}
          </p>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 dark:text-green-400">+3 this month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</h3>
            <Play className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {inProgressModules.length}
          </p>
          <div className="flex items-center mt-2">
            <Clock className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-sm text-blue-600 dark:text-blue-400">Active learning</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Certificates</h3>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalCertificates}
          </p>
          <div className="flex items-center mt-2">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm text-yellow-600 dark:text-yellow-400">Achievements</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</h3>
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {averageScore.toFixed(1)}%
          </p>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-sm text-purple-600 dark:text-purple-400">+5.2%</span>
          </div>
        </motion.div>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search modules, mentors, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Book Mentor
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'modules', label: 'Learning Modules', icon: BookOpen, count: filteredModules.length },
            { id: 'quizzes', label: 'Quizzes', icon: CheckCircle, count: quizzes.length },
            { id: 'certificates', label: 'Certificates', icon: Award, count: certificates.length },
            { id: 'mentors', label: 'Mentors', icon: Users, count: mentors.length },
            { id: 'sessions', label: 'Sessions', icon: Calendar, count: sessions.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'modules' | 'quizzes' | 'certificates' | 'mentors' | 'sessions')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'modules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No modules found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Start your learning journey by exploring available modules
                  </p>
                </div>
              ) : (
                filteredModules.map((module) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedModule(module)}
                  >
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 relative flex items-center justify-center">
                      <div className="text-center">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">{module.type}</span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          module.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          module.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {module.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {module.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {module.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {module.duration} min
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {module.type}
                        </span>
                      </div>
                      {module.progress > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${module.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {module.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {module.isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEnrollModule(module.id);
                            }}
                            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {module.progress > 0 ? 'Continue' : 'Start'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="space-y-4">
              {quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No quizzes available</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Complete modules to unlock quizzes and test your knowledge
                  </p>
                </div>
              ) : (
                quizzes.map((quiz) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{quiz.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {quiz.questions.length} questions • {quiz.timeLimit || 'No time limit'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Best Score</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {quiz.bestScore}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Attempts: {quiz.attempts}</span>
                        <span>Passing: {quiz.passingScore}%</span>
                      </div>
                      <button
                        onClick={() => handleStartQuiz(quiz.id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                      >
                        {quiz.isCompleted ? 'Retake' : 'Start Quiz'}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No certificates yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Complete modules and pass quizzes to earn certificates
                  </p>
                </div>
              ) : (
                certificates.map((certificate) => (
                  <motion.div
                    key={certificate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Award className="w-8 h-8 text-yellow-500" />
                      {certificate.isVerified && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {certificate.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      {certificate.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>Score: {certificate.score}%</span>
                      <span>Issued: {new Date(certificate.issuedDate).toLocaleDateString()}</span>
                    </div>
                    <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md">
                      View Certificate
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'mentors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No mentors available</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Check back later for available mentors in your area
                  </p>
                </div>
              ) : (
                mentors.map((mentor) => (
                  <motion.div
                    key={mentor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{mentor.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {mentor.rating.toFixed(1)} ({mentor.totalStudents} students)
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {mentor.bio}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {mentor.expertise.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ${mentor.hourlyRate}/hour
                      </div>
                      <button
                        onClick={() => {
                          setSelectedMentor(mentor);
                          setShowBookingModal(true);
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          mentor.isAvailable
                            ? 'text-white bg-blue-600 hover:bg-blue-700'
                            : 'text-gray-400 bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                        }`}
                        disabled={!mentor.isAvailable}
                      >
                        {mentor.isAvailable ? 'Book Session' : 'Unavailable'}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sessions scheduled</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Book a session with a mentor to get started
                  </p>
                </div>
              ) : (
                sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{session.subject}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {session.duration} minutes • {new Date(session.scheduledFor).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        session.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        session.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    {session.rating && (
                      <div className="flex items-center space-x-2 mb-4">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Rated {session.rating}/5
                        </span>
                      </div>
                    )}
                    {session.feedback && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        "{session.feedback}"
                      </p>
                    )}
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </button>
                      <button className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                        <Video className="w-4 h-4 mr-1" />
                        Join
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
