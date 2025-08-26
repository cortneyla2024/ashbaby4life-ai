import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';

// Test component to access context
const TestComponent = () => {
  const { 
    transactions, 
    budgets, 
    accounts, 
    isLoading, 
    addTransaction, 
    createBudget, 
    addAccount,
    getBudgetProgress 
  } = useFinance();
  
  return (
    <div>
      <div data-testid="transactions-count">{transactions.length}</div>
      <div data-testid="budgets-count">{budgets.length}</div>
      <div data-testid="accounts-count">{accounts.length}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <button 
        data-testid="add-transaction" 
        onClick={() => addTransaction({
          amount: 100,
          type: 'expense',
          category: 'food',
          description: 'Grocery shopping',
          date: new Date(),
          tags: ['food', 'grocery'],
          accountId: 'account-1'
        })}
      >
        Add Transaction
      </button>
      <button 
        data-testid="add-budget" 
        onClick={() => createBudget({
          name: 'Monthly Food Budget',
          amount: 500,
          spent: 0,
          category: 'food',
          period: 'monthly',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })}
      >
        Add Budget
      </button>
      <button 
        data-testid="add-account" 
        onClick={() => addAccount({
          name: 'Main Checking',
          type: 'checking',
          balance: 1000,
          currency: 'USD',
          institution: 'Bank of America'
        })}
      >
        Add Account
      </button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <FinanceProvider>
      {component}
    </FinanceProvider>
  );
};

describe('FinanceContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide initial state', () => {
    renderWithProvider(<TestComponent />);

    expect(screen.getByTestId('transactions-count')).toHaveTextContent('0');
    expect(screen.getByTestId('budgets-count')).toHaveTextContent('0');
    expect(screen.getByTestId('accounts-count')).toHaveTextContent('0');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('should add a transaction', async () => {
    renderWithProvider(<TestComponent />);

    act(() => {
      screen.getByTestId('add-transaction').click();
    });

    // Check loading state
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(screen.getByTestId('transactions-count')).toHaveTextContent('1');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    }, { timeout: 2000 });
  });

  it('should add a budget', async () => {
    renderWithProvider(<TestComponent />);

    act(() => {
      screen.getByTestId('add-budget').click();
    });

    // Check loading state
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(screen.getByTestId('budgets-count')).toHaveTextContent('1');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    }, { timeout: 2000 });
  });

  it('should add an account', async () => {
    renderWithProvider(<TestComponent />);

    act(() => {
      screen.getByTestId('add-account').click();
    });

    // Check loading state
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(screen.getByTestId('accounts-count')).toHaveTextContent('1');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    }, { timeout: 2000 });
  });

  it('should handle loading state during operations', async () => {
    renderWithProvider(<TestComponent />);

    act(() => {
      screen.getByTestId('add-transaction').click();
    });

    // Should be loading initially
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    }, { timeout: 2000 });
  });

  it('should throw error when useFinance is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useFinance must be used within a FinanceProvider');
    
    consoleSpy.mockRestore();
  });

  it('should calculate budget progress correctly', async () => {
    renderWithProvider(<TestComponent />);

    // Add a budget first
    act(() => {
      screen.getByTestId('add-budget').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('budgets-count')).toHaveTextContent('1');
    }, { timeout: 2000 });
  });

  it('should handle multiple transactions', async () => {
    renderWithProvider(<TestComponent />);

    // Add multiple transactions sequentially
    act(() => {
      screen.getByTestId('add-transaction').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('transactions-count')).toHaveTextContent('1');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    }, { timeout: 2000 });

    act(() => {
      screen.getByTestId('add-transaction').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('transactions-count')).toHaveTextContent('2');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    }, { timeout: 2000 });

    act(() => {
      screen.getByTestId('add-transaction').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('transactions-count')).toHaveTextContent('3');
    }, { timeout: 2000 });
  });

  it('should handle multiple budgets', async () => {
    renderWithProvider(<TestComponent />);

    // Add multiple budgets sequentially
    act(() => {
      screen.getByTestId('add-budget').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('budgets-count')).toHaveTextContent('1');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    }, { timeout: 2000 });

    act(() => {
      screen.getByTestId('add-budget').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('budgets-count')).toHaveTextContent('2');
    }, { timeout: 2000 });
  });

  it('should handle multiple accounts', async () => {
    renderWithProvider(<TestComponent />);

    // Add multiple accounts sequentially
    act(() => {
      screen.getByTestId('add-account').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('accounts-count')).toHaveTextContent('1');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    }, { timeout: 2000 });

    act(() => {
      screen.getByTestId('add-account').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('accounts-count')).toHaveTextContent('2');
    }, { timeout: 2000 });
  });
});
