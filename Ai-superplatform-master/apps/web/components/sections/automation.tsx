'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Zap, 
  Workflow, 
  Bot, 
  Clock, 
  Settings, 
  BarChart3,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const automationFeatures = [
  {
    icon: Zap,
    title: 'Task Automation',
    description: 'Automate repetitive tasks and workflows to save time and reduce errors.',
    features: ['Workflow automation', 'Task scheduling', 'Trigger-based actions', 'Error handling'],
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: Workflow,
    title: 'Process Optimization',
    description: 'Streamline complex processes with intelligent automation and optimization.',
    features: ['Process mapping', 'Bottleneck identification', 'Efficiency improvements', 'Resource optimization'],
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Bot,
    title: 'AI-Powered Automation',
    description: 'Leverage artificial intelligence to automate complex decision-making tasks.',
    features: ['Smart decision making', 'Predictive automation', 'Learning algorithms', 'Adaptive workflows'],
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Clock,
    title: 'Time Management',
    description: 'Automate time-consuming activities and optimize your daily schedule.',
    features: ['Schedule automation', 'Meeting optimization', 'Time tracking', 'Productivity insights'],
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Settings,
    title: 'System Integration',
    description: 'Connect and automate across multiple systems and applications seamlessly.',
    features: ['API integration', 'Data synchronization', 'Cross-platform automation', 'Real-time updates'],
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Monitor and optimize automation performance with detailed analytics and insights.',
    features: ['Performance tracking', 'Efficiency metrics', 'ROI analysis', 'Optimization recommendations'],
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
];

export function Automation() {
  return (
    <section className="py-24 bg-gradient-to-br from-cyan-50 via-background to-blue-50 dark:from-cyan-950/20 dark:via-background dark:to-blue-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Intelligent Automation
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Automate your workflows and eliminate repetitive tasks with AI-powered automation 
            that learns from your patterns and continuously optimizes your processes.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {automationFeatures.map((feature, index) => (
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
            Start Automating
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}


