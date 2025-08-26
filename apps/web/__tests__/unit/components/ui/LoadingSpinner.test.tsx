import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin', 'text-blue-600', 'h-6', 'w-6');
  });

  it('should render with small size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('should render with medium size', () => {
    render(<LoadingSpinner size="md" />);
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toHaveClass('h-6', 'w-6');
  });

  it('should render with large size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('should apply custom className', () => {
    render(<LoadingSpinner className="custom-spinner" />);
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toHaveClass('custom-spinner');
  });

  it('should have correct SVG structure', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner.tagName).toBe('svg');
    expect(spinner).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(spinner).toHaveAttribute('fill', 'none');
    expect(spinner).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('should contain circle and path elements', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('img', { hidden: true });
    const circle = spinner.querySelector('circle');
    const path = spinner.querySelector('path');

    expect(circle).toBeInTheDocument();
    expect(path).toBeInTheDocument();

    expect(circle).toHaveClass('opacity-25');
    expect(path).toHaveClass('opacity-75');
  });

  it('should have correct circle attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('img', { hidden: true });
    const circle = spinner.querySelector('circle');

    expect(circle).toHaveAttribute('cx', '12');
    expect(circle).toHaveAttribute('cy', '12');
    expect(circle).toHaveAttribute('r', '10');
    expect(circle).toHaveAttribute('stroke', 'currentColor');
    expect(circle).toHaveAttribute('stroke-width', '4');
  });

  it('should have correct path attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('img', { hidden: true });
    const path = spinner.querySelector('path');

    expect(path).toHaveAttribute('fill', 'currentColor');
    expect(path).toHaveAttribute('d', 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z');
  });

  it('should combine custom className with default classes', () => {
    render(<LoadingSpinner size="lg" className="custom-class" />);
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toHaveClass('animate-spin', 'text-blue-600', 'h-8', 'w-8', 'custom-class');
  });

  it('should be accessible', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it('should render multiple spinners with different sizes', () => {
    render(
      <div>
        <LoadingSpinner size="sm" />
        <LoadingSpinner size="md" />
        <LoadingSpinner size="lg" />
      </div>
    );

    const spinners = screen.getAllByRole('img', { hidden: true });
    expect(spinners).toHaveLength(3);
    expect(spinners[0]).toHaveClass('h-4', 'w-4');
    expect(spinners[1]).toHaveClass('h-6', 'w-6');
    expect(spinners[2]).toHaveClass('h-8', 'w-8');
  });
});
