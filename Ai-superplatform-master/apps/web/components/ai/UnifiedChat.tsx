'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Paperclip, Smile, Image, FileText, Video, Link, Bot, User } from 'lucide-react';
import { ascendedAI } from '@/lib/ai/ascended-core';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'link' | 'system';
  sender: 'user' | 'ai';
  timestamp: Date;
  metadata?: {
    persona?: string;
    confidence?: number;
    reasoning?: string;
    attachments?: Attachment[];
  };
}

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'link';
  url: string;
  size?: number;
}

interface UnifiedChatProps {
  onPersonaChange?: (persona: string) => void;
  className?: string;
}

export default function UnifiedChat({ onPersonaChange, className = '' }: UnifiedChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<string>('General');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAttachments, setShowAttachments] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize AI and send welcome message
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await ascendedAI.initialize();
        
        const welcomeMessage: Message = {
          id: 'welcome',
          content: "Hello! I'm Hope, your AI companion. I'm here to help you with anything you need - from learning and creativity to mental health support and practical assistance. How can I help you today?",
          type: 'text',
          sender: 'ai',
          timestamp: new Date(),
          metadata: {
            persona: 'General',
            confidence: 1.0,
            reasoning: 'Welcome message to establish connection'
          }
        };
        
        setMessages([welcomeMessage]);
      } catch (error) {
        console.error('Error initializing AI:', error);
      }
    };

    initializeChat();
  }, []);

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      type: 'text',
      sender: 'user',
      timestamp: new Date(),
      metadata: {
        attachments: [...attachments]
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setAttachments([]);
    setIsTyping(true);

    try {
      // Process with AI
      const response = await ascendedAI.processInput(inputValue, {
        attachments,
        conversationHistory: messages
      });

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response.content,
        type: 'text',
        sender: 'ai',
        timestamp: new Date(),
        metadata: {
          persona: response.persona,
          confidence: response.confidence,
          reasoning: response.reasoning
        }
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update persona if changed
      if (response.persona !== currentPersona) {
        setCurrentPersona(response.persona);
        onPersonaChange?.(response.persona);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "I'm sorry, I encountered an error processing your message. Please try again.",
        type: 'text',
        sender: 'ai',
        timestamp: new Date(),
        metadata: {
          persona: 'General',
          confidence: 0.5,
          reasoning: 'Error handling'
        }
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, attachments, messages, currentPersona, onPersonaChange]);

  // Handle voice recording
  const handleVoiceRecording = useCallback(async () => {
    if (isRecording) {
      setIsRecording(false);
      // Stop recording logic here
      return;
    }

    try {
      setIsRecording(true);
      // Start recording logic here
      // In a real implementation, this would use Web Speech API or similar
      
      // Simulate recording for demo
      setTimeout(() => {
        setIsRecording(false);
        setInputValue('Hello, this is a voice message');
      }, 3000);
    } catch (error) {
      console.error('Error with voice recording:', error);
      setIsRecording(false);
    }
  }, [isRecording]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const attachment: Attachment = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(file),
        size: file.size
      };

      setAttachments(prev => [...prev, attachment]);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Handle link attachment
  const handleLinkAttachment = useCallback(() => {
    const url = prompt('Enter a URL to attach:');
    if (url) {
      const attachment: Attachment = {
        id: `link-${Date.now()}`,
        name: url,
        type: 'link',
        url
      };

      setAttachments(prev => [...prev, attachment]);
    }
  }, []);

  // Remove attachment
  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  }, []);

  // Handle keyboard shortcuts
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Format message content
  const formatMessageContent = (message: Message) => {
    if (message.type === 'link') {
      return (
        <a 
          href={message.content} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {message.content}
        </a>
      );
    }

    return message.content;
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">Chat with Hope</h2>
              {currentPersona !== 'General' && (
                <p className="text-sm text-indigo-200">{currentPersona} Mode</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[70%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="text-sm">
                    {formatMessageContent(message)}
                  </div>
                  
                  {/* Attachments */}
                  {message.metadata?.attachments && message.metadata.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.metadata.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center space-x-2 text-xs">
                          {attachment.type === 'image' && <Image className="w-3 h-3" />}
                          {attachment.type === 'file' && <FileText className="w-3 h-3" />}
                          {attachment.type === 'link' && <Link className="w-3 h-3" />}
                          <span className="truncate">{attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-700" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 border">
                {attachment.type === 'image' && <Image className="w-4 h-4 text-gray-500" />}
                {attachment.type === 'file' && <FileText className="w-4 h-4 text-gray-500" />}
                {attachment.type === 'link' && <Link className="w-4 h-4 text-gray-500" />}
                <span className="text-sm text-gray-700 truncate max-w-32">{attachment.name}</span>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          {/* Attachment Button */}
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Voice Recording Button */}
          <button
            onClick={handleVoiceRecording}
            className={`p-2 rounded-full transition-colors ${
              isRecording ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() && attachments.length === 0}
            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Attachment Options */}
        {showAttachments && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex space-x-2"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Image className="w-4 h-4" />
              <span>Image</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>File</span>
            </button>
            
            <button
              onClick={handleLinkAttachment}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Link className="w-4 h-4" />
              <span>Link</span>
            </button>
          </motion.div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
