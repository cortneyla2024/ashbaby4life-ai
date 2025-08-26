'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, 
  Activity, 
  Brain, 
  Moon, 
  Apple, 
  Dumbbell,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const healthMetrics = [
  {
    icon: Heart,
    title: 'Heart Health',
    description: 'Monitor heart rate, blood pressure, and cardiovascular fitness.',
    metrics: ['Heart Rate', 'Blood Pressure', 'HRV', 'Cardio Fitness'],
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: Activity,
    title: 'Physical Activity',
    description: 'Track steps, workouts, and overall physical activity levels.',
    metrics: ['Steps', 'Calories', 'Active Minutes', 'Workouts'],
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Brain,
    title: 'Mental Health',
    description: 'Monitor stress levels, mood, and cognitive performance.',
    metrics: ['Stress Level', 'Mood Tracking', 'Sleep Quality', 'Focus Score'],
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Apple,
    title: 'Nutrition',
    description: 'Track meals, hydration, and nutritional intake.',
    metrics: ['Calories', 'Macros', 'Hydration', 'Meal Planning'],
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Moon,
    title: 'Sleep',
    description: 'Monitor sleep patterns and optimize rest quality.',
    metrics: ['Sleep Duration', 'Sleep Quality', 'Sleep Stages', 'Recovery'],
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: Dumbbell,
    title: 'Fitness',
    description: 'Track strength training, flexibility, and fitness progress.',
    metrics: ['Strength', 'Flexibility', 'Endurance', 'Body Composition'],
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
];

export function HealthTracking() {
  return (
    <section className="py-24 bg-gradient-to-br from-red-50 via-background to-blue-50 dark:from-red-950/20 dark:via-background dark:to-blue-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Comprehensive Health Tracking
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Monitor every aspect of your health with AI-powered insights and personalized recommendations 
            for optimal wellness and performance.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {healthMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${metric.bgColor} ${metric.color}`}>
                      <metric.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{metric.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {metric.description}
                  </p>
                  <div className="space-y-2">
                    {metric.metrics.map((item, itemIndex) => (
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
            Start Tracking Your Health
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}


