'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface FaceToFaceInterfaceProps {
  onMessage?: (message: string) => void;
  onAvatarReady?: () => void;
  className?: string;
}

export function FaceToFaceInterface({ 
  onMessage, 
  onAvatarReady, 
  className 
}: FaceToFaceInterfaceProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userVideoStream, setUserVideoStream] = useState<MediaStream | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const avatarCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initializeInterface();
    return () => cleanup();
  }, []);

  const initializeInterface = async () => {
    try {
      setIsLoading(true);
      await initializeVideo();
      await initializeAvatar();
      setIsConnected(true);
      setIsLoading(false);
      onAvatarReady?.();
    } catch (error) {
      console.error('Failed to initialize interface:', error);
      setIsLoading(false);
    }
  };

  const initializeVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setUserVideoStream(stream);
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to access camera/microphone:', error);
      throw error;
    }
  };

  const initializeAvatar = async () => {
    const canvas = avatarCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw simple avatar
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FCD34D';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  const speakWithEmotion = (text: string) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleUserMessage = async (message: string) => {
    if (!message.trim() || isProcessing) return;
    
    setIsProcessing(true);
    onMessage?.(message);
    
    setTimeout(() => {
      const responses = [
        "I understand what you're saying. Let me help you with that.",
        "That's an interesting point. I'd be happy to assist you further.",
        "I hear you loud and clear. How can I best support you today?"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setAiResponse(randomResponse);
      speakWithEmotion(randomResponse);
      setIsProcessing(false);
    }, 2000);
  };

  const cleanup = () => {
    if (userVideoStream) {
      userVideoStream.getTracks().forEach(track => track.stop());
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Initializing Face-to-Face Interface...</p>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">You</h3>
          <video
            ref={userVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 bg-gray-900 rounded-lg object-cover"
          />
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">AI Assistant</h3>
          <div className="relative">
            <canvas
              ref={avatarCanvasRef}
              width={400}
              height={300}
              className="w-full h-64 bg-blue-500 rounded-lg"
            />
            {isSpeaking && (
              <div className="absolute top-4 right-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {aiResponse && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">AI Response</h3>
          <p className="text-gray-700">{aiResponse}</p>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            onClick={() => handleUserMessage("Hello, how are you?")}
            disabled={isProcessing}
          >
            👋 Greet
          </Button>
          <Button
            variant="outline"
            onClick={() => handleUserMessage("I need help with something")}
            disabled={isProcessing}
          >
            ❓ Ask for Help
          </Button>
          <Button
            variant="outline"
            onClick={() => handleUserMessage("Tell me a joke")}
            disabled={isProcessing}
          >
            😄 Joke
          </Button>
          <Button
            variant="outline"
            onClick={() => handleUserMessage("Goodbye")}
            disabled={isProcessing}
          >
            👋 Goodbye
          </Button>
        </div>
      </Card>
    </div>
  );
}
