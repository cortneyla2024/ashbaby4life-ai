'use client';

import { useState, useCallback } from 'react';

interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  isOnline: boolean;
  lastSeen: Date;
  reputation: number;
  joinDate: Date;
}

interface CommunityPost {
  id: string;
  author: CommunityMember;
  content: string;
  type: 'text' | 'image' | 'video' | 'poll';
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isPinned: boolean;
  isEdited: boolean;
  attachments?: any[];
}

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  avatar: string;
  memberCount: number;
  isPrivate: boolean;
  isJoined: boolean;
  category: string;
  tags: string[];
}

export const useCommunity = () => {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [forums, setForums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const createPost = useCallback(async (content: string, type: 'text' | 'image' | 'video' | 'poll' = 'text', attachments?: any[]) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newPost: CommunityPost = {
        id: Date.now().toString(),
        author: {
          id: 'current-user',
          name: 'Current User',
          avatar: '/api/placeholder/32/32',
          role: 'member',
          isOnline: true,
          lastSeen: new Date(),
          reputation: 100,
          joinDate: new Date()
        },
        content,
        type,
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        shares: 0,
        isPinned: false,
        isEdited: false,
        attachments
      };

      setPosts(prev => [newPost, ...prev]);
    } finally {
      setLoading(false);
    }
  }, []);

  const joinGroup = useCallback(async (groupId: string) => {
    setGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, isJoined: true, memberCount: group.memberCount + 1 }
          : group
      )
    );
  }, []);

  const leaveGroup = useCallback(async (groupId: string) => {
    setGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, isJoined: false, memberCount: group.memberCount - 1 }
          : group
      )
    );
  }, []);

  const likePost = useCallback(async (postId: string) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      )
    );
  }, []);

  const commentOnPost = useCallback(async (postId: string, comment: string) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments + 1 }
          : post
      )
    );
  }, []);

  const joinCommunity = useCallback(async (communityId: string) => {
    // Mock implementation
    console.log('Joining community:', communityId);
  }, []);

  const leaveCommunity = useCallback(async (communityId: string) => {
    // Mock implementation
    console.log('Leaving community:', communityId);
  }, []);

  const createForum = useCallback(async (name: string, description: string) => {
    // Mock implementation
    console.log('Creating forum:', name, description);
  }, []);

  const getCommunityMembers = useCallback(async (communityId: string) => {
    // Mock implementation
    console.log('Getting community members:', communityId);
    return [];
  }, []);

  return {
    members,
    posts,
    groups,
    communities,
    forums,
    loading,
    createPost,
    joinGroup,
    leaveGroup,
    likePost,
    commentOnPost,
    joinCommunity,
    leaveCommunity,
    createForum,
    getCommunityMembers
  };
};
