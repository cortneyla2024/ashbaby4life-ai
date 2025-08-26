'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Target,
  Sparkles,
  Heart,
  DollarSign,
  BookOpen
} from 'lucide-react';
import { getGreeting, getInitials } from '@/lib/utils';

interface WelcomeCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    aiPersona?: string;
  };
}

interface UserStats {
  totalSessions: number;
  streakDays: number;
  goalsCompleted: number;
  moodAverage: number;
  budgetStatus: 'on-track' | 'over-budget' | 'under-budget';
  learningProgress: number;
}

function WelcomeCard({ user }: WelcomeCardProps) {
  const [stats, setStats] = useState<UserStats>({
    totalSessions: 0,
    streakDays: 0,
    goalsCompleted: 0,
    moodAverage: 0,
    budgetStatus: 'on-track',
    learningProgress: 0
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Fetch user stats
    const fetchStats = async () => {
      try {
        // In a real app, you'd fetch this from your API
        // For now, we'll simulate some stats
        setStats({
          totalSessions: 47,
          streakDays: 12,
          goalsCompleted: 8,
          moodAverage: 7.2,
          budgetStatus: 'on-track',
          learningProgress: 65
        });
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      }
    };

    fetchStats();

    return () => clearInterval(interval);
  }, []);

  const getPersonaIcon = (persona?: string) => {
    switch (persona) {
      case 'creative':
        return <Sparkles className="w-4 h-4" />;
      case 'analytical':
        return <TrendingUp className="w-4 h-4" />;
      case 'empathetic':
        return <Heart className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getPersonaColor = (persona?: string) => {
    switch (persona) {
      case 'creative':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'analytical':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'empathetic':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'over-budget':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'under-budget':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-4 border-white dark:border-gray-700 shadow-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {getGreeting()}, {user.name.split(' ')[0]}!
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${getPersonaColor(user.aiPersona)} flex items-center space-x-1`}>
              {getPersonaIcon(user.aiPersona)}
              <span className="capitalize">{user.aiPersona || 'balanced'}</span>
            </Badge>
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.streakDays}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Day Streak</div>
          </div>
          
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-green-100 dark:bg-green-900 rounded-full">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.goalsCompleted}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Goals Done</div>
          </div>
          
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-purple-100 dark:bg-purple-900 rounded-full">
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.moodAverage}/10</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Mood Avg</div>
          </div>
          
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <BookOpen className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.learningProgress}%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Learning</div>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={`${getBudgetStatusColor(stats.budgetStatus)} flex items-center space-x-1`}>
              <DollarSign className="w-3 h-3" />
              <span className="capitalize">{stats.budgetStatus.replace('-', ' ')}</span>
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stats.totalSessions} total sessions
            </span>
          </div>
          
          <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900">
            View Full Stats
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default WelcomeCard;
export { WelcomeCard };
