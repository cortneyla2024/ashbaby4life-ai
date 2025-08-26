'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Search,
  Users,
  ShoppingBag,
  Video,
  Newspaper,
  Briefcase,
  DollarSign,
  GraduationCap,
  Calendar,
  MessageSquare,
  Brain,
  Bot,
  RefreshCw,
  Puzzle,
  BarChart3,
  Building,
  Glasses,
  Menu,
  X,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Navigation items
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Universal dashboard and launcher'
    },
    {
      name: 'Profiles',
      href: '/profiles',
      icon: User,
      description: 'User profiles and gamification'
    },
    {
      name: 'Family Monitor',
      href: '/family-monitoring',
      icon: Users,
      description: 'Family monitoring and protection'
    },
    {
      name: 'Community',
      href: '/community',
      icon: MessageSquare,
      description: 'Forums, messaging, and audio rooms'
    },
    {
      name: 'Social Hub',
      href: '/social-hub',
      icon: Users,
      description: 'AI creations and social feed'
    },
    {
      name: 'Marketplace',
      href: '/marketplace',
      icon: ShoppingBag,
      description: 'E-commerce and AI bundles'
    },
    {
      name: 'Media',
      href: '/media-streaming',
      icon: Video,
      description: 'Media streaming and guided sessions'
    },
    {
      name: 'News',
      href: '/news-alerts',
      icon: Newspaper,
      description: 'AI-summarized news and alerts'
    },
    {
      name: 'Productivity',
      href: '/productivity',
      icon: Briefcase,
      description: 'Collaboration and productivity tools'
    },
    {
      name: 'Finance',
      href: '/finance',
      icon: DollarSign,
      description: 'Finance and payments management'
    },
    {
      name: 'Learning',
      href: '/learning-mentorship',
      icon: GraduationCap,
      description: 'Learning and mentorship platform'
    },
    {
      name: 'Events',
      href: '/events-travel',
      icon: Calendar,
      description: 'Events and travel planning'
    },
    {
      name: 'Communication',
      href: '/omni-channel-communications',
      icon: MessageSquare,
      description: 'Omni-channel communications'
    },
    {
      name: 'Knowledge',
      href: '/knowledge-graph',
      icon: Brain,
      description: 'Personal knowledge graph and memory'
    },
    {
      name: 'AI Assistant',
      href: '/ai-assistant',
      icon: Bot,
      description: 'AI personal assistant'
    },
    {
      name: 'Sync',
      href: '/sync-data-sovereignty',
      icon: RefreshCw,
      description: 'Data sync and sovereignty'
    },
    {
      name: 'Developer',
      href: '/developer-ecosystem',
      icon: Puzzle,
      description: 'Developer ecosystem and plugins'
    },
    {
      name: 'Analytics',
      href: '/advanced-analytics',
      icon: BarChart3,
      description: 'Advanced analytics and insights'
    },
    {
      name: 'Civic Services',
      href: '/civic-services',
      icon: Building,
      description: 'Civic services portal'
    },
    {
      name: 'AR/VR',
      href: '/ar-vr-immersive',
      icon: Glasses,
      description: 'AR/VR immersive experiences'
    },
    {
      name: 'Device Monitor',
      href: '/device-monitoring',
      icon: Monitor,
      description: 'Device monitoring and diagnostics'
    },
    {
      name: 'Self-Update',
      href: '/self-update-watchdog',
      icon: RefreshCw,
      description: 'Self-update and watchdog'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-40',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                CareConnect
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                  )} />
                  {!isCollapsed && (
                    <>
                      <span>{item.name}</span>
                      {/* Tooltip for collapsed state */}
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {item.description}
                      </div>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          {!isCollapsed && user && (
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            {!isCollapsed && (
              <>
                <Link href="/settings">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="h-8 w-8 p-0"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-8 w-8 p-0"
            >
              <Menu className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">CC</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                CareConnect
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            {user && (
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="w-80 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">CC</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      CareConnect
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Mobile Navigation */}
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="space-y-1 px-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            'flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className={cn(
                            'w-5 h-5 flex-shrink-0',
                            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                          )} />
                          <div>
                            <span>{item.name}</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Footer */}
                {user && (
                  <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link href="/settings">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for desktop sidebar */}
      <div className="hidden lg:block w-64" />
    </>
  );
};
