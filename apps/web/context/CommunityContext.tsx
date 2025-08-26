import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface CommunityMember {
  id: string;
  userId: string;
  communityId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
}

interface CommunityMessage {
  id: string;
  communityId: string;
  userId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file';
  createdAt: Date;
  updatedAt: Date;
}

interface CommunityContextType {
  communities: Community[];
  setCommunities: (communities: Community[]) => void;
  currentCommunity: Community | null;
  setCurrentCommunity: (community: Community | null) => void;
  members: CommunityMember[];
  setMembers: (members: CommunityMember[]) => void;
  messages: CommunityMessage[];
  setMessages: (messages: CommunityMessage[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  joinCommunity: (communityId: string) => Promise<void>;
  leaveCommunity: (communityId: string) => Promise<void>;
  sendMessage: (communityId: string, content: string, type?: string) => Promise<void>;
  createCommunity: (community: Omit<Community, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};

interface CommunityProviderProps {
  children: ReactNode;
}

export const CommunityProvider: React.FC<CommunityProviderProps> = ({ children }) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const joinCommunity = useCallback(async (communityId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMember: CommunityMember = {
        id: `member-${Date.now()}`,
        userId: 'current-user-id',
        communityId,
        role: 'member',
        joinedAt: new Date(),
      };
      
      setMembers(prev => [...prev, newMember]);
    } catch (error) {
      console.error('Failed to join community:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const leaveCommunity = useCallback(async (communityId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMembers(prev => prev.filter(member => 
        !(member.communityId === communityId && member.userId === 'current-user-id')
      ));
    } catch (error) {
      console.error('Failed to leave community:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (communityId: string, content: string, type = 'text') => {
    try {
      const newMessage: CommunityMessage = {
        id: `msg-${Date.now()}`,
        communityId,
        userId: 'current-user-id',
        content,
        type: type as 'text' | 'image' | 'video' | 'file',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, []);

  const createCommunity = useCallback(async (community: Omit<Community, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCommunity: Community = {
        ...community,
        id: `community-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setCommunities(prev => [...prev, newCommunity]);
    } catch (error) {
      console.error('Failed to create community:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: CommunityContextType = {
    communities,
    setCommunities,
    currentCommunity,
    setCurrentCommunity,
    members,
    setMembers,
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    joinCommunity,
    leaveCommunity,
    sendMessage,
    createCommunity,
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};
