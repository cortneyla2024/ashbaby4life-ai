import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loading from '@/app/loading';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), }),
}));

describe('Loading', () => {
  it('should render loading component', () => {
    render(<Loading />);
    
    expect(screen.getByText(/Loading.../)).toBeInTheDocument();
  });

  it('should render loading spinner', () => {
    const { container } = render(<Loading />);
    
    // Check for loading spinner elements
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should have proper loading text', () => {
    render(<Loading />);
    
    expect(screen.getByText(/Loading.../)).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    const { container } = render(<Loading />);
    
    const loadingElement = container.querySelector('.flex');
    expect(loadingElement).toBeInTheDocument();
  });
});
