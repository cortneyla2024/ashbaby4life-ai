"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

export interface CreativeProject {
  id: string;
  type: 'art' | 'story' | 'voice' | 'collaboration';
  title: string;
  description: string;
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
  content: any;
  emotionalTags: string[];
  privacy: 'family' | 'private' | 'shared';
  isComplete: boolean;
}

export interface ArtCanvas {
  id: string;
  width: number;
  height: number;
  layers: CanvasLayer[];
  participants: string[];
  currentTool: 'brush' | 'eraser' | 'fill' | 'text';
  currentColor: string;
  brushSize: number;
}

export interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  data: ImageData | null;
}

export interface StoryBuilder {
  id: string;
  title: string;
  chapters: StoryChapter[];
  characters: StoryCharacter[];
  settings: StorySetting[];
  currentChapter: number;
  collaborators: string[];
}

export interface StoryChapter {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: Date;
  emotionalTone: string;
}

export interface StoryCharacter {
  id: string;
  name: string;
  description: string;
  traits: string[];
  createdBy: string;
}

export interface StorySetting {
  id: string;
  name: string;
  description: string;
  mood: string;
  createdBy: string;
}

export interface VoiceTribute {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  transcript: string;
  emotionalTone: string;
  recordedBy: string;
  timestamp: Date;
  recipients: string[];
}

export interface FamilyGallery {
  id: string;
  name: string;
  description: string;
  projects: CreativeProject[];
  createdAt: Date;
  updatedAt: Date;
  privacy: 'family' | 'shared';
  emotionalTags: string[];
}

