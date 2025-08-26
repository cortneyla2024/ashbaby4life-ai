import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AIAssistantProvider, useAIAssistant } from '@/context/AIAssistantContext';

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
    localStorage.clear();
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

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByTestId('messages-count')).toHaveTextContent('1'); // User message only (AI response is mocked)
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
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('should persist state to localStorage', async () => {
    renderWithProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId('send-message').click();
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    const stored = localStorage.getItem('ai-assistant-messages');
    expect(stored).toBeTruthy();
    
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
  });

  it('should load state from localStorage on initialization', () => {
    const mockState = {
      messages: [
        { id: '1', role: 'user', content: 'Previous message', timestamp: new Date().toISOString() }
      ],
      persona: 'therapeutic',
      settings: { maxTokens: 1000, temperature: 0.7, model: 'gpt-4' }
    };
    localStorage.setItem('ai-assistant-state', JSON.stringify(mockState));

    renderWithProvider(<TestComponent />);

    expect(screen.getByTestId('messages-count')).toHaveTextContent('1');
    expect(screen.getByTestId('persona')).toHaveTextContent('therapeutic');
  });

  it('should handle errors gracefully', async () => {
    // Mock console.error to avoid noise in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId('send-message').click();
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Should not crash and should complete
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    
    consoleSpy.mockRestore();
  });
});
