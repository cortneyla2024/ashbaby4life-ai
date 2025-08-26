import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('should render with different variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-input');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');

    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-primary');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size="default">Default</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10');

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-9');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-11');

    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10 w-10');
  });

  it('should show loading spinner when loading is true', () => {
    render(<Button loading>Loading</Button>);
    
    const button = screen.getByRole('button');
    const spinner = screen.getByTestId('loading-spinner');
    
    expect(button).toBeDisabled();
    expect(spinner).toBeInTheDocument();
  });

  it('should show icon when provided and not loading', () => {
    const TestIcon = () => <span data-testid="test-icon">🚀</span>;
    
    render(<Button icon={<TestIcon />}>With Icon</Button>);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('should not show icon when loading', () => {
    const TestIcon = () => <span data-testid="test-icon">🚀</span>;
    
    render(<Button loading icon={<TestIcon />}>Loading</Button>);
    
    expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not handle click events when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should not handle click events when loading', () => {
    const handleClick = jest.fn();
    render(<Button loading onClick={handleClick}>Loading</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Test</Button>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('should pass through additional props', () => {
    render(<Button data-testid="custom-button" aria-label="Custom label">Props</Button>);
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
  });

  it('should handle disabled prop', () => {
    render(<Button disabled>Disabled</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should combine disabled and loading states', () => {
    render(<Button disabled loading>Disabled Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render without children', () => {
    render(<Button />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('');
  });

  it('should render with only icon and no children', () => {
    const TestIcon = () => <span data-testid="test-icon">🚀</span>;
    
    render(<Button icon={<TestIcon />} />);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('🚀');
  });

  it('should handle keyboard events', () => {
    const handleKeyDown = jest.fn();
    render(<Button onKeyDown={handleKeyDown}>Keyboard</Button>);
    
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('should handle focus events', () => {
    const handleFocus = jest.fn();
    render(<Button onFocus={handleFocus}>Focus</Button>);
    
    fireEvent.focus(screen.getByRole('button'));
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('should handle blur events', () => {
    const handleBlur = jest.fn();
    render(<Button onBlur={handleBlur}>Blur</Button>);
    
    fireEvent.blur(screen.getByRole('button'));
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('should handle mouse events', () => {
    const handleMouseEnter = jest.fn();
    const handleMouseLeave = jest.fn();
    
    render(
      <Button onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        Mouse
      </Button>
    );
    
    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    
    expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    expect(handleMouseLeave).toHaveBeenCalledTimes(1);
  });
});
