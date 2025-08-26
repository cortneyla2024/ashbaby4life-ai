import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  ShoppingCart, 
  BookOpen, 
  Heart, 
  MessageCircle, 
  Calendar, 
  Settings,
  Plus,
  Grid,
  Command,
  Bell,
  User,
  TrendingUp,
  FileText,
  Video,
  Music,
  Camera,
  Globe,
  Shield,
  Zap,
  Target,
  Star,
  Award
} from 'lucide-react';

const UniversalDashboard = () => {
  const [widgets, setWidgets] = useState([
    { id: 'search', type: 'search', title: 'Universal Search', icon: Search, position: { x: 0, y: 0 }, size: 'medium' },
    { id: 'community', type: 'community', title: 'Community Hub', icon: Users, position: { x: 1, y: 0 }, size: 'large' },
    { id: 'marketplace', type: 'marketplace', title: 'Marketplace', icon: ShoppingCart, position: { x: 2, y: 0 }, size: 'medium' },
    { id: 'learning', type: 'learning', title: 'Learning Center', icon: BookOpen, position: { x: 0, y: 1 }, size: 'large' },
    { id: 'health', type: 'health', title: 'Health & Therapy', icon: Heart, position: { x: 1, y: 1 }, size: 'large' },
    { id: 'messaging', type: 'messaging', title: 'Messaging', icon: MessageCircle, position: { x: 2, y: 1 }, size: 'medium' },
    { id: 'calendar', type: 'calendar', title: 'Calendar', icon: Calendar, position: { x: 0, y: 2 }, size: 'medium' },
    { id: 'analytics', type: 'analytics', title: 'Analytics', icon: TrendingUp, position: { x: 1, y: 2 }, size: 'medium' },
    { id: 'media', type: 'media', title: 'Media Center', icon: Video, position: { x: 2, y: 2 }, size: 'medium' },
    { id: 'ai-assistant', type: 'ai-assistant', title: 'AI Assistant', icon: Zap, position: { x: 0, y: 3 }, size: 'large' },
    { id: 'finance', type: 'finance', title: 'Finance', icon: Target, position: { x: 1, y: 3 }, size: 'medium' },
    { id: 'events', type: 'events', title: 'Events & Travel', icon: Globe, position: { x: 2, y: 3 }, size: 'medium' }
  ]);

  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userProfile, setUserProfile] = useState({
    name: 'User',
    avatar: '/avatars/default.png',
    level: 15,
    experience: 1250,
    badges: ['Early Adopter', 'Community Helper', 'Wellness Champion']
  });

  const commands = [
    { id: 'search', label: 'Search anything', icon: Search, action: () => navigateToModule('search') },
    { id: 'health', label: 'Health check-in', icon: Heart, action: () => navigateToModule('health') },
    { id: 'community', label: 'Join community', icon: Users, action: () => navigateToModule('community') },
    { id: 'learning', label: 'Start learning', icon: BookOpen, action: () => navigateToModule('learning') },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Zap, action: () => navigateToModule('ai-assistant') },
    { id: 'settings', label: 'Settings', icon: Settings, action: () => navigateToModule('settings') }
  ];

  const navigateToModule = useCallback((moduleId) => {
    // Navigation logic will be implemented with router
    console.log(`Navigating to ${moduleId}`);
    setShowCommandPalette(false);
  }, []);

  const handleWidgetDrag = useCallback((widgetId, newPosition) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, position: newPosition }
        : widget
    ));
  }, []);

  const handleWidgetResize = useCallback((widgetId, newSize) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, size: newSize }
        : widget
    ));
  }, []);

  const addWidget = useCallback((widgetType) => {
    const newWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      title: widgetType.charAt(0).toUpperCase() + widgetType.slice(1),
      icon: getIconForType(widgetType),
      position: { x: Math.floor(Math.random() * 3), y: Math.floor(Math.random() * 4) },
      size: 'medium'
    };
    setWidgets(prev => [...prev, newWidget]);
  }, []);

  const getIconForType = (type) => {
    const iconMap = {
      search: Search,
      community: Users,
      marketplace: ShoppingCart,
      learning: BookOpen,
      health: Heart,
      messaging: MessageCircle,
      calendar: Calendar,
      analytics: TrendingUp,
      media: Video,
      'ai-assistant': Zap,
      finance: Target,
      events: Globe
    };
    return iconMap[type] || Settings;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setShowCommandPalette(true);
            break;
          case 's':
            e.preventDefault();
            navigateToModule('search');
            break;
          case 'h':
            e.preventDefault();
            navigateToModule('health');
            break;
          case 'c':
            e.preventDefault();
            navigateToModule('community');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigateToModule]);

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(commandQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">CareConnect v5.0</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Global Search */}
              <button
                onClick={() => setShowCommandPalette(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Search className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Search or press ⌘K</span>
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{userProfile.name}</p>
                  <p className="text-xs text-gray-500">Level {userProfile.level}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile.name}! 👋
          </h2>
          <p className="text-gray-600">
            Your wellness journey continues. Here's what's happening today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Experience</p>
                <p className="text-2xl font-bold text-gray-900">{userProfile.experience}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Badges</p>
                <p className="text-2xl font-bold text-gray-900">{userProfile.badges.length}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Goals</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Community</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Widget Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              onDrag={handleWidgetDrag}
              onResize={handleWidgetResize}
              onClick={() => navigateToModule(widget.type)}
            />
          ))}
        </div>

        {/* Add Widget Button */}
        <div className="mt-8 flex justify-center">
          <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <Plus className="w-5 h-5" />
            <span>Add Widget</span>
          </button>
        </div>
      </main>

      {/* Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
            onClick={() => setShowCommandPalette(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Command className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search commands, modules, or actions..."
                    value={commandQuery}
                    onChange={(e) => setCommandQuery(e.target.value)}
                    className="flex-1 text-lg outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredCommands.map((command) => (
                  <button
                    key={command.id}
                    onClick={() => command.action()}
                    className="w-full p-4 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <command.icon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{command.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WidgetCard = ({ widget, onDrag, onResize, onClick }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    // Drag logic would be implemented here
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 row-span-1',
    large: 'col-span-2 row-span-2'
  };

  return (
    <motion.div
      layout
      className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer ${sizeClasses[widget.size]}`}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <widget.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">{widget.title}</h3>
          </div>
          <div className="flex items-center space-x-1">
            <button className="p-1 hover:bg-gray-100 rounded">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-3/4"></div>
          </div>
          <p className="text-sm text-gray-600">
            {widget.size === 'large' ? 'Enhanced view with detailed information' : 'Quick access to features'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default UniversalDashboard;
