"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PiggyBank,
  CreditCard,
  BarChart3,
  Plus,
  Calendar,
  AlertTriangle,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";
import TransactionForm from "@/components/finance/TransactionForm";
import BudgetTracker from "@/components/finance/BudgetTracker";

export default function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const stats = [
    {
      title: "Total Balance",
      value: showSensitiveData ? "$12,450.67" : "••••••",
      icon: DollarSign,
      color: "text-green-500",
      description: "All accounts",
      trend: "+$1,234.56",
      trendUp: true,
    },
    {
      title: "Monthly Income",
      value: showSensitiveData ? "$4,500.00" : "••••••",
      icon: TrendingUp,
      color: "text-blue-500",
      description: "This month",
      trend: "+$500.00",
      trendUp: true,
    },
    {
      title: "Monthly Expenses",
      value: showSensitiveData ? "$3,200.00" : "••••••",
      icon: TrendingDown,
      color: "text-red-500",
      description: "This month",
      trend: "-$150.00",
      trendUp: false,
    },
    {
      title: "Savings Rate",
      value: "28.9%",
      icon: PiggyBank,
      color: "text-purple-500",
      description: "Of income",
      trend: "+2.1%",
      trendUp: true,
    },
  ];

  const quickActions = [
    {
      title: "Add Transaction",
      description: "Record income or expense",
      icon: Plus,
      action: () => setShowTransactionForm(true),
      color: "bg-green-100 text-green-600",
    },
    {
      title: "View Budget",
      description: "Check spending limits",
      icon: Target,
      action: () => setActiveTab("budget"),
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Financial Goals",
      description: "Track your progress",
      icon: Target,
      action: () => setActiveTab("goals"),
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Analytics",
      description: "View spending patterns",
      icon: BarChart3,
      action: () => setActiveTab("analytics"),
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const recentTransactions = [
    {
      id: '1',
      type: 'expense',
      amount: 45.67,
      category: 'Food & Dining',
      description: 'Grocery shopping',
      date: '2024-01-15',
      tags: ['Essential', 'Recurring'],
    },
    {
      id: '2',
      type: 'income',
      amount: 2500.00,
      category: 'Salary',
      description: 'Monthly paycheck',
      date: '2024-01-14',
      tags: ['Recurring'],
    },
    {
      id: '3',
      type: 'expense',
      amount: 89.99,
      category: 'Entertainment',
      description: 'Movie tickets and dinner',
      date: '2024-01-13',
      tags: ['Luxury', 'One-time'],
    },
    {
      id: '4',
      type: 'expense',
      amount: 120.00,
      category: 'Transportation',
      description: 'Gas and parking',
      date: '2024-01-12',
      tags: ['Essential', 'Recurring'],
    },
  ];

  const financialTips = [
    {
      tip: "Consider setting up automatic transfers to savings",
      category: "Savings",
      icon: PiggyBank,
    },
    {
      tip: "Review your subscriptions and cancel unused ones",
      category: "Expense Reduction",
      icon: CreditCard,
    },
    {
      tip: "Your emergency fund should cover 3-6 months of expenses",
      category: "Emergency Fund",
      icon: AlertTriangle,
    },
    {
      tip: "Track your net worth monthly to see long-term progress",
      category: "Wealth Building",
      icon: TrendingUp,
    },
  ];

  const handleSaveTransaction = async (transaction: any) => {
    // In a real app, this would save to the database
    console.log('Saving transaction:', transaction);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Track your income, expenses, and financial goals
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowSensitiveData(!showSensitiveData)}
        >
          {showSensitiveData ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showSensitiveData ? 'Hide' : 'Show'} Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${stat.color.replace('text-', 'bg-').replace('-500', '-100')}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{stat.description}</p>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {stat.trend}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-2"
                      onClick={action.action}
                    >
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">{transaction.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-500" />
                Financial Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {financialTips.map((tip, index) => {
                  const Icon = tip.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Icon className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tip.category}</p>
                        <p className="text-sm text-muted-foreground">{tip.tip}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <BudgetTracker />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Financial Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Financial goals feature coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                Financial Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Analytics feature coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        onSubmit={handleSaveTransaction}
      />
    </div>
  );
}




