"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  Calendar,
  Eye,
  EyeOff,
  Plus,
  Settings,
  Sparkles
} from "lucide-react";

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
  color: string;
  icon: string;
}

interface BudgetTrackerProps {
  transactions?: any[];
}

const defaultBudgets: Budget[] = [
  {
    id: '1',
    category: 'Food & Dining',
    limit: 500,
    spent: 320,
    period: 'monthly',
    color: 'bg-red-500',
    icon: '🍽️'
  },
  {
    id: '2',
    category: 'Transportation',
    limit: 200,
    spent: 150,
    period: 'monthly',
    color: 'bg-blue-500',
    icon: '🚗'
  },
  {
    id: '3',
    category: 'Entertainment',
    limit: 300,
    spent: 280,
    period: 'monthly',
    color: 'bg-purple-500',
    icon: '🎬'
  },
  {
    id: '4',
    category: 'Shopping',
    limit: 400,
    spent: 180,
    period: 'monthly',
    color: 'bg-green-500',
    icon: '🛍️'
  },
  {
    id: '5',
    category: 'Utilities',
    limit: 250,
    spent: 220,
    period: 'monthly',
    color: 'bg-yellow-500',
    icon: '⚡'
  },
  {
    id: '6',
    category: 'Healthcare',
    limit: 150,
    spent: 75,
    period: 'monthly',
    color: 'bg-pink-500',
    icon: '🏥'
  }
];

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 75) return 'bg-orange-500';
  if (percentage >= 50) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getProgressVariant = (percentage: number) => {
  if (percentage >= 90) return 'destructive';
  if (percentage >= 75) return 'default';
  return 'default';
};

export default function BudgetTracker({ transactions = [] }: BudgetTrackerProps) {
  const [budgets, setBudgets] = useState<Budget[]>(defaultBudgets);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');

  // Calculate totals
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallProgress = (totalSpent / totalBudget) * 100;

  // Get alerts for budgets over 75%
  const alerts = budgets.filter(budget => (budget.spent / budget.limit) >= 0.75);

  const handleAddBudget = () => {
    // This would open a modal to add a new budget
    console.log('Add budget clicked');
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'yearly': return 'This Year';
      default: return period;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Budget Tracker
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddBudget}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2">
          {(['monthly', 'weekly', 'yearly'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {getPeriodLabel(period)}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Budget Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">${totalBudget.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Budget</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">${totalSpent.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalRemaining.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{overallProgress.toFixed(1)}%</span>
          </div>
          <Progress 
            value={overallProgress} 
            className="h-3"
          />
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 mb-1">Budget Alerts</p>
                <ul className="text-orange-700 space-y-1">
                  {alerts.map(budget => {
                    const percentage = (budget.spent / budget.limit) * 100;
                    return (
                      <li key={budget.id}>
                        • {budget.category}: {percentage.toFixed(0)}% used (${budget.spent}/${budget.limit})
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Individual Budgets */}
        <div className="space-y-4">
          <h3 className="font-medium">Category Budgets</h3>
          <div className="grid gap-4">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.limit) * 100;
              const remaining = budget.limit - budget.spent;
              const isOverBudget = budget.spent > budget.limit;
              
              return (
                <div key={budget.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{budget.icon}</div>
                      <div>
                        <div className="font-medium">{budget.category}</div>
                        <div className="text-sm text-muted-foreground">
                          {getPeriodLabel(budget.period)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${budget.spent.toLocaleString()} / ${budget.limit.toLocaleString()}
                      </div>
                      <div className={`text-sm ${isOverBudget ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {isOverBudget ? '+' : ''}${Math.abs(remaining).toLocaleString()} {isOverBudget ? 'over' : 'remaining'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2"
                    />
                  </div>

                  {showDetails && (
                    <div className="text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Daily average: ${(budget.spent / 30).toFixed(2)}</span>
                        <span>Daily limit: ${(budget.limit / 30).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">Budget Insights</p>
              <ul className="text-blue-700 space-y-1">
                <li>• You're on track with {budgets.filter(b => (b.spent / b.limit) < 0.75).length} categories</li>
                <li>• Consider reducing spending in {alerts.length} categories</li>
                <li>• You have ${totalRemaining.toLocaleString()} remaining this month</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}




