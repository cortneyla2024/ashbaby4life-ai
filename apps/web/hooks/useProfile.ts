import { useState, useEffect, useCallback } from 'react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends';
      showEmail: boolean;
      showLocation: boolean;
    };
  };
  skills: string[];
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProfileUpdateData {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences?: Partial<UserProfile['preferences']>;
  skills?: string[];
  interests?: string[];
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updateData: ProfileUpdateData) => {
    setUpdating(true);
    setError(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      return data.profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  const updateAvatar = useCallback(async (file: File) => {
    setUpdating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }

      const data = await response.json();
      setProfile(prev => prev ? { ...prev, avatar: data.avatarUrl } : null);
      return data.avatarUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update avatar');
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  const updatePreferences = useCallback(async (preferences: Partial<UserProfile['preferences']>) => {
    setUpdating(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const data = await response.json();
      setProfile(prev => prev ? { ...prev, preferences: data.preferences } : null);
      return data.preferences;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  const addSkill = useCallback(async (skill: string) => {
    if (!profile) return;

    try {
      const updatedSkills = [...profile.skills, skill];
      await updateProfile({ skills: updatedSkills });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add skill');
    }
  }, [profile, updateProfile]);

  const removeSkill = useCallback(async (skill: string) => {
    if (!profile) return;

    try {
      const updatedSkills = profile.skills.filter(s => s !== skill);
      await updateProfile({ skills: updatedSkills });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove skill');
    }
  }, [profile, updateProfile]);

  const addInterest = useCallback(async (interest: string) => {
    if (!profile) return;

    try {
      const updatedInterests = [...profile.interests, interest];
      await updateProfile({ interests: updatedInterests });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add interest');
    }
  }, [profile, updateProfile]);

  const removeInterest = useCallback(async (interest: string) => {
    if (!profile) return;

    try {
      const updatedInterests = profile.interests.filter(i => i !== interest);
      await updateProfile({ interests: updatedInterests });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove interest');
    }
  }, [profile, updateProfile]);

  const deleteProfile = useCallback(async () => {
    setUpdating(true);
    setError(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }

      setProfile(null);
      localStorage.removeItem('token');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    updating,
    loadProfile,
    updateProfile,
    updateAvatar,
    updatePreferences,
    addSkill,
    removeSkill,
    addInterest,
    removeInterest,
    deleteProfile,
  };
}
