import { render, screen } from '@testing-library/react';
import { Hero } from '../hero';

describe('Hero', () => {
  it('renders the main heading', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<Hero />);
    expect(screen.getByText(/transform every aspect of your life/i)).toBeInTheDocument();
  });

  it('renders call-to-action links', () => {
    render(<Hero />);
    expect(screen.getByRole('link', { name: /get started free/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /watch demo/i })).toBeInTheDocument();
  });

  it('renders trust indicators', () => {
    render(<Hero />);
    expect(screen.getByText(/10,000\+/i)).toBeInTheDocument();
    expect(screen.getByText(/active users/i)).toBeInTheDocument();
    expect(screen.getByText(/99\.9%/i)).toBeInTheDocument();
    expect(screen.getByText(/uptime/i)).toBeInTheDocument();
    expect(screen.getByText(/24\/7/i)).toBeInTheDocument();
    expect(screen.getByText(/ai support/i)).toBeInTheDocument();
  });

  it('renders feature highlights', () => {
    render(<Hero />);
    expect(screen.getByText(/ai-powered insights/i)).toBeInTheDocument();
    expect(screen.getByText(/health & wellness/i)).toBeInTheDocument();
    expect(screen.getByText(/life automation/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy first/i)).toBeInTheDocument();
    expect(screen.getByText(/community support/i)).toBeInTheDocument();
    expect(screen.getByText(/continuous learning/i)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<Hero />);
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
    });
  });
});


