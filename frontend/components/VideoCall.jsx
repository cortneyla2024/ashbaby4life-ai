import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useBridge } from '../hooks/useBridge';
import { useAI } from '../hooks/useAI';
import { useNotifications } from '../hooks/useNotifications';
import { useSettings } from '../hooks/useSettings';
import { useSession } from '../hooks/useSession';
import { useTelemetry } from '../hooks/useTelemetry';
import { useConnector } from '../hooks/useConnector';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLoading } from '../hooks/useLoading';
import { useAuth } from '../hooks/useAuth';
import { useAIResponse } from '../hooks/useAIResponse';
import { useTheme } from '../hooks/useTheme';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import Notification from './Notification';
import ErrorBoundary from './ErrorBoundary';

const VideoCall = ({ 
  isOpen, 
  onClose, 
  sessionId, 
  aiPersona = 'educator',
  initialTopic = null,
  onSessionEnd 
}) => {
  // State management
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callQuality, setCallQuality] = useState('good');
  const [connectionStats, setConnectionStats] = useState({});
  const [aiAvatar, setAiAvatar] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(initialTopic);
  const [sessionNotes, setSessionNotes] = useState('');
  const [emotionData, setEmotionData] = useState({});
  const [gestureData, setGestureData] = useState({});
  const [voiceData, setVoiceData] = useState({});
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const emotionIntervalRef = useRef(null);
  const gestureIntervalRef = useRef(null);
  const voiceIntervalRef = useRef(null);

  // Hooks
  const { bridge, isConnected: bridgeConnected } = useBridge();
  const { ai, sendMessage, getResponse, setPersona } = useAI();
  const { showNotification } = useNotifications();
  const { settings } = useSettings();
  const { session } = useSession();
  const { trackEvent } = useTelemetry();
  const { activeConnector } = useConnector();
  const { getItem, setItem } = useLocalStorage();
  const { isLoading, setLoading } = useLoading();
  const { user } = useAuth();
  const { aiResponse, isProcessing } = useAIResponse();
  const { theme } = useTheme();

  // Configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
  };

  const videoConstraints = {
    width: { ideal: 1280, min: 640, max: 1920 },
    height: { ideal: 720, min: 480, max: 1080 },
    frameRate: { ideal: 30, min: 15, max: 60 },
    facingMode: 'user'
  };

  const audioConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 2
  };

  // Initialize session
  useEffect(() => {
    if (isOpen && sessionId) {
      initializeSession();
    }
    return () => {
      cleanupSession();
    };
  }, [isOpen, sessionId]);

  // Session timer
  useEffect(() => {
    if (isConnected && !isPaused) {
      sessionTimerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [isConnected, isPaused]);

  // Connection stats monitoring
  useEffect(() => {
    if (isConnected && peerConnectionRef.current) {
      statsIntervalRef.current = setInterval(async () => {
        try {
          const stats = await peerConnectionRef.current.getStats();
          const connectionStats = {};
          
          stats.forEach(report => {
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              connectionStats.rtt = report.currentRoundTripTime;
              connectionStats.bytesReceived = report.bytesReceived;
              connectionStats.bytesSent = report.bytesSent;
            }
            if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
              connectionStats.videoPacketsLost = report.packetsLost;
              connectionStats.videoJitter = report.jitter;
            }
            if (report.type === 'inbound-rtp' && report.mediaType === 'audio') {
              connectionStats.audioPacketsLost = report.packetsLost;
              connectionStats.audioJitter = report.jitter;
            }
          });

          setConnectionStats(connectionStats);
          
          // Update call quality based on stats
          const quality = determineCallQuality(connectionStats);
          setCallQuality(quality);
        } catch (error) {
          console.error('Error getting connection stats:', error);
        }
      }, 2000);
    }

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, [isConnected]);

  // Emotion and gesture tracking
  useEffect(() => {
    if (isConnected && bridgeConnected) {
      emotionIntervalRef.current = setInterval(async () => {
        try {
          const emotionData = await bridge.getEmotionData();
          setEmotionData(emotionData);
          
          // Send emotion data to AI for context
          if (emotionData.emotion && emotionData.confidence > 0.7) {
            await sendEmotionToAI(emotionData);
          }
        } catch (error) {
          console.error('Error getting emotion data:', error);
        }
      }, 1000);

      gestureIntervalRef.current = setInterval(async () => {
        try {
          const gestureData = await bridge.getGestureData();
          setGestureData(gestureData);
        } catch (error) {
          console.error('Error getting gesture data:', error);
        }
      }, 500);

      voiceIntervalRef.current = setInterval(async () => {
        try {
          const voiceData = await bridge.getVoiceData();
          setVoiceData(voiceData);
        } catch (error) {
          console.error('Error getting voice data:', error);
        }
      }, 1000);
    }

    return () => {
      if (emotionIntervalRef.current) {
        clearInterval(emotionIntervalRef.current);
      }
      if (gestureIntervalRef.current) {
        clearInterval(gestureIntervalRef.current);
      }
      if (voiceIntervalRef.current) {
        clearInterval(voiceIntervalRef.current);
      }
    };
  }, [isConnected, bridgeConnected]);

  // Initialize session
  const initializeSession = async () => {
    try {
      setLoading(true);
      setIsConnecting(true);

      // Set AI persona
      await setPersona(aiPersona);

      // Initialize AI avatar
      await initializeAvatar();

      // Get user media
      await getUserMedia();

      // Initialize WebRTC connection
      await initializeWebRTC();

      // Connect to AI service
      await connectToAI();

      setIsConnected(true);
      setIsConnecting(false);
      setLoading(false);

      showNotification('Video call connected successfully', 'success');
      trackEvent('video_call_started', { sessionId, aiPersona, topic: currentTopic });

    } catch (error) {
      console.error('Error initializing session:', error);
      setIsConnecting(false);
      setLoading(false);
      showNotification('Failed to start video call', 'error');
      trackEvent('video_call_failed', { sessionId, error: error.message });
    }
  };

  // Initialize AI avatar
  const initializeAvatar = async () => {
    try {
      const avatarConfig = {
        type: 'realistic',
        gender: 'neutral',
        age: 30,
        ethnicity: 'diverse',
        personality: aiPersona,
        emotions: true,
        gestures: true,
        lipSync: true
      };

      const avatar = await bridge.createAvatar(avatarConfig);
      setAiAvatar(avatar);

      // Set avatar in remote video
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = avatar.stream;
      }
    } catch (error) {
      console.error('Error initializing avatar:', error);
    }
  };

  // Get user media
  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: audioConstraints
      });

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error getting user media:', error);
      throw new Error('Failed to access camera and microphone');
    }
  };

  // Initialize WebRTC
  const initializeWebRTC = async () => {
    try {
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = pc;

      // Add local stream tracks
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }

      // Handle incoming tracks
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setIsConnected(false);
          showNotification('Connection lost', 'warning');
        }
      };

      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to AI service
      await bridge.sendOffer(offer);

    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      throw error;
    }
  };

  // Connect to AI service
  const connectToAI = async () => {
    try {
      await bridge.connectToAI({
        sessionId,
        persona: aiPersona,
        topic: currentTopic,
        userContext: {
          userId: user?.id,
          preferences: settings,
          sessionData: session
        }
      });

      // Start AI conversation
      if (currentTopic) {
        const response = await sendMessage(`Let's start our session about ${currentTopic}`);
        setConversationHistory(prev => [...prev, { role: 'ai', content: response }]);
      }
    } catch (error) {
      console.error('Error connecting to AI:', error);
      throw error;
    }
  };

  // Send emotion data to AI
  const sendEmotionToAI = async (emotionData) => {
    try {
      const response = await sendMessage(
        `I notice you seem ${emotionData.emotion}. How are you feeling about our session?`,
        { emotion: emotionData.emotion, confidence: emotionData.confidence }
      );
      
      if (response) {
        setConversationHistory(prev => [...prev, { role: 'ai', content: response }]);
      }
    } catch (error) {
      console.error('Error sending emotion to AI:', error);
    }
  };

  // Determine call quality
  const determineCallQuality = (stats) => {
    const { rtt, videoPacketsLost, audioPacketsLost } = stats;
    
    if (rtt > 300 || videoPacketsLost > 10 || audioPacketsLost > 5) {
      return 'poor';
    } else if (rtt > 150 || videoPacketsLost > 5 || audioPacketsLost > 2) {
      return 'fair';
    } else {
      return 'good';
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  // Toggle screen sharing
  const toggleScreenSharing = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });

        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }

        setIsScreenSharing(true);
        showNotification('Screen sharing started', 'info');
      } else {
        const videoTrack = localStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }

        setIsScreenSharing(false);
        showNotification('Screen sharing stopped', 'info');
      }
    } catch (error) {
      console.error('Error toggling screen sharing:', error);
      showNotification('Failed to toggle screen sharing', 'error');
    }
  };

  // Start/stop recording
  const toggleRecording = async () => {
    try {
      if (!isRecording) {
        const stream = peerConnectionRef.current.getRemoteStreams()[0] || localStream;
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9'
        });

        const chunks = [];
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          
          // Save recording
          const a = document.createElement('a');
          a.href = url;
          a.download = `session-${sessionId}-${Date.now()}.webm`;
          a.click();
          
          URL.revokeObjectURL(url);
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
        showNotification('Recording started', 'info');
      } else {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current = null;
        }
        setIsRecording(false);
        showNotification('Recording stopped', 'info');
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
      showNotification('Failed to toggle recording', 'error');
    }
  };

  // Pause/resume session
  const togglePause = () => {
    setIsPaused(!isPaused);
    showNotification(isPaused ? 'Session resumed' : 'Session paused', 'info');
  };

  // End session
  const endSession = async () => {
    try {
      // Stop recording if active
      if (isRecording) {
        toggleRecording();
      }

      // Save session data
      const sessionData = {
        sessionId,
        duration: sessionDuration,
        topic: currentTopic,
        notes: sessionNotes,
        conversationHistory,
        emotionData,
        gestureData,
        voiceData,
        timestamp: new Date().toISOString()
      };

      await setItem(`session_${sessionId}`, sessionData);

      // Track session end
      trackEvent('video_call_ended', {
        sessionId,
        duration: sessionDuration,
        topic: currentTopic
      });

      // Cleanup
      cleanupSession();

      // Notify parent
      if (onSessionEnd) {
        onSessionEnd(sessionData);
      }

      onClose();
      showNotification('Session ended', 'success');

    } catch (error) {
      console.error('Error ending session:', error);
      showNotification('Error ending session', 'error');
    }
  };

  // Cleanup session
  const cleanupSession = () => {
    // Stop all streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop recording
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // Clear intervals
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }
    if (emotionIntervalRef.current) {
      clearInterval(emotionIntervalRef.current);
    }
    if (gestureIntervalRef.current) {
      clearInterval(gestureIntervalRef.current);
    }
    if (voiceIntervalRef.current) {
      clearInterval(voiceIntervalRef.current);
    }

    // Reset state
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setIsConnecting(false);
    setSessionDuration(0);
  };

  // Format duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  // Get quality indicator color
  const getQualityColor = () => {
    switch (callQuality) {
      case 'good': return 'text-green-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <ErrorBoundary>
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <div className="flex flex-col h-full bg-gray-900 text-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">AI Video Session</h2>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${getQualityColor()}`}></span>
                <span className="text-sm capitalize">{callQuality} quality</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm">{formatDuration(sessionDuration)}</span>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Video Area */}
            <div className="flex-1 flex flex-col">
              {/* Remote Video */}
              <div className="flex-1 relative bg-black rounded-lg m-4 overflow-hidden">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* AI Avatar Info */}
                {aiAvatar && (
                  <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">AI {aiPersona}</p>
                        <p className="text-xs text-gray-300">{currentTopic}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Connection Stats */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-lg p-3">
                  <div className="text-xs space-y-1">
                    <div>RTT: {connectionStats.rtt ? `${Math.round(connectionStats.rtt * 1000)}ms` : 'N/A'}</div>
                    <div>Video Loss: {connectionStats.videoPacketsLost || 0}</div>
                    <div>Audio Loss: {connectionStats.audioPacketsLost || 0}</div>
                  </div>
                </div>

                {/* Loading Overlay */}
                {isConnecting && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center">
                      <LoadingSpinner size="large" />
                      <p className="mt-4 text-lg">Connecting to AI...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Local Video */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-white">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              {/* Controls */}
              <div className="p-4 border-b border-gray-700">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={toggleMute}
                    className={`p-3 rounded-lg flex flex-col items-center space-y-1 transition-colors ${
                      isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isMuted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      )}
                    </svg>
                    <span className="text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-lg flex flex-col items-center space-y-1 transition-colors ${
                      !isVideoOn ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {!isVideoOn ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      )}
                    </svg>
                    <span className="text-xs">{!isVideoOn ? 'Video On' : 'Video Off'}</span>
                  </button>

                  <button
                    onClick={toggleScreenSharing}
                    className={`p-3 rounded-lg flex flex-col items-center space-y-1 transition-colors ${
                      isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">Share</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={toggleRecording}
                    className={`p-3 rounded-lg flex flex-col items-center space-y-1 transition-colors ${
                      isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs">{isRecording ? 'Stop' : 'Record'}</span>
                  </button>

                  <button
                    onClick={togglePause}
                    className={`p-3 rounded-lg flex flex-col items-center space-y-1 transition-colors ${
                      isPaused ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isPaused ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                    <span className="text-xs">{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                </div>

                <button
                  onClick={endSession}
                  className="w-full mt-2 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  End Session
                </button>
              </div>

              {/* Session Info */}
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold mb-2">Session Info</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Topic:</span>
                    <p className="font-medium">{currentTopic || 'General Discussion'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">AI Persona:</span>
                    <p className="font-medium capitalize">{aiPersona}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <p className="font-medium">{formatDuration(sessionDuration)}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="flex-1 p-4">
                <h3 className="font-semibold mb-2">Session Notes</h3>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Add notes during the session..."
                  className="w-full h-32 p-2 bg-gray-700 border border-gray-600 rounded-lg resize-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </ErrorBoundary>
  );
};

export default VideoCall;
