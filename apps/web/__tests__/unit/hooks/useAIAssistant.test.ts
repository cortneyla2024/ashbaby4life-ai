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

describe('useAIAssistant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAIAssistant());

    expect(result.current.conversations).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('should create a new conversation', async () => {
    const { result } = renderHook(() => useAIAssistant());

    await act(async () => {
      const conversation = await result.current.createConversation();
      expect(conversation.title).toBe('Conversation 1');
      expect(conversation.messages).toEqual([]);
    });

    expect(result.current.conversations).toHaveLength(1);
  });

  it('should send a message to a conversation', async () => {
    const { result } = renderHook(() => useAIAssistant());

    let conversationId: string;

    // First create a conversation
    await act(async () => {
      const conversation = await result.current.createConversation();
      conversationId = conversation.id;
    });

    // Then send a message
    await act(async () => {
      await result.current.sendMessage(conversationId!, 'Hello, AI!');
    });

    const conversation = result.current.conversations.find(c => c.id === conversationId);
    expect(conversation?.messages).toHaveLength(2); // User message + AI response
    expect(conversation?.messages[0].content).toBe('Hello, AI!');
    expect(conversation?.messages[0].type).toBe('user');
    expect(conversation?.messages[1].type).toBe('assistant');
  });

  it('should handle loading state during message sending', async () => {
    const { result } = renderHook(() => useAIAssistant());

    let conversationId: string;

    // Create a conversation first
    let conversation: any;
    await act(async () => {
      conversation = await result.current.createConversation();
    });
    conversationId = conversation.id;

    // Start the send operation
    const sendPromise = result.current.sendMessage(conversationId!, 'Test message');
    
    // During sending, loading should be true
    expect(result.current.loading).toBe(true);

    await act(async () => {
      await sendPromise;
    });

    // After sending, loading should be false
    expect(result.current.loading).toBe(false);
  });

  it('should handle multiple conversations', async () => {
    const { result } = renderHook(() => useAIAssistant());

    let conversation1Id: string;
    let conversation2Id: string;

    // Create two conversations
    await act(async () => {
      const conv1 = await result.current.createConversation();
      conversation1Id = conv1.id;
    });

    await act(async () => {
      const conv2 = await result.current.createConversation();
      conversation2Id = conv2.id;
    });

    expect(result.current.conversations).toHaveLength(2);

    // Send message to first conversation
    await act(async () => {
      await result.current.sendMessage(conversation1Id!, 'Message to conv 1');
    });

    // Send message to second conversation
    await act(async () => {
      await result.current.sendMessage(conversation2Id!, 'Message to conv 2');
    });

    const conv1 = result.current.conversations.find(c => c.id === conversation1Id);
    const conv2 = result.current.conversations.find(c => c.id === conversation2Id);

    expect(conv1?.messages).toHaveLength(2);
    expect(conv2?.messages).toHaveLength(2);
    expect(conv1?.messages[0].content).toBe('Message to conv 1');
    expect(conv2?.messages[0].content).toBe('Message to conv 2');
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useAIAssistant());

    let conversationId: string;

    // Create a conversation first
    let conversation: any;
    await act(async () => {
      conversation = await result.current.createConversation();
    });
    conversationId = conversation.id;

    // Mock fetch to throw an error
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    await act(async () => {
      await result.current.sendMessage(conversationId!, 'Error test message');
    });

    // Should not crash and should complete
    expect(result.current.loading).toBe(false);

    // Restore fetch
    global.fetch = originalFetch;
  });

  it('should maintain conversation order', async () => {
    const { result } = renderHook(() => useAIAssistant());

    let conversation1Id: string;
    let conversation2Id: string;

    // Create conversations in order
    let conv1: any, conv2: any;
    await act(async () => {
      conv1 = await result.current.createConversation();
    });
    await act(async () => {
      conv2 = await result.current.createConversation();
    });
    conversation1Id = conv1.id;
    conversation2Id = conv2.id;

    expect(result.current.conversations[0].title).toBe('Conversation 1');
    expect(result.current.conversations[1].title).toBe('Conversation 2');
  });

  it('should handle concurrent message sending', async () => {
    const { result } = renderHook(() => useAIAssistant());

    let conversationId: string;

    // Create a conversation
    await act(async () => {
      const conversation = await result.current.createConversation();
      conversationId = conversation.id;
    });

    // Send multiple messages concurrently
    await act(async () => {
      const promises = [
        result.current.sendMessage(conversationId!, 'Message 1'),
        result.current.sendMessage(conversationId!, 'Message 2'),
        result.current.sendMessage(conversationId!, 'Message 3')
      ];
      await Promise.all(promises);
    });

    const conversation = result.current.conversations.find(c => c.id === conversationId);
    expect(conversation?.messages).toHaveLength(6); // 3 user messages + 3 AI responses
    expect(result.current.loading).toBe(false);
  });

  it('should create conversations with unique IDs', async () => {
    const { result } = renderHook(() => useAIAssistant());

    let conv1: any, conv2: any;
    
    await act(async () => {
      conv1 = await result.current.createConversation();
    });
    
    await act(async () => {
      conv2 = await result.current.createConversation();
    });

    expect(conv1.id).not.toBe(conv2.id);
    expect(result.current.conversations).toHaveLength(2);
  });
});
