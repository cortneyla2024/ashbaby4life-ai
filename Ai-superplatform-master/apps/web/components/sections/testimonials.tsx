'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Product Manager',
    company: 'TechCorp',
    avatar: '/avatars/sarah.jpg',
    content: 'Vitality AI has completely transformed how I manage my daily life. The AI assistant is incredibly intuitive and the health tracking features have helped me stay on top of my wellness goals.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Entrepreneur',
    company: 'StartupXYZ',
    avatar: '/avatars/michael.jpg',
    content: 'The automation features alone have saved me hours every week. The platform is so comprehensive - it handles everything from financial tracking to document management seamlessly.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Healthcare Professional',
    company: 'HealthFirst',
    avatar: '/avatars/emily.jpg',
    content: 'As someone in healthcare, I appreciate the attention to privacy and security. The platform makes it easy to track my own health metrics while maintaining complete control over my data.',
    rating: 5,
  },
  {
    name: 'David Thompson',
    role: 'Software Engineer',
    company: 'InnovateTech',
    avatar: '/avatars/david.jpg',
    content: 'The collaborative features are game-changing. Working with my team on documents and projects has never been easier. The real-time collaboration is incredibly smooth.',
    rating: 5,
  },
  {
    name: 'Lisa Wang',
    role: 'Financial Advisor',
    company: 'WealthBuild',
    avatar: '/avatars/lisa.jpg',
    content: 'The financial management tools are exceptional. They provide insights I never had before and help me make better financial decisions. The AI recommendations are spot-on.',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'Fitness Coach',
    company: 'FitLife',
    avatar: '/avatars/james.jpg',
    content: 'I recommend Vitality AI to all my clients. The health tracking and goal-setting features are perfect for maintaining accountability and achieving fitness goals.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-background to-gray-50 dark:from-slate-950/20 dark:via-background dark:to-gray-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            What Our Users Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Join thousands of satisfied users who have transformed their lives with Vitality AI. 
            Here's what they have to say about their experience.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-muted-foreground mb-6 italic">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
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
          <div className="text-2xl font-bold text-foreground mb-2">
            10,000+ Happy Users
          </div>
          <div className="text-muted-foreground">
            Join the community of satisfied users transforming their lives
          </div>
        </motion.div>
      </div>
    </section>
  );
}


