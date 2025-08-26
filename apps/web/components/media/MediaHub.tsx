'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Minimize, Settings, Download, Share, Heart,
  MessageCircle, Users, Clock, Calendar, Search, Filter,
  Plus, List, Grid, Shuffle, Repeat, Mic, Video, Music,
  Headphones, BookOpen, Brain, Heart as HeartIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
// import { useMedia } from '@/hooks/useMedia';
// import { useAIService } from '@/hooks/useAIService';
import { useNotifications } from '@/hooks/useNotifications';

interface MediaContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'podcast' | 'guided-session';
  category: string;
  duration: number;
  thumbnail: string;
  url: string;
  transcript?: string;
  captions?: Caption[];
  tags: string[];
  author: string;
  views: number;
  likes: number;
  createdAt: Date;
  isDownloaded: boolean;
  isLiked: boolean;
}

interface Caption {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  language: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  items: MediaContent[];
  isAI: boolean;
  createdAt: Date;
}

interface LiveStream {
  id: string;
  title: string;
  description: string;
  host: string;
  participants: number;
  isLive: boolean;
  thumbnail: string;
  streamUrl: string;
  chatMessages: ChatMessage[];
  startTime: Date;
  endTime?: Date;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'reaction' | 'question';
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  showCaptions: boolean;
  captionLanguage: string;
}

