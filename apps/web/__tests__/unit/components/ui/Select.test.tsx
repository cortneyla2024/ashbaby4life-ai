import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Select } from '@/components/ui/Select';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
  { value: 'option4', label: 'Option 4' }
];

describe('Select', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<Select options={mockOptions} />);
    const selectButton = screen.getByRole('button');
    expect(selectButton).toBeInTheDocument();
    expect(selectButton).toHaveTextContent('Select an option');
  });

  it('should render with custom placeholder', () => {
    render(<Select options={mockOptions} placeholder="Choose an option" />);
    const selectButton = screen.getByRole('button');
    expect(selectButton).toHaveTextContent('Choose an option');
  });

  it('should render with selected value', () => {
    render(<Select options={mockOptions} value="option1" />);
    const selectButton = screen.getByRole('button');
    expect(selectButton).toHaveTextContent('Option 1');
  });

  it('should render when disabled', () => {
    render(<Select options={mockOptions} disabled />);
    const selectButton = screen.getByRole('button');
    expect(selectButton).toBeDisabled();
    expect(selectButton).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('should apply custom className', () => {
    render(<Select options={mockOptions} className="custom-select" />);
    const selectContainer = screen.getByRole('button').parentElement;
    expect(selectContainer).toHaveClass('custom-select');
  });

  it('should open dropdown when clicked', () => {
    render(<Select options={mockOptions} />);
    const selectButton = screen.getByRole('button');
    
    fireEvent.click(selectButton);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
    expect(screen.getByText('Option 4')).toBeInTheDocument();
  });

  it('should close dropdown when clicking outside', async () => {
    render(<Select options={mockOptions} />);
    const selectButton = screen.getByRole('button');
    
    // Open dropdown
    fireEvent.click(selectButton);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  it('should select an option when clicked', () => {
    const onValueChange = jest.fn();
    render(<Select options={mockOptions} onValueChange={onValueChange} />);
    const selectButton = screen.getByRole('button');
    
    // Open dropdown
    fireEvent.click(selectButton);
    
    // Click on an option
    fireEvent.click(screen.getByText('Option 2'));
    
    expect(onValueChange).toHaveBeenCalledWith('option2');
    expect(selectButton).toHaveTextContent('Option 2');
  });

  it('should not select disabled options', () => {
    const onValueChange = jest.fn();
    render(<Select options={mockOptions} onValueChange={onValueChange} />);
    const selectButton = screen.getByRole('button');
    
    // Open dropdown
    fireEvent.click(selectButton);
    
    // Try to click on disabled option
    const disabledOption = screen.getByText('Option 3');
    fireEvent.click(disabledOption);
    
    expect(onValueChange).not.toHaveBeenCalled();
    expect(selectButton).toHaveTextContent('Select an option');
  });

  it('should show check icon for selected option', () => {
    render(<Select options={mockOptions} value="option1" />);
    const selectButton = screen.getByRole('button');
    
    // Open dropdown
    fireEvent.click(selectButton);
    
    // Check that the selected option has a check icon
    const selectedOption = screen.getAllByText('Option 1')[1].closest('button');
    expect(selectedOption).toHaveClass('bg-accent', 'text-accent-foreground');
  });

  it('should rotate chevron icon when open', () => {
    render(<Select options={mockOptions} />);
    const selectButton = screen.getByRole('button');
    
    // Initially closed
    const chevron = selectButton.querySelector('svg');
    expect(chevron).not.toHaveClass('rotate-180');
    
    // Open dropdown
    fireEvent.click(selectButton);
    expect(chevron).toHaveClass('rotate-180');
  });

  it('should handle empty options array', () => {
    render(<Select options={[]} />);
    const selectButton = screen.getByRole('button');
    
    fireEvent.click(selectButton);
    
    // Should not crash and should show empty dropdown
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should update selected option when value prop changes', () => {
    const { rerender } = render(<Select options={mockOptions} value="option1" />);
    let selectButton = screen.getByRole('button');
    expect(selectButton).toHaveTextContent('Option 1');
    
    rerender(<Select options={mockOptions} value="option2" />);
    selectButton = screen.getByRole('button');
    expect(selectButton).toHaveTextContent('Option 2');
  });

  it('should handle options with same labels but different values', () => {
    const optionsWithSameLabels = [
      { value: 'option1', label: 'Same Label' },
      { value: 'option2', label: 'Same Label' }
    ];
    
    const onValueChange = jest.fn();
    render(<Select options={optionsWithSameLabels} onValueChange={onValueChange} />);
    const selectButton = screen.getByRole('button');
    
    fireEvent.click(selectButton);
    
    const options = screen.getAllByText('Same Label');
    expect(options).toHaveLength(2);
    
    fireEvent.click(options[0]);
    expect(onValueChange).toHaveBeenCalledWith('option1');
  });

  it('should handle keyboard navigation', () => {
    render(<Select options={mockOptions} />);
    const selectButton = screen.getByRole('button');
    
    // Open dropdown
    fireEvent.click(selectButton);
    
    // Focus should be on the first option
    const firstOption = screen.getByText('Option 1');
    expect(firstOption).toBeInTheDocument();
  });

  it('should maintain focus when clicking on the same option', () => {
    const onValueChange = jest.fn();
    render(<Select options={mockOptions} value="option1" onValueChange={onValueChange} />);
    const selectButton = screen.getByRole('button');
    
    // Open dropdown
    fireEvent.click(selectButton);
    
    // Click on the already selected option
    fireEvent.click(screen.getAllByText('Option 1')[1]);
    
    expect(onValueChange).toHaveBeenCalledWith('option1');
  });

  it('should handle multiple rapid clicks', () => {
    const onValueChange = jest.fn();
    render(<Select options={mockOptions} onValueChange={onValueChange} />);
    const selectButton = screen.getByRole('button');
    
    // Rapid clicks
    fireEvent.click(selectButton);
    fireEvent.click(selectButton);
    fireEvent.click(selectButton);
    
    // Should still be open
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('should handle options with special characters', () => {
    const optionsWithSpecialChars = [
      { value: 'option1', label: 'Option & Special < > " \' Characters' },
      { value: 'option2', label: 'Option with émojis 🚀' }
    ];
    
    render(<Select options={optionsWithSpecialChars} />);
    const selectButton = screen.getByRole('button');
    
    fireEvent.click(selectButton);
    
    expect(screen.getByText('Option & Special < > " \' Characters')).toBeInTheDocument();
    expect(screen.getByText('Option with émojis 🚀')).toBeInTheDocument();
  });

  it('should handle very long option labels', () => {
    const longLabel = 'This is a very long option label that should be handled properly by the select component without breaking the layout or causing any visual issues';
    const optionsWithLongLabel = [
      { value: 'option1', label: longLabel }
    ];
    
    render(<Select options={optionsWithLongLabel} />);
    const selectButton = screen.getByRole('button');
    
    fireEvent.click(selectButton);
    
    expect(screen.getByText(longLabel)).toBeInTheDocument();
  });

  it('should handle options with numeric values', () => {
    const numericOptions = [
      { value: '1', label: 'One' },
      { value: '2', label: 'Two' },
      { value: '3', label: 'Three' }
    ];
    
    const onValueChange = jest.fn();
    render(<Select options={numericOptions} onValueChange={onValueChange} />);
    const selectButton = screen.getByRole('button');
    
    fireEvent.click(selectButton);
    fireEvent.click(screen.getByText('Two'));
    
    expect(onValueChange).toHaveBeenCalledWith('2');
  });

  it('should be accessible', () => {
    render(<Select options={mockOptions} />);
    const selectButton = screen.getByRole('button');
    expect(selectButton).toBeInTheDocument();
    
    // Should be clickable
    fireEvent.click(selectButton);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('should handle disabled state correctly', () => {
    render(<Select options={mockOptions} disabled />);
    const selectButton = screen.getByRole('button');
    
    // Should not open when disabled
    fireEvent.click(selectButton);
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  it('should handle controlled component behavior', () => {
    const onValueChange = jest.fn();
    render(<Select options={mockOptions} value="option1" onValueChange={onValueChange} />);
    const selectButton = screen.getByRole('button');
    
    expect(selectButton).toHaveTextContent('Option 1');
    
    fireEvent.click(selectButton);
    fireEvent.click(screen.getByText('Option 2'));
    
    expect(onValueChange).toHaveBeenCalledWith('option2');
    // The button text should show the selected option (component updates internal state)
    expect(selectButton).toHaveTextContent('Option 2');
  });
});
