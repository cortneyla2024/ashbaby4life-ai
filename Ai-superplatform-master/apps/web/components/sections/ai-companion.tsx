'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, 
  MessageCircle, 
  Mic, 
  Eye, 
  Heart, 
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const capabilities = [
  {
    icon: MessageCircle,
    title: 'Natural Conversations',
    description: 'Engage in human-like conversations with context awareness and emotional intelligence.',
  },
  {
    icon: Mic,
    title: 'Voice Interaction',
    description: 'Speak naturally with voice recognition and text-to-speech capabilities.',
  },
  {
    icon: Eye,
    title: 'Emotion Detection',
    description: 'AI that understands your emotional state and responds with appropriate empathy.',
  },
  {
    icon: Heart,
    title: 'Personalized Care',
    description: 'Tailored responses and recommendations based on your unique personality and needs.',
  },
  {
    icon: Zap,
    title: 'Real-time Processing',
    description: 'Instant responses with streaming capabilities for natural conversation flow.',
  },
  {
    icon: Brain,
    title: 'Continuous Learning',
    description: 'Adapts and improves over time based on your interactions and feedback.',
  },
];

export function AICompanion() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center rounded-full border bg-background/50 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm mb-6">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              AI-Powered Companion
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl mb-6">
              Your Personal AI Companion
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Experience the future of human-AI interaction with our advanced companion that understands, 
              learns, and grows with you. From casual conversations to deep life guidance, your AI 
              companion is always there to support your journey.
            </p>

            <div className="space-y-4 mb-8">
              {capabilities.map((capability, index) => (
                <motion.div
                  key={capability.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                    <capability.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{capability.title}</h3>
                    <p className="text-sm text-muted-foreground">{capability.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button size="lg" className="group">
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="relative">
                  {/* AI Avatar Placeholder */}
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Brain className="h-16 w-16 text-primary-foreground" />
                  </div>

                  {/* Chat Interface Mockup */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Brain className="h-4 w-4" />
                      </div>
                      <div className="flex-1 rounded-lg bg-muted p-3">
                        <p className="text-sm">Hello! How can I help you today?</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 justify-end">
                      <div className="flex-1 rounded-lg bg-primary p-3 text-primary-foreground">
                        <p className="text-sm">I need help with my daily routine</p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <span className="text-xs font-medium">You</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Brain className="h-4 w-4" />
                      </div>
                      <div className="flex-1 rounded-lg bg-muted p-3">
                        <p className="text-sm">I'd be happy to help! Let me analyze your current routine and suggest some optimizations...</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                    <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="h-3 w-3 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-primary/20"
            />
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -right-4 h-6 w-6 rounded-full bg-primary/30"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}


