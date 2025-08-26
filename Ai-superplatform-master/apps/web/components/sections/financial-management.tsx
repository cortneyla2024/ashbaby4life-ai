'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  PiggyBank, 
  CreditCard, 
  PieChart, 
  Target,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const financialFeatures = [
  {
    icon: DollarSign,
    title: 'Budget Management',
    description: 'Create and maintain smart budgets with AI-powered spending insights.',
    features: ['Expense tracking', 'Budget alerts', 'Spending analysis', 'Smart categorization'],
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Investment Tracking',
    description: 'Monitor your investments and get AI-driven recommendations.',
    features: ['Portfolio tracking', 'Performance analysis', 'Risk assessment', 'Investment suggestions'],
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: PiggyBank,
    title: 'Savings Goals',
    description: 'Set and achieve financial goals with automated savings.',
    features: ['Goal setting', 'Auto-savings', 'Progress tracking', 'Milestone rewards'],
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: CreditCard,
    title: 'Debt Management',
    description: 'Track and optimize your debt repayment strategies.',
    features: ['Debt tracking', 'Payment optimization', 'Interest analysis', 'Debt-free planning'],
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: PieChart,
    title: 'Financial Analytics',
    description: 'Get deep insights into your financial patterns and opportunities.',
    features: ['Spending patterns', 'Income analysis', 'Financial health score', 'Optimization tips'],
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: Target,
    title: 'Financial Planning',
    description: 'Plan for your future with AI-powered financial planning tools.',
    features: ['Retirement planning', 'Tax optimization', 'Insurance analysis', 'Estate planning'],
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
];

export function FinancialManagement() {
  return (
    <section className="py-24 bg-gradient-to-br from-green-50 via-background to-blue-50 dark:from-green-950/20 dark:via-background dark:to-blue-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Smart Financial Management
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Take control of your finances with AI-powered tools that help you budget, invest, 
            save, and plan for a secure financial future.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {financialFeatures.map((feature, index) => (
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
                  <ul className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (index * 0.1) + (itemIndex * 0.05) }}
                        viewport={{ once: true }}
                        className="flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
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
            Start Managing Your Finances
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}


