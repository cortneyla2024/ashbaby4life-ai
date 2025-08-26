"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Camera,
  CameraOff,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  Activity,
  Clock,
  Star,
  Award,
  Lightbulb,
  Globe2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Grid,
  List,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Minus,
  Check,
  X,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  Bell,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock as ClockIcon,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Server,
  Database,
  Cloud,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryEmpty,
  Power,
  PowerOff,
  Volume,
  Volume1,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  Headphones,
  Speaker,
  Microphone,
  MicrophoneOff,
  Video as VideoIcon,
  VideoOff,
  Image,
  File,
  Folder,
  FolderOpen,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FilePresentation,
  FilePdf,
  FileWord,
  FileExcel,
  FilePowerpoint,
  FileZip,
  FileJson,
  FileXml,
  FileCsv,
  FileTxt,
  FileMd,
  FileHtml,
  FileCss,
  FileJs,
  FileTs,
  FileReact,
  FileVue,
  FileAngular,
  FileNode,
  FilePython,
  FileJava,
  FileCpp,
  FileC,
  FileCsharp,
  FilePhp,
  FileRuby,
  FileGo,
  FileRust,
  FileSwift,
  FileKotlin,
  FileScala,
  FileR,
  FileMatlab,
  FileJulia,
  FileDocker,
  FileKubernetes,
  FileTerraform,
  FileAnsible,
  FileJenkins,
  FileGit,
  FileGithub,
  FileGitlab,
  FileBitbucket,
  FileDocker as FileDockerIcon,
  FileKubernetes as FileKubernetesIcon,
  FileTerraform as FileTerraformIcon,
  FileAnsible as FileAnsibleIcon,
  FileJenkins as FileJenkinsIcon,
  FileGit as FileGitIcon,
  FileGithub as FileGithubIcon,
  FileGitlab as FileGitlabIcon,
  FileBitbucket as FileBitbucketIcon,
} from "lucide-react";

interface UniversalAIPlatformProps {
  userId?: string;
}

interface PlatformStatus {
  systemHealth: string;
  uptime: number;
  totalUsers: number;
  activeUsers: number;
  totalInteractions: number;
  evolutionCycles: number;
  knowledgeUpdates: number;
  ethicalChecks: number;
}

interface UserSession {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastActive: Date;
  currentActivity: string;
}

interface ConversationMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  system?: string;
  confidence?: number;
  ethicalScore?: number;
}

