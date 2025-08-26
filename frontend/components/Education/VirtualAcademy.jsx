import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  Share,
  Bookmark,
  MessageCircle,
  Calendar,
  Clock,
  Target,
  Award,
  Star,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  Grid,
  List,
  Settings,
  User,
  Brain,
  Zap,
  Lightbulb,
  TrendingUp,
  BarChart3,
  FileText,
  Video,
  Headphones,
  Code,
  Calculator,
  Palette,
  Globe,
  Microscope,
  Heart,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  DownloadCloud,
  Upload,
  RefreshCw,
  RotateCcw,
  PlayCircle,
  PauseCircle,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Star as StarIcon,
  Heart as HeartIcon,
  Zap as ZapIcon,
  Target as TargetIcon,
  Award as AwardIcon,
  Trophy,
  Medal,
  Crown,
  Gem,
  Diamond,
  Ruby,
  Emerald,
  Sapphire,
  Amethyst,
  Pearl,
  Gold,
  Silver,
  Bronze,
  Platinum,
  Iron,
  Steel,
  Copper,
  Aluminum,
  Titanium,
  Carbon,
  Silicon,
  Oxygen,
  Hydrogen,
  Nitrogen,
  Helium,
  Neon,
  Argon,
  Krypton,
  Xenon,
  Radon,
  Uranium,
  Plutonium,
  Thorium,
  Radium,
  Polonium,
  Astatine,
  Francium,
  Radon as RadonIcon,
  Uranium as UraniumIcon,
  Plutonium as PlutoniumIcon,
  Thorium as ThoriumIcon,
  Radium as RadiumIcon,
  Polonium as PoloniumIcon,
  Astatine as AstatineIcon,
  Francium as FranciumIcon
} from 'lucide-react';

