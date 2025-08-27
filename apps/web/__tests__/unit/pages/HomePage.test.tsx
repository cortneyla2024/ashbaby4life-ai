import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '@/app/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), }),
}));
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    render(<HomePage />);
  });

  it('should render the main title', () => {
    expect(screen.getByText('Welcome to CareConnect v5.0')).toBeInTheDocument();
  });

  it('should display hero description', () => {
    const descriptionElements = screen.getAllByText(/Your comprehensive AI-powered platform/);
    expect(descriptionElements.length).toBeGreaterThan(0);
  });

  it('should display CTA buttons', () => {
    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByText('Try AI Assistant')).toBeInTheDocument();
  });

  it('should display feature cards', () => {
    const aiAssistantElements = screen.getAllByText('AI Assistant');
    expect(aiAssistantElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Finance Hub')).toBeInTheDocument();
  });

  it('should display platform status', () => {
    expect(screen.getByText('Platform Status')).toBeInTheDocument();
  });

  it('should show navigation elements', () => {
    const careConnectElements = screen.getAllByText('CareConnect v5.0');
    expect(careConnectElements.length).toBeGreaterThan(0);
    const dashboardElements = screen.getAllByText('Dashboard');
    expect(dashboardElements.length).toBeGreaterThan(0);
    const aiAssistantElements = screen.getAllByText('AI Assistant');
    expect(aiAssistantElements.length).toBeGreaterThan(0);
  });
});
