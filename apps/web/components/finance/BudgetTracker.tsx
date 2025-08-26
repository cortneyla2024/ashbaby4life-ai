'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  PiggyBank
} from 'lucide-react';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  categories: string[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
  budgetId?: string;
}

interface BudgetTrackerProps {
  budgets: Budget[];
  transactions: Transaction[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  onUpdateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
}

const budgetPeriods = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

const expenseCategories = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Education',
  'Travel',
  'Other'
];

const incomeCategories = [
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Refund',
  'Other'
];

export function BudgetTracker({
  budgets,
  transactions,
  onAddBudget,
  onAddTransaction,
  onUpdateBudget
}: BudgetTrackerProps) {
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Form states for new budget
  const [newBudget, setNewBudget] = useState({
    name: '',
    amount: 0,
    period: 'monthly' as const,
    categories: [] as string[]
  });

  // Form states for new transaction
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    category: '',
    description: '',
    budgetId: ''
  });

  const getBudgetProgress = (budget: Budget) => {
    const progress = (budget.spent / budget.amount) * 100;
    return {
      progress: Math.min(progress, 100),
      isOverBudget: progress > 100,
      remaining: budget.amount - budget.spent
    };
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getNetIncome = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getCategorySpending = () => {
    const categoryMap = new Map<string, number>();
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
      });
    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount
    })).sort((a, b) => b.amount - a.amount);
  };

  const handleAddBudget = async () => {
    if (newBudget.name && newBudget.amount > 0) {
      await onAddBudget({
        ...newBudget,
        spent: 0,
        startDate: new Date(),
        isActive: true
      });
      setNewBudget({ name: '', amount: 0, period: 'monthly', categories: [] });
      setShowAddBudget(false);
    }
  };

  const handleAddTransaction = async () => {
    if (newTransaction.amount > 0 && newTransaction.category && newTransaction.description) {
      await onAddTransaction({
        ...newTransaction,
        date: new Date()
      });
      setNewTransaction({
        type: 'expense',
        amount: 0,
        category: '',
        description: '',
        budgetId: ''
      });
      setShowAddTransaction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Budget Tracker
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your finances and track spending
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowAddBudget(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Budget
          </Button>
          <Button onClick={() => setShowAddTransaction(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                ${getTotalIncome().toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                ${getTotalExpenses().toLocaleString()}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Income</p>
              <p className={`text-2xl font-bold ${getNetIncome() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${getNetIncome().toLocaleString()}
              </p>
            </div>
            <DollarSign className={`w-8 h-8 ${getNetIncome() >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </Card>
      </div>

      {/* Active Budgets */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Active Budgets</h3>
        {budgets.filter(b => b.isActive).length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No active budgets. Create your first budget to start tracking!
            </p>
            <Button onClick={() => setShowAddBudget(true)}>
              Create Budget
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.filter(b => b.isActive).map((budget) => {
              const { progress, isOverBudget, remaining } = getBudgetProgress(budget);
              return (
                <div key={budget.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {budget.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ${budget.spent.toLocaleString()} / ${budget.amount.toLocaleString()}
                      </p>
                      <p className={`text-sm ${isOverBudget ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
                        {isOverBudget ? `$${Math.abs(remaining).toLocaleString()} over` : `$${remaining.toLocaleString()} remaining`}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isOverBudget ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {budget.categories.slice(0, 3).map((category, index) => (
                        <Badge key={index} variant="outline" size="sm">
                          {category}
                        </Badge>
                      ))}
                      {budget.categories.length > 3 && (
                        <Badge variant="outline" size="sm">
                          +{budget.categories.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {isOverBudget && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      {progress <= 100 && progress > 0 && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No transactions yet. Add your first transaction to start tracking!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    {transaction.type === 'income' ? (
                      <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Minus className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Category Spending */}
      {getCategorySpending().length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          <div className="space-y-3">
            {getCategorySpending().slice(0, 5).map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-gray-900 dark:text-white">{item.category}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Budget Modal */}
      <Modal
        isOpen={showAddBudget}
        onClose={() => setShowAddBudget(false)}
        title="Create New Budget"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Budget Name
            </label>
            <Input
              value={newBudget.name}
              onChange={(e) => setNewBudget(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Groceries, Entertainment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <Input
              type="number"
              value={newBudget.amount}
              onChange={(e) => setNewBudget(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Period
            </label>
            <Select
              options={budgetPeriods}
              value={newBudget.period}
              onValueChange={(value) => setNewBudget(prev => ({ ...prev, period: value as any }))}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowAddBudget(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBudget}>
              Create Budget
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        title="Add Transaction"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <Select
              options={[
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' }
              ]}
              value={newTransaction.type}
              onValueChange={(value) => setNewTransaction(prev => ({ ...prev, type: value as any }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <Input
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <Select
              options={(newTransaction.type === 'income' ? incomeCategories : expenseCategories).map(cat => ({
                value: cat,
                label: cat
              }))}
              value={newTransaction.category}
              onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <Input
              value={newTransaction.description}
              onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the transaction"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowAddTransaction(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTransaction}>
              Add Transaction
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
