'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Course {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  avatar: string;
  progress: number;
  status: 'active' | 'completed' | 'upcoming';
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'interactive' | 'quiz' | 'assignment';
  duration: string;
  completed: boolean;
  aiAvatar: string;
}

interface VideoSession {
  id: string;
  title: string;
  participants: string[];
  startTime: string;
  status: 'scheduled' | 'live' | 'ended';
  aiModerator: boolean;
}

export default function EducationPage() {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Advanced Mathematics',
      subject: 'Mathematics',
      instructor: 'Dr. Sarah Chen',
      avatar: '👩‍🏫',
      progress: 75,
      status: 'active',
      duration: '12 weeks',
      level: 'advanced'
    },
    {
      id: '2',
      title: 'Creative Writing Workshop',
      subject: 'Language Arts',
      instructor: 'Prof. Michael Johnson',
      avatar: '👨‍🏫',
      progress: 30,
      status: 'active',
      duration: '8 weeks',
      level: 'intermediate'
    },
    {
      id: '3',
      title: 'Introduction to AI',
      subject: 'Computer Science',
      instructor: 'AI Tutor',
      avatar: '🤖',
      progress: 0,
      status: 'upcoming',
      duration: '10 weeks',
      level: 'beginner'
    }
  ]);

  const [lessons] = useState<Lesson[]>([
    {
      id: '1',
      title: 'Calculus Fundamentals',
      type: 'video',
      duration: '45 min',
      completed: true,
      aiAvatar: '🤖'
    },
    {
      id: '2',
      title: 'Interactive Problem Solving',
      type: 'interactive',
      duration: '30 min',
      completed: false,
      aiAvatar: '🤖'
    },
    {
      id: '3',
      title: 'Chapter Quiz',
      type: 'quiz',
      duration: '20 min',
      completed: false,
      aiAvatar: '🤖'
    }
  ]);

  const [videoSessions] = useState<VideoSession[]>([
    {
      id: '1',
      title: 'Group Study Session',
      participants: ['Student 1', 'Student 2', 'AI Tutor'],
      startTime: '2024-01-15T14:00:00',
      status: 'scheduled',
      aiModerator: true
    }
  ]);

  const [selectedTab, setSelectedTab] = useState('courses');
  const [isAITeaching, setIsAITeaching] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const startAITeaching = async (subject: string) => {
    setIsAITeaching(true);
    // Simulate AI teaching
    setTimeout(() => {
      setAiResponse(`AI Tutor: Let's explore ${subject}! I'll guide you through the concepts step by step. What specific area would you like to focus on first?`);
      setIsAITeaching(false);
    }, 2000);
  };

  const joinVideoSession = (sessionId: string) => {
    console.log(`Joining video session: ${sessionId}`);
  };

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
                Education Hub
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
            Education Hub
          </h1>
          <p className="text-gray-600">
            AI-powered learning with personalized teaching, interactive avatars, and video conferencing.
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="ai-teaching">AI Teaching</TabsTrigger>
            <TabsTrigger value="video-conferencing">Video Conferencing</TabsTrigger>
            <TabsTrigger value="avatars">AI Avatars</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* My Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">My Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center mb-4">
                      <div className="text-3xl mr-3">{course.avatar}</div>
                      <div>
                        <h3 className="font-semibold">{course.title}</h3>
                        <p className="text-sm text-gray-600">{course.instructor}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                          {course.status}
                        </Badge>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{course.duration}</p>
                      <Button className="w-full" variant="outline">
                        Continue Learning
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* AI Teaching Tab */}
          <TabsContent value="ai-teaching" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">AI-Powered Teaching</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Start AI Learning Session</h3>
                  <div className="space-y-4">
                    <Select
                      options={[
                        { value: '', label: 'Select subject' },
                        { value: 'mathematics', label: 'Mathematics' },
                        { value: 'science', label: 'Science' },
                        { value: 'language', label: 'Language Arts' },
                        { value: 'history', label: 'History' },
                        { value: 'computer-science', label: 'Computer Science' }
                      ]}
                    />
                    <Select
                      options={[
                        { value: '', label: 'Select difficulty' },
                        { value: 'beginner', label: 'Beginner' },
                        { value: 'intermediate', label: 'Intermediate' },
                        { value: 'advanced', label: 'Advanced' }
                      ]}
                    />
                    <Button 
                      onClick={() => startAITeaching('Mathematics')}
                      disabled={isAITeaching}
                      className="w-full"
                    >
                      {isAITeaching ? (
                        <>
                          <LoadingSpinner className="mr-2" />
                          Starting AI Session...
                        </>
                      ) : (
                        'Start AI Teaching Session'
                      )}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">AI Tutor Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🎯</div>
                      <div>
                        <p className="font-medium">Personalized Learning</p>
                        <p className="text-sm text-gray-600">Adapts to your learning style</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🔄</div>
                      <div>
                        <p className="font-medium">Real-time Feedback</p>
                        <p className="text-sm text-gray-600">Instant corrections and guidance</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">📊</div>
                      <div>
                        <p className="font-medium">Progress Tracking</p>
                        <p className="text-sm text-gray-600">Monitor your learning journey</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {aiResponse && (
                <div className="mt-6 border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold mb-2">AI Tutor Response</h3>
                  <p className="text-gray-700">{aiResponse}</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Video Conferencing Tab */}
          <TabsContent value="video-conferencing" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Video Conferencing & Collaboration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Join or Create Session</h3>
                  <div className="space-y-4">
                    <Input placeholder="Session name" />
                    <Select
                      options={[
                        { value: '', label: 'Session type' },
                        { value: 'study-group', label: 'Study Group' },
                        { value: 'tutoring', label: 'Tutoring Session' },
                        { value: 'presentation', label: 'Presentation' },
                        { value: 'discussion', label: 'Group Discussion' }
                      ]}
                    />
                    <Button className="w-full">Create New Session</Button>
                    <Button variant="outline" className="w-full">Join Session</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Upcoming Sessions</h3>
                  <div className="space-y-4">
                    {videoSessions.map((session) => (
                      <div key={session.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{session.title}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(session.startTime).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Participants: {session.participants.join(', ')}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'}>
                              {session.status}
                            </Badge>
                            {session.aiModerator && (
                              <Badge variant="outline">AI Moderator</Badge>
                            )}
                          </div>
                        </div>
                        <Button 
                          onClick={() => joinVideoSession(session.id)}
                          className="w-full mt-3"
                          variant="outline"
                        >
                          Join Session
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* AI Avatars Tab */}
          <TabsContent value="avatars" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">AI Teaching Avatars</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg bg-white">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="font-semibold mb-2">Math Tutor</h3>
                  <p className="text-sm text-gray-600 mb-4">Specialized in mathematics and problem-solving</p>
                  <Button className="w-full">Select Avatar</Button>
                </div>
                
                <div className="text-center p-6 border rounded-lg bg-white">
                  <div className="text-6xl mb-4">👩‍🏫</div>
                  <h3 className="font-semibold mb-2">Science Guide</h3>
                  <p className="text-sm text-gray-600 mb-4">Expert in scientific concepts and experiments</p>
                  <Button className="w-full">Select Avatar</Button>
                </div>
                
                <div className="text-center p-6 border rounded-lg bg-white">
                  <div className="text-6xl mb-4">👨‍🏫</div>
                  <h3 className="font-semibold mb-2">Language Coach</h3>
                  <p className="text-sm text-gray-600 mb-4">Specialized in language arts and writing</p>
                  <Button className="w-full">Select Avatar</Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold mb-2">Avatar Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🎭</div>
                    <div>
                      <p className="font-medium">Expressive Communication</p>
                      <p className="text-sm text-gray-600">Facial expressions and gestures</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🗣️</div>
                    <div>
                      <p className="font-medium">Natural Speech</p>
                      <p className="text-sm text-gray-600">Realistic voice and pronunciation</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <p className="font-medium">Subject Expertise</p>
                      <p className="text-sm text-gray-600">Specialized knowledge areas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🔄</div>
                    <div>
                      <p className="font-medium">Adaptive Teaching</p>
                      <p className="text-sm text-gray-600">Personalized learning approach</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Learning Progress</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 border rounded-lg bg-white">
                  <div className="text-3xl font-bold text-blue-600 mb-2">75%</div>
                  <p className="text-sm text-gray-600">Overall Progress</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-white">
                  <div className="text-3xl font-bold text-green-600 mb-2">12</div>
                  <p className="text-sm text-gray-600">Lessons Completed</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-white">
                  <div className="text-3xl font-bold text-purple-600 mb-2">8</div>
                  <p className="text-sm text-gray-600">Study Hours</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Recent Lessons</h3>
                <div className="space-y-3">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{lesson.aiAvatar}</div>
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          <p className="text-sm text-gray-600">{lesson.type} • {lesson.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={lesson.completed ? 'default' : 'secondary'}>
                          {lesson.completed ? 'Completed' : 'Pending'}
                        </Badge>
                        {!lesson.completed && (
                          <Button size="sm" variant="outline">Start</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
