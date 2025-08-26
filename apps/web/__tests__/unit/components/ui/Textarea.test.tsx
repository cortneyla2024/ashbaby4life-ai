import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from '@/components/ui/Textarea';

describe('Textarea', () => {
  it('should render with default props', () => {
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('flex', 'min-h-[80px]', 'w-full', 'rounded-md', 'border', 'border-input', 'bg-background', 'px-3', 'py-2', 'text-sm');
  });

  it('should render with placeholder', () => {
    render(<Textarea placeholder="Enter your message" />);
    const textarea = screen.getByPlaceholderText('Enter your message');
    expect(textarea).toBeInTheDocument();
  });

  it('should render with value', () => {
    render(<Textarea value="test value" onChange={() => {}} />);
    const textarea = screen.getByDisplayValue('test value');
    expect(textarea).toBeInTheDocument();
  });

  it('should render with error state', () => {
    render(<Textarea error />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-red-500', 'focus-visible:ring-red-500');
  });

  it('should render with custom className', () => {
    render(<Textarea className="custom-textarea" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-textarea');
  });

  it('should render when disabled', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('should render when required', () => {
    render(<Textarea required />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeRequired();
  });

  it('should render when readonly', () => {
    render(<Textarea readOnly />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('readonly');
  });

  it('should handle onChange events', () => {
    const handleChange = jest.fn();
    render(<Textarea onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should handle onFocus events', () => {
    const handleFocus = jest.fn();
    render(<Textarea onFocus={handleFocus} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.focus(textarea);
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('should handle onBlur events', () => {
    const handleBlur = jest.fn();
    render(<Textarea onBlur={handleBlur} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.blur(textarea);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('should handle onKeyDown events', () => {
    const handleKeyDown = jest.fn();
    render(<Textarea onKeyDown={handleKeyDown} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('should pass through additional props', () => {
    render(<Textarea data-testid="custom-textarea" aria-label="Custom textarea" />);
    const textarea = screen.getByTestId('custom-textarea');
    expect(textarea).toHaveAttribute('aria-label', 'Custom textarea');
  });

  it('should render with id and name attributes', () => {
    render(<Textarea id="test-textarea" name="testName" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('id', 'test-textarea');
    expect(textarea).toHaveAttribute('name', 'testName');
  });

  it('should render with rows and cols attributes', () => {
    render(<Textarea rows={5} cols={50} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('cols', '50');
  });

  it('should render with maxLength attribute', () => {
    render(<Textarea maxLength={100} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('maxlength', '100');
  });

  it('should render with wrap attribute', () => {
    render(<Textarea wrap="hard" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('wrap', 'hard');
  });

  it('should combine error state with custom className', () => {
    render(<Textarea error className="custom-class" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-red-500', 'focus-visible:ring-red-500', 'custom-class');
  });

  it('should be accessible', () => {
    render(<Textarea aria-label="Test textarea" />);
    const textarea = screen.getByLabelText('Test textarea');
    expect(textarea).toBeInTheDocument();
  });

  it('should handle controlled input', () => {
    const { rerender } = render(<Textarea value="initial" onChange={() => {}} />);
    expect(screen.getByDisplayValue('initial')).toBeInTheDocument();
    
    rerender(<Textarea value="updated" onChange={() => {}} />);
    expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
  });

  it('should handle uncontrolled input', () => {
    render(<Textarea defaultValue="default value" />);
    const textarea = screen.getByDisplayValue('default value');
    expect(textarea).toBeInTheDocument();
  });

  it('should handle multiline text', () => {
    const multilineText = 'Line 1\nLine 2\nLine 3';
    render(<Textarea value={multilineText} onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(multilineText);
  });

  it('should handle paste events', () => {
    const handlePaste = jest.fn();
    render(<Textarea onPaste={handlePaste} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.paste(textarea, { clipboardData: { getData: () => 'pasted text' } });
    expect(handlePaste).toHaveBeenCalledTimes(1);
  });

  it('should handle copy events', () => {
    const handleCopy = jest.fn();
    render(<Textarea onCopy={handleCopy} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.copy(textarea);
    expect(handleCopy).toHaveBeenCalledTimes(1);
  });

  it('should handle cut events', () => {
    const handleCut = jest.fn();
    render(<Textarea onCut={handleCut} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.cut(textarea);
    expect(handleCut).toHaveBeenCalledTimes(1);
  });

  it('should handle select events', () => {
    const handleSelect = jest.fn();
    render(<Textarea onSelect={handleSelect} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.select(textarea);
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it('should render multiple textareas with different states', () => {
    render(
      <div>
        <Textarea data-testid="normal" placeholder="Normal textarea" />
        <Textarea data-testid="error" error placeholder="Error textarea" />
        <Textarea data-testid="disabled" disabled placeholder="Disabled textarea" />
      </div>
    );
    
    const normalTextarea = screen.getByTestId('normal');
    const errorTextarea = screen.getByTestId('error');
    const disabledTextarea = screen.getByTestId('disabled');
    
    expect(normalTextarea).not.toHaveClass('border-red-500');
    expect(errorTextarea).toHaveClass('border-red-500');
    expect(disabledTextarea).toBeDisabled();
  });

  it('should handle resize attribute', () => {
    render(<Textarea style={{ resize: 'none' }} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveStyle({ resize: 'none' });
  });

  it('should handle spellCheck attribute', () => {
    render(<Textarea spellCheck={false} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('spellcheck', 'false');
  });

  it('should handle autoComplete attribute', () => {
    render(<Textarea autoComplete="off" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('autocomplete', 'off');
  });

  it('should handle form attribute', () => {
    render(<Textarea form="test-form" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('form', 'test-form');
  });

  it('should handle dir attribute', () => {
    render(<Textarea dir="rtl" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('dir', 'rtl');
  });

  it('should handle lang attribute', () => {
    render(<Textarea lang="en" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('lang', 'en');
  });

  it('should handle tabIndex attribute', () => {
    render(<Textarea tabIndex={0} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('tabindex', '0');
  });

  it('should handle title attribute', () => {
    render(<Textarea title="Tooltip text" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('title', 'Tooltip text');
  });
});
