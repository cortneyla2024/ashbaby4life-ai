'use client';

import React, { useState } from 'react';
import { EmotionJournalDashboard } from '@/components/emotion/EmotionJournalDashboard';
import { EmotionAvatar } from '@/components/emotion/EmotionAvatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function EmotionBuddyPage() {
  const [currentEmotion, setCurrentEmotion] = useState<'joyful' | 'sad' | 'anxious' | 'excited' | 'calm' | 'neutral'>('neutral');
  const [currentIntensity, setCurrentIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <EmotionAvatar
                  emotion={currentEmotion}
                  intensity={currentIntensity}
                  size="small"
                  isAnimating={true}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Emotion Buddy</h1>
                <p className="text-gray-600">Your AI companion for emotional wellness</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Live
              </Badge>
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Emotional Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet your Emotion Buddy, an AI companion designed to help you reflect, 
            understand, and grow through your emotional experiences. Start journaling 
            and watch your emotional intelligence flourish.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 text-center h-full">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-lg font-semibold mb-2">Emotional Intelligence</h3>
              <p className="text-gray-600">
                Advanced AI that understands and responds to your emotional states 
                with empathy and care.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 text-center h-full">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-lg font-semibold mb-2">Growth Tracking</h3>
              <p className="text-gray-600">
                Visualize your emotional patterns, resilience growth, and personal 
                development over time.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 text-center h-full">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Achievement System</h3>
              <p className="text-gray-600">
                Earn badges for emotional milestones, consistent journaling, and 
                personal growth achievements.
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Interactive Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <Card className="p-8">
            <h3 className="text-2xl font-bold text-center mb-6">
              Try the Emotion Buddy
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose an Emotion
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { emotion: 'joyful', emoji: '😊', label: 'Joyful' },
                      { emotion: 'sad', emoji: '😢', label: 'Sad' },
                      { emotion: 'anxious', emoji: '😰', label: 'Anxious' },
                      { emotion: 'excited', emoji: '🤩', label: 'Excited' },
                      { emotion: 'calm', emoji: '😌', label: 'Calm' },
                      { emotion: 'neutral', emoji: '😐', label: 'Neutral' }
                    ].map(({ emotion, emoji, label }) => (
                      <button
                        key={emotion}
                        onClick={() => setCurrentEmotion(emotion as any)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          currentEmotion === emotion
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Intensity Level
                  </label>
                  <div className="flex space-x-3">
                    {[
                      { intensity: 'low', label: 'Low' },
                      { intensity: 'moderate', label: 'Moderate' },
                      { intensity: 'high', label: 'High' }
                    ].map(({ intensity, label }) => (
                      <button
                        key={intensity}
                        onClick={() => setCurrentIntensity(intensity as any)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          currentIntensity === intensity
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Choose an emotion to see the avatar respond</li>
                    <li>• Adjust intensity to see different expressions</li>
                    <li>• The avatar adapts its tone and guidance style</li>
                    <li>• Start journaling below to experience the full system</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center">
                <EmotionAvatar
                  emotion={currentEmotion}
                  intensity={currentIntensity}
                  size="large"
                  isAnimating={true}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Journal Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <EmotionJournalDashboard userId="demo-user" />
        </motion.div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              Emotion Buddy is designed with privacy, empathy, and emotional intelligence at its core.
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500">
              <span>Privacy First</span>
              <span>•</span>
              <span>AI Ethics</span>
              <span>•</span>
              <span>Emotional Safety</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
