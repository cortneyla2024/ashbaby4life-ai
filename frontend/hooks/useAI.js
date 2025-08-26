/**
 * React Hook for AI Interactions
 * Provides easy access to AI functionality in React components
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import useBridge from '../integration/useBridge';

const useAI = (config = {}) => {
    // Bridge instance
    const bridge = useBridge(config);
    
    // AI state
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastResponse, setLastResponse] = useState(null);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [aiPersonality, setAiPersonality] = useState({
        empathy: 0.9,
        patience: 0.8,
        humor: 0.6,
        formality: 0.4,
        enthusiasm: 0.7,
        analytical: 0.8,
        creative: 0.7,
        supportive: 0.9
    });
    
    // Context and memory
    const [context, setContext] = useState({});
    const [userPreferences, setUserPreferences] = useState({});
    const [sessionData, setSessionData] = useState({});
    
    // Refs for managing state
    const processingRef = useRef(false);
    const abortControllerRef = useRef(null);
    
    // Initialize AI session
    const initializeSession = useCallback(async (userId, sessionConfig = {}) => {
        try {
            setIsProcessing(true);
            
            const session = await bridge.createSession(userId, {
                ai_personality: aiPersonality,
                user_preferences: userPreferences,
                ...sessionConfig
            });
            
            setSessionData(session);
            setContext(prev => ({
                ...prev,
                session_id: session.sessionId,
                user_id: userId,
                start_time: new Date().toISOString()
            }));
            
            return session;
            
        } catch (error) {
            console.error('Error initializing AI session:', error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }, [bridge, aiPersonality, userPreferences]);
    
    // Send message to AI
    const sendMessage = useCallback(async (message, options = {}) => {
        try {
            if (processingRef.current) {
                throw new Error('AI is already processing a request');
            }
            
            processingRef.current = true;
            setIsProcessing(true);
            
            // Create abort controller for cancellation
            abortControllerRef.current = new AbortController();
            
            // Prepare context
            const messageContext = {
                ...context,
                conversation_history: conversationHistory.slice(-10), // Last 10 messages
                user_preferences,
                session_data: sessionData,
                timestamp: new Date().toISOString(),
                ...options.context
            };
            
            // Add message to conversation history
            const userMessage = {
                id: `msg_${Date.now()}`,
                type: 'user',
                content: message,
                timestamp: new Date().toISOString(),
                context: messageContext
            };
            
            setConversationHistory(prev => [...prev, userMessage]);
            
            // Send to AI
            const response = await bridge.sendToAI(message, messageContext);
            
            // Add AI response to conversation history
            const aiMessage = {
                id: `ai_${Date.now()}`,
                type: 'ai',
                content: response.response,
                timestamp: new Date().toISOString(),
                metadata: response.metadata,
                confidence: response.metadata?.confidence_score || 0.8
            };
            
            setConversationHistory(prev => [...prev, aiMessage]);
            setLastResponse(response);
            
            // Update context with new information
            setContext(prev => ({
                ...prev,
                last_interaction: new Date().toISOString(),
                conversation_length: conversationHistory.length + 2
            }));
            
            return response;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('AI request was cancelled');
            } else {
                console.error('Error sending message to AI:', error);
            }
            throw error;
        } finally {
            processingRef.current = false;
            setIsProcessing(false);
            abortControllerRef.current = null;
        }
    }, [bridge, context, conversationHistory, userPreferences, sessionData]);
    
    // Cancel current AI request
    const cancelRequest = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);
    
    // Update AI personality
    const updatePersonality = useCallback((newPersonality) => {
        setAiPersonality(prev => ({
            ...prev,
            ...newPersonality
        }));
    }, []);
    
    // Update user preferences
    const updatePreferences = useCallback((newPreferences) => {
        setUserPreferences(prev => ({
            ...prev,
            ...newPreferences
        }));
    }, []);
    
    // Clear conversation history
    const clearHistory = useCallback(() => {
        setConversationHistory([]);
        setLastResponse(null);
    }, []);
    
    // Get conversation summary
    const getConversationSummary = useCallback(() => {
        if (conversationHistory.length === 0) {
            return null;
        }
        
        const userMessages = conversationHistory.filter(msg => msg.type === 'user');
        const aiMessages = conversationHistory.filter(msg => msg.type === 'ai');
        
        return {
            total_messages: conversationHistory.length,
            user_messages: userMessages.length,
            ai_messages: aiMessages.length,
            duration: conversationHistory.length > 0 ? 
                new Date(conversationHistory[conversationHistory.length - 1].timestamp) - 
                new Date(conversationHistory[0].timestamp) : 0,
            topics: extractTopics(conversationHistory),
            emotions: extractEmotions(conversationHistory),
            average_confidence: aiMessages.reduce((sum, msg) => sum + (msg.confidence || 0), 0) / aiMessages.length
        };
    }, [conversationHistory]);
    
    // Extract topics from conversation
    const extractTopics = useCallback((history) => {
        const topics = new Set();
        
        history.forEach(message => {
            const content = message.content.toLowerCase();
            
            // Simple topic extraction (in a real implementation, you'd use NLP)
            if (content.includes('stress') || content.includes('anxiety')) {
                topics.add('mental_health');
            }
            if (content.includes('money') || content.includes('finance') || content.includes('budget')) {
                topics.add('financial_wellness');
            }
            if (content.includes('goal') || content.includes('plan') || content.includes('achieve')) {
                topics.add('personal_growth');
            }
            if (content.includes('creative') || content.includes('art') || content.includes('write')) {
                topics.add('creative_expression');
            }
            if (content.includes('friend') || content.includes('relationship') || content.includes('social')) {
                topics.add('social_connection');
            }
            if (content.includes('routine') || content.includes('automate') || content.includes('schedule')) {
                topics.add('automation_routines');
            }
        });
        
        return Array.from(topics);
    }, []);
    
    // Extract emotions from conversation
    const extractEmotions = useCallback((history) => {
        const emotions = [];
        
        history.forEach(message => {
            if (message.metadata?.emotion) {
                emotions.push({
                    emotion: message.metadata.emotion,
                    timestamp: message.timestamp,
                    confidence: message.metadata.confidence || 0.8
                });
            }
        });
        
        return emotions;
    }, []);
    
    // Send voice message
    const sendVoiceMessage = useCallback(async (audioData) => {
        try {
            // First, recognize speech
            const speechResult = await bridge.recognizeSpeech(audioData);
            
            if (speechResult.text) {
                // Then send the recognized text to AI
                return await sendMessage(speechResult.text, {
                    context: {
                        input_method: 'voice',
                        speech_confidence: speechResult.confidence
                    }
                });
            } else {
                throw new Error('Speech recognition failed');
            }
            
        } catch (error) {
            console.error('Error processing voice message:', error);
            throw error;
        }
    }, [bridge, sendMessage]);
    
    // Get AI response as speech
    const getSpeechResponse = useCallback(async (text, voiceProfile = null) => {
        try {
            const audioData = await bridge.synthesizeSpeech(text, voiceProfile);
            return audioData;
        } catch (error) {
            console.error('Error synthesizing speech:', error);
            throw error;
        }
    }, [bridge]);
    
    // Analyze video for context
    const analyzeVideo = useCallback(async (videoData) => {
        try {
            const analysis = await bridge.processVideo(videoData);
            
            // Update context with video analysis
            setContext(prev => ({
                ...prev,
                video_analysis: analysis,
                last_video_analysis: new Date().toISOString()
            }));
            
            return analysis;
            
        } catch (error) {
            console.error('Error analyzing video:', error);
            throw error;
        }
    }, [bridge]);
    
    // Analyze audio for context
    const analyzeAudio = useCallback(async (audioData) => {
        try {
            const analysis = await bridge.processAudio(audioData);
            
            // Update context with audio analysis
            setContext(prev => ({
                ...prev,
                audio_analysis: analysis,
                last_audio_analysis: new Date().toISOString()
            }));
            
            return analysis;
            
        } catch (error) {
            console.error('Error analyzing audio:', error);
            throw error;
        }
    }, [bridge]);
    
    // Generate avatar for AI interaction
    const generateAvatar = useCallback(async (avatarConfig) => {
        try {
            const avatar = await bridge.generateAvatar(avatarConfig);
            return avatar;
        } catch (error) {
            console.error('Error generating avatar:', error);
            throw error;
        }
    }, [bridge]);
    
    // Update avatar expression
    const updateAvatarExpression = useCallback(async (emotion, intensity = 1.0) => {
        try {
            const result = await bridge.updateAvatarExpression(emotion, intensity);
            return result;
        } catch (error) {
            console.error('Error updating avatar expression:', error);
            throw error;
        }
    }, [bridge]);
    
    // Perform avatar gesture
    const performAvatarGesture = useCallback(async (gestureType, duration = 2.0) => {
        try {
            const result = await bridge.performAvatarGesture(gestureType, duration);
            return result;
        } catch (error) {
            console.error('Error performing avatar gesture:', error);
            throw error;
        }
    }, [bridge]);
    
    // Get analytics
    const getAnalytics = useCallback(async () => {
        try {
            const analytics = await bridge.getAnalytics();
            return analytics;
        } catch (error) {
            console.error('Error getting analytics:', error);
            throw error;
        }
    }, [bridge]);
    
    // Save session
    const saveSession = useCallback(async () => {
        try {
            const result = await bridge.saveSession();
            return result;
        } catch (error) {
            console.error('Error saving session:', error);
            throw error;
        }
    }, [bridge]);
    
    // End session
    const endSession = useCallback(async () => {
        try {
            await bridge.endSession();
            setSessionData({});
            setContext({});
            clearHistory();
        } catch (error) {
            console.error('Error ending session:', error);
            throw error;
        }
    }, [bridge, clearHistory]);
    
    // Auto-save conversation periodically
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (conversationHistory.length > 0 && sessionData.sessionId) {
                saveSession().catch(console.error);
            }
        }, 60000); // Auto-save every minute
        
        return () => clearInterval(autoSaveInterval);
    }, [conversationHistory, sessionData, saveSession]);
    
    return {
        // State
        isProcessing,
        lastResponse,
        conversationHistory,
        aiPersonality,
        context,
        userPreferences,
        sessionData,
        
        // Core AI functions
        initializeSession,
        sendMessage,
        cancelRequest,
        
        // Personality and preferences
        updatePersonality,
        updatePreferences,
        
        // Conversation management
        clearHistory,
        getConversationSummary,
        
        // Multi-modal interactions
        sendVoiceMessage,
        getSpeechResponse,
        analyzeVideo,
        analyzeAudio,
        
        // Avatar interactions
        generateAvatar,
        updateAvatarExpression,
        performAvatarGesture,
        
        // Session management
        saveSession,
        endSession,
        getAnalytics,
        
        // Bridge access
        bridge
    };
};

export default useAI;
