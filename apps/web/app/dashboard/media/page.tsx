'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';

interface MediaItem {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration: number;
  type: 'video' | 'audio' | 'image';
  thumbnail: string;
  url: string;
  size: number;
  uploadedAt: string;
  tags: string[];
  plays: number;
  likes: number;
  isPublic: boolean;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  itemCount: number;
  duration: number;
  isPublic: boolean;
  createdAt: string;
  items: MediaItem[];
}

export default function MediaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'video' | 'audio' | 'image'>('all');
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);

  const mediaItems: MediaItem[] = [
    {
      id: '1',
      title: 'Sunset Beach Vibes',
      artist: 'Chill Wave',
      album: 'Ocean Sounds',
      duration: 180,
      type: 'audio',
      thumbnail: '/media/beach-sunset.jpg',
      url: '/media/sunset-beach-vibes.mp3',
      size: 8.5,
      uploadedAt: '2024-01-10',
      tags: ['chill', 'beach', 'relaxing'],
      plays: 1247,
      likes: 89,
      isPublic: true,
    },
    {
      id: '2',
      title: 'Coding Tutorial: React Basics',
      duration: 1245,
      type: 'video',
      thumbnail: '/media/react-tutorial.jpg',
      url: '/media/react-basics.mp4',
      size: 156.8,
      uploadedAt: '2024-01-08',
      tags: ['tutorial', 'react', 'coding'],
      plays: 892,
      likes: 156,
      isPublic: true,
    },
    {
      id: '3',
      title: 'Mountain Landscape',
      duration: 0,
      type: 'image',
      thumbnail: '/media/mountain-landscape.jpg',
      url: '/media/mountain-landscape.jpg',
      size: 2.3,
      uploadedAt: '2024-01-05',
      tags: ['nature', 'landscape', 'mountain'],
      plays: 445,
      likes: 67,
      isPublic: true,
    },
    {
      id: '4',
      title: 'Jazz Night Session',
      artist: 'The Jazz Collective',
      album: 'Live Sessions',
      duration: 320,
      type: 'audio',
      thumbnail: '/media/jazz-night.jpg',
      url: '/media/jazz-night-session.mp3',
      size: 12.1,
      uploadedAt: '2024-01-03',
      tags: ['jazz', 'live', 'music'],
      plays: 567,
      likes: 123,
      isPublic: true,
    },
    {
      id: '5',
      title: 'Product Demo: AI Assistant',
      duration: 890,
      type: 'video',
      thumbnail: '/media/ai-demo.jpg',
      url: '/media/ai-assistant-demo.mp4',
      size: 89.4,
      uploadedAt: '2024-01-01',
      tags: ['demo', 'ai', 'product'],
      plays: 234,
      likes: 45,
      isPublic: false,
    },
    {
      id: '6',
      title: 'Family Photo Album',
      duration: 0,
      type: 'image',
      thumbnail: '/media/family-photo.jpg',
      url: '/media/family-photo.jpg',
      size: 1.8,
      uploadedAt: '2023-12-28',
      tags: ['family', 'personal', 'memories'],
      plays: 89,
      likes: 12,
      isPublic: false,
    },
  ];

  const playlists: Playlist[] = [
    {
      id: '1',
      name: 'Workout Mix',
      description: 'High-energy tracks for your workout sessions',
      thumbnail: '/media/workout-mix.jpg',
      itemCount: 12,
      duration: 3600,
      isPublic: true,
      createdAt: '2024-01-10',
      items: [mediaItems[0], mediaItems[3]],
    },
    {
      id: '2',
      name: 'Learning Videos',
      description: 'Educational content and tutorials',
      thumbnail: '/media/learning-videos.jpg',
      itemCount: 8,
      duration: 7200,
      isPublic: true,
      createdAt: '2024-01-08',
      items: [mediaItems[1], mediaItems[4]],
    },
    {
      id: '3',
      name: 'Personal Collection',
      description: 'Private media collection',
      thumbnail: '/media/personal-collection.jpg',
      itemCount: 5,
      duration: 1800,
      isPublic: false,
      createdAt: '2024-01-05',
      items: [mediaItems[2], mediaItems[5]],
    },
  ];

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'Image';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} KB`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} MB`;
    return `${(size / (1024 * 1024)).toFixed(1)} GB`;
  };

  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.artist && item.artist.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handlePlay = (item: MediaItem) => {
    console.log('Playing:', item.title);
    setIsPlaying(true);
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    setCurrentPlaylist(playlist);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-gray-600">Stream, organize, and share your media content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Upload Media</Button>
          <Button>Create Playlist</Button>
        </div>
      </div>

      {/* Media Player */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Now Playing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl">🎵</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium">No media selected</h3>
              <p className="text-sm text-gray-500">Choose a track to start playing</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">⏮</Button>
              <Button size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? '⏸' : '▶'}
              </Button>
              <Button size="sm" variant="outline">⏭</Button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Progress value={currentTime} className="w-full" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0:00</span>
              <span>0:00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            {[
              { id: 'all', name: 'All', icon: '📁' },
              { id: 'video', name: 'Videos', icon: '🎥' },
              { id: 'audio', name: 'Audio', icon: '🎵' },
              { id: 'image', name: 'Images', icon: '🖼️' },
            ].map((type) => (
              <Button
                key={type.id}
                variant={selectedType === type.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type.id as any)}
              >
                {type.icon} {type.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Media Library */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>{filteredMedia.length} items found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMedia.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">
                          {item.type === 'video' ? '🎥' : item.type === 'audio' ? '🎵' : '🖼️'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.title}</h4>
                        {item.artist && (
                          <p className="text-sm text-gray-500 truncate">{item.artist}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{formatDuration(item.duration)}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{formatFileSize(item.size)}</span>
                          {!item.isPublic && (
                            <>
                              <span className="text-xs text-gray-500">•</span>
                              <Badge variant="outline" className="text-xs">Private</Badge>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500">👁️ {item.plays}</span>
                          <span className="text-xs text-gray-500">❤️ {item.likes}</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Button size="sm" onClick={() => handlePlay(item)}>
                          ▶
                        </Button>
                        <Button size="sm" variant="outline">
                          ⋯
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Playlists */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Playlists</CardTitle>
              <CardDescription>Organize your media</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      currentPlaylist?.id === playlist.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handlePlaylistSelect(playlist)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">📁</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{playlist.name}</h4>
                        <p className="text-sm text-gray-500 truncate">{playlist.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{playlist.itemCount} items</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{formatDuration(playlist.duration)}</span>
                          {!playlist.isPublic && (
                            <>
                              <span className="text-xs text-gray-500">•</span>
                              <Badge variant="outline" className="text-xs">Private</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Playlist */}
          {currentPlaylist && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{currentPlaylist.name}</CardTitle>
                <CardDescription>{currentPlaylist.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentPlaylist.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-sm">
                          {item.type === 'video' ? '🎥' : item.type === 'audio' ? '🎵' : '🖼️'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">{formatDuration(item.duration)}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handlePlay(item)}>
                        ▶
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">📤</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">video-tutorial.mp4</span>
                  <span className="text-sm text-gray-500">75%</span>
                </div>
                <Progress value={75} className="w-full" />
                <p className="text-xs text-gray-500 mt-1">Uploading... 2.3 MB/s</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Media</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <div className="text-2xl">📁</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Storage Used</p>
                <p className="text-2xl font-bold">2.4 GB</p>
              </div>
              <div className="text-2xl">💾</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Playlists</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <div className="text-2xl">📋</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Plays</p>
                <p className="text-2xl font-bold">3,247</p>
              </div>
              <div className="text-2xl">▶️</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
