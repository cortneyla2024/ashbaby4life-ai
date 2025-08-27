'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  EmotionalState, 
  EmotionIntensity, 
  JournalEntry, 
  EmotionBadge,
  FamilyEmotionSync
} from '@/lib/emotion/types';
import { getUserEarnedBadges } from '@/lib/emotion/badgeSystem';

interface Child {
  id: string;
  name: string;
  age: number;
  avatar?: string;
  currentEmotion?: EmotionalState;
  journalingFrequency: number; // entries per week
  lastEntry?: Date;
  resilienceScore: number;
  earnedBadges: EmotionBadge[];
  privacySettings: {
    journalingEnabled: boolean;
    avatarVisible: boolean;
    familySharing: boolean;
    therapistSharing: boolean;
  };
}

interface GuardianDashboardProps {
  children: Child[];
  className?: string;
}

export const GuardianDashboard: React.FC<GuardianDashboardProps> = ({
  children,
  className = ''
}) => {
  const [selectedChild, setSelectedChild] = useState<string>(children[0]?.id || '');
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'distress' | 'skipped' | 'volatility' | 'achievement';
    childId: string;
    message: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high';
  }>>([]);

  // Mock data for demonstration
  const [familyEmotionSync] = useState<FamilyEmotionSync>({
    familyId: 'family-1',
    members: children.map(child => ({
      userId: child.id,
      role: 'child' as const,
      currentEmotion: child.currentEmotion ? {
        id: Date.now().toString(),
        userId: child.id,
        timestamp: new Date(),
        source: 'text',
        emotion: child.currentEmotion,
        intensity: 'moderate',
        contextTags: []
      } : undefined
    })),
    sharedThemes: ['family', 'school'],
    alignmentScore: 0.75,
    lastSync: new Date()
  });

  // Get selected child
  const getSelectedChild = useCallback(() => {
    return children.find(child => child.id === selectedChild);
  }, [children, selectedChild]);

  // Calculate emotional trends
  const calculateEmotionalTrends = useCallback((childId: string) => {
    // Mock data - in real app, this would come from the database
    const mockEntries: JournalEntry[] = [
      {
        id: '1',
        userId: childId,
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        content: 'I felt really happy today!',
        emotion: 'joyful',
        intensity: 'high',
        contextTags: ['family'],
        privacy: 'family',
        mode: 'text'
      },
      {
        id: '2',
        userId: childId,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        content: 'School was a bit confusing today.',
        emotion: 'confused',
        intensity: 'moderate',
        contextTags: ['school'],
        privacy: 'family',
        mode: 'text'
      },
      {
        id: '3',
        userId: childId,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        content: 'I was worried about the test.',
        emotion: 'anxious',
        intensity: 'high',
        contextTags: ['school'],
        privacy: 'family',
        mode: 'text'
      },
      {
        id: '4',
        userId: childId,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        content: 'I feel much better now!',
        emotion: 'calm',
        intensity: 'moderate',
        contextTags: ['family'],
        privacy: 'family',
        mode: 'text'
      }
    ];

    return mockEntries;
  }, []);

  // Generate insights
  const generateInsights = useCallback((child: Child) => {
    const entries = calculateEmotionalTrends(child.id);
    const emotionCounts = entries.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {} as Record<EmotionalState, number>);

    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as EmotionalState;

    const hasRecentDistress = entries.some(entry => 
      ['anxious', 'sad', 'angry'].includes(entry.emotion) &&
      new Date().getTime() - entry.timestamp.getTime() < 3 * 24 * 60 * 60 * 1000
    );

    const isImproving = entries.length >= 2 && 
      entries[0].emotion !== 'anxious' && 
      entries[entries.length - 1].emotion === 'anxious';

    return {
      dominantEmotion,
      hasRecentDistress,
      isImproving,
      journalingConsistency: child.journalingFrequency >= 3 ? 'good' : 'needs_improvement',
      resilienceTrend: child.resilienceScore > 0.7 ? 'improving' : 'stable'
    };
  }, [calculateEmotionalTrends]);

  // Handle privacy setting changes
  const handlePrivacyChange = useCallback((childId: string, setting: keyof Child['privacySettings'], value: boolean) => {
    // In real app, this would update the database
    console.log(`Updating privacy setting for child ${childId}: ${setting} = ${value}`);
  }, []);

  // Generate prompt suggestions
  const generatePromptSuggestions = useCallback((child: Child) => {
    const insights = generateInsights(child);
    const suggestions = [];

    if (insights.hasRecentDistress) {
      suggestions.push({
        type: 'support',
        prompt: "How are you feeling about what happened recently?",
        context: 'Recent distress detected'
      });
    }

    if (insights.journalingConsistency === 'needs_improvement') {
      suggestions.push({
        type: 'encouragement',
        prompt: "What's one thing that made you smile today?",
        context: 'Encouraging regular journaling'
      });
    }

    if (child.earnedBadges.length > 0) {
      suggestions.push({
        type: 'celebration',
        prompt: "Tell me about a time you felt really proud of yourself!",
        context: 'Celebrating achievements'
      });
    }

    return suggestions;
  }, [generateInsights]);

  const selectedChildData = getSelectedChild();

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Guardian Dashboard</h1>
        <p className="text-gray-600">Monitor and support your family's emotional wellness journey</p>
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <Card className="p-6 border-l-4 border-red-500">
          <h3 className="text-lg font-semibold mb-4 text-red-700">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="font-medium text-red-800">{alert.message}</div>
                  <div className="text-sm text-red-600">
                    {children.find(c => c.id === alert.childId)?.name} • {alert.timestamp.toLocaleDateString()}
                  </div>
                </div>
                <Badge variant={alert.severity === 'high' ? 'secondary' : 'outline'} className="text-red-700">
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Child Selection & Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Child Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Family Members</h3>
            <div className="space-y-3">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedChild === child.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {child.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{child.name}</div>
                      <div className="text-sm text-gray-500">Age {child.age}</div>
                    </div>
                    {child.currentEmotion && (
                      <Badge variant="secondary" className="capitalize">
                        {child.currentEmotion}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Family Emotion Sync */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Family Emotion Sync</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Alignment Score:</span>
                <Badge variant={familyEmotionSync.alignmentScore > 0.7 ? 'secondary' : 'outline'}>
                  {Math.round(familyEmotionSync.alignmentScore * 100)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Sync:</span>
                <span className="text-sm text-gray-500">
                  {familyEmotionSync.lastSync.toLocaleTimeString()}
                </span>
              </div>
              {familyEmotionSync.sharedThemes.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Shared Themes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {familyEmotionSync.sharedThemes.map((theme) => (
                      <Badge key={theme} variant="outline" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Child Details */}
        <div className="lg:col-span-3">
          {selectedChildData ? (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Emotional Trends</TabsTrigger>
                <TabsTrigger value="journaling">Journaling</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Child Overview */}
                <Card className="p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-xl">
                        {selectedChildData.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedChildData.name}</h2>
                      <p className="text-gray-600">Age {selectedChildData.age}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedChildData.journalingFrequency}</div>
                      <div className="text-sm text-gray-600">Entries/Week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(selectedChildData.resilienceScore * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Resilience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedChildData.earnedBadges.length}</div>
                      <div className="text-sm text-gray-600">Badges Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedChildData.lastEntry ? 
                          Math.floor((new Date().getTime() - selectedChildData.lastEntry.getTime()) / (1000 * 60 * 60 * 24))
                          : 'N/A'
                        }
                      </div>
                      <div className="text-sm text-gray-600">Days Since Last Entry</div>
                    </div>
                  </div>
                </Card>

                {/* Insights */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Insights</h3>
                  {(() => {
                    const insights = generateInsights(selectedChildData);
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <div className="font-medium">Dominant Emotion</div>
                            <div className="text-sm text-gray-600">Most frequent emotional state</div>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {insights.dominantEmotion || 'neutral'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <div className="font-medium">Journaling Consistency</div>
                            <div className="text-sm text-gray-600">Regular reflection habits</div>
                          </div>
                          <Badge variant={insights.journalingConsistency === 'good' ? 'secondary' : 'outline'}>
                            {insights.journalingConsistency === 'good' ? 'Good' : 'Needs Improvement'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div>
                            <div className="font-medium">Resilience Trend</div>
                            <div className="text-sm text-gray-600">Emotional recovery patterns</div>
                          </div>
                          <Badge variant="secondary">
                            {insights.resilienceTrend === 'improving' ? 'Improving' : 'Stable'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })()}
                </Card>

                {/* Prompt Suggestions */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Suggested Prompts</h3>
                  {(() => {
                    const suggestions = generatePromptSuggestions(selectedChildData);
                    return (
                      <div className="space-y-3">
                        {suggestions.map((suggestion, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{suggestion.prompt}</div>
                                <div className="text-sm text-gray-600 mt-1">{suggestion.context}</div>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {suggestion.type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {suggestions.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            <p>No specific suggestions at this time.</p>
                            <p className="text-sm">Continue encouraging regular journaling!</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                {/* Emotional Trends Chart */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Emotional Trends</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Emotional trends visualization would go here</p>
                  </div>
                </Card>

                {/* Recent Entries */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Journal Entries</h3>
                  {(() => {
                    const entries = calculateEmotionalTrends(selectedChildData.id);
                    return (
                      <div className="space-y-4">
                        {entries.map((entry) => (
                          <div key={entry.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="capitalize">
                                  {entry.emotion}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {entry.intensity}
                                </Badge>
                              </div>
                              <span className="text-sm text-gray-500">
                                {entry.timestamp.toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{entry.content}</p>
                            {entry.contextTags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {entry.contextTags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </Card>
              </TabsContent>

              <TabsContent value="journaling" className="space-y-6">
                {/* Journaling Statistics */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Journaling Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedChildData.journalingFrequency}</div>
                      <div className="text-sm text-gray-600">Weekly Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedChildData.lastEntry ? 'Yes' : 'No'}
                      </div>
                      <div className="text-sm text-gray-600">Recent Activity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">85%</div>
                      <div className="text-sm text-gray-600">Completion Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">12</div>
                      <div className="text-sm text-gray-600">Total Entries</div>
                    </div>
                  </div>
                </Card>

                {/* Earned Badges */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Earned Badges</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedChildData.earnedBadges.map((badge) => (
                      <div key={badge.id} className="p-4 border rounded-lg text-center">
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <div className="font-medium">{badge.name}</div>
                        <div className="text-sm text-gray-600">{badge.description}</div>
                      </div>
                    ))}
                    {selectedChildData.earnedBadges.length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        <p>No badges earned yet.</p>
                        <p className="text-sm">Encourage regular journaling to earn badges!</p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                {/* Privacy Settings */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Privacy & Consent Settings</h3>
                  <div className="space-y-4">
                    {Object.entries(selectedChildData.privacySettings).map(([setting, value]) => (
                      <div key={setting} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium capitalize">
                            {setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </div>
                          <div className="text-sm text-gray-600">
                            {setting === 'journalingEnabled' && 'Allow journaling activities'}
                            {setting === 'avatarVisible' && 'Show emotion avatar responses'}
                            {setting === 'familySharing' && 'Share entries with family members'}
                            {setting === 'therapistSharing' && 'Share entries with therapists'}
                          </div>
                        </div>
                        <Button
                          variant={value ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => handlePrivacyChange(selectedChildData.id, setting as keyof Child['privacySettings'], !value)}
                        >
                          {value ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Guardian Controls */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Guardian Controls</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Daily Journaling Reminders</div>
                        <div className="text-sm text-gray-600">Send gentle reminders to journal</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Emotion Alerts</div>
                        <div className="text-sm text-gray-600">Get notified of significant emotional changes</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Therapist Access</div>
                        <div className="text-sm text-gray-600">Manage therapist viewing permissions</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="p-6">
              <div className="text-center py-8 text-gray-500">
                <p>Select a family member to view their details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
