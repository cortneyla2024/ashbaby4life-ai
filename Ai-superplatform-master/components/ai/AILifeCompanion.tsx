"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import FaceToFaceInterface from "./FaceToFaceInterface";
import EducationalInterface from "./EducationalInterface";
import UnifiedChat from "./UnifiedChat";
import {
  MessageCircle,
  Video,
  GraduationCap,
  Heart,
  Brain,
  Music,
  Palette,
  Settings,
  Sparkles,
  Users,
  Target,
  BookOpen,
  Mic,
  MicOff,
} from "lucide-react";

interface AILifeCompanionProps {
  userId: string;
  roomId?: string;
}

interface CompanionMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  prompt?: string;
}

const AILifeCompanion: React.FC<AILifeCompanionProps> = ({
  userId,
  roomId = "default-room",
}) => {
  const [activeMode, setActiveMode] = useState<string>("conversation");
  const [isFaceToFaceActive, setIsFaceToFaceActive] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [companionState, setCompanionState] = useState({
    currentEmotion: "neutral",
    isSpeaking: false,
    currentActivity: "idle",
    energyLevel: 100,
    connectionQuality: "excellent",
  });

  const companionModes: CompanionMode[] = [
    {
      id: "conversation",
      name: "Conversation",
      description: "Natural text-based interaction",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "bg-blue-500",
      prompt: "I am your conversational companion, ready to chat about anything.",
    },
    {
      id: "face-to-face",
      name: "Face-to-Face",
      description: "Video interaction with AI avatar",
      icon: <Video className="w-6 h-6" />,
      color: "bg-purple-500",
      prompt: "I am your face-to-face companion, here to see and hear you.",
    },
    {
      id: "educator",
      name: "Educator",
      description: "Personal AI teacher and tutor",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "bg-green-500",
      prompt: "I am your personal educator, ready to teach any subject at any level.",
    },
    {
      id: "therapist",
      name: "Therapist",
      description: "Emotional support and mental health",
      icon: <Heart className="w-6 h-6" />,
      color: "bg-pink-500",
      prompt: "I am your therapeutic companion, here to provide emotional support and guidance.",
    },
    {
      id: "creative",
      name: "Creative",
      description: "Artistic collaboration and inspiration",
      icon: <Palette className="w-6 h-6" />,
      color: "bg-orange-500",
      prompt: "I am your creative partner, here to inspire and collaborate on artistic projects.",
    },
    {
      id: "analyst",
      name: "Analyst",
      description: "Data analysis and insights",
      icon: <Brain className="w-6 h-6" />,
      color: "bg-indigo-500",
      prompt: "I am your analytical companion, here to help you understand data and make informed decisions.",
    },
  ];

  const currentMode = companionModes.find(mode => mode.id === activeMode);

  const handleModeChange = (modeId: string) => {
    setActiveMode(modeId);

    // Special handling for face-to-face mode
    if (modeId === "face-to-face") {
      setIsFaceToFaceActive(true);
    } else {
      setIsFaceToFaceActive(false);
    }

    // Update companion state
    setCompanionState(prev => ({
      ...prev,
      currentActivity: modeId,
      currentEmotion: "focused",
    }));
  };

  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course);
    setActiveMode("educator");
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const getCompanionStatus = () => {
    if (companionState.isSpeaking) {
return "Speaking";
}
    if (companionState.currentActivity === "idle") {
return "Ready";
}
    return `In ${currentMode?.name} mode`;
  };

  const getEnergyColor = (energy: number) => {
    if (energy > 80) {
return "text-green-500";
}
    if (energy > 50) {
return "text-yellow-500";
}
    return "text-red-500";
  };

  const getConnectionColor = (quality: string) => {
    switch (quality) {
      case "excellent": return "text-green-500";
      case "good": return "text-yellow-500";
      case "poor": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${currentMode?.color} border-2 border-gray-900`}></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Life Companion v3.0</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {getCompanionStatus()}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {companionState.currentEmotion}
                </Badge>
                <div className={`text-xs ${getEnergyColor(companionState.energyLevel)}`}>
                  Energy: {companionState.energyLevel}%
                </div>
                <div className={`text-xs ${getConnectionColor(companionState.connectionQuality)}`}>
                  {companionState.connectionQuality}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAudio}
              className={!isAudioEnabled ? "bg-red-600 text-white" : ""}
            >
              {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center space-x-4 overflow-x-auto">
          {companionModes.map(mode => (
            <Button
              key={mode.id}
              variant={activeMode === mode.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange(mode.id)}
              className={`flex items-center space-x-2 ${
                activeMode === mode.id ? mode.color : "hover:bg-gray-700"
              }`}
            >
              {mode.icon}
              <span>{mode.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Quick Actions */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => setActiveMode("conversation")}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Conversation
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => setActiveMode("face-to-face")}
            >
              <Video className="w-4 h-4 mr-2" />
              Video Call
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => setActiveMode("educator")}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Learn Something
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => setActiveMode("therapist")}
            >
              <Heart className="w-4 h-4 mr-2" />
              Emotional Support
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => setActiveMode("creative")}
            >
              <Palette className="w-4 h-4 mr-2" />
              Creative Project
            </Button>
          </div>

          {/* Companion Stats */}
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-3">Companion Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Energy</span>
                <span className={getEnergyColor(companionState.energyLevel)}>
                  {companionState.energyLevel}%
                </span>
              </div>
              <Progress value={companionState.energyLevel} className="h-1" />

              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Connection</span>
                <span className={getConnectionColor(companionState.connectionQuality)}>
                  {companionState.connectionQuality}
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Current Mode</span>
                <span className="text-white">{currentMode?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {activeMode === "face-to-face" && isFaceToFaceActive ? (
            <FaceToFaceInterface
              userId={userId}
              roomId={roomId}
              onMessage={(message) => {
                console.log("Face-to-face message:", message);
              }}
            />
          ) : (
            <div className="flex-1 p-6">
              {activeMode === "conversation" && (
                <div className="h-full">
                  <UnifiedChat />
                </div>
              )}

              {activeMode === "educator" && (
                <div className="h-full">
                  <EducationalInterface
                    userId={userId}
                    onCourseSelect={handleCourseSelect}
                  />
                </div>
              )}

              {activeMode === "therapist" && (
                <Card className="h-full p-6">
                  <div className="text-center">
                    <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Therapeutic Support</h2>
                    <p className="text-gray-400 mb-6">
                      I'm here to provide emotional support, guidance, and therapeutic techniques.
                    </p>
                    <div className="space-y-4">
                      <Button className="w-full bg-pink-600 hover:bg-pink-700">
                        Start Therapy Session
                      </Button>
                      <Button variant="outline" className="w-full">
                        Mood Assessment
                      </Button>
                      <Button variant="outline" className="w-full">
                        Coping Strategies
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {activeMode === "creative" && (
                <Card className="h-full p-6">
                  <div className="text-center">
                    <Palette className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Creative Collaboration</h2>
                    <p className="text-gray-400 mb-6">
                      Let's create something amazing together. I can help with writing, art, music, and more.
                    </p>
                    <div className="space-y-4">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        Start Creative Project
                      </Button>
                      <Button variant="outline" className="w-full">
                        Writing Assistant
                      </Button>
                      <Button variant="outline" className="w-full">
                        Art Inspiration
                      </Button>
                      <Button variant="outline" className="w-full">
                        Music Composition
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {activeMode === "analyst" && (
                <Card className="h-full p-6">
                  <div className="text-center">
                    <Brain className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Data Analysis</h2>
                    <p className="text-gray-400 mb-6">
                      I can help you analyze data, generate insights, and make informed decisions.
                    </p>
                    <div className="space-y-4">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Start Analysis
                      </Button>
                      <Button variant="outline" className="w-full">
                        Data Visualization
                      </Button>
                      <Button variant="outline" className="w-full">
                        Trend Analysis
                      </Button>
                      <Button variant="outline" className="w-full">
                        Predictive Modeling
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Context and Info */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Context & Insights</h3>

          {/* Current Mode Info */}
          <Card className="p-4 mb-4 bg-gray-800 border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              {currentMode?.icon}
              <h4 className="font-medium text-white">{currentMode?.name}</h4>
            </div>
            <p className="text-sm text-gray-400">{currentMode?.description}</p>
          </Card>

          {/* Selected Course Info */}
          {selectedCourse && (
            <Card className="p-4 mb-4 bg-gray-800 border-gray-700">
              <h4 className="font-medium text-white mb-2">Current Course</h4>
              <p className="text-sm text-gray-400 mb-2">{selectedCourse.title}</p>
              <Progress value={30} className="h-2 mb-2" />
              <p className="text-xs text-gray-500">30% Complete</p>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="p-4 mb-4 bg-gray-800 border-gray-700">
            <h4 className="font-medium text-white mb-3">Today's Activity</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Conversations</span>
                <span className="text-white">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Learning Time</span>
                <span className="text-white">2h 15m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tasks Completed</span>
                <span className="text-white">8</span>
              </div>
            </div>
          </Card>

          {/* Suggestions */}
          <Card className="p-4 bg-gray-800 border-gray-700">
            <h4 className="font-medium text-white mb-3">Suggestions</h4>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-blue-900/20 border border-blue-800 rounded">
                <p className="text-blue-300">Ready for your next lesson?</p>
              </div>
              <div className="p-2 bg-green-900/20 border border-green-800 rounded">
                <p className="text-green-300">Time for a mood check-in</p>
              </div>
              <div className="p-2 bg-purple-900/20 border border-purple-800 rounded">
                <p className="text-purple-300">Continue your creative project</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AILifeCompanion;
