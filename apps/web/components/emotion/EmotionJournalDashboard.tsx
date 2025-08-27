'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmotionAvatar } from './EmotionAvatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { 
  EmotionalState, 
  EmotionIntensity, 
  JournalEntry, 
  AvatarResponse,
  EmotionProfile,
  EmotionMemoryGraph
} from '@/lib/emotion/types';
import { detectTextEmotion, extractContextTags } from '@/lib/emotion/textEmotionDetector';
import { generateAvatarResponse, updateEmotionProfile, detectEmotionalPatterns } from '@/lib/emotion/empathyEngine';

interface EmotionJournalDashboardProps {
  userId: string;
  className?: string;
}

export const EmotionJournalDashboard: React.FC<EmotionJournalDashboardProps> = ({
  userId,
  className = ''
}) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionalState>('neutral');
  const [selectedIntensity, setSelectedIntensity] = useState<EmotionIntensity>('moderate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarResponse, setAvatarResponse] = useState<AvatarResponse | null>(null);
  const [showAvatar, setShowAvatar] = useState(true);
  
  // Mock user profile and memory (in real app, these would come from API/database)
  const [userProfile, setUserProfile] = useState<EmotionProfile>({
    userId,
    dominantEmotions: ['neutral'],
    journalingStyle: 'brief',
    resilienceScore: 0.5,
    preferredTone: 'validating',
    pacingPreference: 'normal',
    lastInteraction: new Date(),
    totalEntries: 0
  });
  
  const [emotionMemory, setEmotionMemory] = useState<EmotionMemoryGraph>({
    userId,
    milestones: [],
    resilienceScore: 0.5,
    dominantThemes: [],
    lastAvatarTone: 'validating'
  });

  // Emotion options for selection
  const emotionOptions: { emotion: EmotionalState; label: string; emoji: string }[] = [
    { emotion: 'joyful', label: 'Joyful', emoji: '😊' },
    { emotion: 'excited', label: 'Excited', emoji: '🤩' },
    { emotion: 'calm', label: 'Calm', emoji: '😌' },
    { emotion: 'neutral', label: 'Neutral', emoji: '😐' },
    { emotion: 'sad', label: 'Sad', emoji: '😢' },
    { emotion: 'anxious', label: 'Anxious', emoji: '😰' },
    { emotion: 'confused', label: 'Confused', emoji: '😕' },
    { emotion: 'angry', label: 'Angry', emoji: '😠' }
  ];

  const intensityOptions: { intensity: EmotionIntensity; label: string }[] = [
    { intensity: 'low', label: 'Low' },
    { intensity: 'moderate', label: 'Moderate' },
    { intensity: 'high', label: 'High' }
  ];

  // Auto-detect emotion from text
  const handleTextChange = useCallback((text: string) => {
    setCurrentEntry(text);
    
    if (text.length > 10) {
      const detected = detectTextEmotion(text);
      setSelectedEmotion(detected.emotion);
      setSelectedIntensity(detected.intensity);
    }
  }, []);

  // Submit journal entry
  const handleSubmit = async () => {
    if (!currentEntry.trim()) return;

    setIsSubmitting(true);

    try {
      // Create new journal entry
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        userId,
        timestamp: new Date(),
        content: currentEntry,
        emotion: selectedEmotion,
        intensity: selectedIntensity,
        contextTags: extractContextTags(currentEntry),
        privacy: 'private',
        mode: 'text'
      };

      // Generate avatar response
      const response = generateAvatarResponse(
        selectedEmotion,
        selectedIntensity,
        newEntry.contextTags.join(', '),
        userProfile,
        emotionMemory
      );

      newEntry.avatarResponse = response;

      // Update entries
      setEntries(prev => [newEntry, ...prev]);

      // Update user profile
      const updatedProfile = updateEmotionProfile(
        userProfile,
        selectedEmotion,
        selectedIntensity,
        currentEntry.length
      );
      setUserProfile(updatedProfile);

      // Update emotion memory
      const newMilestone = {
        id: Date.now().toString(),
        userId,
        timestamp: new Date(),
        source: 'text' as const,
        emotion: selectedEmotion,
        intensity: selectedIntensity,
        contextTags: newEntry.contextTags,
        text: currentEntry
      };

      const updatedMemory = {
        ...emotionMemory,
        milestones: [...emotionMemory.milestones, newMilestone]
      };

      const memoryWithPatterns = detectEmotionalPatterns(updatedMemory);
      setEmotionMemory(memoryWithPatterns);

      // Set avatar response
      setAvatarResponse(response);

      // Clear form
      setCurrentEntry('');
      setSelectedEmotion('neutral');
      setSelectedIntensity('moderate');

      // Hide avatar response after 5 seconds
      setTimeout(() => setAvatarResponse(null), 5000);

    } catch (error) {
      console.error('Error submitting entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate insights
  const insights = React.useMemo(() => {
    if (entries.length === 0) return null;

    const emotionCounts: Record<EmotionalState, number> = {
      anxious: 0, confused: 0, joyful: 0, angry: 0, sad: 0, excited: 0, calm: 0, neutral: 0
    };
    const recentEntries = entries.slice(0, 7); // Last 7 entries

    recentEntries.forEach(entry => {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    });

    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0];

    const totalWords = recentEntries.reduce((sum, entry) => sum + entry.content.split(' ').length, 0);
    const avgWordsPerEntry = totalWords / recentEntries.length;

    return {
      dominantEmotion: dominantEmotion?.[0] as EmotionalState,
      entryCount: entries.length,
      avgWordsPerEntry: Math.round(avgWordsPerEntry),
      resilienceScore: userProfile.resilienceScore,
      journalingStyle: userProfile.journalingStyle
    };
  }, [entries, userProfile]);

  return (
    <div className={`max-w-6xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Emotional Journal</h1>
        <p className="text-gray-600">Reflect, express, and grow with your Emotion Buddy</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Entry Form & Avatar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Emotion Buddy Avatar */}
          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <EmotionAvatar
                emotion={avatarResponse?.avatarExpression || selectedEmotion}
                intensity={selectedIntensity}
                size="medium"
                isAnimating={true}
              />
            </div>
            
            <AnimatePresence>
              {avatarResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-4 p-4 bg-blue-50 rounded-lg"
                >
                  <p className="text-sm text-gray-700 italic">
                    "{avatarResponse.message}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAvatar(!showAvatar)}
              >
                {showAvatar ? 'Hide' : 'Show'} Buddy
              </Button>
            </div>
          </Card>

          {/* Journal Entry Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">How are you feeling?</h3>
            
            <div className="space-y-4">
              {/* Emotion Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emotion
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {emotionOptions.map(({ emotion, label, emoji }) => (
                    <button
                      key={emotion}
                      onClick={() => setSelectedEmotion(emotion)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedEmotion === emotion
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{emoji}</div>
                      <div className="text-xs text-gray-600">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensity
                </label>
                <div className="flex space-x-2">
                  {intensityOptions.map(({ intensity, label }) => (
                    <button
                      key={intensity}
                      onClick={() => setSelectedIntensity(intensity)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedIntensity === intensity
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Entry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reflection
                </label>
                <Textarea
                  value={currentEntry}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Write about your day, feelings, or anything on your mind..."
                  rows={6}
                  className="w-full"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !currentEntry.trim()}
                className="w-full"
              >
                {isSubmitting ? 'Saving...' : 'Save Reflection'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Timeline & Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Insights Panel */}
          {insights && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Your Insights</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{insights.entryCount}</div>
                  <div className="text-sm text-gray-600">Total Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(insights.resilienceScore * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Resilience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{insights.avgWordsPerEntry}</div>
                  <div className="text-sm text-gray-600">Avg Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 capitalize">
                    {insights.journalingStyle}
                  </div>
                  <div className="text-sm text-gray-600">Style</div>
                </div>
              </div>
            </Card>
          )}

          {/* Journal Timeline */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Reflections</h3>
            
            {entries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No journal entries yet. Start your first reflection above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
                  >
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
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
