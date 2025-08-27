import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotFound from '@/app/not-found';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), }),
}));
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('NotFound', () => {
  it('should render 404 error message', () => {
    render(<NotFound />);
    expect(screen.getByText(/404/)).toBeInTheDocument();
    expect(screen.getByText(/Page Not Found/)).toBeInTheDocument();
  });
  it('should render go to homepage link', () => {
    render(<NotFound />);
    const homeLink = screen.getByRole('link', { name: /go to homepage/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });
  it('should have proper styling classes', () => {
    const { container } = render(<NotFound />);
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
    expect(container.querySelector('.flex')).toBeInTheDocument();
  });
});
