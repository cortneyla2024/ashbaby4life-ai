import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Test component to access context
const TestComponent = () => {
  const { user, token, loading, error, login, signup, logout, clearError } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.name : 'No user'}</div>
      <div data-testid="token">{token || 'No token'}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <button 
        data-testid="login" 
        onClick={() => login('test@example.com', 'password')}
      >
        Login
      </button>
      <button 
        data-testid="signup" 
        onClick={() => signup('Test User', 'test@example.com', 'password')}
      >
        Signup
      </button>
      <button 
        data-testid="logout" 
        onClick={logout}
      >
        Logout
      </button>
      <button 
        data-testid="clear-error" 
        onClick={clearError}
      >
        Clear Error
      </button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
    
    // Mock fetch globally
    global.fetch = jest.fn();
  });

  it('should provide initial state', () => {
    renderWithProvider(<TestComponent />);

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('token')).toHaveTextContent('No token');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('No error');
  });

  it('should handle successful login', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockToken = 'mock-token';
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        user: mockUser, 
        token: mockToken 
      })
    });

    renderWithProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId('login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('token')).toHaveTextContent('mock-token');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  it('should handle login failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ 
        success: false, 
        message: 'Invalid credentials' 
      })
    });

    renderWithProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId('login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('should handle network error during login', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderWithProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId('login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error. Please try again.');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('should handle successful signup', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockToken = 'mock-token';
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        user: mockUser, 
        token: mockToken 
      })
    });

    renderWithProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId('signup').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('token')).toHaveTextContent('mock-token');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  it('should handle signup failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ 
        success: false, 
        message: 'Email already exists' 
      })
    });

    renderWithProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId('signup').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Email already exists');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('should handle network error during signup', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderWithProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId('signup').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error. Please try again.');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('should handle logout', () => {
    renderWithProvider(<TestComponent />);

    act(() => {
      screen.getByTestId('logout').click();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('token')).toHaveTextContent('No token');
  });

  it('should clear error', () => {
    renderWithProvider(<TestComponent />);

    act(() => {
      screen.getByTestId('clear-error').click();
    });

    expect(screen.getByTestId('error')).toHaveTextContent('No error');
  });

  it('should validate token on mount with valid token', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockToken = 'valid-token';
    
    localStorageMock.getItem.mockReturnValue(mockToken);
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: mockUser })
    });

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('token')).toHaveTextContent('valid-token');
    });
  });

  it('should handle invalid token on mount', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-token');
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({})
    });

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('token')).toHaveTextContent('No token');
    });
  });

  it('should handle token validation network error', async () => {
    localStorageMock.getItem.mockReturnValue('token');
    
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('token')).toHaveTextContent('No token');
    });
  });

  it('should throw error when useAuth is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });
});
