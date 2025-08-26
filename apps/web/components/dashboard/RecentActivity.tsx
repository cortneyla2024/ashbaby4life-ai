'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { 
  MessageCircle, 
  Heart, 
  DollarSign, 
  Target, 
  Sparkles, 
  Users, 
  Zap,
  TrendingUp,
  BookOpen,
  Music,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { formatTime, formatDate } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'ai-chat' | 'mood-track' | 'budget-update' | 'goal-completed' | 'creative' | 'social' | 'learning' | 'automation';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  status?: 'completed' | 'in-progress' | 'pending';
  value?: string | number;
  module?: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'ai-chat',
    title: 'AI Chat Session',
    description: 'Had a 15-minute conversation about stress management techniques',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    icon: MessageCircle,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    status: 'completed',
    value: '15 min',
    module: 'AI Assistant'
  },
  {
    id: '2',
    type: 'mood-track',
    title: 'Mood Check-in',
    description: 'Recorded mood as 8/10 - feeling productive and motivated',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    icon: Heart,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900',
    status: 'completed',
    value: '8/10',
    module: 'Mental Health'
  },
  {
    id: '3',
    type: 'budget-update',
    title: 'Budget Transaction',
    description: 'Added grocery expense of $45.67 to monthly budget',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    icon: DollarSign,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900',
    status: 'completed',
    value: '$45.67',
    module: 'Financial Wellness'
  },
  {
    id: '4',
    type: 'goal-completed',
    title: 'Goal Achieved',
    description: 'Completed daily meditation goal - 20 minutes of mindfulness',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    icon: Target,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900',
    status: 'completed',
    value: '20 min',
    module: 'Personal Growth'
  },
  {
    id: '5',
    type: 'creative',
    title: 'Creative Session',
    description: 'Started working on a new digital art project',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    icon: Sparkles,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900',
    status: 'in-progress',
    value: 'In Progress',
    module: 'Creative Expression'
  },
  {
    id: '6',
    type: 'social',
    title: 'Social Connection',
    description: 'Scheduled coffee meetup with friend for tomorrow',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    icon: Users,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    status: 'pending',
    value: 'Scheduled',
    module: 'Social Connection'
  },
  {
    id: '7',
    type: 'learning',
    title: 'Learning Progress',
    description: 'Completed 3 lessons in JavaScript course',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    icon: BookOpen,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900',
    status: 'completed',
    value: '3 lessons',
    module: 'Learning Hub'
  },
  {
    id: '8',
    type: 'automation',
    title: 'Automation Triggered',
    description: 'Morning routine automation completed successfully',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    icon: Zap,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    status: 'completed',
    value: 'Success',
    module: 'Automation'
  }
];

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-3 h-3" />;
    case 'in-progress':
      return <Clock className="w-3 h-3" />;
    case 'pending':
      return <Clock className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
};

function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setActivities(mockActivities);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </CardTitle>
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <ArrowRight className="w-4 h-4" />
            <span>View All</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 6).map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className={`p-2 rounded-lg ${activity.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.title}
                      </h4>
                      {activity.status && (
                        <Badge className={`${getStatusColor(activity.status)} flex items-center space-x-1`}>
                          {getStatusIcon(activity.status)}
                          <span className="capitalize">{activity.status.replace('-', ' ')}</span>
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getTimeAgo(activity.timestamp)}
                      </span>
                      {activity.module && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.module}
                        </span>
                      )}
                      {activity.value && (
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {activity.value}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Activity Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {activities.filter(a => a.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {activities.filter(a => a.status === 'in-progress').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">In Progress</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {activities.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentActivity;
export { RecentActivity };
