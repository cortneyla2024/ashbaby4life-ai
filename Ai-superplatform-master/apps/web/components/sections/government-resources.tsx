'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  FileText, 
  Calendar, 
  MapPin, 
  Phone, 
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const governmentFeatures = [
  {
    icon: Building2,
    title: 'Government Services',
    description: 'Access essential government services and resources in one centralized location.',
    features: ['Service directories', 'Application forms', 'Status tracking', 'Document requests'],
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Store and manage important government documents and certificates securely.',
    features: ['Document storage', 'Digital signatures', 'Expiry tracking', 'Backup & sync'],
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Calendar,
    title: 'Deadline Tracking',
    description: 'Never miss important government deadlines, renewals, or filing dates.',
    features: ['Deadline reminders', 'Renewal alerts', 'Tax due dates', 'Compliance tracking'],
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: MapPin,
    title: 'Local Resources',
    description: 'Find government offices, services, and resources in your local area.',
    features: ['Office locator', 'Service hours', 'Contact information', 'Appointment booking'],
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Phone,
    title: 'Support & Assistance',
    description: 'Get help navigating government processes and accessing available assistance.',
    features: ['Process guidance', 'Eligibility checking', 'Application help', 'Support chat'],
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    icon: Globe,
    title: 'Information Hub',
    description: 'Stay informed about government policies, programs, and important updates.',
    features: ['Policy updates', 'Program announcements', 'News feeds', 'Educational resources'],
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
];

export function GovernmentResources() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Government Resources & Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Simplify your interactions with government services through our comprehensive 
            resource hub that helps you navigate bureaucracy and access what you need.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {governmentFeatures.map((feature, index) => (
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
            Access Government Services
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}


