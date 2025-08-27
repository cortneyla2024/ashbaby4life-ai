import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FamilyPage from '@/app/family/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), }),
}));
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('FamilyPage', () => {
  beforeEach(() => {
    render(<FamilyPage />);
  });

  it('should render the family systems with correct title', () => {
    const badges = screen.getAllByText('Family Hub');
    expect(badges.length).toBeGreaterThan(0);
    expect(screen.getByText(/Multi-admin family management with child protection and AI-guided communication/)).toBeInTheDocument();
  });

  it('should display all tabs', () => {
    expect(screen.getByText('Overview')).toBeInTheDocument();
    const familyMembersElements = screen.getAllByText('Family Members');
    expect(familyMembersElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Child Protection')).toBeInTheDocument();
    expect(screen.getByText('AI Communication')).toBeInTheDocument();
  });

  it('should show family hub badge in header', () => {
    const badges = screen.getAllByText('Family Hub');
    expect(badges.length).toBeGreaterThan(0);
  });
});
