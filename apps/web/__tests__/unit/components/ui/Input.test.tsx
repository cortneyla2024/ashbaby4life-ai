import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('should render with default props', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border');
  });

  it('should render with placeholder', () => {
    render(<Input placeholder="Enter your name" />);
    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toBeInTheDocument();
  });

  it('should render with value', () => {
    render(<Input value="test value" onChange={() => {}} />);
    const input = screen.getByDisplayValue('test value');
    expect(input).toBeInTheDocument();
  });

  it('should render with different types', () => {
    const { rerender } = render(<Input type="text" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');

    rerender(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
  });

  it('should render with error state', () => {
    render(<Input error />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500', 'focus-visible:ring-red-500');
  });

  it('should render with custom className', () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('should render when disabled', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('should render when required', () => {
    render(<Input required />);
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('should handle onChange events', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should handle onFocus events', () => {
    const handleFocus = jest.fn();
    render(<Input onFocus={handleFocus} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('should handle onBlur events', () => {
    const handleBlur = jest.fn();
    render(<Input onBlur={handleBlur} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('should handle onKeyDown events', () => {
    const handleKeyDown = jest.fn();
    render(<Input onKeyDown={handleKeyDown} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should pass through additional props', () => {
    render(<Input data-testid="custom-input" aria-label="Custom input" />);
    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('aria-label', 'Custom input');
  });

  it('should render with id and name attributes', () => {
    render(<Input id="test-input" name="testName" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'test-input');
    expect(input).toHaveAttribute('name', 'testName');
  });

  it('should render with min and max attributes for number type', () => {
    render(<Input type="number" min="0" max="100" />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });

  it('should render with step attribute for number type', () => {
    render(<Input type="number" step="0.1" />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('step', '0.1');
  });

  it('should render with pattern attribute', () => {
    render(<Input pattern="[A-Za-z]{3}" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('pattern', '[A-Za-z]{3}');
  });

  it('should render with autocomplete attribute', () => {
    render(<Input autoComplete="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  it('should render with readonly attribute', () => {
    render(<Input readOnly />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
  });

  it('should render with size attribute', () => {
    render(<Input size={20} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('size', '20');
  });

  it('should render with maxLength attribute', () => {
    render(<Input maxLength={50} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxlength', '50');
  });

  it('should combine error state with custom className', () => {
    render(<Input error className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500', 'focus-visible:ring-red-500', 'custom-class');
  });

  it('should be accessible', () => {
    render(<Input aria-label="Test input" />);
    const input = screen.getByLabelText('Test input');
    expect(input).toBeInTheDocument();
  });

  it('should handle controlled input', () => {
    const { rerender } = render(<Input value="initial" onChange={() => {}} />);
    expect(screen.getByDisplayValue('initial')).toBeInTheDocument();
    
    rerender(<Input value="updated" onChange={() => {}} />);
    expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
  });

  it('should handle uncontrolled input', () => {
    render(<Input defaultValue="default value" />);
    const input = screen.getByDisplayValue('default value');
    expect(input).toBeInTheDocument();
  });

  it('should render multiple inputs with different states', () => {
    render(
      <div>
        <Input data-testid="normal" placeholder="Normal input" />
        <Input data-testid="error" error placeholder="Error input" />
        <Input data-testid="disabled" disabled placeholder="Disabled input" />
      </div>
    );
    
    const normalInput = screen.getByTestId('normal');
    const errorInput = screen.getByTestId('error');
    const disabledInput = screen.getByTestId('disabled');
    
    expect(normalInput).not.toHaveClass('border-red-500');
    expect(errorInput).toHaveClass('border-red-500');
    expect(disabledInput).toBeDisabled();
  });
});