export const MediaHub: React.FC = () => {
  const { user } = useAuth();
  
  // Mock data - in a real app, these would come from hooks
  const mediaContent: MediaContent[] = [];
  const playlists: Playlist[] = [];
  const liveStreams: LiveStream[] = [];
  const loading = false;
  
  // Mock functions
  const downloadMedia = async (id: string) => {};
  const likeMedia = async (id: string) => {};
  const createPlaylist = async (params: any) => {};
  const addToPlaylist = async (playlistId: string, contentId: string) => {};
  const generatePlaylist = async (params: any): Promise<Playlist> => ({ 
    id: 'mock', 
    name: 'Generated Playlist', 
    description: '', 
    thumbnail: '', 
    items: [],
    isAI: true,
    createdAt: new Date()
  });
  const generateCaptions = async (contentId: string) => [];
  const analyzeContent = async (contentId: string) => {};
  
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'browse' | 'playlists' | 'live' | 'downloads'>('browse');
  const [selectedContent, setSelectedContent] = useState<MediaContent | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPlayer, setShowPlayer] = useState(false);
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    playbackRate: 1,
    showCaptions: true,
    captionLanguage: 'en'
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const categories = [
    'all', 'meditation', 'fitness', 'education', 'music', 
    'podcasts', 'guided-sessions', 'wellness', 'motivation'
  ];

  const filteredContent = mediaContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || content.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlay = useCallback((content: MediaContent) => {
    setSelectedContent(content);
    setShowPlayer(true);
    setPlayerState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const handlePause = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
    if (videoRef.current) videoRef.current.pause();
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const handlePlayPause = useCallback(() => {
    if (playerState.isPlaying) {
      handlePause();
    } else {
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
      if (videoRef.current) videoRef.current.play();
      if (audioRef.current) audioRef.current.play();
    }
  }, [playerState.isPlaying, handlePause]);

  const handleSeek = useCallback((time: number) => {
    setPlayerState(prev => ({ ...prev, currentTime: time }));
    if (videoRef.current) videoRef.current.currentTime = time;
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const handleVolumeChange = useCallback((volume: number) => {
    setPlayerState(prev => ({ ...prev, volume }));
    if (videoRef.current) videoRef.current.volume = volume;
    if (audioRef.current) audioRef.current.volume = volume;
  }, []);

  const handleMuteToggle = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    if (videoRef.current) videoRef.current.muted = !playerState.isMuted;
    if (audioRef.current) audioRef.current.muted = !playerState.isMuted;
  }, [playerState.isMuted]);

  const handleFullscreenToggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setPlayerState(prev => ({ ...prev, isFullscreen: false }));
    } else {
      videoRef.current?.requestFullscreen();
      setPlayerState(prev => ({ ...prev, isFullscreen: true }));
    }
  }, []);

  const handleDownload = useCallback(async (content: MediaContent) => {
    try {
      await downloadMedia(content.id);
      addNotification({
        type: 'success',
        title: 'Download',
        message: 'Download started!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Download',
        message: 'Download failed'
      });
    }
  }, [downloadMedia, addNotification]);

  const handleLike = useCallback(async (content: MediaContent) => {
    try {
      await likeMedia(content.id);
      addNotification({
        type: 'success',
        title: 'Like',
        message: content.isLiked ? 'Removed from likes' : 'Added to likes'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Like',
        message: 'Failed to update like'
      });
    }
  }, [likeMedia, addNotification]);

  const handleCreatePlaylist = useCallback(async (name: string, description: string) => {
    try {
      await createPlaylist({ name, description });
      setShowPlaylistForm(false);
      addNotification({
        type: 'success',
        title: 'Playlist',
        message: 'Playlist created!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Playlist',
        message: 'Failed to create playlist'
      });
    }
  }, [createPlaylist, addNotification]);

  const handleGeneratePlaylist = useCallback(async (mood: string, duration: number) => {
    try {
      const playlist = await generatePlaylist({ mood, duration, userId: user?.id });
      addNotification({
        type: 'success',
        title: 'AI Playlist',
        message: 'AI playlist generated!'
      });
      setCurrentPlaylist(playlist);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'AI Playlist',
        message: 'Failed to generate playlist'
      });
    }
  }, [generatePlaylist, user?.id, addNotification]);

  const handleGenerateCaptions = useCallback(async (contentId: string) => {
    try {
      const captions = await generateCaptions(contentId);
      addNotification({
        type: 'success',
        title: 'Captions',
        message: 'Captions generated!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Captions',
        message: 'Failed to generate captions'
      });
    }
  }, [generateCaptions, addNotification]);

  const handleSendChatMessage = useCallback(async () => {
    if (!chatMessage.trim() || !currentStream) return;

    try {
      // Send chat message logic here
      setChatMessage('');
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Chat',
        message: 'Failed to send message'
      });
    }
  }, [chatMessage, currentStream, addNotification]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getContentIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      video: <Video className="w-4 h-4" />,
      audio: <Music className="w-4 h-4" />,
      podcast: <Mic className="w-4 h-4" />,
      'guided-session': <Brain className="w-4 h-4" />
    };
    return icons[type] || <Play className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Media & Streaming
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover, stream, and create personalized media experiences
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search media content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'browse', label: 'Browse', icon: Search },
            { id: 'playlists', label: 'Playlists', icon: List },
            { id: 'live', label: 'Live Streams', icon: Users },
            { id: 'downloads', label: 'Downloads', icon: Download }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'browse' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Browse Content</h2>
                <button
                  onClick={() => handleGeneratePlaylist('relaxed', 30)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Playlist
                </button>
              </div>

              {filteredContent.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No content found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                  {filteredContent.map((content) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                        <img
                          src={content.thumbnail}
                          alt={content.title}
                          className={`w-full object-cover ${viewMode === 'list' ? 'h-32' : 'h-48'}`}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <button
                            onClick={() => handlePlay(content)}
                            className="bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100 transition-all duration-200"
                          >
                            <Play className="w-6 h-6 text-gray-900" />
                          </button>
                        </div>
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {formatTime(content.duration)}
                        </div>
                      </div>

                      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            {getContentIcon(content.type)}
                            <span className="ml-1 capitalize">{content.type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleLike(content)}
                              className={`p-1 rounded ${content.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                            >
                              <HeartIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(content)}
                              className="p-1 text-gray-400 hover:text-blue-500 rounded"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {content.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {content.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                          <span>{content.author}</span>
                          <div className="flex items-center space-x-2">
                            <span>{content.views} views</span>
                            <span>{content.likes} likes</span>
                          </div>
                        </div>

                        {content.transcript && (
                          <button
                            onClick={() => handleGenerateCaptions(content.id)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Generate Captions
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Playlists</h2>
                <button
                  onClick={() => setShowPlaylistForm(true)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Playlist
                </button>
              </div>

              {playlists.length === 0 ? (
                <div className="text-center py-12">
                  <List className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No playlists yet</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Create your first playlist to organize your favorite content
                  </p>
                  <button
                    onClick={() => setShowPlaylistForm(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Create Playlist
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playlists.map((playlist) => (
                    <motion.div
                      key={playlist.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setCurrentPlaylist(playlist)}
                    >
                      <div className="relative">
                        <img
                          src={playlist.thumbnail}
                          alt={playlist.name}
                          className="w-full h-48 object-cover"
                        />
                        {playlist.isAI && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            AI Generated
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {playlist.items.length} items
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {playlist.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {playlist.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          Created {new Date(playlist.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'live' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Live Streams</h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {liveStreams.filter(s => s.isLive).length} live now
                </div>
              </div>

              {liveStreams.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No live streams</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Check back later for live wellness sessions
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveStreams.map((stream) => (
                    <motion.div
                      key={stream.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setCurrentStream(stream)}
                    >
                      <div className="relative">
                        <img
                          src={stream.thumbnail}
                          alt={stream.title}
                          className="w-full h-48 object-cover"
                        />
                        {stream.isLive && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center">
                            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                            LIVE
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {stream.participants}
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {stream.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {stream.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                          <span>Hosted by {stream.host}</span>
                          <span>{new Date(stream.startTime).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'downloads' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Downloaded Content</h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {mediaContent.filter(c => c.isDownloaded).length} items
                </div>
              </div>

              {mediaContent.filter(c => c.isDownloaded).length === 0 ? (
                <div className="text-center py-12">
                  <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No downloads yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Download content to access it offline
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {mediaContent.filter(c => c.isDownloaded).map((content) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="relative">
                        <img
                          src={content.thumbnail}
                          alt={content.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <button
                            onClick={() => handlePlay(content)}
                            className="bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100 transition-all duration-200"
                          >
                            <Play className="w-6 h-6 text-gray-900" />
                          </button>
                        </div>
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                          Downloaded
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {content.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {content.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {content.author} • {formatTime(content.duration)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Media Player Modal */}
      <AnimatePresence>
        {showPlayer && selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPlayer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Video/Audio Player */}
              <div className="relative">
                {selectedContent.type === 'video' ? (
                  <video
                    ref={videoRef}
                    src={selectedContent.url}
                    className="w-full h-auto"
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setPlayerState(prev => ({ ...prev, duration: videoRef.current!.duration }));
                      }
                    }}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setPlayerState(prev => ({ ...prev, currentTime: videoRef.current!.currentTime }));
                      }
                    }}
                    onEnded={() => setPlayerState(prev => ({ ...prev, isPlaying: false }))}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-900 flex items-center justify-center">
                    <audio
                      ref={audioRef}
                      src={selectedContent.url}
                      onLoadedMetadata={() => {
                        if (audioRef.current) {
                          setPlayerState(prev => ({ ...prev, duration: audioRef.current!.duration }));
                        }
                      }}
                      onTimeUpdate={() => {
                        if (audioRef.current) {
                          setPlayerState(prev => ({ ...prev, currentTime: audioRef.current!.currentTime }));
                        }
                      }}
                      onEnded={() => setPlayerState(prev => ({ ...prev, isPlaying: false }))}
                    />
                    <div className="text-center text-white">
                      <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-medium mb-2">{selectedContent.title}</h3>
                      <p className="text-gray-400">{selectedContent.author}</p>
                    </div>
                  </div>
                )}

                {/* Player Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePlayPause}
                      className="text-white hover:text-gray-300"
                    >
                      {playerState.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>

                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max={playerState.duration}
                        value={playerState.currentTime}
                        onChange={(e) => handleSeek(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{formatTime(playerState.currentTime)}</span>
                        <span>{formatTime(playerState.duration)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleMuteToggle}
                        className="text-white hover:text-gray-300"
                      >
                        {playerState.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={playerState.volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <button
                        onClick={handleFullscreenToggle}
                        className="text-white hover:text-gray-300"
                      >
                        {playerState.isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Info */}
              <div className="p-4">
                <h3 className="text-lg font-medium text-white mb-2">{selectedContent.title}</h3>
                <p className="text-gray-400 mb-4">{selectedContent.description}</p>
                
                {selectedContent.captions && playerState.showCaptions && (
                  <div className="bg-gray-800 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-medium text-white mb-2">Captions</h4>
                    <div className="text-sm text-gray-300">
                      {selectedContent.captions
                        .filter(caption => 
                          caption.startTime <= playerState.currentTime && 
                          caption.endTime >= playerState.currentTime
                        )
                        .map(caption => (
                          <div key={caption.id} className="text-center">
                            {caption.text}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(selectedContent)}
                      className={`flex items-center space-x-1 ${selectedContent.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                    >
                      <HeartIcon className="w-4 h-4" />
                      <span className="text-sm">{selectedContent.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-500">
                      <Share className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowPlayer(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Stream Modal */}
      <AnimatePresence>
        {currentStream && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
            onClick={() => setCurrentStream(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-full">
                {/* Video Stream */}
                <div className="flex-1 relative">
                  <video
                    src={currentStream.streamUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                  />
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-sm px-3 py-1 rounded-full flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    LIVE
                  </div>
                  <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded-full flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {currentStream.participants}
                  </div>
                </div>

                {/* Chat Panel */}
                <div className="w-80 bg-gray-900 flex flex-col">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-white font-medium">Live Chat</h3>
                    <p className="text-gray-400 text-sm">{currentStream.participants} participants</p>
                  </div>

                  <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3"
                  >
                    {currentStream.chatMessages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {message.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-white text-sm font-medium">{message.username}</span>
                            <span className="text-gray-500 text-xs">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-700">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                      />
                      <button
                        onClick={handleSendChatMessage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist Form Modal */}
      <AnimatePresence>
        {showPlaylistForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPlaylistForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Create New Playlist
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter playlist name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe your playlist"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPlaylistForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCreatePlaylist('New Playlist', 'A new playlist')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Create Playlist
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
