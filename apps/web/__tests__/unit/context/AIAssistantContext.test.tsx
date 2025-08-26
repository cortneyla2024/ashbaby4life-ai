import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AIAssistantProvider, useAIAssistant } from '@/context/AIAssistantContext';

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
  const { state, sendMessage, updatePersona } = useAIAssistant();
  
  return (
    <div>
      <div data-testid="messages-count">{state.messages.length}</div>
      <div data-testid="loading">{state.isLoading.toString()}</div>
      <div data-testid="persona">{state.persona.name}</div>
      <button 
        data-testid="send-message" 
        onClick={() => sendMessage('Test message')}
      >
        Send
      </button>
      <button 
        data-testid="update-persona" 
        onClick={() => updatePersona({ name: 'therapeutic', description: 'Therapeutic AI', personality: 'healing and supportive' })}
      >
        Update Persona
      </button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AIAssistantProvider>
      {component}
    </AIAssistantProvider>
  );
};

describe('AIAssistantContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    // Mock fetch to return a successful response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: 'AI response message' })
    });
  });

  it('should provide initial state', () => {
    renderWithProvider(<TestComponent />);

    expect(screen.getByTestId('messages-count')).toHaveTextContent('0');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('persona')).toHaveTextContent('Hope');
  });

  it('should update persona when updatePersona is called', () => {
    renderWithProvider(<TestComponent />);

    act(() => {
      screen.getByTestId('update-persona').click();
    });

    expect(screen.getByTestId('persona')).toHaveTextContent('therapeutic');
  });

  it('should send message and update messages', async () => {
    renderWithProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId('send-message').click();
    });

    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.getByTestId('messages-count')).toHaveTextContent('2'); // User message + AI response
    });
  });

  it('should handle loading state during message sending', async () => {
    renderWithProvider(<TestComponent />);

    const sendButton = screen.getByTestId('send-message');
    
    act(() => {
      sendButton.click();
    });

    // Should be loading initially
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('should persist state to localStorage', async () => {
    renderWithProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId('send-message').click();
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ai-assistant-messages',
        expect.any(String)
      );
    });

    // Verify the stored data
    const setItemCalls = localStorageMock.setItem.mock.calls;
    const lastCall = setItemCalls[setItemCalls.length - 1];
    const storedData = JSON.parse(lastCall[1]);
    expect(storedData).toHaveLength(2); // User message + AI response
  });

  it('should load state from localStorage on initialization', async () => {
    const mockMessages = [
      { id: '1', role: 'user', content: 'Previous message', timestamp: new Date().toISOString() }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockMessages));

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('messages-count')).toHaveTextContent('1');
    });
    expect(screen.getByTestId('persona')).toHaveTextContent('Hope'); // Default persona
  });

  it('should handle errors gracefully', async () => {
    // Mock console.error to avoid noise in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock fetch to return an error
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    renderWithProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId('send-message').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    
    consoleSpy.mockRestore();
  });
});