const VirtualAcademy = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [userProgress, setUserProgress] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [aiTutor, setAiTutor] = useState({
    isActive: false,
    messages: [],
    suggestions: []
  });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    level: 'all',
    subject: 'all',
    duration: 'all',
    difficulty: 'all'
  });

  const videoRef = useRef(null);
  const transcriptRef = useRef(null);

  // Mock course data
  const courses = [
    {
      id: 'math-101',
      title: 'Advanced Mathematics',
      subject: 'Mathematics',
      level: 'Undergraduate',
      duration: '12 weeks',
      difficulty: 'Intermediate',
      instructor: 'Dr. Sarah Chen',
      rating: 4.8,
      students: 1247,
      lessons: 48,
      certificate: true,
      description: 'Comprehensive course covering calculus, linear algebra, and mathematical analysis.',
      topics: ['Calculus', 'Linear Algebra', 'Mathematical Analysis', 'Number Theory'],
      prerequisites: ['High School Mathematics'],
      learningOutcomes: [
        'Master fundamental calculus concepts',
        'Understand linear algebra principles',
        'Apply mathematical analysis techniques',
        'Develop problem-solving skills'
      ],
      modules: [
        {
          id: 'module-1',
          title: 'Calculus Fundamentals',
          lessons: [
            { id: 'lesson-1', title: 'Introduction to Limits', duration: '45 min', type: 'video' },
            { id: 'lesson-2', title: 'Derivatives and Applications', duration: '60 min', type: 'video' },
            { id: 'lesson-3', title: 'Integration Techniques', duration: '75 min', type: 'video' },
            { id: 'lesson-4', title: 'Practice Problems', duration: '90 min', type: 'interactive' },
            { id: 'lesson-5', title: 'Quiz: Calculus Basics', duration: '30 min', type: 'assessment' }
          ]
        },
        {
          id: 'module-2',
          title: 'Linear Algebra',
          lessons: [
            { id: 'lesson-6', title: 'Vectors and Matrices', duration: '50 min', type: 'video' },
            { id: 'lesson-7', title: 'Systems of Linear Equations', duration: '65 min', type: 'video' },
            { id: 'lesson-8', title: 'Eigenvalues and Eigenvectors', duration: '70 min', type: 'video' },
            { id: 'lesson-9', title: 'Linear Transformations', duration: '55 min', type: 'video' },
            { id: 'lesson-10', title: 'Final Project', duration: '120 min', type: 'project' }
          ]
        }
      ]
    },
    {
      id: 'physics-201',
      title: 'Quantum Physics',
      subject: 'Physics',
      level: 'Graduate',
      duration: '16 weeks',
      difficulty: 'Advanced',
      instructor: 'Prof. Michael Rodriguez',
      rating: 4.9,
      students: 892,
      lessons: 64,
      certificate: true,
      description: 'Advanced quantum mechanics with practical applications and laboratory simulations.',
      topics: ['Wave Functions', 'Quantum Operators', 'Entanglement', 'Quantum Computing'],
      prerequisites: ['Classical Mechanics', 'Linear Algebra'],
      learningOutcomes: [
        'Understand quantum mechanical principles',
        'Solve Schrödinger equation problems',
        'Analyze quantum systems',
        'Apply quantum concepts to modern technology'
      ],
      modules: [
        {
          id: 'module-1',
          title: 'Wave Mechanics',
          lessons: [
            { id: 'lesson-1', title: 'Wave-Particle Duality', duration: '60 min', type: 'video' },
            { id: 'lesson-2', title: 'Schrödinger Equation', duration: '75 min', type: 'video' },
            { id: 'lesson-3', title: 'Probability Interpretation', duration: '50 min', type: 'video' },
            { id: 'lesson-4', title: 'Virtual Lab: Double Slit', duration: '90 min', type: 'simulation' }
          ]
        }
      ]
    },
    {
      id: 'cs-301',
      title: 'Artificial Intelligence',
      subject: 'Computer Science',
      level: 'Graduate',
      duration: '14 weeks',
      difficulty: 'Advanced',
      instructor: 'Dr. Emily Watson',
      rating: 4.7,
      students: 2156,
      lessons: 56,
      certificate: true,
      description: 'Comprehensive AI course covering machine learning, neural networks, and ethical considerations.',
      topics: ['Machine Learning', 'Neural Networks', 'Natural Language Processing', 'Ethics in AI'],
      prerequisites: ['Programming', 'Statistics', 'Linear Algebra'],
      learningOutcomes: [
        'Implement machine learning algorithms',
        'Design neural network architectures',
        'Process natural language data',
        'Evaluate AI ethical implications'
      ],
      modules: [
        {
          id: 'module-1',
          title: 'Machine Learning Fundamentals',
          lessons: [
            { id: 'lesson-1', title: 'Supervised Learning', duration: '70 min', type: 'video' },
            { id: 'lesson-2', title: 'Unsupervised Learning', duration: '65 min', type: 'video' },
            { id: 'lesson-3', title: 'Neural Networks Basics', duration: '80 min', type: 'video' },
            { id: 'lesson-4', title: 'Coding Lab: TensorFlow', duration: '120 min', type: 'coding' }
          ]
        }
      ]
    }
  ];

  const subjects = ['Mathematics', 'Physics', 'Computer Science', 'Biology', 'Chemistry', 'Engineering', 'Psychology', 'Economics'];
  const levels = ['High School', 'Undergraduate', 'Graduate', 'PhD', 'Professional'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setCurrentLesson(course.modules[0]?.lessons[0] || null);
  };

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    setProgress(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (videoRef.current) {
      videoRef.current.currentTime = (newProgress / 100) * videoRef.current.duration;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const activateAiTutor = () => {
    setAiTutor(prev => ({
      ...prev,
      isActive: true,
      messages: [
        {
          id: 1,
          type: 'ai',
          content: 'Hello! I\'m your AI tutor. I can help you with any questions about this course. What would you like to know?',
          timestamp: new Date()
        }
      ]
    }));
  };

  const sendMessageToTutor = (message) => {
    const newMessage = {
      id: aiTutor.messages.length + 1,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setAiTutor(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: aiTutor.messages.length + 2,
        type: 'ai',
        content: `I understand your question about "${message}". Let me explain this concept in detail...`,
        timestamp: new Date()
      };

      setAiTutor(prev => ({
        ...prev,
        messages: [...prev.messages, aiResponse]
      }));
    }, 1000);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filters.level === 'all' || course.level === filters.level;
    const matchesSubject = filters.subject === 'all' || course.subject === filters.subject;
    const matchesDifficulty = filters.difficulty === 'all' || course.difficulty === filters.difficulty;
    
    return matchesSearch && matchesLevel && matchesSubject && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Virtual Academy
          </h1>
          <p className="text-lg text-gray-600">
            K-12 through PhD coursework with AI-powered tutors and adaptive learning
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={filters.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>

              <select
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              <select
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Available Courses ({filteredCourses.length})
              </h3>

              {viewMode === 'grid' ? (
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isSelected={selectedCourse?.id === course.id}
                      onSelect={() => handleCourseSelect(course)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCourses.map((course) => (
                    <CourseListItem
                      key={course.id}
                      course={course}
                      isSelected={selectedCourse?.id === course.id}
                      onSelect={() => handleCourseSelect(course)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Course Content */}
          <div className="lg:col-span-2">
            {selectedCourse ? (
              <div className="space-y-6">
                {/* Video Player */}
                {currentLesson && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="relative bg-black aspect-video">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        poster="/thumbnails/lesson-thumbnail.jpg"
                      >
                        <source src="/videos/sample-lesson.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>

                      {/* Video Controls */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={togglePlay}
                            className="text-white hover:text-blue-400 transition-colors"
                          >
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                          </button>

                          <div className="flex-1">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={progress}
                              onChange={handleProgressChange}
                              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={toggleMute}
                              className="text-white hover:text-blue-400 transition-colors"
                            >
                              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>

                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={isMuted ? 0 : volume}
                              onChange={handleVolumeChange}
                              className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            />

                            <button
                              onClick={toggleFullscreen}
                              className="text-white hover:text-blue-400 transition-colors"
                            >
                              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {currentLesson.title}
                          </h3>
                          <p className="text-gray-600">
                            {currentLesson.duration} • {currentLesson.type}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowTranscript(!showTranscript)}
                            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Transcript</span>
                          </button>

                          <button
                            onClick={activateAiTutor}
                            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <Brain className="w-4 h-4" />
                            <span>AI Tutor</span>
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Course Modules */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Course Modules
                  </h3>

                  <div className="space-y-4">
                    {selectedCourse.modules.map((module) => (
                      <ModuleAccordion
                        key={module.id}
                        module={module}
                        currentLesson={currentLesson}
                        onLessonSelect={handleLessonSelect}
                      />
                    ))}
                  </div>
                </div>

                {/* AI Tutor Chat */}
                {aiTutor.isActive && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Brain className="w-5 h-5 text-blue-500 mr-2" />
                      AI Tutor
                    </h3>

                    <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4">
                      {aiTutor.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`mb-4 ${
                            message.type === 'user' ? 'text-right' : 'text-left'
                          }`}
                        >
                          <div
                            className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.type === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Ask your AI tutor..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            sendMessageToTutor(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a Course
                </h3>
                <p className="text-gray-600">
                  Choose a course from the list to start learning
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseCard = ({ course, isSelected, onSelect }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600">{course.rating}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{course.duration}</span>
        <span>{course.students} students</span>
      </div>

      <div className="flex items-center space-x-2 mt-3">
        <span className={`px-2 py-1 rounded-full text-xs ${
          course.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
          course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
          course.difficulty === 'Advanced' ? 'bg-red-100 text-red-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {course.difficulty}
        </span>
        {course.certificate && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
            Certificate
          </span>
        )}
      </div>
    </motion.div>
  );
};

const CourseListItem = ({ course, isSelected, onSelect }) => {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{course.title}</h4>
          <p className="text-sm text-gray-600">{course.instructor}</p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{course.duration}</span>
          <span>{course.students} students</span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>{course.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModuleAccordion = ({ module, currentLesson, onLessonSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h4 className="font-medium text-gray-900">{module.title}</h4>
        {isExpanded ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200"
          >
            <div className="p-4 space-y-2">
              {module.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => onLessonSelect(lesson)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentLesson?.id === lesson.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {lesson.type === 'video' && <Play className="w-4 h-4" />}
                    {lesson.type === 'interactive' && <Zap className="w-4 h-4" />}
                    {lesson.type === 'assessment' && <Target className="w-4 h-4" />}
                    {lesson.type === 'project' && <Award className="w-4 h-4" />}
                    {lesson.type === 'simulation' && <Microscope className="w-4 h-4" />}
                    {lesson.type === 'coding' && <Code className="w-4 h-4" />}
                    
                    <div className="flex-1">
                      <h5 className="font-medium">{lesson.title}</h5>
                      <p className="text-sm text-gray-500">{lesson.duration}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VirtualAcademy;
