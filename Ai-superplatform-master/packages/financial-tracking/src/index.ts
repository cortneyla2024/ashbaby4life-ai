// @vitality/financial-tracking module

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
  userId: string;
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  spent: number;
  period: string;
  userId: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  userId: string;
}

export class FinancialTracker {
  private transactions: Transaction[] = [];
  private budgets: Budget[] = [];
  private goals: FinancialGoal[] = [];

  addTransaction(transaction: Omit<Transaction, 'id'>): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  getTransactions(userId: string): Transaction[] {
    return this.transactions.filter(t => t.userId === userId);
  }

  addBudget(budget: Omit<Budget, 'id'>): Budget {
    const newBudget: Budget = {
      ...budget,
      id: `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    this.budgets.push(newBudget);
    return newBudget;
  }

  getBudgets(userId: string): Budget[] {
    return this.budgets.filter(b => b.userId === userId);
  }

  addGoal(goal: Omit<FinancialGoal, 'id'>): FinancialGoal {
    const newGoal: FinancialGoal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    this.goals.push(newGoal);
    return newGoal;
  }

  getGoals(userId: string): FinancialGoal[] {
    return this.goals.filter(g => g.userId === userId);
  }

  getFinancialSummary(userId: string) {
    const userTransactions = this.getTransactions(userId);
    const userBudgets = this.getBudgets(userId);
    const userGoals = this.getGoals(userId);

    const totalIncome = userTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = userTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netWorth = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netWorth,
      budgetCount: userBudgets.length,
      goalCount: userGoals.length,
      transactionCount: userTransactions.length
    };
  }
}

export const financialTracker = new FinancialTracker();