export const CreativeCelebration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('art');
  const [projects, setProjects] = useState<CreativeProject[]>([]);
  const [currentProject, setCurrentProject] = useState<CreativeProject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [gallery, setGallery] = useState<FamilyGallery | null>(null);

  // Art Canvas State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [artCanvas, setArtCanvas] = useState<ArtCanvas>({
    id: 'canvas-1',
    width: 800,
    height: 600,
    layers: [{ id: 'layer-1', name: 'Background', visible: true, locked: false, data: null }],
    participants: [],
    currentTool: 'brush',
    currentColor: '#000000',
    brushSize: 5
  });

  // Story Builder State
  const [storyBuilder, setStoryBuilder] = useState<StoryBuilder>({
    id: 'story-1',
    title: 'Our Family Adventure',
    chapters: [],
    characters: [],
    settings: [],
    currentChapter: 0,
    collaborators: []
  });

  // Voice Tribute State
  const [voiceTribute, setVoiceTribute] = useState<VoiceTribute | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    initializeCanvas();
    loadGallery();
  }, []);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const loadGallery = async () => {
    // Simulate loading family gallery
    const mockGallery: FamilyGallery = {
      id: 'gallery-1',
      name: 'Our Family Creations',
      description: 'A collection of our shared creative moments',
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      privacy: 'family',
      emotionalTags: ['joy', 'love', 'creativity']
    };
    setGallery(mockGallery);
  };

  // Art Canvas Functions
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = artCanvas.currentColor;
    ctx.lineWidth = artCanvas.brushSize;
    ctx.lineCap = 'round';
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (e.buttons === 1) { // Left mouse button pressed
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveArtProject = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    
    const newProject: CreativeProject = {
      id: `art-${Date.now()}`,
      type: 'art',
      title: 'Collaborative Art Piece',
      description: 'A beautiful creation made together',
      participants: ['Family Member 1', 'Family Member 2'],
      createdAt: new Date(),
      updatedAt: new Date(),
      content: { imageData },
      emotionalTags: ['joy', 'creativity', 'togetherness'],
      privacy: 'family',
      isComplete: true
    };

    setProjects(prev => [...prev, newProject]);
    if (gallery) {
      setGallery(prev => prev ? { ...prev, projects: [...prev.projects, newProject] } : null);
    }
  };

  // Story Builder Functions
  const addChapter = () => {
    const newChapter: StoryChapter = {
      id: `chapter-${Date.now()}`,
      title: `Chapter ${storyBuilder.chapters.length + 1}`,
      content: '',
      author: 'Family Member',
      timestamp: new Date(),
      emotionalTone: 'joyful'
    };

    setStoryBuilder(prev => ({
      ...prev,
      chapters: [...prev.chapters, newChapter],
      currentChapter: prev.chapters.length
    }));
  };

  const updateChapter = (chapterId: string, content: string) => {
    setStoryBuilder(prev => ({
      ...prev,
      chapters: prev.chapters.map(chapter =>
        chapter.id === chapterId ? { ...chapter, content } : chapter
      )
    }));
  };

  const saveStoryProject = () => {
    const newProject: CreativeProject = {
      id: `story-${Date.now()}`,
      type: 'story',
      title: storyBuilder.title,
      description: 'A collaborative family story',
      participants: storyBuilder.collaborators,
      createdAt: new Date(),
      updatedAt: new Date(),
      content: { story: storyBuilder },
      emotionalTags: ['imagination', 'creativity', 'family'],
      privacy: 'family',
      isComplete: true
    };

    setProjects(prev => [...prev, newProject]);
    if (gallery) {
      setGallery(prev => prev ? { ...prev, projects: [...prev.projects, newProject] } : null);
    }
  };

  // Voice Tribute Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newTribute: VoiceTribute = {
          id: `voice-${Date.now()}`,
          title: 'Family Voice Message',
          duration: audioChunksRef.current.length,
          audioUrl,
          transcript: 'Voice message transcript...',
          emotionalTone: 'loving',
          recordedBy: 'Family Member',
          timestamp: new Date(),
          recipients: ['Family']
        };

        setVoiceTribute(newTribute);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const saveVoiceProject = () => {
    if (!voiceTribute) return;

    const newProject: CreativeProject = {
      id: `voice-${Date.now()}`,
      type: 'voice',
      title: voiceTribute.title,
      description: 'A heartfelt voice message',
      participants: [voiceTribute.recordedBy],
      createdAt: new Date(),
      updatedAt: new Date(),
      content: { tribute: voiceTribute },
      emotionalTags: ['love', 'connection', 'family'],
      privacy: 'family',
      isComplete: true
    };

    setProjects(prev => [...prev, newProject]);
    if (gallery) {
      setGallery(prev => prev ? { ...prev, projects: [...prev.projects, newProject] } : null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Creative Celebration Hub
        </h1>
        <p className="text-xl text-muted-foreground">
          Create, collaborate, and celebrate together through art, stories, and voice
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="art">🎨 Art Canvas</TabsTrigger>
          <TabsTrigger value="story">📖 Story Builder</TabsTrigger>
          <TabsTrigger value="voice">🎤 Voice Tribute</TabsTrigger>
          <TabsTrigger value="gallery">🖼️ Family Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="art" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collaborative Art Canvas</CardTitle>
              <CardDescription>
                Create beautiful artwork together with your family
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="flex gap-2">
                  <Button
                    variant={artCanvas.currentTool === 'brush' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setArtCanvas(prev => ({ ...prev, currentTool: 'brush' }))}
                  >
                    🖌️ Brush
                  </Button>
                  <Button
                    variant={artCanvas.currentTool === 'eraser' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setArtCanvas(prev => ({ ...prev, currentTool: 'eraser' }))}
                  >
                    🧽 Eraser
                  </Button>
                </div>
                <input
                  type="color"
                  value={artCanvas.currentColor}
                  onChange={(e) => setArtCanvas(prev => ({ ...prev, currentColor: e.target.value }))}
                  className="w-12 h-10 rounded border"
                />
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={artCanvas.brushSize}
                  onChange={(e) => setArtCanvas(prev => ({ ...prev, brushSize: parseInt(e.target.value) }))}
                  className="w-24"
                />
                <Button variant="outline" size="sm" onClick={clearCanvas}>
                  Clear
                </Button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={artCanvas.width}
                  height={artCanvas.height}
                  className="cursor-crosshair bg-white"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={saveArtProject} className="flex-1">
                  Save Art Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="story" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Family Story Builder</CardTitle>
              <CardDescription>
                Write collaborative stories with your family
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={addChapter} variant="outline">
                  Add Chapter
                </Button>
                <Button onClick={saveStoryProject}>
                  Save Story
                </Button>
              </div>

              <div className="space-y-4">
                {storyBuilder.chapters.map((chapter, index) => (
                  <div key={chapter.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{chapter.title}</h3>
                    <Textarea
                      value={chapter.content}
                      onChange={(e) => updateChapter(chapter.id, e.target.value)}
                      placeholder="Write your chapter here..."
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
                      <span>By: {chapter.author}</span>
                      <span>•</span>
                      <span>{chapter.timestamp.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {storyBuilder.chapters.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No chapters yet. Start your family story!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Voice Tribute Recorder</CardTitle>
              <CardDescription>
                Record heartfelt voice messages for your family
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? 'destructive' : 'default'}
                  className="flex items-center gap-2"
                >
                  {isRecording ? (
                    <>
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      🎤 Start Recording
                    </>
                  )}
                </Button>
              </div>

              {voiceTribute && (
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">{voiceTribute.title}</h3>
                  <audio controls src={voiceTribute.audioUrl} className="w-full" />
                  <div className="flex gap-2">
                    <Button onClick={saveVoiceProject} className="flex-1">
                      Save Voice Tribute
                    </Button>
                  </div>
                </div>
              )}

              {!voiceTribute && !isRecording && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Click "Start Recording" to create a voice tribute</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Family Gallery</CardTitle>
              <CardDescription>
                View and celebrate your family's creative projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gallery && gallery.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gallery.projects.map((project) => (
                    <Card key={project.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {project.emotionalTags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created: {project.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No projects yet. Start creating with your family!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Celebration Animation */}
      {projects.length > 0 && (
        <div className="fixed bottom-4 right-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-lg animate-bounce">
            <p className="font-semibold">🎉 New creation added to gallery!</p>
          </div>
        </div>
      )}
    </div>
  );
};
