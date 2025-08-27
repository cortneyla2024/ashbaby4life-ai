'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmotionAvatar } from '@/components/emotion/EmotionAvatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  EmotionalState, 
  EmotionIntensity, 
  JournalEntry, 
  EmotionBadge
} from '@/lib/emotion/types';

interface CreativeProject {
  id: string;
  type: 'art' | 'story' | 'voice' | 'collage';
  title: string;
  description: string;
  contributors: string[];
  createdAt: Date;
  completedAt?: Date;
  thumbnail?: string;
  content?: string;
  audioUrl?: string;
  emotion: EmotionalState;
  intensity: EmotionIntensity;
  isShared: boolean;
}

interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child' | 'guardian';
  avatar?: string;
}

interface CreativeCelebrationModuleProps {
  familyId: string;
  members: FamilyMember[];
  className?: string;
}

export const CreativeCelebrationModule: React.FC<CreativeCelebrationModuleProps> = ({
  familyId,
  members,
  className = ''
}) => {
  const [projects, setProjects] = useState<CreativeProject[]>([]);
  const [currentProject, setCurrentProject] = useState<CreativeProject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<CreativeProject['type']>('art');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionalState>('joyful');
  const [selectedIntensity, setSelectedIntensity] = useState<EmotionIntensity>('moderate');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [storyContent, setStoryContent] = useState('');
  const [canvasRef] = useState(useRef<HTMLCanvasElement>(null));
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  // Emotion options for selection
  const emotionOptions: { emotion: EmotionalState; label: string; emoji: string; color: string }[] = [
    { emotion: 'joyful', label: 'Joyful', emoji: '😊', color: '#FFD700' },
    { emotion: 'excited', label: 'Excited', emoji: '🤩', color: '#FF6B6B' },
    { emotion: 'calm', label: 'Calm', emoji: '😌', color: '#4ECDC4' },
    { emotion: 'neutral', label: 'Neutral', emoji: '😐', color: '#95A5A6' },
    { emotion: 'sad', label: 'Sad', emoji: '😢', color: '#3498DB' },
    { emotion: 'anxious', label: 'Anxious', emoji: '😰', color: '#9B59B6' },
    { emotion: 'confused', label: 'Confused', emoji: '😕', color: '#F39C12' },
    { emotion: 'angry', label: 'Angry', emoji: '😠', color: '#E74C3C' }
  ];

  const intensityOptions: { intensity: EmotionIntensity; label: string }[] = [
    { intensity: 'low', label: 'Low' },
    { intensity: 'moderate', label: 'Moderate' },
    { intensity: 'high', label: 'High' }
  ];

  // Initialize canvas for drawing
  const initializeCanvas = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, [canvasRef]);

  // Handle drawing on canvas
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setLastPoint({ x, y });
  }, [canvasRef]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setLastPoint({ x, y });
  }, [isDrawing, lastPoint, canvasRef]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setLastPoint(null);
  }, []);

  // Handle voice recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Stop recording after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 30000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  // Create new project
  const handleCreateProject = useCallback(() => {
    if (!projectTitle.trim()) return;

    const newProject: CreativeProject = {
      id: Date.now().toString(),
      type: selectedType,
      title: projectTitle,
      description: projectDescription,
      contributors: members.map(m => m.id),
      createdAt: new Date(),
      emotion: selectedEmotion,
      intensity: selectedIntensity,
      isShared: false
    };

    setProjects(prev => [newProject, ...prev]);
    setCurrentProject(newProject);
    setIsCreating(false);
    setProjectTitle('');
    setProjectDescription('');
    setSelectedEmotion('joyful');
    setSelectedIntensity('moderate');
    setStoryContent('');
    setAudioBlob(null);
    initializeCanvas();
  }, [projectTitle, projectDescription, selectedType, selectedEmotion, selectedIntensity, members, initializeCanvas]);

  // Complete project
  const handleCompleteProject = useCallback(() => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      completedAt: new Date(),
      content: storyContent,
      audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : undefined
    };

    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
    setCurrentProject(null);
    setStoryContent('');
    setAudioBlob(null);

    // Show celebration
    setCelebrationMessage(`🎉 Amazing! You've completed "${updatedProject.title}" together!`);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 5000);
  }, [currentProject, storyContent, audioBlob]);

  // Get emotion color
  const getEmotionColor = useCallback((emotion: EmotionalState) => {
    return emotionOptions.find(e => e.emotion === emotion)?.color || '#95A5A6';
  }, [emotionOptions]);

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Creative Celebration Space</h1>
        <p className="text-gray-600">Create, collaborate, and celebrate emotional milestones together</p>
      </div>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-xl font-bold mb-2">Celebration!</h3>
                <p className="text-lg">{celebrationMessage}</p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Project Creation & Gallery */}
        <div className="lg:col-span-1 space-y-6">
          {/* Create New Project */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Create Together</h3>
            
            {!isCreating ? (
              <div className="space-y-3">
                <Button 
                  onClick={() => setIsCreating(true)}
                  className="w-full"
                >
                  Start New Project
                </Button>
                <p className="text-sm text-gray-600 text-center">
                  Choose from art, stories, voice recordings, or mood collages
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Project Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'art' as const, label: 'Art', icon: '🎨' },
                      { type: 'story' as const, label: 'Story', icon: '📖' },
                      { type: 'voice' as const, label: 'Voice', icon: '🎤' },
                      { type: 'collage' as const, label: 'Collage', icon: '🖼️' }
                    ].map(({ type, label, icon }) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedType === type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{icon}</div>
                        <div className="text-xs text-gray-600">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter project title..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe your project..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Emotion Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emotion Theme
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {emotionOptions.map(({ emotion, label, emoji, color }) => (
                      <button
                        key={emotion}
                        onClick={() => setSelectedEmotion(emotion)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedEmotion === emotion
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ borderColor: selectedEmotion === emotion ? color : undefined }}
                      >
                        <div className="text-2xl mb-1">{emoji}</div>
                        <div className="text-xs text-gray-600">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intensity
                  </label>
                  <div className="flex space-x-2">
                    {intensityOptions.map(({ intensity, label }) => (
                      <button
                        key={intensity}
                        onClick={() => setSelectedIntensity(intensity)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedIntensity === intensity
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCreateProject}
                    disabled={!projectTitle.trim()}
                    className="flex-1"
                  >
                    Create Project
                  </Button>
                  <Button
                    onClick={() => setIsCreating(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Project Gallery */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Family Gallery</h3>
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setCurrentProject(project)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-300 ${
                    currentProject?.id === project.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {project.type === 'art' && '🎨'}
                      {project.type === 'story' && '📖'}
                      {project.type === 'voice' && '🎤'}
                      {project.type === 'collage' && '🖼️'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{project.title}</div>
                      <div className="text-sm text-gray-500">{project.description}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="capitalize">
                          {project.emotion}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {project.intensity}
                        </Badge>
                        {project.completedAt && (
                          <Badge variant="secondary">Completed</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No projects yet.</p>
                  <p className="text-sm">Start your first creative project above!</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Creative Workspace */}
        <div className="lg:col-span-2">
          {currentProject ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{currentProject.title}</h2>
                  <p className="text-gray-600">{currentProject.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="capitalize">
                    {currentProject.emotion}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {currentProject.intensity}
                  </Badge>
                </div>
              </div>

              {/* Creative Workspace */}
              <Tabs defaultValue={currentProject.type} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="art">Art Canvas</TabsTrigger>
                  <TabsTrigger value="story">Story Builder</TabsTrigger>
                  <TabsTrigger value="voice">Voice Recorder</TabsTrigger>
                  <TabsTrigger value="collage">Mood Collage</TabsTrigger>
                </TabsList>

                <TabsContent value="art" className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Draw together! Express your emotions through art.
                    </p>
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={400}
                      className="border border-gray-300 rounded-lg cursor-crosshair"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    />
                    <div className="mt-4 flex justify-center space-x-2">
                      <Button
                        onClick={initializeCanvas}
                        variant="outline"
                        size="sm"
                      >
                        Clear Canvas
                      </Button>
                      <Button
                        onClick={handleCompleteProject}
                        disabled={!currentProject}
                      >
                        Complete Art
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="story" className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Write a story together about your emotions and experiences.
                    </p>
                    <textarea
                      value={storyContent}
                      onChange={(e) => setStoryContent(e.target.value)}
                      placeholder="Start writing your family story..."
                      rows={12}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={handleCompleteProject}
                        disabled={!storyContent.trim()}
                      >
                        Complete Story
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="voice" className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Record voice messages, songs, or stories together.
                    </p>
                    <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      {!isRecording && !audioBlob ? (
                        <div>
                          <div className="text-4xl mb-4">🎤</div>
                          <Button
                            onClick={startRecording}
                            className="mb-4"
                          >
                            Start Recording
                          </Button>
                          <p className="text-sm text-gray-500">
                            Click to start recording (max 30 seconds)
                          </p>
                        </div>
                      ) : isRecording ? (
                        <div>
                          <div className="text-4xl mb-4 animate-pulse">🔴</div>
                          <p className="text-lg font-medium text-red-600 mb-4">
                            Recording...
                          </p>
                          <Button
                            onClick={stopRecording}
                            variant="secondary"
                          >
                            Stop Recording
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-4xl mb-4">✅</div>
                          <p className="text-lg font-medium text-green-600 mb-4">
                            Recording Complete!
                          </p>
                          <audio controls className="mb-4">
                            <source src={audioBlob ? URL.createObjectURL(audioBlob) : ''} type="audio/webm" />
                          </audio>
                          <Button
                            onClick={handleCompleteProject}
                          >
                            Complete Voice Project
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="collage" className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Create a mood collage with images, words, and colors.
                    </p>
                    <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <div className="text-4xl mb-4">🖼️</div>
                      <p className="text-gray-500 mb-4">
                        Mood collage feature coming soon!
                      </p>
                      <p className="text-sm text-gray-400">
                        You'll be able to add images, stickers, and text to create beautiful collages.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold mb-2">Ready to Create?</h3>
                <p className="text-gray-600 mb-6">
                  Select a project from the gallery or start a new one to begin creating together!
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  Start New Project
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Family Avatar Celebration */}
      {currentProject && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-center space-x-4">
            <EmotionAvatar
              emotion={currentProject.emotion}
              intensity={currentProject.intensity}
              size="large"
              isAnimating={true}
            />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Creating with {currentProject.emotion} energy!
              </h3>
              <p className="text-gray-600">
                Your Emotion Buddy is here to celebrate your creativity
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
