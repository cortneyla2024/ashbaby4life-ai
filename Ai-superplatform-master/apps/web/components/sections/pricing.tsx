'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with basic features',
    features: [
      'AI Assistant (5 conversations/day)',
      'Basic Health Tracking',
      'Simple Goal Setting',
      'Document Storage (100MB)',
      'Community Access',
      'Email Support',
    ],
    notIncluded: [
      'Advanced Analytics',
      'Priority Support',
      'Custom Integrations',
      'Team Collaboration',
      'Advanced Automation',
      'Premium Templates',
    ],
    popular: false,
    buttonText: 'Get Started Free',
    buttonVariant: 'outline' as const,
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'Everything you need for personal optimization',
    features: [
      'AI Assistant (Unlimited)',
      'Advanced Health Tracking',
      'Comprehensive Goal Setting',
      'Document Storage (10GB)',
      'Financial Management',
      'Learning Tracking',
      'Social Network Features',
      'Government Resources',
      'Life Hacks Library',
      'Document Management',
      'Basic Automation',
      'Priority Support',
    ],
    notIncluded: [
      'Team Collaboration',
      'Advanced Analytics',
      'Custom Integrations',
      'Premium Templates',
    ],
    popular: true,
    buttonText: 'Start Pro Trial',
    buttonVariant: 'default' as const,
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: 'per month',
    description: 'Complete solution for teams and organizations',
    features: [
      'Everything in Pro',
      'Team Collaboration',
      'Advanced Analytics',
      'Custom Integrations',
      'Premium Templates',
      'Advanced Automation',
      'API Access',
      'White-label Options',
      'Dedicated Support',
      'Custom Training',
      'SLA Guarantee',
      'Advanced Security',
    ],
    notIncluded: [],
    popular: false,
    buttonText: 'Contact Sales',
    buttonVariant: 'outline' as const,
  },
];

export function Pricing() {
  return (
    <section className="py-24 bg-gradient-to-br from-indigo-50 via-background to-purple-50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Choose Your Plan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Start free and upgrade as you grow. All plans include our core AI features 
            with no hidden fees or long-term commitments.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full ${plan.popular ? 'border-primary shadow-lg scale-105' : 'hover:shadow-lg'} transition-all duration-300`}>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">What's included:</h4>
                    {plan.features.map((feature, featureIndex) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (index * 0.1) + (featureIndex * 0.05) }}
                        viewport={{ once: true }}
                        className="flex items-center space-x-2"
                      >
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {plan.notIncluded.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Not included:</h4>
                      {plan.notIncluded.map((feature, featureIndex) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: (index * 0.1) + (featureIndex * 0.05) }}
                          viewport={{ once: true }}
                          className="flex items-center space-x-2"
                        >
                          <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <Button 
                    className="w-full mt-8" 
                    variant={plan.buttonVariant}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
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
          <p className="text-muted-foreground mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="text-sm text-muted-foreground">
            Need a custom plan? <a href="#" className="text-primary hover:underline">Contact our sales team</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}


