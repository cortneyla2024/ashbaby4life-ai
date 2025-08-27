"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

export interface Client {
  id: string;
  name: string;
  age: number;
  guardianName: string;
  guardianEmail: string;
  startDate: Date;
  lastSession: Date;
  nextSession: Date;
  emotionalSummary: EmotionalSummary;
  journalingStats: JournalingStats;
  badgeProgress: BadgeProgress;
  riskLevel: 'low' | 'medium' | 'high';
  notes: string;
}

export interface EmotionalSummary {
  dominantEmotions: string[];
  emotionalTrend: 'improving' | 'stable' | 'declining';
  recentTriggers: string[];
  copingStrategies: string[];
  resilienceScore: number;
  lastUpdated: Date;
}

export interface JournalingStats {
  totalEntries: number;
  averageFrequency: number; // entries per week
  lastEntry: Date;
  emotionalRange: string[];
  commonThemes: string[];
  engagementScore: number;
}

export interface BadgeProgress {
  totalBadges: number;
  recentBadges: string[];
  progressAreas: string[];
  achievements: string[];
}

export interface SessionPrep {
  id: string;
  clientId: string;
  sessionDate: Date;
  insights: string[];
  suggestedTopics: string[];
  emotionalState: string;
  progressNotes: string;
  goals: string[];
  recommendations: string[];
  generatedAt: Date;
}

export interface SessionReflection {
  id: string;
  clientId: string;
  sessionDate: Date;
  topics: string[];
  emotionalState: string;
  progress: string;
  challenges: string[];
  nextSteps: string[];
  clientFeedback: string;
  therapistNotes: string;
  createdAt: Date;
}

export interface EmotionalArc {
  id: string;
  clientId: string;
  startDate: Date;
  endDate: Date;
  dataPoints: EmotionalDataPoint[];
  trends: string[];
  milestones: string[];
  recommendations: string[];
}

export interface EmotionalDataPoint {
  date: Date;
  emotion: string;
  intensity: number;
  context: string;
  source: 'journal' | 'session' | 'assessment';
}

