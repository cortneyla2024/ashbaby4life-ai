'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface CreativeProject {
  id: string;
  title: string;
  type: 'writing' | 'art' | 'music' | 'video';
  status: 'draft' | 'in-progress' | 'completed';
  aiAssisted: boolean;
}

export default function CreativityPage() {
  const [projects] = useState<CreativeProject[]>([
    {
      id: '1',
      title: 'The Future of AI',
      type: 'writing',
      status: 'in-progress',
      aiAssisted: true
    },
    {
      id: '2',
      title: 'Digital Art Collection',
      type: 'art',
      status: 'completed',
      aiAssisted: true
    },
    {
      id: '3',
      title: 'Ambient Music Project',
      type: 'music',
      status: 'in-progress',
      aiAssisted: true
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
                CareConnect v5.0
              </Link>
              <Badge variant="secondary" className="ml-3">
                Creativity Hub
              </Badge>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link href="/ai-assistant">
                <Button>AI Assistant</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Creativity Hub
          </h1>
          <p className="text-gray-600">
            AI-powered creative expression with collaborative tools and generative content.
          </p>
        </div>

        <Tabs defaultValue="projects">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="ai-generation">AI Generation</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
            <TabsTrigger value="tools">Creative Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">My Creative Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl">
                        {project.type === 'writing' && '📝'}
                        {project.type === 'art' && '🎨'}
                        {project.type === 'music' && '🎵'}
                        {project.type === 'video' && '🎬'}
                      </div>
                      {project.aiAssisted && (
                        <Badge variant="default">AI Assisted</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{project.title}</h3>
                    <div className="flex space-x-2">
                      <Badge variant="outline">{project.type}</Badge>
                      <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                    <Button className="w-full mt-3" variant="outline">
                      Open Project
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ai-generation" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">AI Content Generation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Generate New Content</h3>
                  <div className="space-y-4">
                    <Button className="w-full">Generate Text</Button>
                    <Button className="w-full">Generate Image</Button>
                    <Button className="w-full">Generate Music</Button>
                    <Button className="w-full">Generate Video</Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Generation Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🎨</div>
                      <div>
                        <p className="font-medium">Visual Art</p>
                        <p className="text-sm text-gray-600">Generate images and designs</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">📝</div>
                      <div>
                        <p className="font-medium">Creative Writing</p>
                        <p className="text-sm text-gray-600">Stories and creative content</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🎵</div>
                      <div>
                        <p className="font-medium">Music & Audio</p>
                        <p className="text-sm text-gray-600">Compose melodies</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Collaborative Creation</h2>
              <div className="space-y-4">
                <Button className="w-full">Start New Collaboration</Button>
                <Button variant="outline" className="w-full">Join Existing Project</Button>
                <Button variant="outline" className="w-full">Invite Collaborators</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Creative Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg bg-white">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="font-semibold mb-2">Digital Canvas</h3>
                  <Button className="w-full">Open Canvas</Button>
                </div>
                <div className="text-center p-6 border rounded-lg bg-white">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="font-semibold mb-2">Writing Studio</h3>
                  <Button className="w-full">Start Writing</Button>
                </div>
                <div className="text-center p-6 border rounded-lg bg-white">
                  <div className="text-4xl mb-4">🎵</div>
                  <h3 className="font-semibold mb-2">Music Composer</h3>
                  <Button className="w-full">Compose Music</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
