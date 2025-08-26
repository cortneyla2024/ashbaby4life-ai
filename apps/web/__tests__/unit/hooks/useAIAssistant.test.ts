import { renderHook, act } from '@testing-library/react';
import { useAIAssistant } from '@/hooks/useAIAssistant';

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

// Mock the AI service
jest.mock('@/lib/ai/ascended-core', () => ({
  generateAIResponse: jest.fn().mockResolvedValue('AI response message')
}));

describe('useAIAssistant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAIAssistant());

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.persona).toBe('balanced');
    expect(result.current.settings).toEqual({
      maxTokens: 1000,
      temperature: 0.7,
      model: 'gpt-3.5-turbo'
    });
  });

  it('should send a message and add it to messages', async () => {
    const { result } = renderHook(() => useAIAssistant());

    await act(async () => {
      await result.current.sendMessage('Hello, AI!');
    });

    expect(result.current.messages).toHaveLength(2); // User message + AI response
    expect(result.current.messages[0].content).toBe('Hello, AI!');
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toBe('AI response message');
  });

  it('should update persona', () => {
    const { result } = renderHook(() => useAIAssistant());

    act(() => {
      result.current.updatePersona('therapeutic');
    });

    expect(result.current.persona).toBe('therapeutic');
  });

  it('should update settings', () => {
    const { result } = renderHook(() => useAIAssistant());

    act(() => {
      result.current.updateSettings({
        maxTokens: 2000,
        temperature: 0.5,
        model: 'gpt-4'
      });
    });

    expect(result.current.settings).toEqual({
      maxTokens: 2000,
      temperature: 0.5,
      model: 'gpt-4'
    });
  });

  it('should clear messages', async () => {
    const { result } = renderHook(() => useAIAssistant());

    // First send a message
    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    expect(result.current.messages).toHaveLength(2);

    // Then clear messages
    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it('should handle loading state during message sending', async () => {
    const { result } = renderHook(() => useAIAssistant());

    const sendPromise = act(async () => {
      await result.current.sendMessage('Test message');
    });

    // During sending, loading should be true
    expect(result.current.loading).toBe(true);

    await sendPromise;

    // After sending, loading should be false
    expect(result.current.loading).toBe(false);
  });

  it('should persist messages to localStorage', async () => {
    const { result } = renderHook(() => useAIAssistant());

    await act(async () => {
      await result.current.sendMessage('Persistent message');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'ai-assistant-messages',
      expect.any(String)
    );

    const storedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(storedData).toHaveLength(2);
    expect(storedData[0].content).toBe('Persistent message');
  });

  it('should load messages from localStorage on initialization', () => {
    const storedMessages = [
      {
        id: '1',
        content: 'Previous message',
        role: 'user',
        timestamp: new Date().toISOString()
      }
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedMessages));

    const { result } = renderHook(() => useAIAssistant());

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Previous message');
  });

  it('should handle error during message sending', async () => {
    // Mock the AI service to throw an error
    const { generateAIResponse } = require('@/lib/ai/ascended-core');
    generateAIResponse.mockRejectedValueOnce(new Error('AI service error'));

    const { result } = renderHook(() => useAIAssistant());

    await act(async () => {
      await result.current.sendMessage('Error test message');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].content).toContain('Error');
    expect(result.current.messages[1].role).toBe('assistant');
  });

  it('should maintain conversation context', async () => {
    const { result } = renderHook(() => useAIAssistant());

    await act(async () => {
      await result.current.sendMessage('First message');
    });

    await act(async () => {
      await result.current.sendMessage('Second message');
    });

    expect(result.current.messages).toHaveLength(4); // 2 user + 2 AI responses
    expect(result.current.messages[0].content).toBe('First message');
    expect(result.current.messages[2].content).toBe('Second message');
  });
});
