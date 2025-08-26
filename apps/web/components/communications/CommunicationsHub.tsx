'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Mail, Phone, Video, Send, Search, Filter, Plus,
  Star, Archive, Trash2, Reply, Forward, MoreVertical, User,
  Clock, Check, CheckCheck, AlertCircle, Bot, Sparkles,
  Inbox, SendHorizontal, Mic, Paperclip, Smile, Settings,
  Bell, BellOff, Volume2, VolumeX, Lock, Unlock, Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCommunications } from '@/hooks/useCommunications';
import { useNotifications } from '@/hooks/useNotifications';

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
  attachments?: Attachment[];
  metadata?: {
    threadId?: string;
    replyTo?: string;
    forwardedFrom?: string;
    aiSummary?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
  };
}

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'other';
  size: number;
  url: string;
  thumbnail?: string;
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

interface CommunicationChannel {
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

interface AIRoutingRule {
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

export const CommunicationsHub: React.FC = () => {
  const { user } = useAuth();
  const {
    messages,
    conversations,
    channels,
    routingRules,
    sendMessage,
    markAsRead,
    starMessage,
    archiveMessage,
    createRoutingRule,
    loading
  } = useCommunications();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'inbox' | 'conversations' | 'channels' | 'rules'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({
    recipient: '',
    subject: '',
    content: '',
    type: 'email' as const
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || message.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || message.priority === filterPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;
  const starredCount = messages.filter(m => m.isStarred).length;
  const urgentCount = messages.filter(m => m.priority === 'urgent').length;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    try {
      await sendMessage(composeData);
      setComposeData({ recipient: '', subject: '', content: '', type: 'email' });
      setIsComposing(false);
      addNotification({ type: 'success', title: 'Message sent successfully!', message: 'Your message has been sent' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Failed to send message', message: 'There was an error sending the message' });
    }
  }, [sendMessage, composeData, addNotification]);

  const handleMarkAsRead = useCallback(async (messageId: string) => {
    try {
      await markAsRead(messageId);
      addNotification({ type: 'success', title: 'Message marked as read', message: 'Message has been marked as read' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Failed to mark message as read', message: 'There was an error marking the message as read' });
    }
  }, [markAsRead, addNotification]);

  const handleStarMessage = useCallback(async (messageId: string) => {
    try {
      await starMessage(messageId);
      addNotification({ type: 'success', title: 'Message starred', message: 'Message has been starred' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Failed to star message', message: 'There was an error starring the message' });
    }
  }, [starMessage, addNotification]);

  const handleArchiveMessage = useCallback(async (messageId: string) => {
    try {
      await archiveMessage(messageId);
      addNotification({ type: 'success', title: 'Message archived', message: 'Message has been archived' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Failed to archive message', message: 'There was an error archiving the message' });
    }
  }, [archiveMessage, addNotification]);

  const handleCreateRoutingRule = useCallback(async (rule: Partial<AIRoutingRule>) => {
    try {
      await createRoutingRule(rule as AIRoutingRule);
      addNotification({ type: 'success', title: 'Routing rule created successfully!', message: 'The routing rule has been created' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Failed to create routing rule', message: 'There was an error creating the routing rule' });
    }
  }, [createRoutingRule, addNotification]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Omni-Channel Communications
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Unified inbox with AI-powered message routing and smart organization
        </p>
      </div>

      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread Messages</h3>
            <Inbox className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {unreadCount}
          </p>
          <div className="flex items-center mt-2">
            <AlertCircle className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-sm text-blue-600 dark:text-blue-400">Requires attention</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Starred</h3>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {starredCount}
          </p>
          <div className="flex items-center mt-2">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm text-yellow-600 dark:text-yellow-400">Important messages</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent</h3>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {urgentCount}
          </p>
          <div className="flex items-center mt-2">
            <Clock className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600 dark:text-red-400">Immediate action</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Routing</h3>
            <Bot className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {routingRules.length}
          </p>
          <div className="flex items-center mt-2">
            <Sparkles className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-sm text-purple-600 dark:text-purple-400">Active rules</span>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search messages, contacts, subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Categories</option>
          <option value="personal">Personal</option>
          <option value="work">Work</option>
          <option value="spam">Spam</option>
          <option value="newsletter">Newsletter</option>
          <option value="notification">Notification</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          onClick={() => setIsComposing(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Compose
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'inbox', label: 'Unified Inbox', icon: Inbox, count: unreadCount },
            { id: 'conversations', label: 'Conversations', icon: MessageSquare, count: conversations.length },
            { id: 'channels', label: 'Channels', icon: SendHorizontal, count: channels.length },
            { id: 'rules', label: 'AI Routing', icon: Bot, count: routingRules.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'inbox' && (
            <div className="space-y-4">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      !message.isRead ? 'border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={message.sender.avatar}
                        alt={message.sender.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {message.sender.name}
                            </h3>
                            {message.sender.isVerified && (
                              <Shield className="w-4 h-4 text-blue-500" />
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              message.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              message.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              message.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {message.priority}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                            {message.isRead ? (
                              <CheckCheck className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Check className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        {message.subject && (
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {message.subject}
                          </h4>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {message.content}
                        </p>
                        {message.metadata?.aiSummary && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center space-x-1 mb-1">
                              <Bot className="w-3 h-3 text-blue-500" />
                              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">AI Summary</span>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              {message.metadata.aiSummary}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStarMessage(message.id);
                          }}
                          className={`p-1 rounded ${
                            message.isStarred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                          }`}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveMessage(message.id);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'conversations' && (
            <div className="space-y-4">
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No conversations yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Start a conversation to see it here
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={conversation.lastMessage.sender.avatar}
                            alt={conversation.lastMessage.sender.name}
                            className="w-10 h-10 rounded-full"
                          />
                          {conversation.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {conversation.participants.join(', ')}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(conversation.lastActivity).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          {conversation.isPinned && (
                            <Star className="w-3 h-3 text-yellow-500" />
                          )}
                          {conversation.isMuted && (
                            <BellOff className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map((channel) => (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        channel.isConnected ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <MessageSquare className={`w-5 h-5 ${
                          channel.isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{channel.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{channel.type}</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      channel.isConnected ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Auto Reply</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        channel.settings.autoReply
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {channel.settings.autoReply ? 'On' : 'Off'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Notifications</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        channel.settings.notifications
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {channel.settings.notifications ? 'On' : 'Off'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">AI Routing</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        channel.settings.aiRouting
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {channel.settings.aiRouting ? 'On' : 'Off'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Encryption</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        channel.settings.encryption
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {channel.settings.encryption ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last sync: {new Date(channel.lastSync).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Routing Rules</h3>
                <button
                  onClick={() => handleCreateRoutingRule({})}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </button>
              </div>
              {routingRules.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No routing rules</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create AI routing rules to automatically organize your messages
                  </p>
                </div>
              ) : (
                routingRules.map((rule) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{rule.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rule.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs rounded-full">
                          Priority {rule.priority}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Conditions</h4>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          {rule.conditions.sender && <p>Sender: {rule.conditions.sender}</p>}
                          {rule.conditions.subject && <p>Subject: {rule.conditions.subject}</p>}
                          {rule.conditions.category && <p>Category: {rule.conditions.category}</p>}
                          {rule.conditions.priority && <p>Priority: {rule.conditions.priority}</p>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Actions</h4>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <p>Route to: {rule.actions.routeTo}</p>
                          {rule.actions.autoReply && <p>Auto reply: {rule.actions.autoReply}</p>}
                          {rule.actions.markAsRead && <p>Mark as read: Yes</p>}
                          {rule.actions.archive && <p>Archive: Yes</p>}
                          {rule.actions.forward && <p>Forward to: {rule.actions.forward}</p>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
