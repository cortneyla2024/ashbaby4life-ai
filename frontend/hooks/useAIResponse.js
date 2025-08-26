import { useState, useCallback } from 'react';
import { useTelemetry } from './useTelemetry';
import { useLocalStorage } from './useLocalStorage';

export const useAIResponse = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [conversationHistory, setConversationHistory] = useState([]);
    const { trackEvent } = useTelemetry();
    const { getItem, setItem } = useLocalStorage();

    // Load conversation history from localStorage
    useState(() => {
        const savedHistory = getItem('ai_conversation_history');
        if (savedHistory) {
            try {
                setConversationHistory(JSON.parse(savedHistory));
            } catch (error) {
                console.error('Failed to parse conversation history:', error);
            }
        }
    });

    // Save conversation history to localStorage
    useState(() => {
        if (conversationHistory.length > 0) {
            setItem('ai_conversation_history', JSON.stringify(conversationHistory));
        }
    });

    const sendMessage = useCallback(async (message, type = 'text') => {
        setIsLoading(true);
        setError(null);

        const startTime = Date.now();
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            trackEvent('ai_message_sent', {
                messageId,
                type,
                messageLength: typeof message === 'string' ? message.length : 0
            });

            // Prepare the request payload
            const payload = {
                message,
                type,
                conversationHistory: conversationHistory.slice(-10), // Keep last 10 messages for context
                timestamp: new Date().toISOString(),
                messageId
            };

            // Send request to AI engine
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`AI request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const responseTime = Date.now() - startTime;

            // Add to conversation history
            const newMessage = {
                id: messageId,
                type: 'user',
                content: message,
                timestamp: new Date().toISOString(),
                metadata: { type }
            };

            const aiResponse = {
                id: data.id || `ai_${Date.now()}`,
                type: 'ai',
                content: data.content,
                timestamp: new Date().toISOString(),
                metadata: {
                    responseTime,
                    model: data.model,
                    tokens: data.tokens,
                    confidence: data.confidence
                }
            };

            setConversationHistory(prev => [...prev, newMessage, aiResponse]);

            trackEvent('ai_message_received', {
                messageId,
                responseTime,
                contentLength: data.content.length,
                model: data.model
            });

            return {
                content: data.content,
                metadata: data.metadata,
                responseTime,
                id: aiResponse.id
            };

        } catch (error) {
            console.error('AI response error:', error);
            setError(error.message);

            trackEvent('ai_message_error', {
                messageId,
                error: error.message,
                responseTime: Date.now() - startTime
            });

            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [conversationHistory, trackEvent]);

    const sendFile = useCallback(async (file, description = '') => {
        setIsLoading(true);
        setError(null);

        const startTime = Date.now();
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            trackEvent('ai_file_sent', {
                fileId,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            });

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('description', description);
            formData.append('fileId', fileId);

            // Send file to AI engine
            const response = await fetch('/api/ai/process-file', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`File processing failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const responseTime = Date.now() - startTime;

            // Add to conversation history
            const fileMessage = {
                id: fileId,
                type: 'user',
                content: `File: ${file.name}`,
                timestamp: new Date().toISOString(),
                metadata: {
                    type: 'file',
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    description
                }
            };

            const aiResponse = {
                id: data.id || `ai_${Date.now()}`,
                type: 'ai',
                content: data.content,
                timestamp: new Date().toISOString(),
                metadata: {
                    responseTime,
                    model: data.model,
                    analysis: data.analysis
                }
            };

            setConversationHistory(prev => [...prev, fileMessage, aiResponse]);

            trackEvent('ai_file_processed', {
                fileId,
                responseTime,
                contentLength: data.content.length
            });

            return {
                content: data.content,
                metadata: data.metadata,
                responseTime,
                id: aiResponse.id
            };

        } catch (error) {
            console.error('File processing error:', error);
            setError(error.message);

            trackEvent('ai_file_error', {
                fileId,
                error: error.message,
                responseTime: Date.now() - startTime
            });

            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [trackEvent]);

    const clearConversation = useCallback(() => {
        setConversationHistory([]);
        setError(null);
        setItem('ai_conversation_history', '[]');
        trackEvent('ai_conversation_cleared');
    }, [trackEvent, setItem]);

    const getConversationSummary = useCallback(() => {
        if (conversationHistory.length === 0) return null;

        const userMessages = conversationHistory.filter(msg => msg.type === 'user');
        const aiMessages = conversationHistory.filter(msg => msg.type === 'ai');

        return {
            totalMessages: conversationHistory.length,
            userMessages: userMessages.length,
            aiMessages: aiMessages.length,
            firstMessage: conversationHistory[0]?.timestamp,
            lastMessage: conversationHistory[conversationHistory.length - 1]?.timestamp,
            averageResponseTime: aiMessages.reduce((sum, msg) => 
                sum + (msg.metadata?.responseTime || 0), 0) / aiMessages.length || 0
        };
    }, [conversationHistory]);

    const exportConversation = useCallback(() => {
        if (conversationHistory.length === 0) return;

        const exportData = {
            conversation: conversationHistory,
            summary: getConversationSummary(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_conversation_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        trackEvent('ai_conversation_exported');
    }, [conversationHistory, getConversationSummary, trackEvent]);

    const retryLastMessage = useCallback(async () => {
        const lastUserMessage = conversationHistory
            .filter(msg => msg.type === 'user')
            .pop();

        if (lastUserMessage) {
            // Remove the last AI response if it exists
            const lastMessageIndex = conversationHistory.findIndex(msg => msg.id === lastUserMessage.id);
            if (lastMessageIndex < conversationHistory.length - 1) {
                setConversationHistory(prev => prev.slice(0, lastMessageIndex + 1));
            }

            // Retry the message
            return await sendMessage(lastUserMessage.content, lastUserMessage.metadata?.type || 'text');
        }
    }, [conversationHistory, sendMessage]);

    const getSuggestions = useCallback(async (context = '') => {
        try {
            const response = await fetch('/api/ai/suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    context,
                    conversationHistory: conversationHistory.slice(-5) // Last 5 messages for context
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get suggestions');
            }

            const data = await response.json();
            trackEvent('ai_suggestions_requested', { count: data.suggestions.length });

            return data.suggestions;
        } catch (error) {
            console.error('Failed to get suggestions:', error);
            return [];
        }
    }, [conversationHistory, trackEvent]);

    return {
        sendMessage,
        sendFile,
        clearConversation,
        getConversationSummary,
        exportConversation,
        retryLastMessage,
        getSuggestions,
        conversationHistory,
        isLoading,
        error
    };
};
