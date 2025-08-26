"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  emotionalContext?: {
    userMood: string;
    userTone: string;
    aiResponse: string;
  };
  functions?: Array<{
    name: string;
    success: boolean;
    result?: any;
    error?: string;
  }>;
}

interface EmotionalState {
  mood: string;
  intensity: number;
  confidence: number;
  timestamp: Date;
}

const FaceToFaceInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isConciergeMode, setIsConciergeMode] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth-token");
    if (token) {
      fetch("/api/auth/verify", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
            setIsAuthenticated(true);
          }
        })
        .catch(() => {
          localStorage.removeItem("auth-token");
        });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const requestMediaPermissions = async() => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      setConsentGiven(true);

      // Start emotional analysis
      startEmotionalAnalysis();

    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Unable to access camera and microphone. Please check permissions.");
    }
  };

  const startEmotionalAnalysis = () => {
    // Simulate emotional analysis from video feed
    setInterval(() => {
      if (consentGiven && isVideoEnabled) {
        // In a real implementation, this would analyze the video feed
        const moods = ["happy", "sad", "neutral", "anxious", "excited", "frustrated"];
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        const intensity = Math.random();
        const confidence = 0.7 + Math.random() * 0.3;

        setEmotionalState({
          mood: randomMood,
          intensity,
          confidence,
          timestamp: new Date(),
        });
      }
    }, 5000); // Analyze every 5 seconds
  };

  const sendMessage = async() => {
    if (!inputMessage.trim() || !isAuthenticated) {
return;
}

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
      emotionalContext: emotionalState ? {
        userMood: emotionalState.mood,
        userTone: "conversational",
        aiResponse: "empathetic",
      } : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("auth-token");
      const endpoint = isConciergeMode ? "/api/ai/universal-concierge" : "/api/ai/chat";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: inputMessage,
          request: inputMessage, // For concierge mode
          context: "Face-to-face conversation with Hope",
          actionMode: isConciergeMode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          functions: data.functions,
          emotionalContext: {
            userMood: emotionalState?.mood || "neutral",
            userTone: "conversational",
            aiResponse: emotionalState ? "empathetic" : "neutral",
          },
        };

        setMessages(prev => [...prev, aiMessage]);

        // Check if we're in concierge mode
        if (data.conciergeMode) {
          setIsConciergeMode(true);
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleConciergeMode = () => {
    setIsConciergeMode(!isConciergeMode);
  };

  const getEmotionalResponse = (mood: string): string => {
    switch (mood) {
      case "happy":
        return "😊 I can see you're feeling good! I'm glad to share this moment with you.";
      case "sad":
        return "😔 I notice you seem down. I'm here to listen and support you.";
      case "anxious":
        return "😰 I sense you're feeling anxious. Let's take a deep breath together.";
      case "excited":
        return "🎉 Your excitement is contagious! I'm excited to help you with whatever you need.";
      case "frustrated":
        return "😤 I can see you're frustrated. Let's work through this together.";
      default:
        return "I'm here to help you with whatever you need.";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">
            Please log in to access your face-to-face conversation with Hope.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Log In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Hope - Your AI Companion</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Face-to-Face</Badge>
                {isConciergeMode && <Badge variant="outline">Universal Concierge</Badge>}
                {emotionalState && (
                  <Badge variant="outline">
                    {emotionalState.mood} ({(emotionalState.confidence * 100).toFixed(0)}%)
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleConciergeMode}
              className={isConciergeMode ? "bg-purple-600 text-white" : ""}
            >
              {isConciergeMode ? "Concierge Mode" : "Standard Mode"}
            </Button>
            <div className="text-sm text-gray-400">
              {user?.name || user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="w-1/3 bg-gray-900 border-r border-gray-800 p-4">
          <div className="space-y-4">
            {/* AI Avatar */}
            <div className="relative">
              <div className="w-full h-64 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🤖</div>
                  <p className="text-lg font-medium">Hope</p>
                  <p className="text-sm opacity-75">Your AI Companion</p>
                </div>
              </div>
              {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* User Video */}
            <div className="relative">
              {!consentGiven ? (
                <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">📹</div>
                    <p className="text-sm mb-4">Enable camera for face-to-face interaction</p>
                    <Button onClick={requestMediaPermissions} size="sm">
                      Enable Camera
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    className="w-full h-48 bg-gray-800 rounded-lg object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary">You</Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Emotional Analysis */}
            {emotionalState && (
              <Card className="p-4 bg-gray-800 border-gray-700">
                <h3 className="text-sm font-semibold text-white mb-2">Emotional Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Mood:</span>
                    <span className="text-white capitalize">{emotionalState.mood}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Intensity:</span>
                    <span className="text-white">{(emotionalState.intensity * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-white">{(emotionalState.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => setInputMessage("I need help with something important.")}
              >
                <span className="mr-2">🎯</span>
                Get Help
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => setInputMessage("I'm feeling overwhelmed today.")}
              >
                <span className="mr-2">😌</span>
                Emotional Support
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => setInputMessage("Can you help me learn something new?")}
              >
                <span className="mr-2">📚</span>
                Learn Something
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-4">👋</div>
                <p className="text-lg font-medium mb-2">Hello, I'm Hope</p>
                <p className="text-sm mb-4">I'm here to help you with anything you need - from daily tasks to complex challenges.</p>
                <p className="text-sm mb-4">Enable your camera for a more personal experience, or just start typing to begin our conversation.</p>
                <div className="mt-6 space-y-2">
                  <p className="text-xs">• "I need help finding resources for..."</p>
                  <p className="text-xs">• "Can you help me understand..."</p>
                  <p className="text-xs">• "I'm feeling..."</p>
                  <p className="text-xs">• "Show me how to..."</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-100"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Emotional Context */}
                  {message.emotionalContext && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 rounded-lg p-3 max-w-md">
                        <div className="text-xs text-gray-400 mb-2">Emotional Context:</div>
                        <div className="text-xs text-gray-300">
                          <div>Your mood: {message.emotionalContext.userMood}</div>
                          <div>My response: {message.emotionalContext.aiResponse}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Function Results */}
                  {message.functions && message.functions.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 rounded-lg p-3 max-w-md">
                        <div className="text-xs text-gray-400 mb-2">Actions taken:</div>
                        {message.functions.map((func, index) => (
                          <div key={index} className="flex items-center space-x-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${func.success ? "bg-green-500" : "bg-red-500"}`} />
                            <span className="text-xs text-gray-300">
                              {func.name.replace(/_/g, " ").toLowerCase()}
                            </span>
                            {!func.success && (
                              <span className="text-xs text-red-400">({func.error})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConciergeMode ? "What would you like me to help you with? (I can do anything!)" : "Type your message... (Press Enter to send)"}
                className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceToFaceInterface;
