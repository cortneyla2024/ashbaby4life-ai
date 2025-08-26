/**
 * React Hook for CareConnect Bridge
 * Provides easy integration of the bridge in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import CareConnectBridge from './bridge.js';

const useBridge = (config = {}) => {
    // Bridge instance
    const bridgeRef = useRef(null);
    
    // State
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [session, setSession] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // AI state
    const [aiResponse, setAiResponse] = useState(null);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    
    // Video state
    const [videoData, setVideoData] = useState(null);
    const [isVideoProcessing, setIsVideoProcessing] = useState(false);
    
    // Audio state
    const [audioData, setAudioData] = useState(null);
    const [isAudioProcessing, setIsAudioProcessing] = useState(false);
    
    // Avatar state
    const [avatar, setAvatar] = useState(null);
    const [isAvatarGenerating, setIsAvatarGenerating] = useState(false);
    
    // Analytics state
    const [analytics, setAnalytics] = useState(null);
    
    // Initialize bridge
    useEffect(() => {
        const initializeBridge = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                // Create bridge instance
                bridgeRef.current = new CareConnectBridge(config);
                
                // Set up event listeners
                bridgeRef.current.on('connected', () => {
                    setIsConnected(true);
                    setConnectionStatus('connected');
                    setIsLoading(false);
                });
                
                bridgeRef.current.on('disconnected', () => {
                    setIsConnected(false);
                    setConnectionStatus('disconnected');
                });
                
                bridgeRef.current.on('error', (err) => {
                    setError(err);
                    setIsLoading(false);
                });
                
                bridgeRef.current.on('sessionCreated', (sessionData) => {
                    setSession(sessionData);
                });
                
                bridgeRef.current.on('sessionEnded', () => {
                    setSession(null);
                });
                
                bridgeRef.current.on('aiResponse', (response) => {
                    setAiResponse(response);
                    setIsAiProcessing(false);
                });
                
                bridgeRef.current.on('videoProcessed', (data) => {
                    setVideoData(data);
                    setIsVideoProcessing(false);
                });
                
                bridgeRef.current.on('audioProcessed', (data) => {
                    setAudioData(data);
                    setIsAudioProcessing(false);
                });
                
                bridgeRef.current.on('avatarGenerated', (avatarData) => {
                    setAvatar(avatarData);
                    setIsAvatarGenerating(false);
                });
                
                bridgeRef.current.on('analyticsReceived', (analyticsData) => {
                    setAnalytics(analyticsData);
                });
                
                bridgeRef.current.on('speechSynthesized', (audioData) => {
                    // Handle synthesized speech
                    console.log('Speech synthesized:', audioData);
                });
                
                bridgeRef.current.on('speechRecognized', (result) => {
                    // Handle speech recognition
                    console.log('Speech recognized:', result);
                });
                
                bridgeRef.current.on('avatarExpressionUpdated', (result) => {
                    // Handle avatar expression updates
                    console.log('Avatar expression updated:', result);
                });
                
                bridgeRef.current.on('avatarGesturePerformed', (result) => {
                    // Handle avatar gesture updates
                    console.log('Avatar gesture performed:', result);
                });
                
            } catch (err) {
                setError(err);
                setIsLoading(false);
            }
        };
        
        initializeBridge();
        
        // Cleanup on unmount
        return () => {
            if (bridgeRef.current) {
                bridgeRef.current.disconnect();
            }
        };
    }, [config]);
    
    // Create session
    const createSession = useCallback(async (userId, sessionConfig = {}) => {
        try {
            if (!bridgeRef.current) {
                throw new Error('Bridge not initialized');
            }
            
            const sessionData = await bridgeRef.current.createSession(userId, sessionConfig);
            return sessionData;
            
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);
    
    // Send message to AI
    const sendToAI = useCallback(async (message, context = {}) => {
        try {
            if (!bridgeRef.current) {
                throw new Error('Bridge not initialized');
            }
            
            setIsAiProcessing(true);
            setError(null);
            
            const response = await bridgeRef.current.sendToAI(message, context);
            return response;
            
        } catch (err) {
            setError(err);
            setIsAiProcessing(false);
            throw err;
        }
    }, []);
    
    // Process video
    const processVideo = useCallback(async (videoData) => {
        try {
            if (!bridgeRef.current) {
                throw new Error('Bridge not initialized');
            }
            
            setIsVideoProcessing(true);
            setError(null);
            
            const result = await bridgeRef.current.processVideo(videoData);
            return result;
            
        } catch (err) {
            setError(err);
            setIsVideoProcessing(false);
            throw err;
        }
    }, []);
    
    // Process audio
    const processAudio = useCallback(async (audioData) => {
        try {
            if (!bridgeRef.current) {
                throw new Error('Bridge not initialized');
            }
            
            setIsAudioProcessing(true);
            setError(null);
            
            const result = await bridgeRef.current.processAudio(audioData);
            return result;
            
        } catch (err) {
            setError(err);
            setIsAudioProcessing(false);
            throw err;
        }
    }, []);
    
    // Generate avatar
    const generateAvatar = useCallback(async (avatarConfig) => {
        try {
            if (!bridgeRef.current) {
                throw new Error('Bridge not initialized');
            }
            
            setIsAvatarGenerating(true);
            setError(null);
            
            const avatarData = await bridgeRef.current.generateAvatar(avatarConfig);
            return avatarData;
            
        } catch (err) {
            setError(err);
            setIsAvatarGenerating(false);
            throw err;
        }
    }, []);
    
    // Update avatar expression
    const updateAvatarExpression = useCallback(async (emotion, intensity = 1.0) => {
        try {
            if (!bridgeRef.current) {
                throw new Error('Bridge not initialized');
            }
            
            setError(null);
            
            const result = await bridgeRef.current.updateAvatarExpression(emotion, intensity);
            return result;
            
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);
    
    // Perform avatar gesture
    const performAvatarGesture = useCallback(async (gestureType, duration = 2.0) => {
        try {
            if (!bridgeRef.current) {
                throw new Error('Bridge not initialized');
            }
            
            setError(null);
            
            const result = await bridgeRef.current.performAvatarGesture(gestureType, duration);
            return result;
            
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);
    
    // Synthesize speech
    const synthesizeSpeech = useCallback(async (text, voiceProfile = null) => {
        try {
            if (!bridgeRef.current) {
                throw new Error('Bridge not initialized');
            }
            
            setError(null);
            
            const audioData = await bridgeRef.current.synthesizeSpeech(text, voiceProfile);
            return audioData;
            
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);
    
    // Recognize speech
    const recognizeSpeech = useCallback(async (audioData) => {
        try {
            if (!bridgeRef.current) {
                throw new Error('Bridge not initialized');
            }
            
            setError(null);
            
            const result = await bridgeRef.current.recognizeSpeech(audioData);
            return result;
            
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);
    
    // Get analytics
    const getAnalytics = useCallback(async () => {
        try {
            if (!bridgeRef.current) {
                throw new Error('Bridge not initialized');
            }
            
            setError(null);
            
            const analyticsData = await bridgeRef.current.getAnalytics();
            return analyticsData;
            
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);
    
    // Save session
    const saveSession = useCallback(async () => {
        try {
            if (!bridgeRef.current) {
                throw new Error('Bridge not initialized');
            }
            
            setError(null);
            
            const result = await bridgeRef.current.saveSession();
            return result;
            
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);
    
    // End session
    const endSession = useCallback(async () => {
        try {
            if (!bridgeRef.current) {
                throw new Error('Bridge not initialized');
            }
            
            setError(null);
            
            await bridgeRef.current.endSession();
            
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);
    
    // Get connection status
    const getConnectionStatus = useCallback(() => {
        if (!bridgeRef.current) {
            return {
                isConnected: false,
                reconnectAttempts: 0,
                services: {
                    aiEngine: 'disconnected',
                    backend: 'disconnected',
                    videoProcessor: 'disconnected',
                    audioProcessor: 'disconnected',
                    avatarSystem: 'disconnected'
                },
                session: {
                    hasSession: false,
                    sessionId: null,
                    userId: null
                }
            };
        }
        
        return bridgeRef.current.getConnectionStatus();
    }, []);
    
    // Disconnect bridge
    const disconnect = useCallback(() => {
        if (bridgeRef.current) {
            bridgeRef.current.disconnect();
        }
    }, []);
    
    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    
    // Clear AI response
    const clearAiResponse = useCallback(() => {
        setAiResponse(null);
    }, []);
    
    // Clear video data
    const clearVideoData = useCallback(() => {
        setVideoData(null);
    }, []);
    
    // Clear audio data
    const clearAudioData = useCallback(() => {
        setAudioData(null);
    }, []);
    
    // Clear avatar
    const clearAvatar = useCallback(() => {
        setAvatar(null);
    }, []);
    
    // Clear analytics
    const clearAnalytics = useCallback(() => {
        setAnalytics(null);
    }, []);
    
    return {
        // Bridge instance
        bridge: bridgeRef.current,
        
        // Connection state
        isConnected,
        connectionStatus,
        isLoading,
        error,
        
        // Session state
        session,
        
        // AI state
        aiResponse,
        isAiProcessing,
        
        // Video state
        videoData,
        isVideoProcessing,
        
        // Audio state
        audioData,
        isAudioProcessing,
        
        // Avatar state
        avatar,
        isAvatarGenerating,
        
        // Analytics state
        analytics,
        
        // Methods
        createSession,
        sendToAI,
        processVideo,
        processAudio,
        generateAvatar,
        updateAvatarExpression,
        performAvatarGesture,
        synthesizeSpeech,
        recognizeSpeech,
        getAnalytics,
        saveSession,
        endSession,
        getConnectionStatus,
        disconnect,
        
        // Clear methods
        clearError,
        clearAiResponse,
        clearVideoData,
        clearAudioData,
        clearAvatar,
        clearAnalytics
    };
};

export default useBridge;
