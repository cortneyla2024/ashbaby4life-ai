import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FinanceHub } from '@/components/finance/FinanceHub';
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

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn()
}));

const mockUseFinance = require('@/hooks/useFinance').useFinance;
const mockUseAuth = require('@/hooks/useAuth').useAuth;
const mockUseNotifications = require('@/hooks/useNotifications').useNotifications;

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
      period: 'monthly' as const,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      timestamp: new Date()
    }
  ];

  const mockTransactions = [
    {
      id: '1',
      description: 'Grocery shopping',
      amount: 50,
      type: 'expense' as const,
      category: 'Food',
      date: new Date('2024-01-15'),
      tags: [],
      accountId: '1',
      timestamp: new Date()
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
      isLoading: false,
      addTransaction: jest.fn(),
      createBudget: jest.fn()
    });

    mockUseNotifications.mockReturnValue({
      addNotification: jest.fn()
    });
  });

  it('should render the finance hub with correct title', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    expect(screen.getByText('Finance & Payments')).toBeInTheDocument();
    expect(screen.getByText('Manage your money, track spending, and grow your wealth')).toBeInTheDocument();
  });

  it('should display balance overview cards', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('Monthly Income')).toBeInTheDocument();
    expect(screen.getByText('Monthly Expenses')).toBeInTheDocument();
    expect(screen.getByText('Investments')).toBeInTheDocument();
  });

  it('should display tabs for different views', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Budgets')).toBeInTheDocument();
  });

  it('should show add transaction button', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
  });

  it('should handle search functionality', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search transactions, budgets...');
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'grocery' } });
    expect(searchInput).toHaveValue('grocery');
  });

  it('should handle tab switching', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    // Initially on overview tab
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();

    // Switch to transactions tab
    const transactionsTab = screen.getByText('Transactions');
    fireEvent.click(transactionsTab);

    // Switch to budgets tab
    const budgetsTab = screen.getByText('Budgets');
    fireEvent.click(budgetsTab);
  });

  it('should display transaction information when transactions exist', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    // Check for transaction in the overview tab
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
  });

  it('should display budget progress when budgets exist', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    // Check for budget progress in the overview tab
    expect(screen.getByText('Budget Progress')).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    expect(() => {
      render(
        <TestWrapper>
          <FinanceHub />
        </TestWrapper>
      );
    }).not.toThrow();
  });

  it('should display all main sections', () => {
    render(
      <TestWrapper>
        <FinanceHub />
      </TestWrapper>
    );

    // Check that all main sections are present
    expect(screen.getByText('Finance & Payments')).toBeInTheDocument();
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
  });
});
