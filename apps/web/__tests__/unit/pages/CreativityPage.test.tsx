import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreativityPage from '@/app/creativity/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), }),
}));
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('CreativityPage', () => {
  beforeEach(() => {
    render(<CreativityPage />);
  });

  it('should render the creativity hub with correct title', () => {
    const badges = screen.getAllByText('Creativity Hub');
    expect(badges.length).toBeGreaterThan(0);
    expect(screen.getByText(/AI-powered creative expression/)).toBeInTheDocument();
  });

  it('should display all tabs', () => {
    expect(screen.getByText('My Projects')).toBeInTheDocument();
    expect(screen.getByText('AI Generation')).toBeInTheDocument();
    expect(screen.getByText('Collaboration')).toBeInTheDocument();
  });

  it('should show creativity hub badge in header', () => {
    const badges = screen.getAllByText('Creativity Hub');
    expect(badges.length).toBeGreaterThan(0);
  });
});
