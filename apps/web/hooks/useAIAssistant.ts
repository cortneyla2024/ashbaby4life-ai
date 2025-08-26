'use client';

import { useState, useCallback } from 'react';

interface AIMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
}

export const useAIAssistant = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (conversationId: string, message: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMessage: AIMessage = {
        id: Date.now().toString(),
        content: message,
        type: 'user',
        timestamp: new Date()
      };

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: `I understand you said: "${message}". How can I help you further?`,
        type: 'assistant',
        timestamp: new Date()
      };

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, messages: [...conv.messages, newMessage, assistantMessage] }
            : conv
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = useCallback(async () => {
    const newConversation: AIConversation = {
      id: Date.now().toString(),
      title: `Conversation ${conversations.length + 1}`,
      messages: [],
      createdAt: new Date()
    };

    setConversations(prev => [...prev, newConversation]);
    return newConversation;
  }, [conversations.length]);

  return {
    conversations,
    sendMessage,
    createConversation,
    loading
  };
};
