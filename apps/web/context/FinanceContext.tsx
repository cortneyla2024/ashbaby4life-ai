import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  description: string;
  date: Date;
  tags: string[];
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  institution: string;
  accountNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FinanceContextType {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Transaction>;
  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  createBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Budget>;
  updateBudget: (budgetId: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Account>;
  updateAccount: (accountId: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  getFinancialStats: () => Promise<any>;
  getBudgetProgress: (budgetId: string) => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

interface FinanceProviderProps {
  children: ReactNode;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTransaction: Transaction = {
        ...transaction,
        id: `transaction-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setTransactions(prev => [...prev, newTransaction]);
      return newTransaction;
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTransaction = useCallback(async (transactionId: string, updates: Partial<Transaction>): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === transactionId
            ? { ...transaction, ...updates, updatedAt: new Date() }
            : transaction
        )
      );
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTransaction = useCallback(async (transactionId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBudget = useCallback(async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBudget: Budget = {
        ...budget,
        id: `budget-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setBudgets(prev => [...prev, newBudget]);
      return newBudget;
    } catch (error) {
      console.error('Failed to create budget:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBudget = useCallback(async (budgetId: string, updates: Partial<Budget>): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBudgets(prev =>
        prev.map(budget =>
          budget.id === budgetId
            ? { ...budget, ...updates, updatedAt: new Date() }
            : budget
        )
      );
    } catch (error) {
      console.error('Failed to update budget:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBudget = useCallback(async (budgetId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
    } catch (error) {
      console.error('Failed to delete budget:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addAccount = useCallback(async (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAccount: Account = {
        ...account,
        id: `account-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setAccounts(prev => [...prev, newAccount]);
      return newAccount;
    } catch (error) {
      console.error('Failed to add account:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAccount = useCallback(async (accountId: string, updates: Partial<Account>): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAccounts(prev =>
        prev.map(account =>
          account.id === accountId
            ? { ...account, ...updates, updatedAt: new Date() }
            : account
        )
      );
    } catch (error) {
      console.error('Failed to update account:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async (accountId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAccounts(prev => prev.filter(account => account.id !== accountId));
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFinancialStats = useCallback(async (): Promise<any> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netWorth = accounts.reduce((sum, account) => sum + account.balance, 0);
      
      return {
        totalIncome,
        totalExpenses,
        netWorth,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
        totalAccounts: accounts.length,
        totalTransactions: transactions.length,
      };
    } catch (error) {
      console.error('Failed to get financial stats:', error);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [transactions, accounts]);

  const getBudgetProgress = useCallback((budgetId: string): number => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return 0;
    return (budget.spent / budget.amount) * 100;
  }, [budgets]);

  const value: FinanceContextType = {
    transactions,
    setTransactions,
    budgets,
    setBudgets,
    accounts,
    setAccounts,
    isLoading,
    setIsLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    createBudget,
    updateBudget,
    deleteBudget,
    addAccount,
    updateAccount,
    deleteAccount,
    getFinancialStats,
    getBudgetProgress,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
