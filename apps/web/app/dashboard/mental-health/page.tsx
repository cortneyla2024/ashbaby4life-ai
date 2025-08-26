"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { 
  Brain, 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Activity,
  Target,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Moon,
  Sun,
  Cloud,
  Zap,
  Leaf
} from "lucide-react";

interface MoodEntry {
  id: string;
  mood: number;
  emotions: string[];
  notes: string;
  activities: string[];
  triggers: string[];
  coping_strategies: string[];
  sleep_hours: number;
  energy_level: number;
  stress_level: number;
  anxiety_level: number;
  social_interaction: number;
  date: string;
}

interface WellnessGoal {
  id: string;
  title: string;
  description: string;
  category: 'sleep' | 'exercise' | 'meditation' | 'social' | 'nutrition' | 'stress';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  isCompleted: boolean;
}

export default function MentalHealthDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [wellnessGoals, setWellnessGoals] = useState<WellnessGoal[]>([]);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [currentMood, setCurrentMood] = useState(0);

  // Mock data
  useEffect(() => {
    // Simulate fetching mood entries
    const mockMoodEntries: MoodEntry[] = [
      {
        id: '1',
        mood: 7,
        emotions: ['happy', 'excited', 'grateful'],
        notes: 'Great day at work, got promoted!',
        activities: ['work', 'exercise', 'socializing'],
        triggers: [],
        coping_strategies: ['exercise', 'meditation'],
        sleep_hours: 8,
        energy_level: 8,
        stress_level: 3,
        anxiety_level: 2,
        social_interaction: 9,
        date: '2024-01-15',
      },
      {
        id: '2',
        mood: 4,
        emotions: ['sad', 'tired', 'overwhelmed'],
        notes: 'Stressful day, lots of deadlines',
        activities: ['work', 'commuting'],
        triggers: ['work_pressure', 'traffic'],
        coping_strategies: ['deep_breathing', 'music'],
        sleep_hours: 5,
        energy_level: 3,
        stress_level: 8,
        anxiety_level: 7,
        social_interaction: 2,
        date: '2024-01-14',
      },
      {
        id: '3',
        mood: 6,
        emotions: ['calm', 'content'],
        notes: 'Peaceful weekend morning',
        activities: ['reading', 'meditation', 'cooking'],
        triggers: [],
        coping_strategies: ['meditation', 'journaling'],
        sleep_hours: 9,
        energy_level: 6,
        stress_level: 2,
        anxiety_level: 1,
        social_interaction: 5,
        date: '2024-01-13',
      },
    ];

    const mockWellnessGoals: WellnessGoal[] = [
      {
        id: '1',
        title: 'Improve Sleep Quality',
        description: 'Get 8 hours of quality sleep consistently',
        category: 'sleep',
        target: 8,
        current: 6.5,
        unit: 'hours',
        deadline: '2024-02-15',
        isCompleted: false,
      },
      {
        id: '2',
        title: 'Daily Meditation',
        description: 'Practice mindfulness for 15 minutes daily',
        category: 'meditation',
        target: 15,
        current: 10,
        unit: 'minutes',
        deadline: '2024-02-01',
        isCompleted: false,
      },
      {
        id: '3',
        title: 'Reduce Stress',
        description: 'Keep stress levels below 5/10',
        category: 'stress',
        target: 5,
        current: 6,
        unit: 'level',
        deadline: '2024-02-20',
        isCompleted: false,
      },
    ];

    setMoodEntries(mockMoodEntries);
    setWellnessGoals(mockWellnessGoals);
  }, []);

  // Calculate statistics
  const averageMood = moodEntries.length > 0 
    ? moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length 
    : 0;

  const moodTrend = moodEntries.length >= 2 
    ? moodEntries[0].mood - moodEntries[moodEntries.length - 1].mood 
    : 0;

  const currentStreak = 7; // Mock streak
  const totalEntries = moodEntries.length;

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-600';
    if (mood >= 6) return 'text-blue-600';
    if (mood >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 8) return <Sun className="h-5 w-5 text-green-600" />;
    if (mood >= 6) return <Cloud className="h-5 w-5 text-blue-600" />;
    if (mood >= 4) return <Moon className="h-5 w-5 text-yellow-600" />;
    return <Zap className="h-5 w-5 text-red-600" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep': return <Moon className="h-4 w-4" />;
      case 'exercise': return <Activity className="h-4 w-4" />;
      case 'meditation': return <Brain className="h-4 w-4" />;
      case 'social': return <Heart className="h-4 w-4" />;
      case 'nutrition': return <Leaf className="h-4 w-4" />;
      case 'stress': return <AlertTriangle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sleep': return 'bg-blue-100 text-blue-800';
      case 'exercise': return 'bg-green-100 text-green-800';
      case 'meditation': return 'bg-purple-100 text-purple-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      case 'nutrition': return 'bg-orange-100 text-orange-800';
      case 'stress': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMoodSubmit = (mood: number) => {
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood,
      emotions: [],
      notes: '',
      activities: [],
      triggers: [],
      coping_strategies: [],
      sleep_hours: 0,
      energy_level: 5,
      stress_level: 5,
      anxiety_level: 5,
      social_interaction: 5,
      date: new Date().toISOString().split('T')[0],
    };
    setMoodEntries(prev => [newEntry, ...prev]);
    setShowMoodForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Mental Health Dashboard</h1>
          <p className="text-muted-foreground">
            Track your mood, set wellness goals, and build healthy habits
          </p>
        </div>
        <Button onClick={() => setShowMoodForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Mood
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mood">Mood Tracking</TabsTrigger>
          <TabsTrigger value="goals">Wellness Goals</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Brain className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Average Mood</p>
                    <p className={`text-2xl font-bold ${getMoodColor(averageMood)}`}>
                      {averageMood.toFixed(1)}/10
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">This week</p>
                      {moodTrend > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                    <p className="text-2xl font-bold text-blue-600">{currentStreak} days</p>
                    <p className="text-xs text-muted-foreground">Mood tracking</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {wellnessGoals.filter(g => !g.isCompleted).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Wellness goals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                    <p className="text-2xl font-bold text-orange-600">{totalEntries}</p>
                    <p className="text-xs text-muted-foreground">Mood logs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Mood Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Recent Mood Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moodEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      {getMoodIcon(entry.mood)}
                      <div>
                        <div className="font-medium">{entry.notes || 'No notes'}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${getMoodColor(entry.mood)}`}>
                        {entry.mood}/10
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.emotions.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Wellness Goals Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Wellness Goals Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wellnessGoals.slice(0, 3).map((goal) => {
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(goal.category)}
                          <span className="font-medium">{goal.title}</span>
                          <Badge className={getCategoryColor(goal.category)}>
                            {goal.category}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {goal.current}/{goal.target} {goal.unit}
                        </span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood" className="space-y-6">
          {/* Mood Tracking Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                How are you feeling today?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
                  <Button
                    key={mood}
                    variant={currentMood === mood ? "default" : "outline"}
                    className="h-16 flex flex-col items-center justify-center"
                    onClick={() => setCurrentMood(mood)}
                  >
                    <div className="text-lg">{mood}</div>
                    <div className="text-xs">
                      {mood <= 2 ? 'Terrible' : 
                       mood <= 4 ? 'Bad' : 
                       mood <= 6 ? 'Okay' : 
                       mood <= 8 ? 'Good' : 'Excellent'}
                    </div>
                  </Button>
                ))}
              </div>
              
              {currentMood > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getMoodIcon(currentMood)}
                    <span className="font-medium">
                      You're feeling a {currentMood}/10 today
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handleMoodSubmit(currentMood)}
                    >
                      Quick Log
                    </Button>
                    <Button onClick={() => setShowMoodForm(true)}>
                      Detailed Entry
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mood History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Mood History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moodEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getMoodIcon(entry.mood)}
                        <span className="font-medium">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {entry.mood}/10
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {entry.notes}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {entry.emotions.map((emotion, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          {/* Wellness Goals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Wellness Goals
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wellnessGoals.map((goal) => {
                  const progress = (goal.current / goal.target) * 100;
                  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(goal.category)}
                          <div>
                            <h3 className="font-medium">{goal.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {goal.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(goal.category)}>
                            {goal.category}
                          </Badge>
                          {goal.isCompleted && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.current}/{goal.target} {goal.unit}</span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{daysLeft} days left</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Mood Trend Analysis</h4>
                      <p className="text-sm text-blue-700">
                        Your mood has been improving over the past week. You tend to feel better on weekends and after exercise.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">Wellness Recommendations</h4>
                      <p className="text-sm text-green-700">
                        Consider increasing your sleep duration. Your mood is 20% better on days when you get 8+ hours of sleep.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-800 mb-1">Pattern Recognition</h4>
                      <p className="text-sm text-purple-700">
                        You're most productive and happy on Tuesday and Wednesday. Consider scheduling important tasks on these days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coping Strategies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Coping Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">For Stress</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Deep breathing exercises</li>
                    <li>• Progressive muscle relaxation</li>
                    <li>• Take a short walk</li>
                    <li>• Listen to calming music</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">For Low Mood</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Practice gratitude</li>
                    <li>• Connect with friends</li>
                    <li>• Engage in hobbies</li>
                    <li>• Get some sunlight</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">For Anxiety</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Grounding techniques</li>
                    <li>• Mindfulness meditation</li>
                    <li>• Journal your thoughts</li>
                    <li>• Limit caffeine intake</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">For Better Sleep</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Establish a routine</li>
                    <li>• Avoid screens before bed</li>
                    <li>• Create a calm environment</li>
                    <li>• Practice relaxation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Mood Form Modal */}
      {showMoodForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Log Your Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">How are you feeling?</label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
                      <Button
                        key={mood}
                        variant={currentMood === mood ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentMood(mood)}
                      >
                        {mood}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowMoodForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleMoodSubmit(currentMood)}
                    disabled={currentMood === 0}
                    className="flex-1"
                  >
                    Save Entry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
