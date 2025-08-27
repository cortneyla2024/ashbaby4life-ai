import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HealthPage from '@/app/health/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), }),
}));
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('HealthPage', () => {
  beforeEach(() => { render(<HealthPage />); });
  it('should render the health tracking page with correct title', () => {
    const badges = screen.getAllByText('Health Tracking');
    expect(badges.length).toBeGreaterThan(0);
    expect(screen.getByText(/Monitor your health, track wellness/)).toBeInTheDocument();
  });
  it('should display health overview cards', () => {
    expect(screen.getByText('Overall Health Score')).toBeInTheDocument();
    expect(screen.getByText('Average Sleep')).toBeInTheDocument();
    expect(screen.getByText('Daily Steps')).toBeInTheDocument();
  });
  it('should show health tracking badge in header', () => {
    const badges = screen.getAllByText('Health Tracking');
    expect(badges.length).toBeGreaterThan(0);
  });
});
