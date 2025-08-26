'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User,
  Loader2,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// TODO: Replace with actual package imports when available
// import { useAIService } from '@vitality/ai-service';
// import { useEmotionDetection } from '@vitality/emotion-detection';
// import { useVoiceProcessing } from '@vitality/voice-processing';

// Temporary mock implementations
const useAIService = () => ({
  generateResponse: async (message: string) => `Mock AI response to: ${message}`,
  streamResponse: async (message: string, onChunk: (chunk: string) => void) => {
    const response = `Mock streaming response to: ${message}`;
    for (const char of response) {
      onChunk(char);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
});

const useEmotionDetection = () => ({
  detectFromText: (text: string) => ({ emotion: 'neutral' }),
  getCurrentEmotion: () => 'neutral'
});

const useVoiceProcessing = () => ({
  startRecording: () => Promise.resolve(),
  stopRecording: () => Promise.resolve({ text: 'mock transcribed text' }),
  speak: (text: string) => Promise.resolve(),
  getRecordingStatus: () => ({ isRecording: false }),
  getSpeakingStatus: () => ({ isSpeaking: false })
});
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  emotion?: string;
  isStreaming?: boolean;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI companion. How can I help you today?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { generateResponse, streamResponse } = useAIService();
  const { detectFromText, getCurrentEmotion } = useEmotionDetection();
  const { 
    startRecording, 
    stopRecording, 
    speak, 
    getRecordingStatus, 
    getSpeakingStatus 
  } = useVoiceProcessing();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Detect emotion from user input
    const emotionResult = detectFromText(content);
    const currentEmotion = emotionResult.emotion;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
      emotion: currentEmotion,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Add streaming message
      const streamingMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages(prev => [...prev, streamingMessage]);

      // Stream response
      let fullResponse = '';
      await streamResponse(content, (chunk: string) => {
        fullResponse += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === streamingMessage.id 
              ? { ...msg, content: fullResponse, isStreaming: true }
              : msg
          )
        );
      });

      // Mark as complete
      setMessages(prev => 
        prev.map(msg => 
          msg.id === streamingMessage.id 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

      // Speak the response if not muted
      if (!isMuted && fullResponse) {
        try {
          await speak(fullResponse);
        } catch (error) {
          console.warn('Speech synthesis failed:', error);
        }
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => 
        prev.filter(msg => !msg.isStreaming)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      try {
        setIsListening(false);
        const result = await stopRecording();
        if (result.text.trim()) {
          setInputValue(result.text);
          handleSendMessage(result.text);
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsListening(false);
      }
    } else {
      try {
        setIsListening(true);
        await startRecording();
      } catch (error) {
        console.error('Error starting recording:', error);
        setIsListening(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (getSpeakingStatus()) {
      // Stop current speech
      // This would be handled by the voice processing service
    }
  };

  // Update listening status based on voice processing service
  useEffect(() => {
    const checkRecordingStatus = () => {
      const recordingStatus = getRecordingStatus();
      if (recordingStatus.isRecording !== isListening) {
        setIsListening(recordingStatus.isRecording);
      }
    };

    const interval = setInterval(checkRecordingStatus, 100);
    return () => clearInterval(interval);
  }, [isListening, getRecordingStatus]);

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          aria-label="Open AI Assistant"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 w-96 max-h-[600px]"
          >
            <Card className="h-full shadow-xl">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">AI Assistant</h3>
                      <p className="text-xs text-muted-foreground">
                        {getCurrentEmotion() ? `Detected: ${getCurrentEmotion()}` : 'Ready to help'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="h-8 w-8"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex items-start space-x-3',
                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      )}
                    >
                      <div className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full',
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      )}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className={cn(
                        'flex-1 space-y-2',
                        message.role === 'user' ? 'text-right' : ''
                      )}>
                        <div className={cn(
                          'rounded-lg px-3 py-2 max-w-[80%]',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        )}>
                          <p className="text-sm">
                            {message.content}
                            {message.isStreaming && (
                              <motion.span
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="ml-1"
                              >
                                ▋
                              </motion.span>
                            )}
                          </p>
                        </div>
                        {message.emotion && (
                          <Badge variant="secondary" className="text-xs">
                            {message.emotion}
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t space-y-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={isLoading || isListening}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleVoiceInput}
                      disabled={isLoading}
                      className={cn(
                        'h-10 w-10',
                        isListening && 'bg-red-500 text-white hover:bg-red-600'
                      )}
                    >
                      {isListening ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => handleSendMessage(inputValue)}
                      disabled={!inputValue.trim() || isLoading}
                      size="icon"
                      className="h-10 w-10"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {isListening && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="flex space-x-1">
                        <motion.div
                          className="h-2 w-2 bg-primary rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                        <motion.div
                          className="h-2 w-2 bg-primary rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="h-2 w-2 bg-primary rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                      <span>Listening...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

