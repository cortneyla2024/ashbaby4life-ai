'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Send,
  Image,
  Smile,
  MoreHorizontal,
  Heart,
  Share2,
  Flag,
  Volume2,
  VolumeX,
  Settings,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  UserPlus,
  Crown,
  Shield,
  Star
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCommunity } from '@/hooks/useCommunity';
import { useMessaging } from '@/hooks/useMessaging';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useStories } from '@/hooks/useStories';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';
import { Community, Forum, Message, Story, AudioRoom, User } from '@/types/community';

interface CommunityHubProps {
  className?: string;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ className }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('forums');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isInAudioRoom, setIsInAudioRoom] = useState(false);
  const [audioRoom, setAudioRoom] = useState<AudioRoom | null>(null);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [storyContent, setStoryContent] = useState('');
  const [storyMedia, setStoryMedia] = useState<File | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    communities, 
    forums, 
    joinCommunity, 
    leaveCommunity, 
    createForum,
    getCommunityMembers 
  } = useCommunity();

  const { 
    messages, 
    sendMessage, 
    sendVoiceMessage, 
    sendImageMessage,
    markAsRead,
    getTypingUsers 
  } = useMessaging();

  const { 
    audioRooms, 
    joinAudioRoom, 
    leaveAudioRoom, 
    createAudioRoom,
    isMuted,
    isDeafened,
    toggleMute,
    toggleDeafen,
    raiseHand,
    lowerHand 
  } = useVoiceChat();

  const { 
    stories, 
    createStory, 
    viewStory, 
    reactToStory,
    getStoryReactions 
  } = useStories();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !selectedForum) return;

    try {
      await sendMessage({
        forumId: selectedForum.id,
        content: messageText,
        type: 'text',
        userId: user?.id || '',
        timestamp: new Date().toISOString()
      });
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [messageText, selectedForum, sendMessage, user?.id]);

  // Handle voice message
  const handleVoiceMessage = useCallback(async (audioBlob: Blob) => {
    if (!selectedForum) return;

    try {
      await sendVoiceMessage({
        forumId: selectedForum.id,
        audioBlob,
        userId: user?.id || '',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send voice message:', error);
    }
  }, [selectedForum, sendVoiceMessage, user?.id]);

  // Handle image message
  const handleImageMessage = useCallback(async (file: File) => {
    if (!selectedForum) return;

    try {
      await sendImageMessage({
        forumId: selectedForum.id,
        imageFile: file,
        userId: user?.id || '',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send image message:', error);
    }
  }, [selectedForum, sendImageMessage, user?.id]);

  // Handle story creation
  const handleCreateStory = useCallback(async () => {
    if (!storyContent.trim() && !storyMedia) return;

    try {
      await createStory({
        content: storyContent,
        media: storyMedia,
        userId: user?.id || '',
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });
      setStoryContent('');
      setStoryMedia(null);
      setShowStoryCreator(false);
    } catch (error) {
      console.error('Failed to create story:', error);
    }
  }, [storyContent, storyMedia, createStory, user?.id]);

  // Handle audio room actions
  const handleJoinAudioRoom = useCallback(async (room: AudioRoom) => {
    try {
      await joinAudioRoom(room.id);
      setAudioRoom(room);
      setIsInAudioRoom(true);
    } catch (error) {
      console.error('Failed to join audio room:', error);
    }
  }, [joinAudioRoom]);

  const handleLeaveAudioRoom = useCallback(async () => {
    if (!audioRoom) return;

    try {
      await leaveAudioRoom(audioRoom.id);
      setAudioRoom(null);
      setIsInAudioRoom(false);
    } catch (error) {
      console.error('Failed to leave audio room:', error);
    }
  }, [audioRoom, leaveAudioRoom]);

  // Get user role in community
  const getUserRole = (community: Community): 'admin' | 'moderator' | 'member' => {
    const member = community.members.find(m => m.userId === user?.id);
    return member?.role || 'member';
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'moderator':
        return <Shield className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Community Hub
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStoryCreator(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Story
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* TODO: Create audio room */}}
          >
            <Mic className="w-4 h-4 mr-2" />
            Start Room
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <Tabs defaultValue={activeTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="forums">Forums</TabsTrigger>
              <TabsTrigger value="rooms">Audio Rooms</TabsTrigger>
              <TabsTrigger value="stories">Stories</TabsTrigger>
            </TabsList>

            <TabsContent value="forums" className="flex-1 flex flex-col">
              {/* Communities */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                  Communities
                </h3>
                <div className="space-y-2">
                  {communities.map((community) => (
                    <button
                      key={community.id}
                      onClick={() => setSelectedCommunity(community)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-colors',
                        selectedCommunity?.id === community.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={community.avatar} />
                          <AvatarFallback>{community.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {community.name}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {community.members.length} members
                          </p>
                        </div>
                        {getRoleIcon(getUserRole(community))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Forums */}
              {selectedCommunity && (
                <div className="flex-1 p-4">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                    Forums
                  </h3>
                  <div className="space-y-2">
                    {forums
                      .filter(forum => forum.communityId === selectedCommunity.id)
                      .map((forum) => (
                        <button
                          key={forum.id}
                          onClick={() => setSelectedForum(forum)}
                          className={cn(
                            'w-full text-left p-3 rounded-lg border transition-colors',
                            selectedForum?.id === forum.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                                {forum.name}
                              </h4>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {forum.description}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {forum.messageCount}
                            </Badge>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rooms" className="flex-1 p-4">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                Live Audio Rooms
              </h3>
              <div className="space-y-2">
                {audioRooms.map((room) => (
                  <Card key={room.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            'w-3 h-3 rounded-full',
                            room.isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-400'
                          )} />
                          <div>
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                              {room.title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {room.participants.length} participants
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleJoinAudioRoom(room)}
                        >
                          Join
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stories" className="flex-1 p-4">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                Stories
              </h3>
              <div className="space-y-2">
                {stories.map((story) => (
                  <Card key={story.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={story.user?.avatar} />
                          <AvatarFallback>{story.user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                            {story.user?.name}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                            {story.content}
                          </p>
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(story.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedForum ? (
            <>
              {/* Forum Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {selectedForum.name}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedForum.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {selectedForum.messageCount} messages
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages
                    .filter(msg => msg.forumId === selectedForum.id)
                    .map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-start space-x-3"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.user?.avatar} />
                          <AvatarFallback>{message.user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {message.user?.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                            {getRoleIcon(message.user?.role || 'member')}
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                            {message.type === 'text' && (
                              <p className="text-sm text-slate-900 dark:text-white">
                                {message.content}
                              </p>
                            )}
                            {message.type === 'voice' && (
                              <div className="flex items-center space-x-2">
                                <Mic className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  Voice message
                                </span>
                                <Button variant="ghost" size="sm">
                                  <Volume2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                            {message.type === 'image' && (
                              <div>
                                <img 
                                  src={message.content} 
                                  alt="Message attachment"
                                  className="max-w-xs rounded-lg"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Heart className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Share2 className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-6 w-6 p-0"
                      >
                        <Image className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="h-6 w-6 p-0"
                      >
                        <Smile className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageMessage(file);
                    }
                  }}
                  className="hidden"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Select a forum to start chatting
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Choose a community and forum from the sidebar to begin messaging.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Audio Room Panel */}
        {isInAudioRoom && audioRoom && (
          <div className="w-80 border-l border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    {audioRoom.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {audioRoom.participants.length} participants
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLeaveAudioRoom}
                >
                  Leave
                </Button>
              </div>
            </div>

            <div className="flex-1 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant={isMuted ? "destructive" : "default"}
                    size="sm"
                    onClick={toggleMute}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant={isDeafened ? "destructive" : "default"}
                    size="sm"
                    onClick={toggleDeafen}
                  >
                    {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Participants
                  </h4>
                  <div className="space-y-2">
                    {audioRoom.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>{participant.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-900 dark:text-white">
                          {participant.name}
                        </span>
                        {participant.isSpeaking && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                        {participant.isMuted && (
                          <MicOff className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Story Creator Modal */}
      <AnimatePresence>
        {showStoryCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowStoryCreator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Create Story
              </h3>
              
              <div className="space-y-4">
                <Input
                  placeholder="What's on your mind?"
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  className="w-full"
                />
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Add Media
                  </Button>
                  {storyMedia && (
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {storyMedia.name}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowStoryCreator(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateStory}
                    disabled={!storyContent.trim() && !storyMedia}
                  >
                    Create Story
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
