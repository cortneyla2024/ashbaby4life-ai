'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  Users,
  Award,
  Play,
  Pause,
  Clock,
  Star,
  MessageCircle,
  Video,
  Download,
  Bookmark,
  Share,
  Search,
  Filter,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  lessons: number;
  rating: number;
  enrolledStudents: number;
  price: number;
  isFree: boolean;
  thumbnail: string;
  tags: string[];
  isEnrolled: boolean;
  progress: number; // percentage
  lastAccessed: Date;
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: number;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  isCompleted: boolean;
  isDownloaded: boolean;
  content?: string;
  videoUrl?: string;
}

interface Quiz {
  id: string;
  courseId: string;
  title: string;
  questions: number;
  timeLimit: number;
  passingScore: number;
  attempts: number;
  bestScore: number;
  isCompleted: boolean;
}

interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  rating: number;
  students: number;
  hourlyRate: number;
  availability: string[];
  bio: string;
  avatar: string;
  isOnline: boolean;
}

interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  issueDate: Date;
  grade: string;
  certificateUrl: string;
  isVerified: boolean;
}

const LearningAndMentorship: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [view, setView] = useState<'courses' | 'my-learning' | 'mentors' | 'certificates' | 'quizzes'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Mock data
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js and become a full-stack developer',
      instructor: 'Dr. Angela Yu',
      category: 'Programming',
      level: 'beginner',
      duration: 2880,
      lessons: 45,
      rating: 4.8,
      enrolledStudents: 125000,
      price: 89.99,
      isFree: false,
      thumbnail: '/api/placeholder/300/200',
      tags: ['web development', 'javascript', 'react'],
      isEnrolled: true,
      progress: 65,
      lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Machine Learning Fundamentals',
      description: 'Master the basics of ML algorithms and data science',
      instructor: 'Andrew Ng',
      category: 'Data Science',
      level: 'intermediate',
      duration: 1800,
      lessons: 32,
      rating: 4.9,
      enrolledStudents: 89000,
      price: 0,
      isFree: true,
      thumbnail: '/api/placeholder/300/200',
      tags: ['machine learning', 'python', 'data science'],
      isEnrolled: false,
      progress: 0,
      lastAccessed: new Date()
    }
  ];

  const mockMentors: Mentor[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      expertise: ['React', 'Node.js', 'TypeScript'],
      rating: 4.9,
      students: 150,
      hourlyRate: 75,
      availability: ['Mon', 'Wed', 'Fri'],
      bio: 'Senior Full-Stack Developer with 8+ years of experience',
      avatar: '/api/placeholder/100/100',
      isOnline: true
    },
    {
      id: '2',
      name: 'Michael Chen',
      expertise: ['Python', 'Machine Learning', 'Data Science'],
      rating: 4.8,
      students: 89,
      hourlyRate: 90,
      availability: ['Tue', 'Thu', 'Sat'],
      bio: 'ML Engineer at Google, PhD in Computer Science',
      avatar: '/api/placeholder/100/100',
      isOnline: false
    }
  ];

  const mockCertificates: Certificate[] = [
    {
      id: '1',
      courseId: '1',
      courseTitle: 'Complete Web Development Bootcamp',
      issueDate: new Date('2024-01-15'),
      grade: 'A+',
      certificateUrl: '/certificates/web-dev-cert.pdf',
      isVerified: true
    }
  ];

  useEffect(() => {
    setCourses(mockCourses);
    setMentors(mockMentors);
    setCertificates(mockCertificates);
  }, []);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
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
      course.id === courseId 
        ? { ...course, isEnrolled: true }
        : course
    ));
  };

  const handleBookMentor = (mentorId: string) => {
    // Handle mentor booking
    console.log('Booking mentor:', mentorId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning & Mentorship</h1>
          <p className="text-gray-600">Master new skills with micro-courses, expert mentors, and earn certificates</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8">
          {[
            { key: 'courses', label: 'Courses', icon: BookOpen },
            { key: 'my-learning', label: 'My Learning', icon: GraduationCap },
            { key: 'mentors', label: 'Mentors', icon: Users },
            { key: 'certificates', label: 'Certificates', icon: Award },
            { key: 'quizzes', label: 'Quizzes', icon: Target }
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
            {/* Courses View */}
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
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="programming">Programming</option>
                      <option value="data-science">Data Science</option>
                      <option value="design">Design</option>
                      <option value="business">Business</option>
                    </select>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <motion.div
                      key={course.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl shadow-sm overflow-hidden"
                    >
                      <div className="relative">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-48 object-cover"
                        />
                        {course.isFree && (
                          <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                            FREE
                          </span>
                        )}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                          {formatDuration(course.duration)}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                            {course.level}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{course.rating}</span>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <span>{course.instructor}</span>
                          <span>{course.lessons} lessons</span>
                        </div>
                        
                        {course.isEnrolled ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Progress</span>
                              <span className="text-sm font-medium">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              Continue Learning
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              {course.isFree ? 'Free' : `$${course.price}`}
                            </span>
                            <button
                              onClick={() => handleEnrollCourse(course.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Enroll Now
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Mentors View */}
            {view === 'mentors' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Expert Mentors</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mentors.map((mentor) => (
                      <motion.div
                        key={mentor.id}
                        whileHover={{ scale: 1.02 }}
                        className="border border-gray-200 rounded-xl p-6"
                      >
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="relative">
                            <img
                              src={mentor.avatar}
                              alt={mentor.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              mentor.isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{mentor.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{mentor.bio}</p>
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{mentor.rating}</span>
                              <span className="text-sm text-gray-600">•</span>
                              <span className="text-sm text-gray-600">{mentor.students} students</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Expertise</p>
                            <div className="flex flex-wrap gap-1">
                              {mentor.expertise.map((skill) => (
                                <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Rate</p>
                              <p className="font-semibold text-gray-900">${mentor.hourlyRate}/hour</p>
                            </div>
                            <button
                              onClick={() => handleBookMentor(mentor.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Book Session
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Certificates View */}
            {view === 'certificates' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">My Certificates</h3>
                  
                  <div className="space-y-4">
                    {certificates.map((certificate) => (
                      <motion.div
                        key={certificate.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <Award className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{certificate.courseTitle}</h4>
                              <p className="text-sm text-gray-600">Issued {formatDate(certificate.issueDate)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              certificate.grade === 'A+' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              Grade: {certificate.grade}
                            </span>
                            <button className="text-blue-600 hover:text-blue-700">
                              <Download className="w-5 h-5" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LearningAndMentorship;
