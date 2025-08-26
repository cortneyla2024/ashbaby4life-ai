'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Brain, 
  Heart, 
  Palette, 
  Scale, 
  DollarSign,
  BookOpen,
  Settings
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  persona?: string;
  reasoning?: string[];
  suggestions?: string[];
}

interface AIChatInterfaceProps {
  onSendMessage: (message: string, persona?: string) => Promise<void>;
  messages: Message[];
  isLoading?: boolean;
  currentPersona?: string;
  onPersonaChange?: (persona: string) => void;
}

const personas = [
  { value: 'balanced', label: 'Balanced', icon: Brain },
  { value: 'educator', label: 'Educator', icon: BookOpen },
  { value: 'therapist', label: 'Therapist', icon: Heart },
  { value: 'creative', label: 'Creative', icon: Palette },
  { value: 'legal_advocate', label: 'Legal Advocate', icon: Scale },
  { value: 'financial_advisor', label: 'Financial Advisor', icon: DollarSign }
];

export function AIChatInterface({
  onSendMessage,
  messages,
  isLoading = false,
  currentPersona = 'balanced',
  onPersonaChange
}: AIChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedPersona, setSelectedPersona] = useState(currentPersona);
  const [showReasoning, setShowReasoning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setSelectedPersona(currentPersona);
  }, [currentPersona]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() && !isLoading) {
      await onSendMessage(inputMessage, selectedPersona);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPersonaIcon = (persona: string) => {
    const personaData = personas.find(p => p.value === persona);
    return personaData ? personaData.icon : Brain;
  };

  const getPersonaColor = (persona: string) => {
    const colors = {
      educator: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      therapist: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      creative: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      legal_advocate: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      financial_advisor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      balanced: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[persona as keyof typeof colors] || colors.balanced;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Bot className="w-6 h-6 text-blue-500" />
          <h2 className="text-lg font-semibold">AI Assistant</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select
            options={personas}
            value={selectedPersona}
            onValueChange={(value) => {
              setSelectedPersona(value);
              onPersonaChange?.(value);
            }}
            className="w-40"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowReasoning(!showReasoning)}
            className={showReasoning ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-3xl ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`rounded-lg px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                {/* AI Persona Badge */}
                {message.sender === 'ai' && message.persona && (
                  <div className="flex items-center space-x-2 mb-2">
                    {React.createElement(getPersonaIcon(message.persona), { 
                      className: 'w-4 h-4' 
                    })}
                    <Badge className={getPersonaColor(message.persona)} size="sm">
                      {message.persona.replace('_', ' ')}
                    </Badge>
                  </div>
                )}

                {/* Message Content */}
                <div className="prose prose-sm max-w-none">
                  {message.content.split('\n').map((line, index) => (
                    <p key={index} className={index > 0 ? 'mt-2' : ''}>
                      {line}
                    </p>
                  ))}
                </div>

                {/* Reasoning (if enabled and available) */}
                {showReasoning && message.reasoning && message.reasoning.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        AI Reasoning
                      </span>
                    </div>
                    <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                      {message.reasoning.map((reason, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-gray-400">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Suggestions
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage(suggestion)}
                          className="text-xs h-6 px-2"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.sender === 'user' ? 'order-1 ml-2' : 'order-2 mr-2'
            }`}>
              {message.sender === 'user' ? (
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Bot className="w-5 h-5 text-blue-500" />
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="flex-1 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
