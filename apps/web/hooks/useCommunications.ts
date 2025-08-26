'use client';

import { useState, useCallback } from 'react';

interface Message {
  id: string;
  type: 'email' | 'sms' | 'chat' | 'voice' | 'video';
  sender: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar: string;
    isVerified: boolean;
  };
  recipient: string;
  subject?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'personal' | 'work' | 'spam' | 'newsletter' | 'notification';
  attachments?: any[];
  metadata?: {
    threadId?: string;
    replyTo?: string;
    forwardedFrom?: string;
    aiSummary?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
  };
}

interface Channel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'chat' | 'voice' | 'video';
  icon: string;
  isActive: boolean;
  isConnected: boolean;
  lastSync: Date;
  settings: {
    autoReply: boolean;
    notifications: boolean;
    aiRouting: boolean;
    encryption: boolean;
  };
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  lastActivity: Date;
  type: 'individual' | 'group' | 'channel';
}

interface RoutingRule {
  id: string;
  name: string;
  conditions: {
    sender?: string;
    subject?: string;
    content?: string;
    category?: string;
    priority?: string;
  };
  actions: {
    routeTo: string;
    autoReply?: string;
    markAsRead?: boolean;
    archive?: boolean;
    forward?: string;
  };
  isActive: boolean;
  priority: number;
}

export const useCommunications = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (data: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newMessage: Message = {
        id: Date.now().toString(),
        type: data.type || 'email',
        sender: {
          id: 'current-user',
          name: 'Current User',
          email: 'user@example.com',
          avatar: '/api/placeholder/32/32',
          isVerified: true
        },
        recipient: data.recipient || '',
        subject: data.subject,
        content: data.content || '',
        timestamp: new Date(),
        isRead: true,
        isStarred: false,
        isArchived: false,
        priority: data.priority || 'medium',
        category: data.category || 'personal'
      };

      setMessages(prev => [...prev, newMessage]);
      
      // Update channel's last message
      setChannels(prev => 
        prev.map(channel => 
          channel.id === data.channelId 
            ? { ...channel, lastMessage: newMessage }
            : channel
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createChannel = useCallback(async (name: string, type: 'email' | 'sms' | 'chat' | 'voice' | 'video') => {
    const newChannel: Channel = {
      id: Date.now().toString(),
      name,
      type,
      icon: '📧',
      isActive: true,
      isConnected: true,
      lastSync: new Date(),
      settings: {
        autoReply: false,
        notifications: true,
        aiRouting: false,
        encryption: true
      }
    };

    setChannels(prev => [...prev, newChannel]);
    return newChannel;
  }, []);

  const markAsRead = useCallback((messageId: string) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { ...message, read: true }
          : message
      )
    );
  }, []);

  const getChannelMessages = useCallback((channelId: string) => {
    // For now, return all messages since we don't have channel property
    // This should be updated when the Message interface includes channel information
    return messages;
  }, [messages]);

  const starMessage = useCallback((messageId: string) => {
    // Mock implementation
    console.log('Starring message:', messageId);
  }, []);

  const archiveMessage = useCallback((messageId: string) => {
    // Mock implementation
    console.log('Archiving message:', messageId);
  }, []);

  const createRoutingRule = useCallback((rule: any) => {
    const newRule: RoutingRule = {
      id: Date.now().toString(),
      name: rule.name || '',
      conditions: rule.conditions || {},
      actions: rule.actions || { routeTo: '' },
      isActive: rule.isActive !== undefined ? rule.isActive : true,
      priority: rule.priority || 1
    };
    setRoutingRules(prev => [...prev, newRule]);
    return newRule;
  }, []);

  return {
    messages,
    channels,
    conversations,
    routingRules,
    loading,
    sendMessage,
    createChannel,
    markAsRead,
    getChannelMessages,
    starMessage,
    archiveMessage,
    createRoutingRule
  };
};
