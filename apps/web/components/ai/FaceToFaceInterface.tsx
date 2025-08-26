'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Settings, 
  MessageCircle,
  User,
  Bot
} from 'lucide-react';

interface FaceToFaceInterfaceProps {
  onStartCall: () => void;
  onEndCall: () => void;
  isCallActive: boolean;
  aiPersona: string;
  userAvatar?: string;
  aiAvatar?: string;
}

export function FaceToFaceInterface({
  onStartCall,
  onEndCall,
  isCallActive,
  aiPersona,
  userAvatar,
  aiAvatar
}: FaceToFaceInterfaceProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'ai';
    message: string;
    timestamp: Date;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const aiVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isCallActive) {
      // Initialize video streams
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error('Error accessing media devices:', err);
        });
    }
  }, [isCallActive]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: 'user' as const,
        message: newMessage,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai' as const,
          message: `I understand you're saying: "${newMessage}". How can I help you further?`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const getPersonaColor = (persona: string) => {
    const colors = {
      educator: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      therapist: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      creative: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      legal_advocate: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      financial_advisor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      balanced: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[persona as keyof typeof colors] || colors.balanced;
  };

  return (
    <div className="space-y-4">
      {/* Main Video Interface */}
      <Card className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Video */}
          <div className="relative">
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {isCallActive ? (
                <video
                  ref={userVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            <div className="absolute bottom-2 left-2">
              <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                You
              </Badge>
            </div>
          </div>

          {/* AI Video */}
          <div className="relative">
            <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg overflow-hidden">
              {isCallActive ? (
                <video
                  ref={aiVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Bot className="w-16 h-16 text-blue-400" />
                </div>
              )}
            </div>
            <div className="absolute bottom-2 left-2">
              <Badge className={getPersonaColor(aiPersona)}>
                {aiPersona.replace('_', ' ').charAt(0).toUpperCase() + aiPersona.replace('_', ' ').slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center space-x-4 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            className={!isVideoEnabled ? 'bg-red-500 text-white hover:bg-red-600' : ''}
          >
            {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={!isAudioEnabled ? 'bg-red-500 text-white hover:bg-red-600' : ''}
          >
            {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className={showChat ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>

          {!isCallActive ? (
            <Button
              onClick={onStartCall}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Phone className="h-4 w-4 mr-2" />
              Start Call
            </Button>
          ) : (
            <Button
              onClick={onEndCall}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              End Call
            </Button>
          )}
        </div>
      </Card>

      {/* Chat Panel */}
      {showChat && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Chat</h3>
            <Badge variant="outline">Real-time</Badge>
          </div>
          
          <div className="h-64 overflow-y-auto space-y-3 mb-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              Send
            </Button>
          </div>
        </Card>
      )}

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Call Settings"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Video Settings</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isVideoEnabled}
                  onChange={(e) => setIsVideoEnabled(e.target.checked)}
                  className="rounded"
                />
                <span>Enable video</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Audio Settings</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAudioEnabled}
                  onChange={(e) => setIsAudioEnabled(e.target.checked)}
                  className="rounded"
                />
                <span>Enable microphone</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">AI Persona</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current persona: <Badge className={getPersonaColor(aiPersona)}>
                {aiPersona.replace('_', ' ')}
              </Badge>
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
