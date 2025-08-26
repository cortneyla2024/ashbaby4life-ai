"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
  color: string;
}

export default function BudgetTracker() {
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: '1',
      category: 'Groceries',
      limit: 500,
      spent: 320,
      period: 'monthly',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      category: 'Entertainment',
      limit: 200,
      spent: 180,
      period: 'monthly',
      color: 'bg-purple-500'
    },
    {
      id: '3',
      category: 'Transportation',
      limit: 300,
      spent: 250,
      period: 'monthly',
      color: 'bg-green-500'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly',
    color: 'bg-blue-500'
  });

  const getProgressPercentage = (spent: number, limit: number) => {
    return Math.min((spent / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (percentage >= 75) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBudget) {
      setBudgets(prev => prev.map(budget => 
        budget.id === editingBudget.id 
          ? { ...budget, ...formData, limit: parseFloat(formData.limit) }
          : budget
      ));
      setEditingBudget(null);
    } else {
      const newBudget: Budget = {
        id: Date.now().toString(),
        category: formData.category,
        limit: parseFloat(formData.limit),
        spent: 0,
        period: formData.period,
        color: formData.color
      };
      setBudgets(prev => [...prev, newBudget]);
    }
    
    setFormData({ category: '', limit: '', period: 'monthly', color: 'bg-blue-500' });
    setShowAddForm(false);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
      period: budget.period,
      color: budget.color
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    setBudgets(prev => prev.filter(budget => budget.id !== id));
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">${totalBudget.toFixed(2)}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${totalRemaining.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Budget Categories</CardTitle>
            <Button onClick={() => setShowAddForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgets.map((budget) => {
              const percentage = getProgressPercentage(budget.spent, budget.limit);
              return (
                <div key={budget.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${budget.color}`} />
                      <h3 className="font-medium">{budget.category}</h3>
                      <Badge variant="outline" className="text-xs">
                        {budget.period}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(percentage)}
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(budget)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                    </span>
                    <span className="text-sm font-medium">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingBudget ? 'Edit Budget' : 'Add New Budget'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Groceries, Entertainment"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Budget Limit</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Period</label>
                <Select
                  value={formData.period}
                  onValueChange={(value: 'monthly' | 'weekly' | 'yearly') => 
                    setFormData(prev => ({ ...prev, period: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Color</label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-blue-500">Blue</SelectItem>
                    <SelectItem value="bg-green-500">Green</SelectItem>
                    <SelectItem value="bg-purple-500">Purple</SelectItem>
                    <SelectItem value="bg-orange-500">Orange</SelectItem>
                    <SelectItem value="bg-red-500">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingBudget(null);
                    setFormData({ category: '', limit: '', period: 'monthly', color: 'bg-blue-500' });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingBudget ? 'Update Budget' : 'Add Budget'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { BudgetTracker };
