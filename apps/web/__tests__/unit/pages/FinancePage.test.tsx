import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FinancePage from '@/app/finance/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), }),
}));
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('FinancePage', () => {
  beforeEach(() => { render(<FinancePage />); });
  it('should render the finance hub with correct title', () => {
    const badges = screen.getAllByText('Finance Hub');
    expect(badges.length).toBeGreaterThan(0);
    expect(screen.getByText(/Manage your finances, track budgets/)).toBeInTheDocument();
  });
  it('should display finance overview cards', () => {
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('Monthly Budget')).toBeInTheDocument();
    expect(screen.getByText('Savings Goal')).toBeInTheDocument();
  });
  it('should show finance hub badge in header', () => {
    const badges = screen.getAllByText('Finance Hub');
    expect(badges.length).toBeGreaterThan(0);
  });
});
