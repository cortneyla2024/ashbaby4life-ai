import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '@/app/dashboard/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), }),
}));
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('DashboardPage', () => {
  beforeEach(() => {
    render(<DashboardPage />);
  });

  it('should render the dashboard with correct title', () => {
    expect(screen.getByText('Welcome to Your Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Access all your platform features/)).toBeInTheDocument();
  });

  it('should display platform status', () => {
    expect(screen.getByText('Platform Status')).toBeInTheDocument();
  });

  it('should display feature cards', () => {
    const aiAssistantElements = screen.getAllByText('AI Assistant');
    expect(aiAssistantElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Finance Hub')).toBeInTheDocument();
    expect(screen.getByText('Health Tracking')).toBeInTheDocument();
    expect(screen.getByText('Education Hub')).toBeInTheDocument();
  });

  it('should show dashboard badge in header', () => {
    const badges = screen.getAllByText('Dashboard');
    expect(badges.length).toBeGreaterThan(0);
  });
});
