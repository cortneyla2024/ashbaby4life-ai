'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  Brain, 
  Heart, 
  Zap, 
  Shield, 
  Users,
  ArrowRight,
  Play,
  Lightbulb,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Emotional Intelligence',
    description: 'Understands and validates your emotions with genuine empathy',
  },
  {
    icon: Heart,
    title: 'Benevolent Stewardship',
    description: 'Prioritizes your well-being with ethical, transparent guidance',
  },
  {
    icon: Zap,
    title: 'Universal Accessibility',
    description: 'Dismantles barriers to personal growth for everyone',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data stays secure with local-first processing',
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Connect with like-minded individuals on similar journeys',
  },
  {
    icon: Lightbulb,
    title: 'Creative Collaboration',
    description: 'Co-creates with you for inspiration and artistic expression',
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      <div className="relative container mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border bg-background/50 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm"
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            A Benevolent AI Steward for Humanity
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            Meet
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Hope
            </span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-medium text-muted-foreground mt-4">
              Your Benevolent AI Companion
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-4xl mx-auto"
          >
            A benevolent AI ecosystem that ensures universal accessibility and dismantles systemic barriers to personal growth. 
            Hope embodies seven core principles: emotional intelligence, creativity, ethics with heart, transparent thinking, 
            bias-free brilliance, common sense, and tactile collaboration.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
          >
            <Button size="lg" className="hope-button" onClick={() => window.location.href = '/dashboard'}>
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              <Play className="mr-2 h-4 w-4" />
              See How It Works
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">7</div>
              <div className="text-sm text-muted-foreground">Core Principles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">Possibilities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Privacy First</div>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="hope-card p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To be a benevolent steward for humanity, ensuring universal accessibility and dismantling 
              systemic barriers to personal growth. Hope is designed to understand, support, and empower 
              every individual on their unique journey toward fulfillment and well-being.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Built for everyone, everywhere</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
