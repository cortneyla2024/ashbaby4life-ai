import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { ToasterProvider, useToaster, ToasterComponent } from '@/components/ui/Toaster';

// Test component to access context
const TestComponent = () => {
  const { toasts, addToast, removeToast, clearToasts } = useToaster();
  
  return (
    <div>
      <div data-testid="toasts-count">{toasts.length}</div>
      <button 
        data-testid="add-success" 
        onClick={() => addToast({ type: 'success', title: 'Success message' })}
      >
        Add Success
      </button>
      <button 
        data-testid="add-error" 
        onClick={() => addToast({ type: 'error', title: 'Error message' })}
      >
        Add Error
      </button>
      <button 
        data-testid="add-warning" 
        onClick={() => addToast({ type: 'warning', title: 'Warning message' })}
      >
        Add Warning
      </button>
      <button 
        data-testid="add-info" 
        onClick={() => addToast({ type: 'info', title: 'Info message' })}
      >
        Add Info
      </button>
      <button 
        data-testid="add-with-message" 
        onClick={() => addToast({ 
          type: 'success', 
          title: 'With Message', 
          message: 'This is a detailed message' 
        })}
      >
        Add with Message
      </button>
      <button 
        data-testid="add-with-action" 
        onClick={() => addToast({ 
          type: 'info', 
          title: 'With Action', 
          action: { label: 'Undo', onClick: () => console.log('Undo clicked') }
        })}
      >
        Add with Action
      </button>
      <button 
        data-testid="add-persistent" 
        onClick={() => addToast({ 
          type: 'warning', 
          title: 'Persistent', 
          duration: 0 
        })}
      >
        Add Persistent
      </button>
      <button 
        data-testid="remove-first" 
        onClick={() => toasts.length > 0 && removeToast(toasts[0].id)}
      >
        Remove First
      </button>
      <button 
        data-testid="clear-all" 
        onClick={clearToasts}
      >
        Clear All
      </button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ToasterProvider>
      {component}
    </ToasterProvider>
  );
};

describe('Toaster', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('ToasterProvider', () => {
    it('should provide initial state', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByTestId('toasts-count')).toHaveTextContent('0');
    });

    it('should add success toast', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-success'));
      expect(screen.getByTestId('toasts-count')).toHaveTextContent('1');
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('should add error toast', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-error'));
      expect(screen.getByTestId('toasts-count')).toHaveTextContent('1');
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should add warning toast', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-warning'));
      expect(screen.getByTestId('toasts-count')).toHaveTextContent('1');
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    it('should add info toast', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-info'));
      expect(screen.getByTestId('toasts-count')).toHaveTextContent('1');
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });

    it('should add toast with message', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-with-message'));
      expect(screen.getByText('With Message')).toBeInTheDocument();
      expect(screen.getByText('This is a detailed message')).toBeInTheDocument();
    });

    it('should add toast with action', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-with-action'));
      expect(screen.getByText('With Action')).toBeInTheDocument();
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    it('should add persistent toast', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-persistent'));
      expect(screen.getByText('Persistent')).toBeInTheDocument();
      
      // Fast-forward time - toast should still be there
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      expect(screen.getByText('Persistent')).toBeInTheDocument();
    });

    it('should remove toast by id', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-success'));
      expect(screen.getByTestId('toasts-count')).toHaveTextContent('1');
      
      fireEvent.click(screen.getByTestId('remove-first'));
      expect(screen.getByTestId('toasts-count')).toHaveTextContent('0');
    });

    it('should clear all toasts', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-success'));
      fireEvent.click(screen.getByTestId('add-error'));
      expect(screen.getByTestId('toasts-count')).toHaveTextContent('2');
      
      fireEvent.click(screen.getByTestId('clear-all'));
      expect(screen.getByTestId('toasts-count')).toHaveTextContent('0');
    });

    it('should auto-remove toast after duration', async () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-success'));
      expect(screen.getByTestId('toasts-count')).toHaveTextContent('1');
      
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('toasts-count')).toHaveTextContent('0');
      });
    });

    it('should handle multiple toasts', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-success'));
      fireEvent.click(screen.getByTestId('add-error'));
      fireEvent.click(screen.getByTestId('add-warning'));
      
      expect(screen.getByTestId('toasts-count')).toHaveTextContent('3');
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    it('should throw error when useToaster is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useToaster must be used within a ToasterProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Toast Component', () => {
        it('should render success toast with correct styling', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-success'));

      const toast = screen.getByText('Success message').closest('div');
      const outerToast = toast?.parentElement?.parentElement?.parentElement;
      expect(outerToast).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800');
    });

    it('should render error toast with correct styling', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-error'));

      const toast = screen.getByText('Error message').closest('div');
      const outerToast = toast?.parentElement?.parentElement?.parentElement;
      expect(outerToast).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
    });

    it('should render warning toast with correct styling', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-warning'));

      const toast = screen.getByText('Warning message').closest('div');
      const outerToast = toast?.parentElement?.parentElement?.parentElement;
      expect(outerToast).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800');
    });

    it('should render info toast with correct styling', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-info'));

      const toast = screen.getByText('Info message').closest('div');
      const outerToast = toast?.parentElement?.parentElement?.parentElement;
      expect(outerToast).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
    });

    it('should render close button', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-success'));
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should close toast when close button is clicked', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-success'));
      expect(screen.getByTestId('toasts-count')).toHaveTextContent('1');
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(screen.getByTestId('toasts-count')).toHaveTextContent('0');
    });

    it('should handle action button click', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-with-action'));
      
      const actionButton = screen.getByText('Undo');
      fireEvent.click(actionButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Undo clicked');
      consoleSpy.mockRestore();
    });

        it('should render correct icons for each toast type', () => {
      renderWithProvider(<TestComponent />);

      fireEvent.click(screen.getByTestId('add-success'));
      const successToast = screen.getByText('Success message').closest('div')?.parentElement?.parentElement;
      expect(successToast?.querySelector('svg')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('add-error'));
      const errorToast = screen.getByText('Error message').closest('div')?.parentElement?.parentElement;
      expect(errorToast?.querySelector('svg')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('add-warning'));
      const warningToast = screen.getByText('Warning message').closest('div')?.parentElement?.parentElement;
      expect(warningToast?.querySelector('svg')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('add-info'));
      const infoToast = screen.getByText('Info message').closest('div')?.parentElement?.parentElement;
      expect(infoToast?.querySelector('svg')).toBeInTheDocument();
    });

    it('should not render toasts when empty', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    });

        it('should be accessible', () => {
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId('add-success'));

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('ToasterComponent', () => {
    it('should render standalone toaster component', () => {
      render(
        <ToasterProvider>
          <ToasterComponent />
        </ToasterProvider>
      );
      // Should render without errors
      expect(document.body).toBeInTheDocument();
    });
  });
});
