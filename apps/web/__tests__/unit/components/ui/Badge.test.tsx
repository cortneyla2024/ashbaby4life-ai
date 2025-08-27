import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('should render with default props', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });
  it('should render with different variants', () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>);
    expect(screen.getByText('Default')).toBeInTheDocument();
    rerender(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toBeInTheDocument();
    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText('Destructive')).toBeInTheDocument();
    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toBeInTheDocument();
  });
  it('should apply custom className', () => {
    const { container } = render(<Badge className="custom-class">Custom Badge</Badge>);
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
  });
  it('should render with children', () => {
    render(<Badge>Child Content</Badge>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
