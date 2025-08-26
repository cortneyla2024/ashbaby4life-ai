export interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string;
  memberCount: number;
  isPrivate: boolean;
  isJoined: boolean;
  category: string;
  tags: string[];
  members: Array<{
    userId: string;
    role: 'admin' | 'moderator' | 'member';
  }>;
}

export interface Forum {
  id: string;
  name: string;
  description: string;
  topicCount: number;
  postCount: number;
  messageCount: number;
  lastActivity: Date;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Story {
  id: string;
  content: string;
  author: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: Date;
  expiresAt: Date;
  views: number;
}

export interface AudioRoom {
  id: string;
  name: string;
  title: string;
  host: string;
  participantCount: number;
  participants: Array<{
    id: string;
    name: string;
    avatar: string;
    isSpeaking?: boolean;
    isMuted?: boolean;
  }>;
  isLive: boolean;
  topic: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
}
