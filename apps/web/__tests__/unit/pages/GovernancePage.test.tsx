import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GovernancePage from '@/app/governance/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), }),
}));
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('GovernancePage', () => {
  beforeEach(() => {
    render(<GovernancePage />);
  });

  it('should render the governance hub with correct title', () => {
    const badges = screen.getAllByText('Governance Hub');
    expect(badges.length).toBeGreaterThan(0);
    expect(screen.getByText(/Privacy-first, ethical, and inclusive governance/)).toBeInTheDocument();
  });

  it('should display all tabs', () => {
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Privacy & Ethics')).toBeInTheDocument();
    expect(screen.getByText('Social Hubs')).toBeInTheDocument();
    expect(screen.getByText('Financial Governance')).toBeInTheDocument();
  });

  it('should display overview content by default', () => {
    expect(screen.getByText('Privacy Protection')).toBeInTheDocument();
    expect(screen.getByText('Inclusive Design')).toBeInTheDocument();
    const ethicalAIElements = screen.getAllByText('Ethical AI');
    expect(ethicalAIElements.length).toBeGreaterThan(0);
    const financialTransparencyElements = screen.getAllByText('Financial Transparency');
    expect(financialTransparencyElements.length).toBeGreaterThan(0);
  });

  it('should show governance hub badge in header', () => {
    const badges = screen.getAllByText('Governance Hub');
    expect(badges.length).toBeGreaterThan(0);
  });
});
