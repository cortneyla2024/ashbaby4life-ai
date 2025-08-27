'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EmotionJournalDashboard } from '@/components/emotion/EmotionJournalDashboard';
import { FamilyJournalSpace } from '@/components/family/FamilyJournalSpace';
import { GuardianDashboard } from '@/components/family/GuardianDashboard';
import { TherapistDashboard } from '@/components/therapist/TherapistDashboard';
import { CreativeCelebrationModule } from '@/components/creative/CreativeCelebrationModule';
import { EmotionAvatar } from '@/components/emotion/EmotionAvatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { emotionBadges } from '@/lib/emotion/badgeSystem';

// Mock data for demonstration
const mockFamilyMembers = [
  { id: 'parent-1', name: 'Sarah', role: 'parent' as const, avatar: '👩', currentEmotion: 'joyful' as const },
  { id: 'child-1', name: 'Emma', role: 'child' as const, avatar: '👧', currentEmotion: 'excited' as const, age: 8 },
  { id: 'child-2', name: 'Liam', role: 'child' as const, avatar: '👦', currentEmotion: 'calm' as const, age: 12 }
];

const mockChildren = [
  {
    id: 'child-1',
    name: 'Emma',
    age: 8,
    avatar: '👧',
    currentEmotion: 'excited' as const,
    journalingFrequency: 4,
    lastEntry: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    resilienceScore: 0.85,
    earnedBadges: [emotionBadges[0], emotionBadges[2]], // Expressive Star, Calm Navigator
    privacySettings: {
      journalingEnabled: true,
      avatarVisible: true,
      familySharing: true,
      therapistSharing: false
    }
  },
  {
    id: 'child-2',
    name: 'Liam',
    age: 12,
    avatar: '👦',
    currentEmotion: 'calm' as const,
    journalingFrequency: 3,
    lastEntry: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    resilienceScore: 0.72,
    earnedBadges: [emotionBadges[1]], // Honest Heart
    privacySettings: {
      journalingEnabled: true,
      avatarVisible: true,
      familySharing: true,
      therapistSharing: true
    }
  }
];

const mockClients = [
  {
    id: 'client-1',
    name: 'Emma',
    age: 8,
    avatar: '👧',
    currentEmotion: 'excited' as const,
    lastSession: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    nextSession: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    journalingFrequency: 4,
    resilienceScore: 0.85,
    earnedBadges: [emotionBadges[0], emotionBadges[2]],
    emotionalSummary: 'Emma has shown remarkable progress in managing anxiety and expressing her emotions through journaling.',
    consentLevel: 'full' as const,
    therapistNotes: 'Emma is responding well to the journaling intervention. Her anxiety levels have decreased significantly.',
    sessionHistory: [
      {
        id: 'session-1',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        duration: 45,
        topics: ['anxiety management', 'journaling practice'],
        notes: 'Discussed anxiety triggers and practiced journaling techniques.'
      },
      {
        id: 'session-2',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        duration: 50,
        topics: ['emotional expression', 'family support'],
        notes: 'Explored ways to express emotions and discussed family support systems.'
      }
    ]
  },
  {
    id: 'client-2',
    name: 'Liam',
    age: 12,
    avatar: '👦',
    currentEmotion: 'calm' as const,
    lastSession: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    nextSession: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    journalingFrequency: 3,
    resilienceScore: 0.72,
    earnedBadges: [emotionBadges[1]],
    emotionalSummary: 'Liam is developing better emotional regulation skills and showing increased resilience.',
    consentLevel: 'full' as const,
    therapistNotes: 'Liam is making steady progress. His journaling consistency has improved.',
    sessionHistory: [
      {
        id: 'session-1',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        duration: 40,
        topics: ['emotional regulation', 'stress management'],
        notes: 'Worked on stress management techniques and emotional regulation strategies.'
      }
    ]
  }
];