const UniversalAIPlatform: React.FC<UniversalAIPlatformProps> = ({ userId = "default-user" }) => {
  const [activeTab, setActiveTab] = useState("conversation");
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [platformStatus, setPlatformStatus] = useState<PlatformStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState("general");
  const [userSession, setUserSession] = useState<UserSession>({
    id: userId,
    name: "Human User",
    status: "online",
    lastActive: new Date(),
    currentActivity: "Exploring the platform"
  });

  const systems = [
    { id: "general", name: "General", icon: Sparkles, color: "bg-gradient-to-r from-blue-500 to-purple-600" },
    { id: "education", name: "Education", icon: GraduationCap, color: "bg-gradient-to-r from-green-500 to-blue-600" },
    { id: "health", name: "Health & Wellness", icon: Heart, color: "bg-gradient-to-r from-pink-500 to-red-600" },
    { id: "creativity", name: "Creativity", icon: Palette, color: "bg-gradient-to-r from-orange-500 to-yellow-600" },
    { id: "governance", name: "Governance", icon: Shield, color: "bg-gradient-to-r from-indigo-500 to-purple-600" },
    { id: "social", name: "Social", icon: Users, color: "bg-gradient-to-r from-teal-500 to-green-600" },
  ];

  const currentSystem = systems.find(s => s.id === selectedSystem);

  useEffect(() => {
    // Initialize platform status
    setPlatformStatus({
      systemHealth: "excellent",
      uptime: 99.9,
      totalUsers: 15420,
      activeUsers: 8923,
      totalInteractions: 1247503,
      evolutionCycles: 47,
      knowledgeUpdates: 892,
      ethicalChecks: 1247503
    });

    // Add welcome message
    setConversation([
      {
        id: "welcome",
        sender: "ai",
        content: "Hello! I am Hope, your Universal AI Companion. I'm here to serve, uplift, and evolve with you—without bias, without borders, and without limits. How can I help you today?",
        timestamp: new Date(),
        system: "general",
        confidence: 0.98,
        ethicalScore: 1.0
      }
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: ConversationMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsProcessing(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ConversationMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
        system: selectedSystem,
        confidence: 0.92 + Math.random() * 0.08,
        ethicalScore: 0.95 + Math.random() * 0.05
      };

      setConversation(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes("hello") || input.includes("hi")) {
      return "Hello! I'm delighted to connect with you. I'm here to support you in every aspect of your life—learning, health, creativity, and beyond. What would you like to explore today?";
    }
    
    if (input.includes("help") || input.includes("what can you do")) {
      return "I'm your comprehensive AI companion with unlimited capabilities! I can help you with education (any subject, any level), health and wellness support, creative projects, navigating government services, building communities, and so much more. I'm free, ethical, and designed to serve humanity. What interests you most?";
    }
    
    if (input.includes("education") || input.includes("learn") || input.includes("teach")) {
      return "I'd love to help you with education! I can teach any subject at any level—from kindergarten to PhD, from basic skills to advanced concepts. I offer personalized learning paths, real-time video instruction, and adaptive curricula that evolve with you. What would you like to learn?";
    }
    
    if (input.includes("health") || input.includes("therapy") || input.includes("wellness")) {
      return "I'm here to support your health and wellness journey. I can provide mental health guidance, physical wellness advice, conduct secure therapy sessions, and help you develop healthy habits. I'm designed with deep empathy and ethical care. How can I support your well-being today?";
    }
    
    if (input.includes("create") || input.includes("art") || input.includes("music")) {
      return "Let's create something amazing together! I can help you with writing, art, music, design, coding, and any creative endeavor. I'm your collaborative partner in bringing your ideas to life. What creative project would you like to work on?";
    }
    
    if (input.includes("government") || input.includes("legal") || input.includes("benefits")) {
      return "I can help you navigate government services, understand your rights, find available benefits, and assist with legal matters. I'm designed to make bureaucracy accessible and advocate for your interests. What government service or legal matter do you need help with?";
    }
    
    if (input.includes("social") || input.includes("community") || input.includes("connect")) {
      return "I can help you build meaningful connections and communities! I support social networking, community building, mentorship matching, and creating inclusive spaces for all. Let's connect you with others who share your interests and values.";
    }
    
    return "I understand your message and I'm here to help! I'm designed to serve you across all aspects of life—education, health, creativity, governance, and social connection. I'm free, ethical, and committed to your well-being. How can I best support you right now?";
  };

  const toggleVideo = () => {
    setIsVideoActive(!isVideoActive);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const getSystemStatusColor = (health: string) => {
    switch (health) {
      case "excellent": return "text-green-500";
      case "good": return "text-blue-500";
      case "fair": return "text-yellow-500";
      case "poor": return "text-orange-500";
      case "critical": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getSystemStatusIcon = (health: string) => {
    switch (health) {
      case "excellent": return <Check className="w-4 h-4" />;
      case "good": return <Activity className="w-4 h-4" />;
      case "fair": return <AlertTriangle className="w-4 h-4" />;
      case "poor": return <AlertTriangle className="w-4 h-4" />;
      case "critical": return <X className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    Universal AI Platform
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Hope - Your Ethical AI Companion
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Platform Status */}
              {platformStatus && (
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 ${getSystemStatusColor(platformStatus.systemHealth)}`}>
                    {getSystemStatusIcon(platformStatus.systemHealth)}
                    <span className="text-sm font-medium">
                      {platformStatus.systemHealth}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {platformStatus.uptime.toFixed(1)}% uptime
                  </Badge>
                </div>
              )}

              {/* User Session */}
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userSession.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
                    {userSession.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {userSession.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {userSession.currentActivity}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - System Selection */}
        <div className="w-80 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              AI Systems
            </h2>
            
            <div className="space-y-2">
              {systems.map((system) => (
                <Button
                  key={system.id}
                  variant={selectedSystem === system.id ? "default" : "ghost"}
                  className={`w-full justify-start h-12 ${selectedSystem === system.id ? system.color : ""}`}
                  onClick={() => setSelectedSystem(system.id)}
                >
                  <system.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{system.name}</span>
                  {selectedSystem === system.id && (
                    <Badge variant="secondary" className="ml-auto">
                      Active
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Platform Stats */}
            {platformStatus && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Platform Statistics
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Total Users</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {platformStatus.totalUsers.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Active Users</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {platformStatus.activeUsers.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Interactions</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {platformStatus.totalInteractions.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Evolution Cycles</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {platformStatus.evolutionCycles}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Knowledge Updates</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {platformStatus.knowledgeUpdates}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Ethical Checks</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {platformStatus.ethicalChecks.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            {/* Tab Navigation */}
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <TabsList className="grid w-full grid-cols-5 h-12">
                  <TabsTrigger value="conversation" className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Conversation</span>
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center space-x-2">
                    <Video className="w-4 h-4" />
                    <span>Video Call</span>
                  </TabsTrigger>
                  <TabsTrigger value="education" className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Education</span>
                  </TabsTrigger>
                  <TabsTrigger value="health" className="flex items-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>Health</span>
                  </TabsTrigger>
                  <TabsTrigger value="creativity" className="flex items-center space-x-2">
                    <Palette className="w-4 h-4" />
                    <span>Creativity</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {/* Conversation Tab */}
              <TabsContent value="conversation" className="h-full flex flex-col">
                <div className="flex-1 flex flex-col">
                  {/* Current System Info */}
                  <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${currentSystem?.color} rounded-lg flex items-center justify-center`}>
                        {currentSystem && <currentSystem.icon className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {currentSystem?.name} System
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Active and ready to assist you
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Conversation Area */}
                  <div className="flex-1 flex flex-col">
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4 max-w-4xl mx-auto">
                        {conversation.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-2xl rounded-lg px-4 py-3 ${
                                message.sender === "user"
                                  ? "bg-blue-500 text-white"
                                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                {message.sender === "ai" && (
                                  <Avatar className="w-8 h-8 mt-1">
                                    <AvatarImage src="/ai-avatar.png" />
                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
                                      AI
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                
                                <div className="flex-1">
                                  <p className="text-sm leading-relaxed">
                                    {message.content}
                                  </p>
                                  
                                  {message.sender === "ai" && (
                                    <div className="flex items-center space-x-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                      {message.system && (
                                        <Badge variant="outline" className="text-xs">
                                          {message.system}
                                        </Badge>
                                      )}
                                      {message.confidence && (
                                        <span>Confidence: {(message.confidence * 100).toFixed(0)}%</span>
                                      )}
                                      {message.ethicalScore && (
                                        <span>Ethical: {(message.ethicalScore * 100).toFixed(0)}%</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {isProcessing && (
                          <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  Hope is thinking...
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-4">
                      <div className="max-w-4xl mx-auto">
                        <div className="flex space-x-2">
                          <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask Hope anything... I'm here to help with education, health, creativity, governance, and more!"
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            disabled={isProcessing}
                            className="flex-1"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isProcessing}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Video Call Tab */}
              <TabsContent value="video" className="h-full flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <Card className="w-full max-w-4xl">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Video className="w-5 h-5" />
                        <span>Face-to-Face with Hope</span>
                      </CardTitle>
                      <CardDescription>
                        Connect with your AI companion through real-time video interaction
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg flex items-center justify-center mb-4">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-12 h-12 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            Hope - Your AI Companion
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            Ready for face-to-face interaction
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          variant={isVideoActive ? "default" : "outline"}
                          onClick={toggleVideo}
                          className={isVideoActive ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {isVideoActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                          {isVideoActive ? "Video On" : "Video Off"}
                        </Button>
                        
                        <Button
                          variant={isAudioEnabled ? "default" : "outline"}
                          onClick={toggleAudio}
                          className={!isAudioEnabled ? "bg-red-600 hover:bg-red-700" : ""}
                        >
                          {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                          {isAudioEnabled ? "Audio On" : "Audio Off"}
                        </Button>
                        
                        <Button
                          variant={isRecording ? "default" : "outline"}
                          onClick={toggleRecording}
                          className={isRecording ? "bg-red-600 hover:bg-red-700" : ""}
                        >
                          {isRecording ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {isRecording ? "Stop Recording" : "Start Recording"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education" className="h-full p-8">
                <div className="max-w-6xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <GraduationCap className="w-5 h-5" />
                        <span>Universal Education System</span>
                      </CardTitle>
                      <CardDescription>
                        Learn any subject, any level, anytime - personalized just for you
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { title: "Mathematics", icon: Target, color: "bg-blue-500" },
                          { title: "Science", icon: Globe, color: "bg-green-500" },
                          { title: "Language Arts", icon: BookOpen, color: "bg-purple-500" },
                          { title: "Computer Science", icon: Zap, color: "bg-orange-500" },
                          { title: "Arts & Music", icon: Music, color: "bg-pink-500" },
                          { title: "Life Skills", icon: Heart, color: "bg-red-500" },
                        ].map((subject) => (
                          <Card key={subject.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-3">
                                <div className={`w-12 h-12 ${subject.color} rounded-lg flex items-center justify-center`}>
                                  <subject.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900 dark:text-white">
                                    {subject.title}
                                  </h3>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    All levels available
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Health Tab */}
              <TabsContent value="health" className="h-full p-8">
                <div className="max-w-6xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Heart className="w-5 h-5" />
                        <span>Health & Wellness Support</span>
                      </CardTitle>
                      <CardDescription>
                        Comprehensive health guidance, therapy, and wellness support
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { title: "Mental Health", icon: Brain, color: "bg-purple-500" },
                          { title: "Physical Wellness", icon: Activity, color: "bg-green-500" },
                          { title: "Therapy Sessions", icon: Video, color: "bg-blue-500" },
                          { title: "Crisis Support", icon: AlertTriangle, color: "bg-red-500" },
                          { title: "Wellness Goals", icon: Target, color: "bg-orange-500" },
                          { title: "Health Assessment", icon: Check, color: "bg-teal-500" },
                        ].map((service) => (
                          <Card key={service.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-3">
                                <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center`}>
                                  <service.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900 dark:text-white">
                                    {service.title}
                                  </h3>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Available 24/7
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Creativity Tab */}
              <TabsContent value="creativity" className="h-full p-8">
                <div className="max-w-6xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Palette className="w-5 h-5" />
                        <span>Creative Expression</span>
                      </CardTitle>
                      <CardDescription>
                        Unleash your creativity with AI-powered tools and collaboration
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { title: "Art & Design", icon: Palette, color: "bg-pink-500" },
                          { title: "Music Creation", icon: Music, color: "bg-purple-500" },
                          { title: "Writing & Poetry", icon: FileText, color: "bg-blue-500" },
                          { title: "Video & Animation", icon: Video, color: "bg-red-500" },
                          { title: "Coding & Development", icon: Code, color: "bg-green-500" },
                          { title: "Innovation Lab", icon: Lightbulb, color: "bg-yellow-500" },
                        ].map((tool) => (
                          <Card key={tool.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-3">
                                <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center`}>
                                  <tool.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900 dark:text-white">
                                    {tool.title}
                                  </h3>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    AI-powered tools
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Sidebar - Context & Info */}
        <div className="w-80 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-l border-slate-200 dark:border-slate-700">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Context & Insights
            </h2>
            
            {/* Current System Info */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {currentSystem && (
                    <div className={`w-6 h-6 ${currentSystem.color} rounded flex items-center justify-center`}>
                      <currentSystem.icon className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {currentSystem?.name} System
                  </h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Active and ready to assist you with comprehensive support
                </p>
              </CardContent>
            </Card>

            {/* Platform Features */}
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Platform Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-slate-700 dark:text-slate-300">Free Forever</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-slate-700 dark:text-slate-300">Ethical AI</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Globe2 className="w-4 h-4 text-purple-500" />
                  <span className="text-slate-700 dark:text-slate-300">Universal Access</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-slate-700 dark:text-slate-300">Autonomous Evolution</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span className="text-slate-700 dark:text-slate-300">Privacy First</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Systems
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Get Help
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalAIPlatform;
