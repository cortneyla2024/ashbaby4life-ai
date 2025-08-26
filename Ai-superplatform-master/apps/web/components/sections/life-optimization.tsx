'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  Zap, 
  Brain, 
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const optimizationAreas = [
  {
    icon: Target,
    title: 'Goal Setting & Achievement',
    description: 'Set SMART goals and track progress with AI-powered insights and accountability.',
    features: ['Smart goal recommendations', 'Progress tracking', 'Milestone celebrations', 'Adaptive planning'],
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Clock,
    title: 'Time Management',
    description: 'Optimize your daily schedule and maximize productivity with intelligent time blocking.',
    features: ['Priority-based scheduling', 'Energy level optimization', 'Focus time tracking', 'Distraction blocking'],
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Brain,
    title: 'Mental Performance',
    description: 'Enhance cognitive function and mental clarity through personalized brain training.',
    features: ['Cognitive assessments', 'Memory exercises', 'Focus training', 'Stress management'],
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Heart,
    title: 'Wellness Optimization',
    description: 'Achieve optimal physical and mental health with personalized wellness plans.',
    features: ['Health monitoring', 'Nutrition guidance', 'Exercise planning', 'Sleep optimization'],
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: Zap,
    title: 'Productivity Enhancement',
    description: 'Boost your efficiency and output with AI-powered productivity tools and insights.',
    features: ['Workflow automation', 'Performance analytics', 'Habit formation', 'Energy management'],
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Continuous Growth',
    description: 'Foster personal development and lifelong learning with adaptive growth strategies.',
    features: ['Skill development', 'Knowledge tracking', 'Learning paths', 'Progress visualization'],
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
];

export function LifeOptimization() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Optimize Every Aspect of Your Life
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Our AI-powered platform analyzes your patterns, preferences, and goals to create 
            personalized optimization strategies for every area of your life.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {optimizationAreas.map((area, index) => (
            <motion.div
              key={area.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${area.bgColor} ${area.color}`}>
                      <area.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{area.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    {area.description}
                  </p>
                  <ul className="space-y-2">
                    {area.features.map((feature, featureIndex) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (index * 0.1) + (featureIndex * 0.05) }}
                        viewport={{ once: true }}
                        className="flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
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
            Start Optimizing Your Life
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}


