"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  LineChart,
  Activity,
  Target,
  Sparkles
} from "lucide-react";

interface MoodEntry {
  id: string;
  mood: number;
  timestamp: Date;
  notes?: string;
}

interface MoodStats {
  average: number;
  trend: 'up' | 'down' | 'stable';
  streak: number;
  totalEntries: number;
  bestDay: string;
  worstDay: string;
}

// Generate mock data for the last 30 days
const generateMockData = (): MoodEntry[] => {
  const data: MoodEntry[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip some days to simulate real usage
    if (Math.random() > 0.3) {
      const mood = Math.floor(Math.random() * 10) + 1;
      data.push({
        id: `mood_${i}`,
        mood,
        timestamp: date,
        notes: mood < 5 ? "Had a rough day" : mood > 7 ? "Great day!" : "Regular day",
      });
    }
  }
  
  return data;
};

const calculateStats = (data: MoodEntry[]): MoodStats => {
  if (data.length === 0) {
    return {
      average: 0,
      trend: 'stable',
      streak: 0,
      totalEntries: 0,
      bestDay: '',
      worstDay: '',
    };
  }

  const moods = data.map(entry => entry.mood);
  const average = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
  
  // Calculate trend
  const recentMoods = moods.slice(-7);
  const olderMoods = moods.slice(-14, -7);
  const recentAvg = recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length;
  const olderAvg = olderMoods.reduce((sum, mood) => sum + mood, 0) / olderMoods.length;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (recentAvg > olderAvg + 0.5) trend = 'up';
  else if (recentAvg < olderAvg - 0.5) trend = 'down';

  // Calculate streak
  let streak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].mood >= 7) streak++;
    else break;
  }

  // Find best and worst days
  const bestEntry = data.reduce((best, current) => 
    current.mood > best.mood ? current : best
  );
  const worstEntry = data.reduce((worst, current) => 
    current.mood < worst.mood ? current : worst
  );

  return {
    average: Math.round(average * 10) / 10,
    trend,
    streak,
    totalEntries: data.length,
    bestDay: bestEntry.timestamp.toLocaleDateString(),
    worstDay: worstEntry.timestamp.toLocaleDateString(),
  };
};

const getMoodColor = (mood: number): string => {
  if (mood >= 8) return 'bg-green-500';
  if (mood >= 6) return 'bg-blue-500';
  if (mood >= 4) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getMoodEmoji = (mood: number): string => {
  if (mood >= 8) return '😊';
  if (mood >= 6) return '🙂';
  if (mood >= 4) return '😐';
  return '😢';
};

export default function MoodHistoryChart() {
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);

  useEffect(() => {
    // Load data from localStorage or generate mock data
    const savedData = localStorage.getItem('mood_history');
    let data: MoodEntry[];
    
    if (savedData) {
      data = JSON.parse(savedData).map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
    } else {
      data = generateMockData();
      localStorage.setItem('mood_history', JSON.stringify(data));
    }
    
    setMoodData(data);
    setStats(calculateStats(data));
  }, []);

  const filteredData = moodData.filter(entry => {
    const daysAgo = (new Date().getTime() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    switch (timeRange) {
      case '7d': return daysAgo <= 7;
      case '30d': return daysAgo <= 30;
      case '90d': return daysAgo <= 90;
      default: return true;
    }
  });

  const handleEntryClick = (entry: MoodEntry) => {
    setSelectedEntry(selectedEntry?.id === entry.id ? null : entry);
  };

  if (!stats) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Mood History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-8 w-8 mx-auto mb-4 text-muted-foreground animate-spin" />
            <p className="text-muted-foreground">Loading mood data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Mood History
        </CardTitle>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.average}</div>
            <div className="text-xs text-muted-foreground">Average Mood</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.streak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.totalEntries}</div>
            <div className="text-xs text-muted-foreground">Total Entries</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {stats.trend === 'up' ? '↗️' : stats.trend === 'down' ? '↘️' : '→'}
            </div>
            <div className="text-xs text-muted-foreground">Trend</div>
          </div>
        </div>

        {/* Mood Chart */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Mood Over Time</h3>
          <div className="h-48 flex items-end gap-1 bg-muted/20 rounded-lg p-4">
            {filteredData.length === 0 ? (
              <div className="w-full text-center text-muted-foreground">
                No mood data for this period
              </div>
            ) : (
              filteredData.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex-1 flex flex-col items-center cursor-pointer group"
                  onClick={() => handleEntryClick(entry)}
                >
                  <div
                    className={`w-full rounded-t-sm transition-all duration-200 group-hover:opacity-80 ${
                      getMoodColor(entry.mood)
                    }`}
                    style={{ height: `${(entry.mood / 10) * 100}%` }}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {entry.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Entry Details */}
        {selectedEntry && (
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getMoodEmoji(selectedEntry.mood)}</span>
                <div>
                  <div className="font-medium">Mood: {selectedEntry.mood}/10</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedEntry.timestamp.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                {selectedEntry.mood >= 8 ? 'Excellent' : 
                 selectedEntry.mood >= 6 ? 'Good' : 
                 selectedEntry.mood >= 4 ? 'Okay' : 'Low'}
              </Badge>
            </div>
            {selectedEntry.notes && (
              <div className="text-sm italic border-l-2 border-blue-500 pl-3">
                "{selectedEntry.notes}"
              </div>
            )}
          </div>
        )}

        {/* Insights */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">Mood Insights</p>
              <ul className="text-blue-700 space-y-1">
                <li>• Your average mood is {stats.average}/10</li>
                <li>• Best day: {stats.bestDay}</li>
                <li>• You've logged {stats.totalEntries} entries</li>
                {stats.streak > 0 && (
                  <li>• Current streak: {stats.streak} days of good mood!</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

