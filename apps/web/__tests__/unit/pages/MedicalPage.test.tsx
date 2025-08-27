import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MedicalPage from '@/app/medical/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), }),
}));
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('MedicalPage', () => {
  beforeEach(() => {
    render(<MedicalPage />);
  });

  it('should render the medical hub with correct title', () => {
    const badges = screen.getAllByText('Medical Hub');
    expect(badges.length).toBeGreaterThan(0);
    expect(screen.getByText(/AI-powered healthcare management/)).toBeInTheDocument();
  });

  it('should display all tabs', () => {
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('Telehealth')).toBeInTheDocument();
    expect(screen.getByText('AI Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Empathy Interface')).toBeInTheDocument();
  });

  it('should show medical hub badge in header', () => {
    const badges = screen.getAllByText('Medical Hub');
    expect(badges.length).toBeGreaterThan(0);
  });
});
