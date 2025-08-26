'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Book,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  User,
  Users,
  MessageCircle,
  Star,
  Clock,
  CheckCircle,
  Trophy,
  Target,
  Zap,
  BookOpen,
  Video,
  Headphones,
  FileText,
  Download,
  Share,
  Bookmark,
  Settings,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  X
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  rating: number;
  enrolledStudents: number;
  progress: number; // 0-100
  thumbnail: string;
  lessons: Lesson[];
  isEnrolled: boolean;
  isPremium: boolean;
}

interface Lesson {
  id: string;
  title: string;
  duration: number;
  type: 'video' | 'quiz' | 'reading' | 'interactive';
  isCompleted: boolean;
  isLocked: boolean;
}

interface AITutor {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  personality: string;
  isActive: boolean;
}

const VirtualAcademy: React.FC = () => {
  const [view, setView] = useState<'courses' | 'my-learning' | 'ai-tutor' | 'achievements'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [aiTutors, setAiTutors] = useState<AITutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<AITutor | null>(null);

  // Mock data
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'Introduction to Machine Learning',
      description: 'Learn the fundamentals of machine learning with hands-on examples and real-world applications.',
      instructor: 'Dr. Sarah Chen',
      duration: 480,
      level: 'beginner',
      category: 'Technology',
      rating: 4.8,
      enrolledStudents: 12543,
      progress: 65,
      thumbnail: '/course-ml.jpg',
      isEnrolled: true,
      isPremium: false,
      lessons: [
        { id: '1', title: 'What is Machine Learning?', duration: 15, type: 'video', isCompleted: true, isLocked: false },
        { id: '2', title: 'Types of ML Algorithms', duration: 20, type: 'video', isCompleted: true, isLocked: false },
        { id: '3', title: 'Data Preprocessing', duration: 25, type: 'interactive', isCompleted: false, isLocked: false },
        { id: '4', title: 'Model Evaluation', duration: 30, type: 'quiz', isCompleted: false, isLocked: true }
      ]
    },
    {
      id: '2',
      title: 'Digital Marketing Mastery',
      description: 'Complete guide to digital marketing including SEO, social media, and content marketing.',
      instructor: 'Mark Rodriguez',
      duration: 360,
      level: 'intermediate',
      category: 'Business',
      rating: 4.6,
      enrolledStudents: 8234,
      progress: 0,
      thumbnail: '/course-marketing.jpg',
      isEnrolled: false,
      isPremium: true,
      lessons: [
        { id: '1', title: 'Digital Marketing Overview', duration: 20, type: 'video', isCompleted: false, isLocked: false },
        { id: '2', title: 'SEO Fundamentals', duration: 35, type: 'video', isCompleted: false, isLocked: true },
        { id: '3', title: 'Social Media Strategy', duration: 30, type: 'reading', isCompleted: false, isLocked: true }
      ]
    },
    {
      id: '3',
      title: 'Mindfulness and Meditation',
      description: 'Learn mindfulness techniques and meditation practices for better mental health and focus.',
      instructor: 'Emma Thompson',
      duration: 240,
      level: 'beginner',
      category: 'Wellness',
      rating: 4.9,
      enrolledStudents: 15678,
      progress: 25,
      thumbnail: '/course-mindfulness.jpg',
      isEnrolled: true,
      isPremium: false,
      lessons: [
        { id: '1', title: 'Introduction to Mindfulness', duration: 15, type: 'video', isCompleted: true, isLocked: false },
        { id: '2', title: 'Breathing Techniques', duration: 20, type: 'interactive', isCompleted: false, isLocked: false },
        { id: '3', title: 'Body Scan Meditation', duration: 25, type: 'video', isCompleted: false, isLocked: false }
      ]
    }
  ];

  const mockTutors: AITutor[] = [
    {
      id: '1',
      name: 'Professor Alex',
      avatar: '/tutor-alex.jpg',
      specialty: 'Technology & Programming',
      personality: 'Patient and methodical, great at breaking down complex concepts',
      isActive: true
    },
    {
      id: '2',
      name: 'Coach Maria',
      avatar: '/tutor-maria.jpg',
      specialty: 'Business & Leadership',
      personality: 'Energetic and motivating, focuses on practical applications',
      isActive: false
    },
    {
      id: '3',
      name: 'Zen Master Lin',
      avatar: '/tutor-lin.jpg',
      specialty: 'Wellness & Mindfulness',
      personality: 'Calm and wise, emphasizes holistic understanding',
      isActive: false
    }
  ];

  useEffect(() => {
    setCourses(mockCourses);
    setAiTutors(mockTutors);
    setSelectedTutor(mockTutors[0]);
  }, []);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEnrollCourse = (courseId: string) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, isEnrolled: true } : course
    ));
  };

  const handleStartLesson = (course: Course, lesson: Lesson) => {
    setSelectedCourse(course);
    setCurrentLesson(lesson);
    setIsPlaying(true);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const enrolledCourses = courses.filter(course => course.isEnrolled);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Virtual Academy</h1>
          <p className="text-gray-600">AI-powered education with adaptive learning and human-like avatars</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8">
          {[
            { key: 'courses', label: 'Course Catalog', icon: BookOpen },
            { key: 'my-learning', label: 'My Learning', icon: GraduationCap },
            { key: 'ai-tutor', label: 'AI Tutor', icon: User },
            { key: 'achievements', label: 'Achievements', icon: Trophy }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                view === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Course Catalog */}
            {view === 'courses' && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search courses..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        <option value="technology">Technology</option>
                        <option value="business">Business</option>
                        <option value="wellness">Wellness</option>
                        <option value="arts">Arts</option>
                      </select>
                      <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <motion.div
                      key={course.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl shadow-sm overflow-hidden"
                    >
                      <div className="aspect-video bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                        <Video className="w-12 h-12 text-white" />
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                            {course.level}
                          </span>
                          {course.isPremium && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              Premium
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{course.instructor}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDuration(course.duration)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{course.rating}</span>
                            <span className="text-sm text-gray-600">({course.enrolledStudents.toLocaleString()})</span>
                          </div>
                        </div>
                        
                        {course.isEnrolled ? (
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{course.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedCourse(course)}
                              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Continue Learning
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEnrollCourse(course.id)}
                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Enroll Now
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* My Learning */}
            {view === 'my-learning' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">My Enrolled Courses</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enrolledCourses.map((course) => (
                      <motion.div
                        key={course.id}
                        whileHover={{ scale: 1.02 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">{course.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                            {course.level}
                          </span>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Overall Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          {course.lessons.slice(0, 3).map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {lesson.isCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : lesson.isLocked ? (
                                  <div className="w-4 h-4 bg-gray-300 rounded-full" />
                                ) : (
                                  <Play className="w-4 h-4 text-blue-500" />
                                )}
                                <span className="text-sm text-gray-700">{lesson.title}</span>
                              </div>
                              <span className="text-xs text-gray-500">{lesson.duration}m</span>
                            </div>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Continue Course
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Tutor */}
            {view === 'ai-tutor' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">AI Learning Companions</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {aiTutors.map((tutor) => (
                      <motion.div
                        key={tutor.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedTutor(tutor)}
                        className={`border rounded-lg p-6 cursor-pointer transition-colors ${
                          selectedTutor?.id === tutor.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900">{tutor.name}</h4>
                          <p className="text-sm text-blue-600">{tutor.specialty}</p>
                        </div>
                        
                        <p className="text-sm text-gray-600 text-center mb-4">{tutor.personality}</p>
                        
                        <div className="flex items-center justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            tutor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {tutor.isActive ? 'Active' : 'Available'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {selectedTutor && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{selectedTutor.name}</h4>
                          <p className="text-sm text-gray-600">Ready to help you learn</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-2">
                          "Hello! I'm {selectedTutor.name}, your AI learning companion specializing in {selectedTutor.specialty.toLowerCase()}. 
                          How can I help you with your studies today?"
                        </p>
                      </div>
                      
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          placeholder="Ask me anything about your courses..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Achievements */}
            {view === 'achievements' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Learning Achievements</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: '1', title: 'First Course Completed', description: 'Complete your first course', icon: GraduationCap, earned: true },
                      { id: '2', title: 'Learning Streak', description: '7 days of continuous learning', icon: Target, earned: true },
                      { id: '3', title: 'Quiz Master', description: 'Score 100% on 5 quizzes', icon: Trophy, earned: false },
                      { id: '4', title: 'AI Collaborator', description: 'Complete 10 AI tutor sessions', icon: User, earned: false },
                      { id: '5', title: 'Knowledge Seeker', description: 'Enroll in 5 different courses', icon: BookOpen, earned: false },
                      { id: '6', title: 'Speed Learner', description: 'Complete a course in under a week', icon: Zap, earned: false }
                    ].map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.02 }}
                        className={`border rounded-lg p-6 text-center ${
                          achievement.earned 
                            ? 'border-yellow-300 bg-yellow-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                          achievement.earned 
                            ? 'bg-yellow-100 text-yellow-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <achievement.icon className="w-8 h-8" />
                        </div>
                        
                        <h4 className={`font-semibold mb-2 ${
                          achievement.earned ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {achievement.title}
                        </h4>
                        
                        <p className={`text-sm ${
                          achievement.earned ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                          {achievement.description}
                        </p>
                        
                        {achievement.earned && (
                          <div className="mt-4">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              Earned
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Course Detail Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h2>
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
                      {currentLesson ? (
                        <div className="text-center text-white">
                          <h3 className="text-xl mb-4">{currentLesson.title}</h3>
                          <div className="flex items-center justify-center space-x-4">
                            <button className="p-2 bg-white bg-opacity-20 rounded-full">
                              <SkipBack className="w-6 h-6" />
                            </button>
                            <button
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="p-3 bg-blue-600 rounded-full"
                            >
                              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                            </button>
                            <button className="p-2 bg-white bg-opacity-20 rounded-full">
                              <SkipForward className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-white">
                          <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>Select a lesson to start learning</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
                      <div className="space-y-2">
                        {selectedCourse.lessons.map((lesson, index) => (
                          <div
                            key={lesson.id}
                            onClick={() => !lesson.isLocked && handleStartLesson(selectedCourse, lesson)}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                              lesson.isLocked 
                                ? 'bg-gray-100 cursor-not-allowed' 
                                : currentLesson?.id === lesson.id 
                                  ? 'bg-blue-50 border-2 border-blue-500' 
                                  : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-sm font-medium text-gray-500">
                                {String(index + 1).padStart(2, '0')}
                              </div>
                              {lesson.isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : lesson.isLocked ? (
                                <div className="w-5 h-5 bg-gray-300 rounded-full" />
                              ) : (
                                <Play className="w-5 h-5 text-blue-500" />
                              )}
                              <div>
                                <h4 className={`font-medium ${lesson.isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                                  {lesson.title}
                                </h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <span>{lesson.duration}m</span>
                                  <span>•</span>
                                  <span>{lesson.type}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Course Progress</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Completion</span>
                            <span>{selectedCourse.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${selectedCourse.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Completed Lessons</span>
                          <span>{selectedCourse.lessons.filter(l => l.isCompleted).length}/{selectedCourse.lessons.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Course Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Instructor</span>
                          <span>{selectedCourse.instructor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration</span>
                          <span>{formatDuration(selectedCourse.duration)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Level</span>
                          <span className="capitalize">{selectedCourse.level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rating</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{selectedCourse.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <Bookmark className="w-4 h-4 inline mr-2" />
                        Bookmark Course
                      </button>
                      <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Share className="w-4 h-4 inline mr-2" />
                        Share Course
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualAcademy;
