'use client';

import { motion } from 'framer-motion';
import { 
  Brain, 
  Heart, 
  DollarSign, 
  BookOpen, 
  Target, 
  Users,
  FileText,
  Zap,
  Shield,
  TrendingUp,
  Globe,
  Lightbulb
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Companion',
    description: 'Your personal AI assistant that understands your needs and provides intelligent recommendations.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Heart,
    title: 'Health Tracking',
    description: 'Comprehensive health monitoring with AI-powered insights and personalized wellness plans.',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: DollarSign,
    title: 'Financial Management',
    description: 'Smart budgeting, investment tracking, and financial planning with AI-driven insights.',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: BookOpen,
    title: 'Learning Optimization',
    description: 'Personalized learning paths, skill tracking, and knowledge management for continuous growth.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Target,
    title: 'Goal Achievement',
    description: 'Set, track, and achieve your goals with AI-powered planning and progress monitoring.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: Users,
    title: 'Social Network',
    description: 'Connect with like-minded individuals and build meaningful relationships in a supportive community.',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Intelligent document organization, search, and management with AI-powered categorization.',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: Zap,
    title: 'Life Automation',
    description: 'Automate routine tasks and workflows to focus on what truly matters in your life.',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'End-to-end encryption and local-first architecture ensure your data stays private and secure.',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Analytics & Insights',
    description: 'Deep analytics and actionable insights to help you make better decisions and track progress.',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
  },
  {
    icon: Globe,
    title: 'Government Resources',
    description: 'Access to government benefits, resources, and services with AI-powered guidance.',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
  {
    icon: Lightbulb,
    title: 'Life Hacks',
    description: 'Curated collection of proven life hacks and optimization techniques for every aspect of life.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
];

export function Features() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Everything You Need for a Better Life
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Our comprehensive platform combines cutting-edge AI technology with proven life optimization 
            strategies to help you achieve your full potential in every area of life.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative rounded-lg border bg-background p-6 transition-all hover:shadow-lg hover:border-primary/20"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor} ${feature.color} transition-colors group-hover:scale-110`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground">
            And that's just the beginning. Our platform is constantly evolving with new features and capabilities.
          </p>
        </motion.div>
      </div>
    </section>
  );
}


