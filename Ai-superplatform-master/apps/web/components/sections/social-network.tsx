'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  MessageCircle, 
  Share2, 
  Heart, 
  Globe, 
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const socialFeatures = [
  {
    icon: Users,
    title: 'Community Building',
    description: 'Connect with like-minded individuals and build meaningful relationships.',
    features: ['Interest groups', 'Community forums', 'Event organization', 'Member matching'],
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: MessageCircle,
    title: 'Smart Communication',
    description: 'AI-powered messaging that helps you communicate more effectively.',
    features: ['Conversation starters', 'Tone analysis', 'Response suggestions', 'Translation support'],
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Share2,
    title: 'Content Sharing',
    description: 'Share your knowledge, experiences, and achievements with your network.',
    features: ['Rich media sharing', 'Story creation', 'Achievement posts', 'Knowledge articles'],
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Heart,
    title: 'Emotional Support',
    description: 'Get and provide emotional support through AI-enhanced interactions.',
    features: ['Mood tracking', 'Support matching', 'Wellness check-ins', 'Crisis resources'],
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    icon: Globe,
    title: 'Global Connections',
    description: 'Connect with people from around the world and learn from diverse perspectives.',
    features: ['Cultural exchange', 'Language learning', 'Global events', 'Cross-cultural insights'],
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: Shield,
    title: 'Privacy & Safety',
    description: 'Advanced privacy controls and safety features to protect your social experience.',
    features: ['Privacy controls', 'Content moderation', 'Blocking tools', 'Safety reporting'],
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
];

export function SocialNetwork() {
  return (
    <section className="py-24 bg-gradient-to-br from-pink-50 via-background to-purple-50 dark:from-pink-950/20 dark:via-background dark:to-purple-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Meaningful Social Connections
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Build authentic relationships and connect with people who share your interests, 
            values, and goals through our intelligent social networking platform.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {socialFeatures.map((feature, index) => (
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
                        <CheckCircle className="h-4 w-4 text-green-500" />
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
            Join Our Community
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}


