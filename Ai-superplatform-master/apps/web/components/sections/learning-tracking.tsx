'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  GraduationCap, 
  Brain, 
  Target, 
  Clock, 
  Award,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const learningFeatures = [
  {
    icon: BookOpen,
    title: 'Course Management',
    description: 'Track your learning progress across multiple courses and subjects.',
    features: ['Course tracking', 'Progress monitoring', 'Study schedules', 'Resource management'],
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Brain,
    title: 'Skill Development',
    description: 'Build and track new skills with personalized learning paths.',
    features: ['Skill assessment', 'Learning paths', 'Practice exercises', 'Skill validation'],
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Target,
    title: 'Goal Achievement',
    description: 'Set learning goals and track your progress toward mastery.',
    features: ['Goal setting', 'Milestone tracking', 'Achievement badges', 'Progress visualization'],
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Clock,
    title: 'Study Optimization',
    description: 'Optimize your study time with AI-powered scheduling and techniques.',
    features: ['Study scheduling', 'Focus tracking', 'Break optimization', 'Memory techniques'],
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: Award,
    title: 'Certification Tracking',
    description: 'Track professional certifications and continuing education requirements.',
    features: ['Certification tracking', 'CEU management', 'Renewal reminders', 'Credential storage'],
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Performance Analytics',
    description: 'Get insights into your learning patterns and optimize your approach.',
    features: ['Learning analytics', 'Performance trends', 'Weakness identification', 'Improvement suggestions'],
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
];

export function LearningTracking() {
  return (
    <section className="py-24 bg-gradient-to-br from-purple-50 via-background to-blue-50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Continuous Learning & Skill Development
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Accelerate your learning journey with AI-powered tools that help you track progress, 
            optimize study time, and achieve mastery in any subject.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {learningFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor} ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <div className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (index * 0.1) + (itemIndex * 0.05) }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                      >
                        <span className="text-sm font-medium">{item}</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Button size="lg" className="group">
            Start Your Learning Journey
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}


