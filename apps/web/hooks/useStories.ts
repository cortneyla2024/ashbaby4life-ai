'use client';

import { useState, useCallback } from 'react';

interface Story {
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

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);

  const createStory = useCallback(async (content: string | any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newStory: Story = {
        id: Date.now().toString(),
        content,
        author: 'current-user',
        user: {
          id: 'current-user',
          name: 'Current User',
          avatar: '/api/placeholder/32/32'
        },
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        views: 0
      };

      setStories(prev => [newStory, ...prev]);
    } finally {
      setLoading(false);
    }
  }, []);

  const viewStory = useCallback(async (storyId: string) => {
    setStories(prev => 
      prev.map(story => 
        story.id === storyId 
          ? { ...story, views: story.views + 1 }
          : story
      )
    );
  }, []);

  const reactToStory = useCallback(async (storyId: string, reaction: string) => {
    // Mock implementation
    console.log('Reacting to story:', storyId, reaction);
  }, []);

  const getStoryReactions = useCallback(async (storyId: string) => {
    // Mock implementation
    return [];
  }, []);

  return {
    stories,
    loading,
    createStory,
    viewStory,
    reactToStory,
    getStoryReactions
  };
};
