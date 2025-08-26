'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Lightbulb, 
  Clock, 
  DollarSign, 
  Home, 
  Utensils, 
  Car,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const lifeHackFeatures = [
  {
    icon: Lightbulb,
    title: 'Productivity Hacks',
    description: 'Discover time-saving techniques and productivity boosters for everyday tasks.',
    features: ['Time management', 'Task automation', 'Focus techniques', 'Energy optimization'],
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: DollarSign,
    title: 'Money-Saving Tips',
    description: 'Learn practical ways to save money and make your budget go further.',
    features: ['Budget optimization', 'Smart shopping', 'Investment tips', 'Expense tracking'],
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Home,
    title: 'Home Organization',
    description: 'Transform your living space with clever organization and decluttering strategies.',
    features: ['Space optimization', 'Storage solutions', 'Decluttering methods', 'Maintenance tips'],
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Utensils,
    title: 'Cooking & Nutrition',
    description: 'Master the kitchen with quick recipes, meal prep, and healthy eating strategies.',
    features: ['Quick recipes', 'Meal planning', 'Nutrition tips', 'Food preservation'],
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: Car,
    title: 'Transportation',
    description: 'Optimize your travel and transportation with smart commuting strategies.',
    features: ['Route optimization', 'Fuel efficiency', 'Public transit tips', 'Travel planning'],
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Clock,
    title: 'Time Optimization',
    description: 'Make the most of every minute with intelligent time management strategies.',
    features: ['Schedule optimization', 'Multitasking tips', 'Break management', 'Priority setting'],
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
];

export function LifeHacks() {
  return (
    <section className="py-24 bg-gradient-to-br from-yellow-50 via-background to-orange-50 dark:from-yellow-950/20 dark:via-background dark:to-orange-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Life Hacks & Optimization
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Discover practical tips, tricks, and strategies to optimize every aspect of your life 
            and make daily tasks easier, faster, and more enjoyable.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {lifeHackFeatures.map((feature, index) => (
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
                        <Sparkles className="h-4 w-4 text-yellow-500" />
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
            Discover Life Hacks
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}


