'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  MessageCircle, 
  Video, 
  Target, 
  Heart, 
  DollarSign, 
  BookOpen, 
  Sparkles, 
  Plus,
  TrendingUp,
  Calendar,
  Music,
  Settings
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  href: string;
  badge?: string;
  isNew?: boolean;
}

const quickActions: QuickAction[] = [
  {
    id: 'ai-chat',
    title: 'AI Chat',
    description: 'Talk with your AI companion',
    icon: MessageCircle,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    href: '#ai-chat',
    badge: 'Popular'
  },
  {
    id: 'face-to-face',
    title: 'Face to Face',
    description: 'Video call with AI',
    icon: Video,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900',
    href: '#face-to-face',
    isNew: true
  },
  {
    id: 'mood-tracker',
    title: 'Mood Tracker',
    description: 'Track your daily mood',
    icon: Heart,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900',
    href: '#mood-tracker'
  },
  {
    id: 'budget-tracker',
    title: 'Budget Tracker',
    description: 'Manage your finances',
    icon: DollarSign,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900',
    href: '#budget-tracker'
  },
  {
    id: 'goal-setting',
    title: 'Goal Setting',
    description: 'Set and track goals',
    icon: Target,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900',
    href: '#goal-setting'
  },
  {
    id: 'learning',
    title: 'Learning Hub',
    description: 'Track your learning progress',
    icon: BookOpen,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900',
    href: '#learning'
  },
  {
    id: 'creative',
    title: 'Creative Studio',
    description: 'Express your creativity',
    icon: Sparkles,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    href: '#creative'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'View your progress insights',
    icon: TrendingUp,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900',
    href: '#analytics'
  },
  {
    id: 'calendar',
    title: 'Calendar',
    description: 'Manage your schedule',
    icon: Calendar,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900',
    href: '#calendar'
  },
  {
    id: 'music',
    title: 'Music Therapy',
    description: 'Relax with AI-curated music',
    icon: Music,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900',
    href: '#music'
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Customize your experience',
    icon: Settings,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900',
    href: '#settings'
  }
];

function QuickActions() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleActionClick = (actionId: string) => {
    setSelectedAction(actionId);
    // In a real app, you'd navigate to the specific section or open a modal
    console.log(`Quick action clicked: ${actionId}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </CardTitle>
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <Plus className="w-4 h-4" />
            <span>Customize</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              className={`group relative p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200 text-left ${
                selectedAction === action.id 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-full ${action.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {action.title}
                    </h3>
                    {action.isNew && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs px-1 py-0">
                        New
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {action.description}
                  </p>
                  
                  {action.badge && (
                    <div className="mt-2">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                        {action.badge}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent dark:from-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none" />
            </button>
          ))}
        </div>
        
        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Active Goals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">7.8</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Mood</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">85%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Budget Health</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickActions;
export { QuickActions };
