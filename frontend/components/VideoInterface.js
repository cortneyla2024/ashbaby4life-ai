/**
 * Video Interface Component for CareConnect v5.0
 * Handles WebRTC video conferencing, screen sharing, and recording
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAI } from '../hooks/useAI';
import { useTelemetry } from '../hooks/useTelemetry';

const VideoInterface = ({ 
    sessionId, 
    isHost = false, 
    onVideoData = null,
    onAudioData = null,
    config = {} 
}) => {
    // State management
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(new Map());
    const [isRecording, setIsRecording] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [participants, setParticipants] = useState([]);
    const [videoQuality, setVideoQuality] = useState('high');
    const [audioLevel, setAudioLevel] = useState(0);
    const [videoStats, setVideoStats] = useState({});
    
    // Refs
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef(new Map());
    const peerConnections = useRef(new Map());
    const mediaRecorder = useRef(null);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const dataArray = useRef(null);
    const animationFrame = useRef(null);
    
    // Hooks
    const { socket, isConnected } = useSocket();
    const { aiResponse, sendToAI } = useAI();
    const { trackEvent } = useTelemetry();
    
    // Configuration
    const defaultConfig = {
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        },
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ],
        recording: {
            mimeType: 'video/webm;codecs=vp9,opus',
            videoBitsPerSecond: 2500000,
            audioBitsPerSecond: 128000
        }
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    // Initialize video interface
    useEffect(() => {
        initializeVideoInterface();
        return () => cleanup();
    }, []);
    
    // Handle socket events
    useEffect(() => {
        if (!socket) return;
        
        const handleJoinSession = (data) => {
            handleParticipantJoined(data);
        };
        
        const handleLeaveSession = (data) => {
            handleParticipantLeft(data);
        };
        
        const handleOffer = async (data) => {
            await handleIncomingOffer(data);
        };
        
        const handleAnswer = async (data) => {
            await handleIncomingAnswer(data);
        };
        
        const handleIceCandidate = async (data) => {
            await handleIncomingIceCandidate(data);
        };
        
        const handleVideoData = (data) => {
            if (onVideoData) {
                onVideoData(data);
            }
        };
        
        const handleAudioData = (data) => {
            if (onAudioData) {
                onAudioData(data);
            }
        };
        
        // Register event listeners
        socket.on('join-session', handleJoinSession);
        socket.on('leave-session', handleLeaveSession);
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);
        socket.on('video-data', handleVideoData);
        socket.on('audio-data', handleAudioData);
        
        return () => {
            socket.off('join-session', handleJoinSession);
            socket.off('leave-session', handleLeaveSession);
            socket.off('offer', handleOffer);
            socket.off('answer', handleAnswer);
            socket.off('ice-candidate', handleIceCandidate);
            socket.off('video-data', handleVideoData);
            socket.off('audio-data', handleAudioData);
        };
    }, [socket, onVideoData, onAudioData]);
    
    // Initialize video interface
    const initializeVideoInterface = async () => {
        try {
            setConnectionStatus('initializing');
            
            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: finalConfig.video,
                audio: finalConfig.audio
            });
            
            setLocalStream(stream);
            
            // Set local video
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            
            // Initialize audio analysis
            initializeAudioAnalysis(stream);
            
            // Join session
            if (socket && sessionId) {
                socket.emit('join-session', { sessionId, isHost });
            }
            
            setConnectionStatus('connected');
            
            // Track event
            trackEvent('video_interface_initialized', {
                sessionId,
                isHost,
                videoQuality: videoQuality
            });
            
        } catch (error) {
            console.error('Error initializing video interface:', error);
            setConnectionStatus('error');
            trackEvent('video_interface_error', { error: error.message });
        }
    };
    
    // Initialize audio analysis
    const initializeAudioAnalysis = (stream) => {
        try {
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.current.createMediaStreamSource(stream);
            analyser.current = audioContext.current.createAnalyser();
            
            analyser.current.fftSize = 256;
            const bufferLength = analyser.current.frequencyBinCount;
            dataArray.current = new Uint8Array(bufferLength);
            
            source.connect(analyser.current);
            
            // Start audio level monitoring
            updateAudioLevel();
            
        } catch (error) {
            console.error('Error initializing audio analysis:', error);
        }
    };
    
    // Update audio level
    const updateAudioLevel = () => {
        if (!analyser.current || !dataArray.current) return;
        
        analyser.current.getByteFrequencyData(dataArray.current);
        
        const average = dataArray.current.reduce((a, b) => a + b) / dataArray.current.length;
        const normalizedLevel = average / 255;
        
        setAudioLevel(normalizedLevel);
        
        animationFrame.current = requestAnimationFrame(updateAudioLevel);
    };
    
    // Handle participant joined
    const handleParticipantJoined = async (data) => {
        try {
            const { participantId, isHost: participantIsHost } = data;
            
            setParticipants(prev => [...prev, { id: participantId, isHost: participantIsHost }]);
            
            // Create peer connection
            const peerConnection = new RTCPeerConnection({
                iceServers: finalConfig.iceServers
            });
            
            // Add local stream tracks
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
            
            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', {
                        sessionId,
                        targetId: participantId,
                        candidate: event.candidate
                    });
                }
            };
            
            // Handle remote stream
            peerConnection.ontrack = (event) => {
                const remoteStream = new MediaStream();
                event.streams[0].getTracks().forEach(track => {
                    remoteStream.addTrack(track);
                });
                
                setRemoteStreams(prev => new Map(prev.set(participantId, remoteStream)));
            };
            
            // Store peer connection
            peerConnections.current.set(participantId, peerConnection);
            
            // Create offer if we're the host
            if (isHost) {
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                
                socket.emit('offer', {
                    sessionId,
                    targetId: participantId,
                    offer: offer
                });
            }
            
        } catch (error) {
            console.error('Error handling participant joined:', error);
        }
    };
    
    // Handle participant left
    const handleParticipantLeft = (data) => {
        try {
            const { participantId } = data;
            
            setParticipants(prev => prev.filter(p => p.id !== participantId));
            
            // Close peer connection
            const peerConnection = peerConnections.current.get(participantId);
            if (peerConnection) {
                peerConnection.close();
                peerConnections.current.delete(participantId);
            }
            
            // Remove remote stream
            setRemoteStreams(prev => {
                const newMap = new Map(prev);
                newMap.delete(participantId);
                return newMap;
            });
            
        } catch (error) {
            console.error('Error handling participant left:', error);
        }
    };
    
    // Handle incoming offer
    const handleIncomingOffer = async (data) => {
        try {
            const { participantId, offer } = data;
            
            // Create peer connection
            const peerConnection = new RTCPeerConnection({
                iceServers: finalConfig.iceServers
            });
            
            // Add local stream tracks
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
            
            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', {
                        sessionId,
                        targetId: participantId,
                        candidate: event.candidate
                    });
                }
            };
            
            // Handle remote stream
            peerConnection.ontrack = (event) => {
                const remoteStream = new MediaStream();
                event.streams[0].getTracks().forEach(track => {
                    remoteStream.addTrack(track);
                });
                
                setRemoteStreams(prev => new Map(prev.set(participantId, remoteStream)));
            };
            
            // Store peer connection
            peerConnections.current.set(participantId, peerConnection);
            
            // Set remote description and create answer
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            socket.emit('answer', {
                sessionId,
                targetId: participantId,
                answer: answer
            });
            
        } catch (error) {
            console.error('Error handling incoming offer:', error);
        }
    };
    
    // Handle incoming answer
    const handleIncomingAnswer = async (data) => {
        try {
            const { participantId, answer } = data;
            
            const peerConnection = peerConnections.current.get(participantId);
            if (peerConnection) {
                await peerConnection.setRemoteDescription(answer);
            }
            
        } catch (error) {
            console.error('Error handling incoming answer:', error);
        }
    };
    
    // Handle incoming ICE candidate
    const handleIncomingIceCandidate = async (data) => {
        try {
            const { participantId, candidate } = data;
            
            const peerConnection = peerConnections.current.get(participantId);
            if (peerConnection) {
                await peerConnection.addIceCandidate(candidate);
            }
            
        } catch (error) {
            console.error('Error handling incoming ICE candidate:', error);
        }
    };
    
    // Toggle mute
    const toggleMute = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
                
                trackEvent('audio_toggled', { muted: !audioTrack.enabled });
            }
        }
    }, [localStream, trackEvent]);
    
    // Toggle video
    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(!videoTrack.enabled);
                
                trackEvent('video_toggled', { enabled: !videoTrack.enabled });
            }
        }
    }, [localStream, trackEvent]);
    
    // Start/stop screen sharing
    const toggleScreenSharing = useCallback(async () => {
        try {
            if (isScreenSharing) {
                // Stop screen sharing
                const videoTrack = localStream.getVideoTracks()[0];
                if (videoTrack) {
                    videoTrack.stop();
                }
                
                // Get camera video track
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: finalConfig.video
                });
                
                const newVideoTrack = newStream.getVideoTracks()[0];
                localStream.removeTrack(localStream.getVideoTracks()[0]);
                localStream.addTrack(newVideoTrack);
                
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream;
                }
                
                // Replace track in all peer connections
                peerConnections.current.forEach(peerConnection => {
                    const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(newVideoTrack);
                    }
                });
                
                setIsScreenSharing(false);
                trackEvent('screen_sharing_stopped');
                
            } else {
                // Start screen sharing
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: finalConfig.video
                });
                
                const screenVideoTrack = screenStream.getVideoTracks()[0];
                
                // Replace camera track with screen track
                const oldVideoTrack = localStream.getVideoTracks()[0];
                localStream.removeTrack(oldVideoTrack);
                localStream.addTrack(screenVideoTrack);
                
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream;
                }
                
                // Replace track in all peer connections
                peerConnections.current.forEach(peerConnection => {
                    const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(screenVideoTrack);
                    }
                });
                
                setIsScreenSharing(true);
                trackEvent('screen_sharing_started');
            }
            
        } catch (error) {
            console.error('Error toggling screen sharing:', error);
        }
    }, [isScreenSharing, localStream, finalConfig.video, trackEvent]);
    
    // Start/stop recording
    const toggleRecording = useCallback(() => {
        try {
            if (isRecording) {
                // Stop recording
                if (mediaRecorder.current) {
                    mediaRecorder.current.stop();
                    mediaRecorder.current = null;
                }
                
                setIsRecording(false);
                trackEvent('recording_stopped');
                
            } else {
                // Start recording
                const stream = localVideoRef.current?.srcObject;
                if (stream) {
                    mediaRecorder.current = new MediaRecorder(stream, {
                        mimeType: finalConfig.recording.mimeType,
                        videoBitsPerSecond: finalConfig.recording.videoBitsPerSecond,
                        audioBitsPerSecond: finalConfig.recording.audioBitsPerSecond
                    });
                    
                    const chunks = [];
                    
                    mediaRecorder.current.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            chunks.push(event.data);
                        }
                    };
                    
                    mediaRecorder.current.onstop = () => {
                        const blob = new Blob(chunks, { type: 'video/webm' });
                        const url = URL.createObjectURL(blob);
                        
                        // Create download link
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `careconnect-recording-${Date.now()}.webm`;
                        a.click();
                        
                        URL.revokeObjectURL(url);
                    };
                    
                    mediaRecorder.current.start();
                    setIsRecording(true);
                    trackEvent('recording_started');
                }
            }
            
        } catch (error) {
            console.error('Error toggling recording:', error);
        }
    }, [isRecording, finalConfig.recording, trackEvent]);
    
    // Change video quality
    const changeVideoQuality = useCallback(async (quality) => {
        try {
            const qualityConfigs = {
                low: { width: 640, height: 480, frameRate: 15 },
                medium: { width: 1280, height: 720, frameRate: 30 },
                high: { width: 1920, height: 1080, frameRate: 30 }
            };
            
            const config = qualityConfigs[quality];
            if (!config) return;
            
            // Get new video stream
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: config,
                audio: finalConfig.audio
            });
            
            // Replace video track
            const newVideoTrack = newStream.getVideoTracks()[0];
            const oldVideoTrack = localStream.getVideoTracks()[0];
            
            localStream.removeTrack(oldVideoTrack);
            localStream.addTrack(newVideoTrack);
            
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream;
            }
            
            // Replace track in all peer connections
            peerConnections.current.forEach(peerConnection => {
                const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    sender.replaceTrack(newVideoTrack);
                }
            });
            
            setVideoQuality(quality);
            trackEvent('video_quality_changed', { quality });
            
        } catch (error) {
            console.error('Error changing video quality:', error);
        }
    }, [localStream, finalConfig.audio, trackEvent]);
    
    // Get video statistics
    const getVideoStats = useCallback(async () => {
        try {
            const stats = {};
            
            // Get local video stats
            if (localVideoRef.current) {
                const videoTrack = localStream?.getVideoTracks()[0];
                if (videoTrack) {
                    const sender = peerConnections.current.values().next().value?.getSenders()
                        .find(s => s.track === videoTrack);
                    
                    if (sender) {
                        const senderStats = await sender.getStats();
                        senderStats.forEach(report => {
                            if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
                                stats.localVideo = {
                                    bytesSent: report.bytesSent,
                                    packetsSent: report.packetsSent,
                                    framesSent: report.framesSent,
                                    framesDropped: report.framesDropped
                                };
                            }
                        });
                    }
                }
            }
            
            // Get remote video stats
            const remoteStats = {};
            for (const [participantId, peerConnection] of peerConnections.current) {
                const receiverStats = await peerConnection.getStats();
                receiverStats.forEach(report => {
                    if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                        remoteStats[participantId] = {
                            bytesReceived: report.bytesReceived,
                            packetsReceived: report.packetsReceived,
                            framesReceived: report.framesReceived,
                            framesDropped: report.framesDropped
                        };
                    }
                });
            }
            
            stats.remoteVideo = remoteStats;
            setVideoStats(stats);
            
        } catch (error) {
            console.error('Error getting video stats:', error);
        }
    }, [localStream]);
    
    // Update stats periodically
    useEffect(() => {
        const interval = setInterval(getVideoStats, 5000);
        return () => clearInterval(interval);
    }, [getVideoStats]);
    
    // Cleanup
    const cleanup = useCallback(() => {
        try {
            // Stop recording
            if (mediaRecorder.current) {
                mediaRecorder.current.stop();
            }
            
            // Stop screen sharing
            if (isScreenSharing) {
                toggleScreenSharing();
            }
            
            // Close peer connections
            peerConnections.current.forEach(peerConnection => {
                peerConnection.close();
            });
            peerConnections.current.clear();
            
            // Stop local stream
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            
            // Stop audio analysis
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
            
            if (audioContext.current) {
                audioContext.current.close();
            }
            
            // Leave session
            if (socket && sessionId) {
                socket.emit('leave-session', { sessionId });
            }
            
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }, [localStream, isScreenSharing, toggleScreenSharing, socket, sessionId]);
    
    // AI integration for video analysis
    const analyzeVideoWithAI = useCallback(async (videoData) => {
        try {
            const response = await sendToAI({
                type: 'video_analysis',
                data: videoData,
                sessionId
            });
            
            return response;
            
        } catch (error) {
            console.error('Error analyzing video with AI:', error);
        }
    }, [sendToAI, sessionId]);
    
    return (
        <div className="video-interface">
            {/* Connection Status */}
            <div className={`connection-status ${connectionStatus}`}>
                <span className="status-indicator"></span>
                <span className="status-text">
                    {connectionStatus === 'connected' && 'Connected'}
                    {connectionStatus === 'connecting' && 'Connecting...'}
                    {connectionStatus === 'disconnected' && 'Disconnected'}
                    {connectionStatus === 'error' && 'Connection Error'}
                </span>
            </div>
            
            {/* Video Grid */}
            <div className="video-grid">
                {/* Local Video */}
                <div className="video-container local-video">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="video-element"
                    />
                    <div className="video-overlay">
                        <div className="participant-info">
                            <span className="participant-name">You</span>
                            {isHost && <span className="host-badge">Host</span>}
                        </div>
                        <div className="audio-level">
                            <div 
                                className="audio-bar"
                                style={{ height: `${audioLevel * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                
                {/* Remote Videos */}
                {Array.from(remoteStreams.entries()).map(([participantId, stream]) => (
                    <div key={participantId} className="video-container remote-video">
                        <video
                            ref={el => {
                                if (el) {
                                    el.srcObject = stream;
                                    remoteVideoRefs.current.set(participantId, el);
                                }
                            }}
                            autoPlay
                            playsInline
                            className="video-element"
                        />
                        <div className="video-overlay">
                            <div className="participant-info">
                                <span className="participant-name">
                                    {participants.find(p => p.id === participantId)?.name || 'Participant'}
                                </span>
                                {participants.find(p => p.id === participantId)?.isHost && (
                                    <span className="host-badge">Host</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Controls */}
            <div className="video-controls">
                <button
                    onClick={toggleMute}
                    className={`control-btn ${isMuted ? 'muted' : ''}`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    <i className={`fas fa-microphone${isMuted ? '-slash' : ''}`}></i>
                </button>
                
                <button
                    onClick={toggleVideo}
                    className={`control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
                    title={isVideoEnabled ? 'Disable Video' : 'Enable Video'}
                >
                    <i className={`fas fa-video${!isVideoEnabled ? '-slash' : ''}`}></i>
                </button>
                
                <button
                    onClick={toggleScreenSharing}
                    className={`control-btn ${isScreenSharing ? 'active' : ''}`}
                    title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                >
                    <i className="fas fa-desktop"></i>
                </button>
                
                <button
                    onClick={toggleRecording}
                    className={`control-btn ${isRecording ? 'recording' : ''}`}
                    title={isRecording ? 'Stop Recording' : 'Start Recording'}
                >
                    <i className={`fas fa-${isRecording ? 'stop' : 'record-vinyl'}`}></i>
                </button>
                
                {/* Video Quality Selector */}
                <select
                    value={videoQuality}
                    onChange={(e) => changeVideoQuality(e.target.value)}
                    className="quality-selector"
                >
                    <option value="low">Low Quality</option>
                    <option value="medium">Medium Quality</option>
                    <option value="high">High Quality</option>
                </select>
            </div>
            
            {/* Participants List */}
            <div className="participants-list">
                <h4>Participants ({participants.length + 1})</h4>
                <div className="participant-item local">
                    <span className="participant-name">You</span>
                    {isHost && <span className="host-badge">Host</span>}
                </div>
                {participants.map(participant => (
                    <div key={participant.id} className="participant-item">
                        <span className="participant-name">
                            {participant.name || 'Participant'}
                        </span>
                        {participant.isHost && <span className="host-badge">Host</span>}
                    </div>
                ))}
            </div>
            
            {/* Video Statistics */}
            <div className="video-stats">
                <h4>Statistics</h4>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-label">Local Video:</span>
                        <span className="stat-value">
                            {videoStats.localVideo?.framesSent || 0} frames sent
                        </span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Audio Level:</span>
                        <span className="stat-value">
                            {Math.round(audioLevel * 100)}%
                        </span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Connection:</span>
                        <span className="stat-value">
                            {connectionStatus}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoInterface;
