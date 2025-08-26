import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MediaItem {
  id: string;
  title: string;
  description?: string;
  type: 'audio' | 'video' | 'image' | 'document';
  url: string;
  thumbnail?: string;
  duration?: number;
  size: number;
  tags: string[];
  category: string;
  uploadedAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  items: MediaItem[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MediaContextType {
  mediaItems: MediaItem[];
  setMediaItems: (items: MediaItem[]) => void;
  playlists: Playlist[];
  setPlaylists: (playlists: Playlist[]) => void;
  currentItem: MediaItem | null;
  setCurrentItem: (item: MediaItem | null) => void;
  currentPlaylist: Playlist | null;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  uploadMedia: (file: File, metadata?: any) => Promise<MediaItem>;
  createPlaylist: (name: string, description?: string, isPublic?: boolean) => Promise<Playlist>;
  addToPlaylist: (playlistId: string, mediaItem: MediaItem) => Promise<void>;
  removeFromPlaylist: (playlistId: string, mediaItemId: string) => Promise<void>;
  searchMedia: (query: string, filters?: any) => Promise<MediaItem[]>;
  deleteMedia: (mediaId: string) => Promise<void>;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};

interface MediaProviderProps {
  children: ReactNode;
}

export const MediaProvider: React.FC<MediaProviderProps> = ({ children }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentItem, setCurrentItem] = useState<MediaItem | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const uploadMedia = useCallback(async (file: File, metadata?: any): Promise<MediaItem> => {
    setIsLoading(true);
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newMediaItem: MediaItem = {
        id: `media-${Date.now()}`,
        title: file.name,
        type: getMediaType(file.type),
        url: URL.createObjectURL(file),
        size: file.size,
        tags: [],
        category: 'general',
        uploadedAt: new Date(),
        updatedAt: new Date(),
        metadata: metadata || {},
      };
      
      setMediaItems(prev => [...prev, newMediaItem]);
      return newMediaItem;
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPlaylist = useCallback(async (name: string, description?: string, isPublic = false): Promise<Playlist> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPlaylist: Playlist = {
        id: `playlist-${Date.now()}`,
        name,
        description,
        items: [],
        isPublic,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setPlaylists(prev => [...prev, newPlaylist]);
      return newPlaylist;
    } catch (error) {
      console.error('Failed to create playlist:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToPlaylist = useCallback(async (playlistId: string, mediaItem: MediaItem): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlaylists(prev =>
        prev.map(playlist =>
          playlist.id === playlistId
            ? { ...playlist, items: [...playlist.items, mediaItem], updatedAt: new Date() }
            : playlist
        )
      );
    } catch (error) {
      console.error('Failed to add to playlist:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFromPlaylist = useCallback(async (playlistId: string, mediaItemId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlaylists(prev =>
        prev.map(playlist =>
          playlist.id === playlistId
            ? { 
                ...playlist, 
                items: playlist.items.filter(item => item.id !== mediaItemId),
                updatedAt: new Date()
              }
            : playlist
        )
      );
    } catch (error) {
      console.error('Failed to remove from playlist:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchMedia = useCallback(async (query: string, filters?: any): Promise<MediaItem[]> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock search results
      const mockItems: MediaItem[] = [
        {
          id: '1',
          title: 'Sample Media',
          type: 'video',
          url: '/sample-video.mp4',
          size: 1024000,
          tags: ['sample'],
          category: 'general',
          uploadedAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      return mockItems;
    } catch (error) {
      console.error('Failed to search media:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteMedia = useCallback(async (mediaId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMediaItems(prev => prev.filter(item => item.id !== mediaId));
      
      // Remove from all playlists
      setPlaylists(prev =>
        prev.map(playlist => ({
          ...playlist,
          items: playlist.items.filter(item => item.id !== mediaId),
          updatedAt: new Date(),
        }))
      );
    } catch (error) {
      console.error('Failed to delete media:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMediaType = (mimeType: string): 'audio' | 'video' | 'image' | 'document' => {
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    return 'document';
  };

  const value: MediaContextType = {
    mediaItems,
    setMediaItems,
    playlists,
    setPlaylists,
    currentItem,
    setCurrentItem,
    currentPlaylist,
    setCurrentPlaylist,
    isPlaying,
    setIsPlaying,
    isLoading,
    setIsLoading,
    uploadMedia,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    searchMedia,
    deleteMedia,
  };

  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
  );
};
