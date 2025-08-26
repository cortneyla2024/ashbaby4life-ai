import { useState, useCallback, useEffect } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  points: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  completed: boolean;
  completedAt?: Date;
  progress: number;
  maxProgress: number;
  points: number;
}

export const useBadges = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/badges', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }

      const data = await response.json();
      setBadges(data.badges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch badges');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/achievements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }

      const data = await response.json();
      setAchievements(data.achievements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  }, []);

  const unlockBadge = useCallback(async (badgeId: string) => {
    try {
      const response = await fetch(`/api/badges/${badgeId}/unlock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to unlock badge');
      }

      const data = await response.json();
      setBadges(prev => prev.map(badge => 
        badge.id === badgeId ? { ...badge, unlocked: true, unlockedAt: new Date() } : badge
      ));
      return data.badge;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock badge');
      throw err;
    }
  }, []);

  const updateBadgeProgress = useCallback(async (badgeId: string, progress: number) => {
    try {
      const response = await fetch(`/api/badges/${badgeId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ progress }),
      });

      if (!response.ok) {
        throw new Error('Failed to update badge progress');
      }

      const data = await response.json();
      setBadges(prev => prev.map(badge => 
        badge.id === badgeId ? { ...badge, progress: data.progress } : badge
      ));
      return data.badge;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update badge progress');
      throw err;
    }
  }, []);

  const completeAchievement = useCallback(async (achievementId: string) => {
    try {
      const response = await fetch(`/api/achievements/${achievementId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to complete achievement');
      }

      const data = await response.json();
      setAchievements(prev => prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, completed: true, completedAt: new Date() }
          : achievement
      ));
      return data.achievement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete achievement');
      throw err;
    }
  }, []);

  const updateAchievementProgress = useCallback(async (achievementId: string, progress: number) => {
    try {
      const response = await fetch(`/api/achievements/${achievementId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ progress }),
      });

      if (!response.ok) {
        throw new Error('Failed to update achievement progress');
      }

      const data = await response.json();
      setAchievements(prev => prev.map(achievement => 
        achievement.id === achievementId ? { ...achievement, progress: data.progress } : achievement
      ));
      return data.achievement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update achievement progress');
      throw err;
    }
  }, []);

  const getUnlockedBadges = useCallback(() => {
    return badges.filter(badge => badge.unlocked);
  }, [badges]);

  const getLockedBadges = useCallback(() => {
    return badges.filter(badge => !badge.unlocked);
  }, [badges]);

  const getBadgesByCategory = useCallback((category: string) => {
    return badges.filter(badge => badge.category === category);
  }, [badges]);

  const getBadgesByRarity = useCallback((rarity: 'common' | 'rare' | 'epic' | 'legendary') => {
    return badges.filter(badge => badge.rarity === rarity);
  }, [badges]);

  const getCompletedAchievements = useCallback(() => {
    return achievements.filter(achievement => achievement.completed);
  }, [achievements]);

  const getPendingAchievements = useCallback(() => {
    return achievements.filter(achievement => !achievement.completed);
  }, [achievements]);

  const getAchievementsByCategory = useCallback((category: string) => {
    return achievements.filter(achievement => achievement.category === category);
  }, [achievements]);

  const getTotalPoints = useCallback(() => {
    const badgePoints = badges.filter(badge => badge.unlocked).reduce((sum, badge) => sum + badge.points, 0);
    const achievementPoints = achievements.filter(achievement => achievement.completed).reduce((sum, achievement) => sum + achievement.points, 0);
    return badgePoints + achievementPoints;
  }, [badges, achievements]);

  // Load data on mount
  useEffect(() => {
    fetchBadges();
    fetchAchievements();
  }, [fetchBadges, fetchAchievements]);

  return {
    // State
    badges,
    achievements,
    loading,
    error,
    
    // Badge functions
    fetchBadges,
    unlockBadge,
    updateBadgeProgress,
    
    // Achievement functions
    fetchAchievements,
    completeAchievement,
    updateAchievementProgress,
    
    // Getter functions
    getUnlockedBadges,
    getLockedBadges,
    getBadgesByCategory,
    getBadgesByRarity,
    getCompletedAchievements,
    getPendingAchievements,
    getAchievementsByCategory,
    getTotalPoints,
  };
};

