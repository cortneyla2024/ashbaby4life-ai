'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, DollarSign, TrendingUp, PiggyBank, BarChart3,
  Plus, Search, Filter, Download, Settings, Eye, EyeOff,
  ArrowUpRight, ArrowDownRight, Calendar, Target, Wallet,
  Shield, Lock, Unlock, RefreshCw, PieChart, LineChart
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useNotifications } from '@/hooks/useNotifications';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  date: Date;
  tags: string[];
  accountId: string;
  timestamp: Date;
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
  period: 'monthly' | 'yearly' | 'weekly';
  startDate: Date;
  endDate: Date;
  timestamp: Date;
}

interface Investment {
  id: string;
  type: 'stocks' | 'crypto' | 'bonds' | 'real-estate';
  name: string;
  symbol?: string;
  amount: number;
  currentValue: number;
  purchaseDate: Date;
  returnPercentage: number;
  isActive: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  name: string;
  last4?: string;
  isDefault: boolean;
  isActive: boolean;
}

export const FinanceHub: React.FC = () => {
  const { user } = useAuth();
  const {
    transactions,
    budgets,
    addTransaction,
    createBudget,
    isLoading
  } = useFinance();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const totalBalance = transactions.reduce((sum, t) => {
    if (t.type === 'income') return sum + t.amount;
    if (t.type === 'expense') return sum - t.amount;
    return sum;
  }, 0);

  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvestments = 0; // Placeholder since investments not available

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTransaction = useCallback(async (transaction: Partial<Transaction>) => {
    try {
      await addTransaction(transaction as Omit<Transaction, 'id' | 'timestamp'>);
      setShowAddModal(false);
      addNotification({ type: 'success', title: 'Success', message: 'Transaction added successfully!' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to add transaction' });
    }
      }, [addTransaction, addNotification]);

  const handleCreateBudget = useCallback(async (budget: Partial<Budget>) => {
    try {
      await createBudget(budget as Budget);
      addNotification({ type: 'success', title: 'Success', message: 'Budget created successfully!' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to create budget' });
    }
      }, [createBudget, addNotification]);

  const handleAddInvestment = useCallback(async (investment: Partial<Investment>) => {
    try {
      // Placeholder since addInvestment not available
      addNotification({ type: 'info', title: 'Info', message: 'Investment functionality not available yet' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to add investment' });
    }
      }, [addNotification]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Finance & Payments
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your money, track spending, and grow your wealth
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Balance</h3>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {showBalance ? `$${totalBalance.toFixed(2)}` : '••••••'}
          </p>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 dark:text-green-400">+2.5%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Monthly Income</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${monthlyIncome.toFixed(2)}
          </p>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 dark:text-green-400">+12.3%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Monthly Expenses</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ${monthlyExpenses.toFixed(2)}
          </p>
          <div className="flex items-center mt-2">
            <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600 dark:text-red-400">-5.2%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Investments</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${totalInvestments.toFixed(2)}
          </p>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-sm text-blue-600 dark:text-blue-400">+8.7%</span>
          </div>
        </motion.div>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search transactions, budgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'transactions', label: 'Transactions', icon: CreditCard, count: filteredTransactions.length },
            { id: 'budgets', label: 'Budgets', icon: Target, count: budgets.length },
    
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900' :
                          transaction.type === 'expense' ? 'bg-red-100 dark:bg-red-900' :
                          'bg-blue-100 dark:bg-blue-900'
                        }`}>
                          {transaction.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" /> :
                           transaction.type === 'expense' ? <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" /> :
                           <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'income' ? 'text-green-600 dark:text-green-400' :
                          transaction.type === 'expense' ? 'text-red-600 dark:text-red-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`}>
                          {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Budget Progress</h3>
                <div className="space-y-4">
                  {budgets.slice(0, 5).map((budget) => {
                    const progress = (budget.spent / budget.amount) * 100;
                    return (
                      <div key={budget.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{budget.category}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              progress > 90 ? 'bg-red-500' :
                              progress > 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Add your first transaction to start tracking your finances
                  </p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900' :
                          transaction.type === 'expense' ? 'bg-red-100 dark:bg-red-900' :
                          'bg-blue-100 dark:bg-blue-900'
                        }`}>
                          {transaction.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" /> :
                           transaction.type === 'expense' ? <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" /> :
                           <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'income' ? 'text-green-600 dark:text-green-400' :
                          transaction.type === 'expense' ? 'text-red-600 dark:text-red-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`}>
                          {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'budgets' && (
            <div className="space-y-4">
              {budgets.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No budgets set</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create budgets to track your spending and stay on target
                  </p>
                </div>
              ) : (
                budgets.map((budget) => {
                  const progress = (budget.spent / budget.amount) * 100;
                  return (
                    <motion.div
                      key={budget.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{budget.category}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          progress > 90 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          progress > 75 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {progress.toFixed(1)}% used
                        </span>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Spent: ${budget.spent.toFixed(2)}</span>
                          <span>Limit: ${budget.amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                              progress > 90 ? 'bg-red-500' :
                              progress > 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>Period: {budget.period}</span>
                                                 <span>Remaining: ${(budget.amount - budget.spent).toFixed(2)}</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}


        </motion.div>
      </AnimatePresence>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
