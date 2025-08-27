'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmotionAvatar } from '@/components/emotion/EmotionAvatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  EmotionalState, 
  EmotionIntensity, 
  JournalEntry, 
  AvatarResponse,
  FamilyEmotionSync
} from '@/lib/emotion/types';
import { detectTextEmotion, extractContextTags } from '@/lib/emotion/textEmotionDetector';
import { generateAvatarResponse } from '@/lib/emotion/empathyEngine';

interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child' | 'guardian';
  avatar?: string;
  currentEmotion?: EmotionalState;
}

interface FamilyJournalSpaceProps {
  familyId: string;
  members: FamilyMember[];
  className?: string;
}

export const FamilyJournalSpace: React.FC<FamilyJournalSpaceProps> = ({
  familyId,
  members,
  className = ''
}) => {
  const [sharedEntries, setSharedEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionalState>('neutral');
  const [selectedIntensity, setSelectedIntensity] = useState<EmotionIntensity>('moderate');
  const [selectedMember, setSelectedMember] = useState<string>(members[0]?.id || '');
  const [privacyLevel, setPrivacyLevel] = useState<'private' | 'guardian' | 'family'>('family');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarResponse, setAvatarResponse] = useState<AvatarResponse | null>(null);
  const [familyEmotionSync, setFamilyEmotionSync] = useState<FamilyEmotionSync>({
    familyId,
    members: members.map(m => ({
      userId: m.id,
      role: m.role,
      currentEmotion: m.currentEmotion ? {
        id: Date.now().toString(),
        userId: m.id,
        timestamp: new Date(),
        source: 'text',
        emotion: m.currentEmotion,
        intensity: 'moderate',
        contextTags: []
      } : undefined
    })),
    sharedThemes: [],
    alignmentScore: 0.5,
    lastSync: new Date()
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

  // Submit family journal entry
  const handleSubmit = async () => {
    if (!currentEntry.trim() || !selectedMember) return;

    setIsSubmitting(true);

    try {
      const member = members.find(m => m.id === selectedMember);
      if (!member) return;

      // Create new journal entry
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        userId: selectedMember,
        timestamp: new Date(),
        content: currentEntry,
        emotion: selectedEmotion,
        intensity: selectedIntensity,
        contextTags: extractContextTags(currentEntry),
        privacy: privacyLevel,
        mode: 'text'
      };

      // Generate avatar response
      const response = generateAvatarResponse(
        selectedEmotion,
        selectedIntensity,
        newEntry.contextTags.join(', '),
        undefined,
        undefined
      );

      newEntry.avatarResponse = response;

      // Update shared entries
      setSharedEntries(prev => [newEntry, ...prev]);

      // Update family emotion sync
      const updatedSync = {
        ...familyEmotionSync,
        members: familyEmotionSync.members.map(m => 
          m.userId === selectedMember 
            ? { ...m, currentEmotion: {
                id: Date.now().toString(),
                userId: selectedMember,
                timestamp: new Date(),
                source: 'text',
                emotion: selectedEmotion,
                intensity: selectedIntensity,
                contextTags: newEntry.contextTags
              }}
            : m
        ),
        lastSync: new Date()
      };

      // Calculate alignment score based on shared emotions
      const recentEmotions = updatedSync.members
        .filter(m => m.currentEmotion)
        .map(m => m.currentEmotion!.emotion);
      
      const emotionCounts = recentEmotions.reduce((acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const maxCount = Math.max(...Object.values(emotionCounts));
      const alignmentScore = maxCount / recentEmotions.length;
      
      updatedSync.alignmentScore = alignmentScore;

      // Extract shared themes
      const allTags = newEntry.contextTags;
      updatedSync.sharedThemes = [...new Set(allTags)];

      setFamilyEmotionSync(updatedSync);

      // Set avatar response
      setAvatarResponse(response);

      // Clear form
      setCurrentEntry('');
      setSelectedEmotion('neutral');
      setSelectedIntensity('moderate');

      // Hide avatar response after 5 seconds
      setTimeout(() => setAvatarResponse(null), 5000);

    } catch (error) {
      console.error('Error submitting family entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get member by ID
  const getMemberById = (id: string) => members.find(m => m.id === id);

  return (
    <div className={`max-w-6xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Family Journal Space</h1>
        <p className="text-gray-600">Share, connect, and grow together as a family</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Entry Form & Avatar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Family Emotion Sync Overview */}
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

          {/* Family Avatar Response */}
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
          </Card>

          {/* Family Journal Entry Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Share Your Thoughts</h3>
            
            <div className="space-y-4">
              {/* Family Member Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who is writing?
                </label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Privacy Level Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy Level
                </label>
                <div className="flex space-x-2">
                  {[
                    { level: 'private' as const, label: 'Private', icon: '🔒' },
                    { level: 'guardian' as const, label: 'Guardian', icon: '👥' },
                    { level: 'family' as const, label: 'Family', icon: '🏠' }
                  ].map(({ level, label, icon }) => (
                    <button
                      key={level}
                      onClick={() => setPrivacyLevel(level)}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        privacyLevel === level
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{icon}</div>
                      <div className="text-xs text-gray-600">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

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
                  placeholder="Share your thoughts, feelings, or experiences with your family..."
                  rows={6}
                  className="w-full"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !currentEntry.trim() || !selectedMember}
                className="w-full"
              >
                {isSubmitting ? 'Sharing...' : 'Share with Family'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Timeline & Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Family Members Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Family Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => {
                const memberSync = familyEmotionSync.members.find(m => m.userId === member.id);
                return (
                  <div key={member.id} className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{member.role}</div>
                      </div>
                    </div>
                    {memberSync?.currentEmotion && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="capitalize">
                          {memberSync.currentEmotion.emotion}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {memberSync.currentEmotion.intensity}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Family Journal Timeline */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Family Journal Timeline</h3>
            
            {sharedEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No shared entries yet. Start your first family reflection above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sharedEntries.map((entry) => {
                  const member = getMemberById(entry.userId);
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {member?.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{member?.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{member?.role}</div>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {entry.emotion}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {entry.intensity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {entry.privacy}
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
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
