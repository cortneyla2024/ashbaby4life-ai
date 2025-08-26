'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { 
  Brain, 
  Heart, 
  DollarSign, 
  Target, 
  Sparkles, 
  Users, 
  Zap,
  TrendingUp,
  Activity,
  BookOpen,
  Music,
  Settings,
  ArrowRight,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  progress: number;
  status: 'active' | 'completed' | 'pending' | 'overdue';
  lastActivity?: string;
  tasksCount?: number;
  completedTasks?: number;
  href: string;
  isNew?: boolean;
  isPremium?: boolean;
}

const modules: Module[] = [
  {
    id: 'mental-health',
    title: 'Mental Health & Wellness',
    description: 'Track mood, manage stress, and practice mindfulness',
    icon: Heart,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900',
    progress: 75,
    status: 'active',
    lastActivity: '2 hours ago',
    tasksCount: 5,
    completedTasks: 3,
    href: '#mental-health'
  },
  {
    id: 'financial-wellness',
    title: 'Financial Wellness',
    description: 'Budget tracking, expense management, and financial goals',
    icon: DollarSign,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900',
    progress: 60,
    status: 'active',
    lastActivity: '1 day ago',
    tasksCount: 8,
    completedTasks: 5,
    href: '#financial-wellness'
  },
  {
    id: 'personal-growth',
    title: 'Personal Growth & Learning',
    description: 'Skill development, goal setting, and progress tracking',
    icon: Target,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900',
    progress: 85,
    status: 'active',
    lastActivity: '3 hours ago',
    tasksCount: 12,
    completedTasks: 10,
    href: '#personal-growth'
  },
  {
    id: 'creative-expression',
    title: 'Creative Expression',
    description: 'Art, music, writing, and creative projects',
    icon: Sparkles,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900',
    progress: 45,
    status: 'pending',
    lastActivity: '2 days ago',
    tasksCount: 3,
    completedTasks: 1,
    href: '#creative-expression'
  },
  {
    id: 'social-connection',
    title: 'Social Connection',
    description: 'Community engagement and relationship building',
    icon: Users,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    progress: 90,
    status: 'completed',
    lastActivity: '1 hour ago',
    tasksCount: 6,
    completedTasks: 6,
    href: '#social-connection'
  },
  {
    id: 'automation-routines',
    title: 'Automation & Routines',
    description: 'Smart automation and daily routine optimization',
    icon: Zap,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    progress: 30,
    status: 'overdue',
    lastActivity: '5 days ago',
    tasksCount: 4,
    completedTasks: 1,
    href: '#automation-routines',
    isNew: true
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Your personal AI companion for daily tasks',
    icon: Brain,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900',
    progress: 95,
    status: 'active',
    lastActivity: 'Just now',
    tasksCount: 15,
    completedTasks: 14,
    href: '#ai-assistant',
    isPremium: true
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    description: 'Data-driven insights and progress analytics',
    icon: TrendingUp,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900',
    progress: 70,
    status: 'active',
    lastActivity: '4 hours ago',
    tasksCount: 7,
    completedTasks: 5,
    href: '#analytics'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'overdue':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <Activity className="w-3 h-3" />;
    case 'completed':
      return <CheckCircle className="w-3 h-3" />;
    case 'pending':
      return <Clock className="w-3 h-3" />;
    case 'overdue':
      return <Clock className="w-3 h-3" />;
    default:
      return <Activity className="w-3 h-3" />;
  }
};

function ModuleGrid() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const handleModuleClick = (moduleId: string) => {
    setSelectedModule(moduleId);
    // In a real app, you'd navigate to the specific module
    console.log(`Module clicked: ${moduleId}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Life Management Modules
          </CardTitle>
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <Settings className="w-4 h-4" />
            <span>Customize</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((module) => (
            <div
              key={module.id}
              onClick={() => handleModuleClick(module.id)}
              className={`group relative p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 cursor-pointer ${
                selectedModule === module.id 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${module.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <module.icon className={`w-6 h-6 ${module.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {module.title}
                      </h3>
                      {module.isNew && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
                          New
                        </Badge>
                      )}
                      {module.isPremium && (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {module.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              </div>

              {/* Progress Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {module.progress}%
                  </span>
                </div>
                <Progress value={module.progress} className="h-2" />
                
                {/* Status and Tasks */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(module.status)} flex items-center space-x-1`}>
                      {getStatusIcon(module.status)}
                      <span className="capitalize">{module.status}</span>
                    </Badge>
                  </div>
                  
                  {module.tasksCount && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {module.completedTasks}/{module.tasksCount} tasks
                    </div>
                  )}
                </div>

                {/* Last Activity */}
                {module.lastActivity && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Last activity: {module.lastActivity}</span>
                  </div>
                )}
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-50/30 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Module Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Modules</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">6</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Overdue</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ModuleGrid;
export { ModuleGrid };
