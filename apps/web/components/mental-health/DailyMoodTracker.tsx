'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { 
  Smile, 
  Frown, 
  Meh, 
  TrendingUp, 
  Calendar, 
  Activity,
  Heart,
  Brain,
  Coffee,
  BookOpen,
  Music,
  Users,
  Sun,
  Moon
} from 'lucide-react';

interface MoodEntry {
  id: string;
  mood: number;
  energy: number;
  notes: string;
  activities: string[];
  timestamp: Date;
}

interface DailyMoodTrackerProps {
  onSaveMood: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => Promise<void>;
  todayEntry?: MoodEntry;
  weeklyData?: Array<{ date: string; averageMood: number }>;
}

const moodLevels = [
  { value: 1, label: 'Very Low', icon: Frown, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900' },
  { value: 2, label: 'Low', icon: Frown, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900' },
  { value: 3, label: 'Below Average', icon: Meh, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900' },
  { value: 4, label: 'Average', icon: Meh, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900' },
  { value: 5, label: 'Good', icon: Smile, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900' },
  { value: 6, label: 'Very Good', icon: Smile, color: 'text-green-600', bgColor: 'bg-green-200 dark:bg-green-800' },
  { value: 7, label: 'Great', icon: Smile, color: 'text-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-900' },
  { value: 8, label: 'Excellent', icon: Smile, color: 'text-emerald-600', bgColor: 'bg-emerald-200 dark:bg-emerald-800' },
  { value: 9, label: 'Amazing', icon: Smile, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900' },
  { value: 10, label: 'Perfect', icon: Smile, color: 'text-purple-600', bgColor: 'bg-purple-200 dark:bg-purple-800' }
];

const commonActivities = [
  { id: 'exercise', label: 'Exercise', icon: Activity },
  { id: 'meditation', label: 'Meditation', icon: Brain },
  { id: 'social', label: 'Social Time', icon: Users },
  { id: 'reading', label: 'Reading', icon: BookOpen },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'coffee', label: 'Coffee/Tea', icon: Coffee },
  { id: 'outdoors', label: 'Outdoors', icon: Sun },
  { id: 'sleep', label: 'Good Sleep', icon: Moon },
  { id: 'hobby', label: 'Hobby', icon: Heart }
];

export function DailyMoodTracker({
  onSaveMood,
  todayEntry,
  weeklyData = []
}: DailyMoodTrackerProps) {
  const [mood, setMood] = useState(todayEntry?.mood || 5);
  const [energy, setEnergy] = useState(todayEntry?.energy || 5);
  const [notes, setNotes] = useState(todayEntry?.notes || '');
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    todayEntry?.activities || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSaveMood({
        mood,
        energy,
        notes,
        activities: selectedActivities
      });
    } catch (error) {
      console.error('Error saving mood:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodLevel = (value: number) => {
    return moodLevels.find(level => level.value === value) || moodLevels[4];
  };

  const getWeeklyAverage = () => {
    if (weeklyData.length === 0) return 0;
    const sum = weeklyData.reduce((acc, day) => acc + day.averageMood, 0);
    return Math.round(sum / weeklyData.length);
  };

  const getMoodTrend = () => {
    if (weeklyData.length < 2) return 'neutral';
    const recent = weeklyData.slice(-3);
    const older = weeklyData.slice(-6, -3);
    if (recent.length === 0 || older.length === 0) return 'neutral';
    
    const recentAvg = recent.reduce((acc, day) => acc + day.averageMood, 0) / recent.length;
    const olderAvg = older.reduce((acc, day) => acc + day.averageMood, 0) / older.length;
    
    return recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'neutral';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Daily Mood Tracker
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            How are you feeling today?
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Weekly Overview */}
      {weeklyData.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Weekly Overview
            </h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className={`w-4 h-4 ${
                getMoodTrend() === 'up' ? 'text-green-500' : 
                getMoodTrend() === 'down' ? 'text-red-500' : 'text-gray-400'
              }`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Avg: {getWeeklyAverage()}/10
              </span>
            </div>
          </div>
          
          <div className="flex space-x-1">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex-1">
                <div className="text-xs text-gray-500 mb-1">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded relative">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-b"
                    style={{ height: `${(day.averageMood / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Mood Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">How's your mood today?</h3>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {moodLevels.map((level) => {
            const Icon = level.icon;
            return (
              <button
                key={level.value}
                onClick={() => setMood(level.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  mood === level.value
                    ? `${level.bgColor} border-blue-500`
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-1 ${level.color}`} />
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {level.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {level.label}
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Selected: {getMoodLevel(mood).label} ({mood}/10)
          </span>
        </div>
      </Card>

      {/* Energy Level */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Energy Level</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Low</span>
          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(e) => setEnergy(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">High</span>
        </div>
        <div className="text-center mt-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Energy: {energy}/10
          </span>
        </div>
      </Card>

      {/* Activities */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">What did you do today?</h3>
        <div className="grid grid-cols-3 gap-3">
          {commonActivities.map((activity) => {
            const Icon = activity.icon;
            const isSelected = selectedActivities.includes(activity.id);
            return (
              <button
                key={activity.id}
                onClick={() => handleActivityToggle(activity.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1 ${
                  isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                }`} />
                <div className={`text-xs font-medium ${
                  isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {activity.label}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How was your day? Any specific thoughts or feelings you'd like to share?"
          rows={4}
        />
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="px-6"
        >
          {isSubmitting ? 'Saving...' : 'Save Mood Entry'}
        </Button>
      </div>

      {/* Today's Summary */}
      {todayEntry && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Today's Entry
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Mood: {todayEntry.mood}/10 • Energy: {todayEntry.energy}/10
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {todayEntry.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
