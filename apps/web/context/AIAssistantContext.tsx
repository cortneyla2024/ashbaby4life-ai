'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    sources?: string[];
    emotions?: string[];
  };
}

interface AIAssistantState {
  messages: AIMessage[];
  isLoading: boolean;
  error: string | null;
  persona: {
    name: string;
    description: string;
    personality: string;
  };
  settings: {
    autoRespond: boolean;
    voiceEnabled: boolean;
    contextAware: boolean;
    privacyMode: boolean;
  };
  context: {
    currentTopic: string;
    userMood: number;
    recentInteractions: string[];
  };
}

type AIAssistantAction =
  | { type: 'ADD_MESSAGE'; payload: AIMessage }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_PERSONA'; payload: Partial<AIAssistantState['persona']> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AIAssistantState['settings']> }
  | { type: 'UPDATE_CONTEXT'; payload: Partial<AIAssistantState['context']> }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'LOAD_MESSAGES'; payload: AIMessage[] };

const initialState: AIAssistantState = {
  messages: [],
  isLoading: false,
  error: null,
  persona: {
    name: 'Hope',
    description: 'Compassionate AI companion',
    personality: 'empathetic and supportive'
  },
  settings: {
    autoRespond: false,
    voiceEnabled: false,
    contextAware: true,
    privacyMode: false
  },
  context: {
    currentTopic: '',
    userMood: 5,
    recentInteractions: []
  }
};

function aiAssistantReducer(state: AIAssistantState, action: AIAssistantAction): AIAssistantState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        context: {
          ...state.context,
          recentInteractions: [
            action.payload.content,
            ...state.context.recentInteractions.slice(0, 9)
          ]
        }
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_PERSONA':
      return {
        ...state,
        persona: { ...state.persona, ...action.payload }
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    case 'UPDATE_CONTEXT':
      return {
        ...state,
        context: { ...state.context, ...action.payload }
      };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    case 'LOAD_MESSAGES':
      return { ...state, messages: action.payload };
    default:
      return state;
  }
}

interface AIAssistantContextType {
  state: AIAssistantState;
  sendMessage: (content: string) => Promise<void>;
  updatePersona: (persona: Partial<AIAssistantState['persona']>) => void;
  updateSettings: (settings: Partial<AIAssistantState['settings']>) => void;
  updateContext: (context: Partial<AIAssistantState['context']>) => void;
  clearMessages: () => void;
  loadMessages: (messages: AIMessage[]) => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(aiAssistantReducer, initialState);

  const sendMessage = async (content: string) => {
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context: state.context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: {
          confidence: data.confidence,
          sources: data.sources,
          emotions: data.emotions
        }
      };

      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updatePersona = (persona: Partial<AIAssistantState['persona']>) => {
    dispatch({ type: 'UPDATE_PERSONA', payload: persona });
  };

  const updateSettings = (settings: Partial<AIAssistantState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const updateContext = (context: Partial<AIAssistantState['context']>) => {
    dispatch({ type: 'UPDATE_CONTEXT', payload: context });
  };

  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  const loadMessages = (messages: AIMessage[]) => {
    dispatch({ type: 'LOAD_MESSAGES', payload: messages });
  };

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('ai-assistant-messages');
    if (savedMessages) {
      try {
        const messages = JSON.parse(savedMessages);
        loadMessages(messages);
      } catch (error) {
        console.error('Failed to load saved messages:', error);
      }
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('ai-assistant-messages', JSON.stringify(state.messages));
  }, [state.messages]);

  const value: AIAssistantContextType = {
    state,
    sendMessage,
    updatePersona,
    updateSettings,
    updateContext,
    clearMessages,
    loadMessages
  };

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
}
