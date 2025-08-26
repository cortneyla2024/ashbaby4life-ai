'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Brain,
  TrendingUp,
  Lightbulb,

  Heart,
  DollarSign,
  BookOpen
} from 'lucide-react';

const insights = [
  {
    id: 1,
    type: 'mood',
    title: 'Mood Pattern Detected',
    description: 'Your mood tends to be higher on days when you exercise. Consider adding a morning workout to your routine.',
    icon: Heart,
    color: 'text-pink-500',
    action: 'Schedule Workout',
    priority: 'high'
  },
  {
    id: 2,
    type: 'finance',
    title: 'Spending Alert',
    description: 'You\'re spending 15% more on dining out this month. Consider cooking at home to save money.',
    icon: DollarSign,
    color: 'text-green-500',
    action: 'View Budget',
    priority: 'medium'
  },
  {
    id: 3,
    type: 'learning',
    title: 'Learning Opportunity',
    description: 'Based on your interests, you might enjoy learning about machine learning. Here\'s a curated path.',
    icon: BookOpen,
    color: 'text-blue-500',
    action: 'Start Learning',
    priority: 'low'
  }
];

const recommendations = [
  {
    title: 'Schedule a mental health check-in',
    time: 'Today, 6:00 PM',
    icon: Heart
  },
  {
    title: 'Review your monthly budget',
    time: 'Tomorrow, 9:00 AM',
    icon: DollarSign
  },
  {
    title: 'Continue your JavaScript course',
    time: 'This weekend',
    icon: BookOpen
  }
];

export function AIInsights() {
  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${insight.color}`}>
                    <insight.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {insight.title}
                      </h4>
                      {insight.priority === 'high' && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full">
                          High Priority
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {insight.description}
                    </p>
                    <Button size="sm" variant="outline">
                      {insight.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <rec.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {rec.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {rec.time}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  Schedule
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            This Week's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Mood Average</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">7.8/10</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Goals Completed</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">3/5</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Learning Hours</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">12.5 hrs</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
