'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Settings, Volume2 } from 'lucide-react';
import * as THREE from 'three';
import { ascendedAI } from '@/lib/ai/ascended-core';

interface FaceToFaceInterfaceProps {
  onClose?: () => void;
  onPersonaChange?: (persona: string) => void;
}

interface VideoStream {
  id: string;
  stream: MediaStream;
  isLocal: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
}

export default function FaceToFaceInterface({ onClose, onPersonaChange }: FaceToFaceInterfaceProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<string>('General');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const avatarContainerRef = useRef<HTMLDivElement>(null);
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const threeRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const avatarRef = useRef<THREE.Mesh | null>(null);

  // Initialize 3D avatar
  useEffect(() => {
    if (!avatarContainerRef.current || !showAvatar) return;

    const initAvatar = () => {
      const container = avatarContainerRef.current!;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      // Create simple avatar geometry
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x4f46e5,
        transparent: true,
        opacity: 0.8
      });
      const avatar = new THREE.Mesh(geometry, material);
      scene.add(avatar);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 1);
      scene.add(directionalLight);

      camera.position.z = 3;

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        avatar.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();

      threeSceneRef.current = scene;
      threeRendererRef.current = renderer;
      avatarRef.current = avatar;

      // Handle resize
      const handleResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', handleResize);
    };

    initAvatar();

    return () => {
      if (threeRendererRef.current && avatarContainerRef.current) {
        avatarContainerRef.current.removeChild(threeRendererRef.current.domElement);
        threeRendererRef.current.dispose();
      }
    };
  }, [showAvatar]);

  // Initialize local video stream
  useEffect(() => {
    const initLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initLocalStream();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Connect to AI companion
  const connectToAI = useCallback(async () => {
    setIsConnecting(true);
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Initialize AI
      await ascendedAI.initialize();
      
      // Generate AI avatar stream (simulated)
      const aiStream = new MediaStream();
      setRemoteStream(aiStream);
      
      setIsConnected(true);
      setIsConnecting(false);
      
      // Initial AI greeting
      const response = await ascendedAI.processInput('Hello, I\'m ready to connect.');
      setAiResponse(response.content);
      setCurrentPersona(response.persona);
      onPersonaChange?.(response.persona);
      
    } catch (error) {
      console.error('Error connecting to AI:', error);
      setIsConnecting(false);
    }
  }, [onPersonaChange]);

  // Disconnect from AI
  const disconnectFromAI = useCallback(() => {
    setIsConnected(false);
    setRemoteStream(null);
    setAiResponse('');
    setCurrentPersona('General');
    onPersonaChange?.('General');
  }, [onPersonaChange]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Process voice input
  const processVoiceInput = useCallback(async (audioData: Float32Array) => {
    if (!isConnected || isProcessing) return;

    setIsProcessing(true);
    
    try {
      // Simulate voice-to-text processing
      const transcribedText = await simulateVoiceToText(audioData);
      
      // Process with AI
      const response = await ascendedAI.processInput(transcribedText);
      setAiResponse(response.content);
      setCurrentPersona(response.persona);
      onPersonaChange?.(response.persona);
      
      // Simulate AI speech
      await simulateTextToSpeech(response.content);
      
    } catch (error) {
      console.error('Error processing voice input:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, isProcessing, onPersonaChange]);

  // Simulate voice-to-text
  const simulateVoiceToText = async (audioData: Float32Array): Promise<string> => {
    // In a real implementation, this would use a speech recognition API
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "Hello, how can you help me today?";
  };

  // Simulate text-to-speech
  const simulateTextToSpeech = async (text: string): Promise<void> => {
    // In a real implementation, this would use a TTS API
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('AI speaking:', text);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-semibold">Face-to-Face with Hope</h2>
            {currentPersona !== 'General' && (
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                {currentPersona}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Video Area */}
          <div className="flex-1 relative bg-gray-900">
            {/* Local Video */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {isVideoOff && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Remote Video / AI Avatar */}
            <div className="absolute inset-0 flex items-center justify-center">
              {showAvatar ? (
                <div ref={avatarContainerRef} className="w-full h-full" />
              ) : (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Connection Status */}
            {!isConnected && !isConnecting && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-semibold mb-4">Connect with Hope</h3>
                  <p className="text-gray-300 mb-6">Your AI companion is ready to meet you</p>
                  <button
                    onClick={connectToAI}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Start Conversation
                  </button>
                </div>
              </div>
            )}

            {isConnecting && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Connecting to Hope...</p>
                </div>
              </div>
            )}

            {/* AI Response Overlay */}
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-20 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg"
              >
                <p className="text-sm">{aiResponse}</p>
              </motion.div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 flex flex-col">
            {/* Controls */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full transition-colors ${
                  isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              
              <button
                onClick={isConnected ? disconnectFromAI : connectToAI}
                className={`p-3 rounded-full transition-colors ${
                  isConnected ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}
                disabled={isConnecting}
              >
                {isConnected ? <PhoneOff className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              </button>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Avatar Mode</span>
                <button
                  onClick={() => setShowAvatar(!showAvatar)}
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
                >
                  {showAvatar ? '3D Avatar' : 'Video'}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Volume</span>
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-gray-500" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="80"
                    className="w-20"
                  />
                </div>
              </div>
            </div>

            {/* Persona Info */}
            {currentPersona !== 'General' && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">{currentPersona}</h4>
                <p className="text-sm text-indigo-700">
                  Specialized mode activated for enhanced assistance
                </p>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-700">Processing...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
