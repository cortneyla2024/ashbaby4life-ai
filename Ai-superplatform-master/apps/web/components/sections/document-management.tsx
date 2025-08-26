'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  FolderOpen, 
  Search, 
  Shield, 
  Share2, 
  Archive,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const documentFeatures = [
  {
    icon: FileText,
    title: 'Document Creation',
    description: 'Create, edit, and format documents with AI-powered assistance and templates.',
    features: ['Smart templates', 'AI writing assistance', 'Formatting tools', 'Collaborative editing'],
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: FolderOpen,
    title: 'Organization',
    description: 'Keep your documents organized with intelligent categorization and tagging.',
    features: ['Auto-categorization', 'Smart folders', 'Tag management', 'Search optimization'],
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Search,
    title: 'Advanced Search',
    description: 'Find any document instantly with powerful search and filtering capabilities.',
    features: ['Full-text search', 'Content filtering', 'Search history', 'Saved searches'],
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Shield,
    title: 'Security & Privacy',
    description: 'Keep your documents secure with enterprise-grade encryption and access controls.',
    features: ['End-to-end encryption', 'Access controls', 'Audit trails', 'Backup protection'],
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: Share2,
    title: 'Collaboration',
    description: 'Work together on documents with real-time collaboration and version control.',
    features: ['Real-time editing', 'Version history', 'Comment system', 'Approval workflows'],
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: Archive,
    title: 'Document Lifecycle',
    description: 'Manage the complete lifecycle of your documents from creation to archiving.',
    features: ['Lifecycle tracking', 'Retention policies', 'Auto-archiving', 'Compliance management'],
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
];

export function DocumentManagement() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-background to-slate-50 dark:from-gray-950/20 dark:via-background dark:to-slate-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Intelligent Document Management
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Streamline your document workflow with AI-powered organization, search, and 
            collaboration tools that make managing your digital files effortless.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {documentFeatures.map((feature, index) => (
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
            Manage Your Documents
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}


