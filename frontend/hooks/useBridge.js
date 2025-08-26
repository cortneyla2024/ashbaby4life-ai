import { useState, useEffect, useCallback, useRef } from 'react';
import { CareConnectBridge } from '../integration/bridge';

const useBridge = () => {
  const [bridge, setBridge] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastActivity, setLastActivity] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [aiStatus, setAiStatus] = useState('disconnected');
  const [videoStatus, setVideoStatus] = useState('disconnected');
  const [audioStatus, setAudioStatus] = useState('disconnected');
  const [avatarStatus, setAvatarStatus] = useState('disconnected');
  const [emotionData, setEmotionData] = useState(null);
  const [gestureData, setGestureData] = useState(null);
  const [voiceData, setVoiceData] = useState(null);
  const [systemStats, setSystemStats] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [healthStatus, setHealthStatus] = useState('unknown');

  const bridgeRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const statsIntervalRef = useRef(null);

  // Initialize bridge
  useEffect(() => {
    const initializeBridge = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        // Create bridge instance
        const bridgeInstance = new CareConnectBridge();
        bridgeRef.current = bridgeInstance;
        setBridge(bridgeInstance);

        // Set up event listeners
        bridgeInstance.on('connected', handleConnected);
        bridgeInstance.on('disconnected', handleDisconnected);
        bridgeInstance.on('error', handleError);
        bridgeInstance.on('ai_status', handleAiStatus);
        bridgeInstance.on('video_status', handleVideoStatus);
        bridgeInstance.on('audio_status', handleAudioStatus);
        bridgeInstance.on('avatar_status', handleAvatarStatus);
        bridgeInstance.on('emotion_data', handleEmotionData);
        bridgeInstance.on('gesture_data', handleGestureData);
        bridgeInstance.on('voice_data', handleVoiceData);
        bridgeInstance.on('session_data', handleSessionData);
        bridgeInstance.on('system_stats', handleSystemStats);
        bridgeInstance.on('performance_metrics', handlePerformanceMetrics);
        bridgeInstance.on('health_status', handleHealthStatus);
        bridgeInstance.on('activity', handleActivity);

        // Connect to services
        await bridgeInstance.connect();

      } catch (err) {
        console.error('Error initializing bridge:', err);
        setError(err.message);
        setIsConnecting(false);
      }
    };

    initializeBridge();

    return () => {
      cleanup();
    };
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (bridgeRef.current) {
      bridgeRef.current.disconnect();
      bridgeRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }
  }, []);

  // Event handlers
  const handleConnected = useCallback(() => {
    setIsConnected(true);
    setIsConnecting(false);
    setConnectionStatus('connected');
    setError(null);
    setLastActivity(new Date());

    // Start heartbeat
    heartbeatIntervalRef.current = setInterval(() => {
      if (bridgeRef.current) {
        bridgeRef.current.heartbeat();
      }
    }, 30000); // 30 seconds

    // Start stats collection
    statsIntervalRef.current = setInterval(async () => {
      if (bridgeRef.current) {
        try {
          const stats = await bridgeRef.current.getSystemStats();
          setSystemStats(stats);
        } catch (err) {
          console.error('Error getting system stats:', err);
        }
      }
    }, 5000); // 5 seconds
  }, []);

  const handleDisconnected = useCallback(() => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setLastActivity(new Date());

    // Clear intervals
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    // Attempt reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(async () => {
      if (bridgeRef.current) {
        try {
          await bridgeRef.current.connect();
        } catch (err) {
          console.error('Reconnection failed:', err);
        }
      }
    }, 5000); // 5 seconds
  }, []);

  const handleError = useCallback((error) => {
    console.error('Bridge error:', error);
    setError(error.message || 'Unknown error occurred');
    setLastActivity(new Date());
  }, []);

  const handleAiStatus = useCallback((status) => {
    setAiStatus(status);
    setLastActivity(new Date());
  }, []);

  const handleVideoStatus = useCallback((status) => {
    setVideoStatus(status);
    setLastActivity(new Date());
  }, []);

  const handleAudioStatus = useCallback((status) => {
    setAudioStatus(status);
    setLastActivity(new Date());
  }, []);

  const handleAvatarStatus = useCallback((status) => {
    setAvatarStatus(status);
    setLastActivity(new Date());
  }, []);

  const handleEmotionData = useCallback((data) => {
    setEmotionData(data);
    setLastActivity(new Date());
  }, []);

  const handleGestureData = useCallback((data) => {
    setGestureData(data);
    setLastActivity(new Date());
  }, []);

  const handleVoiceData = useCallback((data) => {
    setVoiceData(data);
    setLastActivity(new Date());
  }, []);

  const handleSessionData = useCallback((data) => {
    setSessionData(data);
    setLastActivity(new Date());
  }, []);

  const handleSystemStats = useCallback((stats) => {
    setSystemStats(stats);
    setLastActivity(new Date());
  }, []);

  const handlePerformanceMetrics = useCallback((metrics) => {
    setPerformanceMetrics(metrics);
    setLastActivity(new Date());
  }, []);

  const handleHealthStatus = useCallback((status) => {
    setHealthStatus(status);
    setLastActivity(new Date());
  }, []);

  const handleActivity = useCallback(() => {
    setLastActivity(new Date());
  }, []);

  // Bridge methods
  const connect = useCallback(async (config = {}) => {
    if (bridgeRef.current) {
      try {
        setIsConnecting(true);
        setError(null);
        await bridgeRef.current.connect(config);
      } catch (err) {
        setError(err.message);
        setIsConnecting(false);
        throw err;
      }
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (bridgeRef.current) {
      try {
        await bridgeRef.current.disconnect();
      } catch (err) {
        console.error('Error disconnecting:', err);
      }
    }
  }, []);

  const reconnect = useCallback(async () => {
    if (bridgeRef.current) {
      try {
        setIsConnecting(true);
        setError(null);
        await bridgeRef.current.reconnect();
      } catch (err) {
        setError(err.message);
        setIsConnecting(false);
        throw err;
      }
    }
  }, []);

  const sendMessage = useCallback(async (message, options = {}) => {
    if (bridgeRef.current) {
      try {
        return await bridgeRef.current.sendMessage(message, options);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    throw new Error('Bridge not initialized');
  }, []);

  const getResponse = useCallback(async (message, options = {}) => {
    if (bridgeRef.current) {
      try {
        return await bridgeRef.current.getResponse(message, options);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    throw new Error('Bridge not initialized');
  }, []);

  const connectToAI = useCallback(async (config = {}) => {
    if (bridgeRef.current) {
      try {
        return await bridgeRef.current.connectToAI(config);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    throw new Error('Bridge not initialized');
  }, []);

  const createAvatar = useCallback(async (config = {}) => {
    if (bridgeRef.current) {
      try {
        return await bridgeRef.current.createAvatar(config);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    throw new Error('Bridge not initialized');
  }, []);

  const sendOffer = useCallback(async (offer) => {
    if (bridgeRef.current) {
      try {
        return await bridgeRef.current.sendOffer(offer);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    throw new Error('Bridge not initialized');
  }, []);

  const getEmotionData = useCallback(async () => {
    if (bridgeRef.current) {
      try {
        return await bridgeRef.current.getEmotionData();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    throw new Error('Bridge not initialized');
  }, []);

  const getGestureData = useCallback(async () => {
    if (bridgeRef.current) {
      try {
        return await bridgeRef.current.getGestureData();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    throw new Error('Bridge not initialized');
  }, []);

  const getVoiceData = useCallback(async () => {
    if (bridgeRef.current) {
      try {
        return await bridgeRef.current.getVoiceData();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    throw new Error('Bridge not initialized');
  }, []);

  const getSystemStats = useCallback(async () => {
    if (bridgeRef.current) {
      try {
        return await bridgeRef.current.getSystemStats();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    throw new Error('Bridge not initialized');
  }, []);

  const getPerformanceMetrics = useCallback(async () => {
    if (bridgeRef.current) {
      try {
        return await bridgeRef.current.getPerformanceMetrics();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    throw new Error('Bridge not initialized');
  }, []);

  const getHealthStatus = useCallback(async () => {
    if (bridgeRef.current) {
      try {
        return await bridgeRef.current.getHealthStatus();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    throw new Error('Bridge not initialized');
  }, []);

  const updateSession = useCallback(async (sessionData) => {
    if (bridgeRef.current) {
      try {
        return await bridgeRef.current.updateSession(sessionData);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    throw new Error('Bridge not initialized');
  }, []);

  const endSession = useCallback(async () => {
    if (bridgeRef.current) {
      try {
        return await bridgeRef.current.endSession();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    throw new Error('Bridge not initialized');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const isReady = isConnected && !isConnecting && !error;
  const isHealthy = healthStatus === 'healthy';
  const hasActiveSession = sessionData !== null;
  const isAIConnected = aiStatus === 'connected';
  const isVideoConnected = videoStatus === 'connected';
  const isAudioConnected = audioStatus === 'connected';
  const isAvatarConnected = avatarStatus === 'connected';

  // Connection time
  const connectionTime = lastActivity ? new Date() - lastActivity : null;
  const isConnectionStale = connectionTime && connectionTime > 300000; // 5 minutes

  return {
    // Bridge instance
    bridge: bridgeRef.current,

    // Connection state
    isConnected,
    isConnecting,
    isReady,
    connectionStatus,
    error,
    clearError,

    // Service status
    aiStatus,
    videoStatus,
    audioStatus,
    avatarStatus,
    healthStatus,
    isHealthy,

    // Data
    sessionData,
    emotionData,
    gestureData,
    voiceData,
    systemStats,
    performanceMetrics,

    // Activity
    lastActivity,
    connectionTime,
    isConnectionStale,
    hasActiveSession,

    // Service availability
    isAIConnected,
    isVideoConnected,
    isAudioConnected,
    isAvatarConnected,

    // Methods
    connect,
    disconnect,
    reconnect,
    sendMessage,
    getResponse,
    connectToAI,
    createAvatar,
    sendOffer,
    getEmotionData,
    getGestureData,
    getVoiceData,
    getSystemStats,
    getPerformanceMetrics,
    getHealthStatus,
    updateSession,
    endSession
  };
};

export default useBridge;