export const TherapistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sessionPrep, setSessionPrep] = useState<SessionPrep | null>(null);
  const [emotionalArc, setEmotionalArc] = useState<EmotionalArc | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      // Simulate loading clients
      const mockClients: Client[] = [
        {
          id: 'client-1',
          name: 'Alex Johnson',
          age: 12,
          guardianName: 'Sarah Johnson',
          guardianEmail: 'sarah.johnson@email.com',
          startDate: new Date('2024-01-15'),
          lastSession: new Date('2024-03-20'),
          nextSession: new Date('2024-03-27'),
          emotionalSummary: {
            dominantEmotions: ['anxious', 'confused'],
            emotionalTrend: 'improving',
            recentTriggers: ['school tests', 'social situations'],
            copingStrategies: ['deep breathing', 'journaling'],
            resilienceScore: 0.7,
            lastUpdated: new Date()
          },
          journalingStats: {
            totalEntries: 45,
            averageFrequency: 3.2,
            lastEntry: new Date('2024-03-22'),
            emotionalRange: ['anxious', 'calm', 'joyful'],
            commonThemes: ['school', 'friends', 'family'],
            engagementScore: 0.8
          },
          badgeProgress: {
            totalBadges: 8,
            recentBadges: ['Courage Explorer', 'Emotion Detective'],
            progressAreas: ['anxiety management', 'social confidence'],
            achievements: ['Consistent journaling', 'Improved coping skills']
          },
          riskLevel: 'low',
          notes: 'Making good progress with anxiety management. Continue with current approach.'
        },
        {
          id: 'client-2',
          name: 'Maya Chen',
          age: 14,
          guardianName: 'David Chen',
          guardianEmail: 'david.chen@email.com',
          startDate: new Date('2024-02-01'),
          lastSession: new Date('2024-03-18'),
          nextSession: new Date('2024-03-25'),
          emotionalSummary: {
            dominantEmotions: ['sad', 'withdrawn'],
            emotionalTrend: 'stable',
            recentTriggers: ['family conflicts', 'academic pressure'],
            copingStrategies: ['art therapy', 'mindfulness'],
            resilienceScore: 0.5,
            lastUpdated: new Date()
          },
          journalingStats: {
            totalEntries: 28,
            averageFrequency: 2.1,
            lastEntry: new Date('2024-03-21'),
            emotionalRange: ['sad', 'neutral', 'hopeful'],
            commonThemes: ['family', 'school', 'self-esteem'],
            engagementScore: 0.6
          },
          badgeProgress: {
            totalBadges: 5,
            recentBadges: ['Resilience Builder'],
            progressAreas: ['emotional expression', 'self-compassion'],
            achievements: ['Started art therapy', 'Improved family communication']
          },
          riskLevel: 'medium',
          notes: 'Showing signs of improvement but needs continued support with family dynamics.'
        }
      ];
      setClients(mockClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSessionPrep = async (clientId: string) => {
    setIsLoading(true);
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      // Simulate AI-generated session prep
      const prep: SessionPrep = {
        id: `prep-${Date.now()}`,
        clientId,
        sessionDate: client.nextSession,
        insights: [
          'Client has shown 30% improvement in anxiety management over the past month',
          'Journaling frequency has increased from 2.1 to 3.2 entries per week',
          'Recent badge achievements indicate growing confidence in emotional awareness',
          'Family dynamics remain a key area for continued work'
        ],
        suggestedTopics: [
          'Review progress with anxiety coping strategies',
          'Discuss recent journaling insights and emotional patterns',
          'Explore family communication improvements',
          'Set goals for continued emotional growth'
        ],
        emotionalState: 'Improving with some challenges in family relationships',
        progressNotes: 'Significant progress in individual coping skills, family work ongoing',
        goals: [
          'Maintain consistent journaling practice',
          'Continue developing anxiety management techniques',
          'Improve family communication patterns',
          'Build self-compassion and emotional resilience'
        ],
        recommendations: [
          'Continue current therapeutic approach',
          'Consider family therapy sessions',
          'Encourage continued use of art therapy',
          'Monitor for any signs of regression'
        ],
        generatedAt: new Date()
      };

      setSessionPrep(prep);
    } catch (error) {
      console.error('Error generating session prep:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmotionalArc = async (clientId: string) => {
    setIsLoading(true);
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      // Simulate emotional arc data
      const arc: EmotionalArc = {
        id: `arc-${Date.now()}`,
        clientId,
        startDate: client.startDate,
        endDate: new Date(),
        dataPoints: [
          { date: new Date('2024-01-15'), emotion: 'anxious', intensity: 8, context: 'Initial assessment', source: 'assessment' },
          { date: new Date('2024-02-01'), emotion: 'anxious', intensity: 7, context: 'School stress', source: 'journal' },
          { date: new Date('2024-02-15'), emotion: 'calm', intensity: 4, context: 'Coping strategies working', source: 'session' },
          { date: new Date('2024-03-01'), emotion: 'joyful', intensity: 6, context: 'Achievement in school', source: 'journal' },
          { date: new Date('2024-03-15'), emotion: 'anxious', intensity: 5, context: 'Test preparation', source: 'journal' },
          { date: new Date('2024-03-22'), emotion: 'calm', intensity: 3, context: 'Successful test completion', source: 'journal' }
        ],
        trends: [
          'Overall decrease in anxiety intensity over time',
          'Increased use of coping strategies',
          'More frequent positive emotional states',
          'Improved resilience in challenging situations'
        ],
        milestones: [
          'Started consistent journaling practice',
          'Earned first emotional awareness badge',
          'Successfully managed test anxiety',
          'Improved family communication'
        ],
        recommendations: [
          'Continue current therapeutic approach',
          'Focus on maintaining progress during transitions',
          'Encourage continued journaling practice',
          'Monitor for any regression patterns'
        ]
      };

      setEmotionalArc(arc);
    } catch (error) {
      console.error('Error generating emotional arc:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'stable': return 'text-yellow-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Therapist Dashboard
        </h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive client insights and session preparation tools
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">👥 Client Overview</TabsTrigger>
          <TabsTrigger value="session">📋 Session Prep</TabsTrigger>
          <TabsTrigger value="progress">📈 Progress Tracking</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clients.map((client) => (
              <Card key={client.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedClient(client)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{client.name}</CardTitle>
                      <CardDescription>
                        Age: {client.age} • Guardian: {client.guardianName}
                      </CardDescription>
                    </div>
                    <Badge className={getRiskLevelColor(client.riskLevel)}>
                      {client.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Session</p>
                      <p className="text-sm">{client.lastSession.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Next Session</p>
                      <p className="text-sm">{client.nextSession.toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Emotional Trend</p>
                    <p className={cn("text-sm font-medium", getTrendColor(client.emotionalSummary.emotionalTrend))}>
                      {client.emotionalSummary.emotionalTrend.toUpperCase()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resilience Score</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${client.emotionalSummary.resilienceScore * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(client.emotionalSummary.resilienceScore * 100).toFixed(0)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recent Badges</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.badgeProgress.recentBadges.slice(0, 2).map((badge) => (
                        <Badge key={badge} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="session" className="space-y-6">
          {selectedClient ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Session Preparation for {selectedClient.name}</CardTitle>
                  <CardDescription>
                    AI-generated insights and recommendations for upcoming session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => generateSessionPrep(selectedClient.id)}
                    disabled={isLoading}
                    className="mb-4"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Generate Session Prep'}
                  </Button>

                  {sessionPrep && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-2">Key Insights</h3>
                          <ul className="space-y-2">
                            {sessionPrep.insights.map((insight, index) => (
                              <li key={index} className="text-sm bg-blue-50 p-2 rounded">
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Suggested Topics</h3>
                          <ul className="space-y-2">
                            {sessionPrep.suggestedTopics.map((topic, index) => (
                              <li key={index} className="text-sm bg-green-50 p-2 rounded">
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Goals for This Session</h3>
                        <ul className="space-y-1">
                          {sessionPrep.goals.map((goal, index) => (
                            <li key={index} className="text-sm">• {goal}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Recommendations</h3>
                        <ul className="space-y-1">
                          {sessionPrep.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Select a client to generate session preparation</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {selectedClient ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Tracking for {selectedClient.name}</CardTitle>
                  <CardDescription>
                    Detailed progress analysis and emotional trajectory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => generateEmotionalArc(selectedClient.id)}
                    disabled={isLoading}
                    className="mb-4"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Generate Emotional Arc'}
                  </Button>

                  {emotionalArc && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-2">Key Trends</h3>
                          <ul className="space-y-2">
                            {emotionalArc.trends.map((trend, index) => (
                              <li key={index} className="text-sm bg-purple-50 p-2 rounded">
                                {trend}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Achievement Milestones</h3>
                          <ul className="space-y-2">
                            {emotionalArc.milestones.map((milestone, index) => (
                              <li key={index} className="text-sm bg-yellow-50 p-2 rounded">
                                {milestone}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Emotional Data Points</h3>
                        <div className="space-y-2">
                          {emotionalArc.dataPoints.map((point, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                              <span className="text-sm">{point.date.toLocaleDateString()}</span>
                              <span className="text-sm font-medium">{point.emotion}</span>
                              <span className="text-sm">Intensity: {point.intensity}/10</span>
                              <span className="text-sm text-muted-foreground">{point.context}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Select a client to view progress tracking</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{clients.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {clients.filter(c => c.nextSession > new Date()).length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>High Risk Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {clients.filter(c => c.riskLevel === 'high').length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Client Engagement Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="flex justify-between items-center">
                    <span className="font-medium">{client.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Journaling: {client.journalingStats.averageFrequency.toFixed(1)}/week
                      </span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${client.journalingStats.engagementScore * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {(client.journalingStats.engagementScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
