import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FinanceHub from '@/components/finance/FinanceHub';
import { AuthProvider } from '@/context/AuthContext';
import { FinanceProvider } from '@/context/FinanceContext';
import { ToasterProvider } from '@/components/ui/Toaster';

// Mock the hooks
jest.mock('@/hooks/useFinance', () => ({
  useFinance: jest.fn()
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

const mockUseFinance = require('@/hooks/useFinance').useFinance;
const mockUseAuth = require('@/hooks/useAuth').useAuth;

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <FinanceProvider>
      <ToasterProvider>
        {children}
      </ToasterProvider>
    </FinanceProvider>
  </AuthProvider>
);

describe('FinanceHub', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User'
  };

  const mockBudgets = [
    {
      id: '1',
      name: 'Groceries',
      amount: 500,
      spent: 300,
      category: 'Food',
      period: 'monthly',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    }
  ];

  const mockTransactions = [
    {
      id: '1',
      description: 'Grocery shopping',
      amount: 50,
      type: 'expense',
      category: 'Food',
      date: new Date('2024-01-15'),
      budgetId: '1'
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      signup: jest.fn()
    });

    mockUseFinance.mockReturnValue({
      budgets: mockBudgets,
      transactions: mockTransactions,
      loading: false,
      error: null,
      createBudget: jest.fn(),
      updateBudget: jest.fn(),
      deleteBudget: jest.fn(),
      createTransaction: jest.fn(),
      updateTransaction: jest.fn(),
      deleteTransaction: jest.fn(),
      getBudgetStats: jest.fn().mockReturnValue({
        totalBudget: 500,
        totalSpent: 300,
        remaining: 200,
        percentageUsed: 60
      })
    });
  });

  it('should render the finance hub with budget information', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    expect(screen.getByText('Finance Hub')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
    expect(screen.getByText('$300 spent')).toBeInTheDocument();
  });

  it('should display transaction information', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('should show budget creation form when add budget button is clicked', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    const addBudgetButton = screen.getByText('Add Budget');
    fireEvent.click(addBudgetButton);

    expect(screen.getByText('Create New Budget')).toBeInTheDocument();
    expect(screen.getByLabelText('Budget Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
  });

  it('should show transaction creation form when add transaction button is clicked', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    const addTransactionButton = screen.getByText('Add Transaction');
    fireEvent.click(addTransactionButton);

    expect(screen.getByText('Add New Transaction')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
  });

  it('should display budget progress bars', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    // Check for progress bar elements
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('should show budget statistics', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    expect(screen.getByText('$500')).toBeInTheDocument(); // Total budget
    expect(screen.getByText('$300')).toBeInTheDocument(); // Total spent
    expect(screen.getByText('$200')).toBeInTheDocument(); // Remaining
  });

  it('should handle budget form submission', async () => {
    const mockCreateBudget = jest.fn();
    mockUseFinance.mockReturnValue({
      ...mockUseFinance(),
      createBudget: mockCreateBudget
    });

    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    const addBudgetButton = screen.getByText('Add Budget');
    fireEvent.click(addBudgetButton);

    const nameInput = screen.getByLabelText('Budget Name');
    const amountInput = screen.getByLabelText('Amount');
    const submitButton = screen.getByText('Create Budget');

    fireEvent.change(nameInput, { target: { value: 'New Budget' } });
    fireEvent.change(amountInput, { target: { value: '1000' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateBudget).toHaveBeenCalledWith({
        name: 'New Budget',
        amount: 1000,
        category: 'Other',
        period: 'monthly'
      });
    });
  });

  it('should handle transaction form submission', async () => {
    const mockCreateTransaction = jest.fn();
    mockUseFinance.mockReturnValue({
      ...mockUseFinance(),
      createTransaction: mockCreateTransaction
    });

    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    const addTransactionButton = screen.getByText('Add Transaction');
    fireEvent.click(addTransactionButton);

    const descriptionInput = screen.getByLabelText('Description');
    const amountInput = screen.getByLabelText('Amount');
    const submitButton = screen.getByText('Add Transaction');

    fireEvent.change(descriptionInput, { target: { value: 'New Transaction' } });
    fireEvent.change(amountInput, { target: { value: '75' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateTransaction).toHaveBeenCalledWith({
        description: 'New Transaction',
        amount: 75,
        type: 'expense',
        category: 'Other'
      });
    });
  });

  it('should display loading state when data is loading', () => {
    mockUseFinance.mockReturnValue({
      ...mockUseFinance(),
      loading: true
    });

    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display empty state when no budgets exist', () => {
    mockUseFinance.mockReturnValue({
      ...mockUseFinance(),
      budgets: []
    });

    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    expect(screen.getByText('No budgets found')).toBeInTheDocument();
    expect(screen.getByText('Create your first budget to get started')).toBeInTheDocument();
  });

  it('should display empty state when no transactions exist', () => {
    mockUseFinance.mockReturnValue({
      ...mockUseFinance(),
      transactions: []
    });

    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    expect(screen.getByText('No transactions found')).toBeInTheDocument();
    expect(screen.getByText('Add your first transaction to start tracking')).toBeInTheDocument();
  });

  it('should handle form validation', async () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    const addBudgetButton = screen.getByText('Add Budget');
    fireEvent.click(addBudgetButton);

    const submitButton = screen.getByText('Create Budget');
    fireEvent.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Budget name is required')).toBeInTheDocument();
      expect(screen.getByText('Amount is required')).toBeInTheDocument();
    });
  });

  it('should close modals when cancel button is clicked', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    const addBudgetButton = screen.getByText('Add Budget');
    fireEvent.click(addBudgetButton);

    expect(screen.getByText('Create New Budget')).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Create New Budget')).not.toBeInTheDocument();
  });
});