export default function CareConnectDemoPage() {
  const [activeTab, setActiveTab] = useState('emotion-buddy');

  const tabs = [
    { id: 'emotion-buddy', label: 'Emotion Buddy', icon: '🧠' },
    { id: 'family-journaling', label: 'Family Journaling', icon: '👨‍👩‍👧‍👦' },
    { id: 'guardian-dashboard', label: 'Guardian Dashboard', icon: '🛡️' },
    { id: 'therapist-dashboard', label: 'Therapist Dashboard', icon: '👩‍⚕️' },
    { id: 'creative-celebration', label: 'Creative Celebration', icon: '🎨' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CC</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CareConnect v5.0</h1>
                <p className="text-sm text-gray-600">Emotionally Intelligent Family Wellness Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Demo Mode</Badge>
              <div className="flex items-center space-x-2">
                <EmotionAvatar
                  emotion="joyful"
                  intensity="moderate"
                  size="small"
                  isAnimating={true}
                />
                <span className="text-sm text-gray-600">Emotion Buddy Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-16">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center space-y-1 p-2"
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-xs">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="emotion-buddy" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Emotion Buddy System</h2>
                <p className="text-gray-600">Your AI companion for emotional wellness and growth</p>
              </div>
              <EmotionJournalDashboard userId="demo-user" />
            </motion.div>
          </TabsContent>

          <TabsContent value="family-journaling" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FamilyJournalSpace
                familyId="demo-family"
                members={mockFamilyMembers}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="guardian-dashboard" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GuardianDashboard children={mockChildren} />
            </motion.div>
          </TabsContent>

          <TabsContent value="therapist-dashboard" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TherapistDashboard clients={mockClients} />
            </motion.div>
          </TabsContent>

          <TabsContent value="creative-celebration" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CreativeCelebrationModule
                familyId="demo-family"
                members={mockFamilyMembers}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Feature Overview */}
      <div className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">CareConnect v5.0 Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A comprehensive platform that combines emotional intelligence, family connection, 
              professional oversight, and creative expression for holistic wellness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Emotion Buddy */}
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-2">Emotion Buddy</h3>
              <p className="text-gray-600 mb-4">
                AI-powered emotional companion with adaptive responses and voice modulation
              </p>
              <div className="space-y-2">
                <Badge variant="outline">Text & Voice Detection</Badge>
                <Badge variant="outline">Adaptive Responses</Badge>
                <Badge variant="outline">Emotion Badges</Badge>
              </div>
            </Card>

            {/* Family Systems */}
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-semibold mb-2">Family Journaling</h3>
              <p className="text-gray-600 mb-4">
                Shared emotional space with privacy controls and family sync
              </p>
              <div className="space-y-2">
                <Badge variant="outline">Shared Entries</Badge>
                <Badge variant="outline">Privacy Controls</Badge>
                <Badge variant="outline">Emotion Sync</Badge>
              </div>
            </Card>

            {/* Guardian Dashboard */}
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">Guardian Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive oversight tools for family emotional wellness
              </p>
              <div className="space-y-2">
                <Badge variant="outline">Progress Tracking</Badge>
                <Badge variant="outline">Privacy Management</Badge>
                <Badge variant="outline">Alert System</Badge>
              </div>
            </Card>

            {/* Therapist Dashboard */}
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">👩‍⚕️</div>
              <h3 className="text-xl font-semibold mb-2">Therapist Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Professional tools for client management and session preparation
              </p>
              <div className="space-y-2">
                <Badge variant="outline">Session Prep AI</Badge>
                <Badge variant="outline">Progress Analytics</Badge>
                <Badge variant="outline">Client Notes</Badge>
              </div>
            </Card>
          </div>

          {/* Additional Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-2xl">🎨</div>
                <h3 className="text-lg font-semibold">Creative Celebration</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Collaborative art, storytelling, and voice projects for emotional expression
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Art Canvas</Badge>
                <Badge variant="outline">Story Builder</Badge>
                <Badge variant="outline">Voice Recording</Badge>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-2xl">🔐</div>
                <h3 className="text-lg font-semibold">Privacy & Security</h3>
              </div>
              <p className="text-gray-600 mb-4">
                End-to-end encryption, consent management, and role-based access
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Encryption</Badge>
                <Badge variant="outline">Consent Controls</Badge>
                <Badge variant="outline">Role-Based Access</Badge>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-2xl">🤖</div>
                <h3 className="text-lg font-semibold">AI Intelligence</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Advanced emotion detection, pattern recognition, and adaptive responses
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Emotion Detection</Badge>
                <Badge variant="outline">Pattern Recognition</Badge>
                <Badge variant="outline">Adaptive AI</Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">CareConnect v5.0</h3>
            <p className="text-gray-400 mb-4">
              Empowering families through emotional intelligence and compassionate technology
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-400">
              <span>Privacy First</span>
              <span>•</span>
              <span>Family Centered</span>
              <span>•</span>
              <span>Professionally Supported</span>
              <span>•</span>
              <span>AI Enhanced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
