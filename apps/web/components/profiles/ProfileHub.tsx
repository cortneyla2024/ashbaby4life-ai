'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Trophy, Target, Heart, Calendar, 
  TrendingUp, Award, Star, Edit, Plus,
  CheckCircle, Clock, BarChart3, Users
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { useGoals } from '@/hooks/useGoals';
import { useBadges } from '@/hooks/useBadges';
import { useNotifications } from '@/hooks/useNotifications';

interface Profile {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    privacyLevel: 'public' | 'private' | 'friends';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
    totalGoals: number;
    completedGoals: number;
    streakDays: number;
    totalPoints: number;
  };
  createdAt: Date;
  updatedAt: Date;
}





interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: Date;
  progress: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate: Date;
  progress: number;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

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

export const ProfileHub: React.FC = () => {
  const { user } = useAuth();
  const { profile, updateProfile, loading: profileLoading } = useProfiles();
  const { goals, createGoal, updateGoal, deleteGoal, loading: goalsLoading } = useGoals();
  const { badges, loading: badgesLoading } = useBadges();
  const { showNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'profile' | 'goals' | 'badges' | 'journey'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    privacyLevel: profile?.preferences?.privacyLevel || 'public',
    notifications: profile?.preferences?.notifications || { email: true, push: true, sms: false },
    theme: profile?.preferences?.theme || 'auto',
    language: profile?.preferences?.language || 'en'
  });

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: 'health',
    priority: 'medium' as 'low' | 'medium' | 'high',
    targetDate: new Date(),
    progress: 0
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        privacyLevel: profile.preferences.privacyLevel,
        notifications: profile.preferences.notifications,
        theme: profile.preferences.theme,
        language: profile.preferences.language
      });
    }
  }, [profile]);

  const handleProfileUpdate = useCallback(async () => {
    if (!profile) return;

    try {
      await updateProfile({
        ...profile,
        displayName: formData.displayName,
        bio: formData.bio,
        preferences: {
          ...profile.preferences,
          privacyLevel: formData.privacyLevel as 'public' | 'private' | 'friends',
          notifications: formData.notifications,
          theme: formData.theme as 'light' | 'dark' | 'auto',
          language: formData.language
        }
      });

      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      showNotification('Failed to update profile', 'error');
    }
  }, [profile, formData, updateProfile, showNotification]);

  const handleGoalSubmit = useCallback(async () => {
    try {
      const goalData = {
        ...goalForm,
        completed: false,
        milestones: []
      };

      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData);
        showNotification('Goal updated successfully!', 'success');
      } else {
        await createGoal(goalData);
        showNotification('Goal created successfully!', 'success');
      }

      setShowGoalForm(false);
      setEditingGoal(null);
      setGoalForm({
        title: '',
        description: '',
        category: 'health',
        priority: 'medium',
        targetDate: new Date(),
        progress: 0
      });
    } catch (error) {
      showNotification('Failed to save goal', 'error');
    }
  }, [goalForm, editingGoal, createGoal, updateGoal, showNotification]);

  const handleGoalProgress = useCallback(async (goalId: string, newProgress: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const updatedGoal = {
        ...goal,
        progress: newProgress,
        completed: newProgress >= 100
      };

      await updateGoal(goalId, updatedGoal);
      showNotification('Goal progress updated!', 'success');
    } catch (error) {
      showNotification('Failed to update goal progress', 'error');
    }
  }, [goals, updateGoal, showNotification]);

  const getProgressPercentage = (goal: Goal) => {
    return Math.min(goal.progress, 100);
  };

  const getGoalCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      health: <Heart className="w-4 h-4" />,
      fitness: <TrendingUp className="w-4 h-4" />,
      learning: <Target className="w-4 h-4" />,
      social: <Users className="w-4 h-4" />,
      productivity: <CheckCircle className="w-4 h-4" />,
      finance: <BarChart3 className="w-4 h-4" />
    };
    return icons[category] || <Target className="w-4 h-4" />;
  };

  const getBadgeRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'bg-gray-100 text-gray-800',
      rare: 'bg-blue-100 text-blue-800',
      epic: 'bg-purple-100 text-purple-800',
      legendary: 'bg-yellow-100 text-yellow-800'
    };
    return colors[rarity] || colors.common;
  };

  if (profileLoading || goalsLoading || badgesLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile & Progress
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track your care journey, goals, and achievements
        </p>
      </div>

      {/* Stats Overview */}
      {profile && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Goals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.stats.completedGoals}/{profile.stats.totalGoals}
                </p>
              </div>
            </div>
          </div>

                     <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
             <div className="flex items-center">
               <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                 <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
               </div>
               <div className="ml-3">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasks</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
                   {profile.stats.completedTasks}/{profile.stats.totalTasks}
                 </p>
               </div>
             </div>
           </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.stats.streakDays} days
                </p>
              </div>
            </div>
          </div>

                     <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
             <div className="flex items-center">
               <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                 <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
               </div>
               <div className="ml-3">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Points</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
                   {profile.stats.totalPoints}
                 </p>
               </div>
             </div>
           </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'badges', label: 'Badges', icon: Trophy },
            { id: 'journey', label: 'Care Journey', icon: Heart }
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
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Privacy Level
                      </label>
                                             <select
                         value={formData.privacyLevel}
                         onChange={(e) => setFormData({ ...formData, privacyLevel: e.target.value as 'public' | 'private' | 'friends' })}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                       >
                        <option value="public">Public</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Theme
                      </label>
                                             <select
                         value={formData.theme}
                         onChange={(e) => setFormData({ ...formData, theme: e.target.value as 'light' | 'dark' | 'auto' })}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                       >
                        <option value="auto">Auto</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>
                  </div>

                                     <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                       Notifications
                     </label>
                     <div className="space-y-2">
                       <div className="flex items-center">
                         <input
                           type="checkbox"
                           id="email-notifications"
                           checked={formData.notifications.email}
                           onChange={(e) => setFormData({ 
                             ...formData, 
                             notifications: { ...formData.notifications, email: e.target.checked }
                           })}
                           className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                         />
                         <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                           Email notifications
                         </label>
                       </div>
                       <div className="flex items-center">
                         <input
                           type="checkbox"
                           id="push-notifications"
                           checked={formData.notifications.push}
                           onChange={(e) => setFormData({ 
                             ...formData, 
                             notifications: { ...formData.notifications, push: e.target.checked }
                           })}
                           className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                         />
                         <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                           Push notifications
                         </label>
                       </div>
                       <div className="flex items-center">
                         <input
                           type="checkbox"
                           id="sms-notifications"
                           checked={formData.notifications.sms}
                           onChange={(e) => setFormData({ 
                             ...formData, 
                             notifications: { ...formData.notifications, sms: e.target.checked }
                           })}
                           className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                         />
                         <label htmlFor="sms-notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                           SMS notifications
                         </label>
                       </div>
                     </div>
                   </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileUpdate}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Display Name
                    </label>
                    <p className="text-gray-900 dark:text-white">{profile?.displayName || 'Not set'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <p className="text-gray-900 dark:text-white">{profile?.bio || 'No bio added yet'}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Privacy Level
                      </label>
                      <p className="text-gray-900 dark:text-white capitalize">{profile?.preferences?.privacyLevel || 'public'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Theme
                      </label>
                      <p className="text-gray-900 dark:text-white capitalize">{profile?.preferences?.theme || 'auto'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Goals</h2>
                <button
                  onClick={() => setShowGoalForm(true)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </button>
              </div>

              {goals.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No goals yet</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Start your journey by setting your first goal
                  </p>
                  <button
                    onClick={() => setShowGoalForm(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Create Your First Goal
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goals.map((goal) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            {getGoalCategoryIcon(goal.category)}
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {goal.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {goal.category}
                            </p>
                          </div>
                        </div>
                        {goal.completed && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {goal.description}
                      </p>

                                             <div className="mb-4">
                         <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                           <span>Progress</span>
                           <span>{goal.progress}%</span>
                         </div>
                         <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                           <div
                             className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                             style={{ width: `${getProgressPercentage(goal)}%` }}
                           ></div>
                         </div>
                       </div>

                       <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                         <Clock className="w-4 h-4 mr-1" />
                         Due: {new Date(goal.targetDate).toLocaleDateString()}
                       </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingGoal(goal);
                                                         setGoalForm({
                               title: goal.title,
                               description: goal.description,
                               category: goal.category,
                               priority: goal.priority,
                               targetDate: goal.targetDate,
                               progress: goal.progress
                             });
                            setShowGoalForm(true);
                          }}
                          className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-600 dark:border-red-400 rounded-md"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Badges</h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {badges.length} badges earned
                </div>
              </div>

              {badges.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No badges yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Complete goals and activities to earn badges
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {badges.map((badge) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center"
                    >
                      <div className="text-4xl mb-4">{badge.icon}</div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {badge.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {badge.description}
                      </p>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeRarityColor(badge.rarity)}`}>
                        {badge.rarity}
                      </div>
                                             <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                         {badge.unlocked ? `Unlocked ${badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : 'recently'}` : 'Not unlocked yet'}
                       </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

                     {activeTab === 'journey' && (
             <div className="space-y-6">
               <div className="text-center py-12">
                 <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Care Journey</h3>
                 <p className="text-gray-600 dark:text-gray-300">
                   Your personalized care journey will be available soon
                 </p>
               </div>
             </div>
           )}
        </motion.div>
      </AnimatePresence>

      {/* Goal Form Modal */}
      <AnimatePresence>
        {showGoalForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowGoalForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter goal title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={goalForm.description}
                    onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe your goal"
                  />
                </div>

                                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                       Category
                     </label>
                     <select
                       value={goalForm.category}
                       onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                     >
                       <option value="health">Health</option>
                       <option value="fitness">Fitness</option>
                       <option value="learning">Learning</option>
                       <option value="social">Social</option>
                       <option value="productivity">Productivity</option>
                       <option value="finance">Finance</option>
                     </select>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                       Priority
                     </label>
                     <select
                       value={goalForm.priority}
                       onChange={(e) => setGoalForm({ ...goalForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                     >
                       <option value="low">Low</option>
                       <option value="medium">Medium</option>
                       <option value="high">High</option>
                     </select>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                       Target Date
                     </label>
                     <input
                       type="date"
                       value={goalForm.targetDate.toISOString().split('T')[0]}
                       onChange={(e) => setGoalForm({ ...goalForm, targetDate: new Date(e.target.value) })}
                       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                       Progress (%)
                     </label>
                     <input
                       type="number"
                       value={goalForm.progress}
                       onChange={(e) => setGoalForm({ ...goalForm, progress: parseInt(e.target.value) || 0 })}
                       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                       min="0"
                       max="100"
                     />
                   </div>
                 </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowGoalForm(false);
                    setEditingGoal(null);
                                         setGoalForm({
                       title: '',
                       description: '',
                       category: 'health',
                       priority: 'medium',
                       targetDate: new Date(),
                       progress: 0
                     });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGoalSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
