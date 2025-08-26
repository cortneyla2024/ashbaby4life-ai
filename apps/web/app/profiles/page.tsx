'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Users,
  Trophy,
  Star,
  Target,
  Award,
  Settings,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Calendar,
  TrendingUp,
  Activity,
  Heart,
  Brain,
  Zap,
  Crown,
  Medal,
  Badge,
  Gift,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'parent' | 'child' | 'guest';
  familyId?: string;
  permissions: string[];
  badges: Badge[];
  achievements: Achievement[];
  goals: Goal[];
  stats: UserStats;
  privacySettings: PrivacySettings;
  createdAt: Date;
  lastActive: Date;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  unlockedAt?: Date;
  icon: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  deadline?: Date;
  completed: boolean;
  reward?: string;
}

interface UserStats {
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNext: number;
  streakDays: number;
  totalAchievements: number;
  totalBadges: number;
  completedGoals: number;
  totalGoals: number;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'family' | 'private';
  showStats: boolean;
  showBadges: boolean;
  showAchievements: boolean;
  allowMessages: boolean;
  showOnlineStatus: boolean;
}

interface Family {
  id: string;
  name: string;
  members: UserProfile[];
  admins: string[];
  settings: FamilySettings;
  createdAt: Date;
}

interface FamilySettings {
  allowChildProfiles: boolean;
  requireApproval: boolean;
  contentFiltering: boolean;
  timeLimits: boolean;
  spendingLimits: boolean;
}

const ProfilesAndGamification: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [view, setView] = useState<'profile' | 'family' | 'badges' | 'achievements' | 'goals' | 'settings'>('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);

  // Mock data
  const mockUser: UserProfile = {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: '/api/avatars/alex.jpg',
    role: 'parent',
    familyId: 'family1',
    permissions: ['manage_family', 'view_analytics', 'edit_profiles'],
    badges: [
      {
        id: '1',
        name: 'Early Bird',
        description: 'Complete 5 morning routines',
        icon: '🌅',
        category: 'productivity',
        rarity: 'common',
        unlockedAt: new Date('2024-01-15'),
        progress: 5,
        maxProgress: 5
      },
      {
        id: '2',
        name: 'Knowledge Seeker',
        description: 'Complete 10 learning modules',
        icon: '📚',
        category: 'education',
        rarity: 'rare',
        unlockedAt: new Date('2024-01-20'),
        progress: 10,
        maxProgress: 10
      },
      {
        id: '3',
        name: 'Wellness Champion',
        description: 'Maintain 30-day wellness streak',
        icon: '💪',
        category: 'health',
        rarity: 'epic',
        progress: 25,
        maxProgress: 30
      }
    ],
    achievements: [
      {
        id: '1',
        name: 'First Steps',
        description: 'Complete your first goal',
        points: 100,
        category: 'milestone',
        unlockedAt: new Date('2024-01-10'),
        icon: '🎯'
      },
      {
        id: '2',
        name: 'Family Builder',
        description: 'Add 3 family members',
        points: 250,
        category: 'social',
        unlockedAt: new Date('2024-01-12'),
        icon: '👨‍👩‍👧‍👦'
      }
    ],
    goals: [
      {
        id: '1',
        title: 'Daily Exercise',
        description: 'Complete 30 minutes of exercise',
        category: 'health',
        target: 30,
        current: 25,
        unit: 'minutes',
        completed: false,
        reward: '50 points'
      },
      {
        id: '2',
        title: 'Read Books',
        description: 'Read 12 books this year',
        category: 'learning',
        target: 12,
        current: 8,
        unit: 'books',
        completed: false,
        reward: '200 points'
      }
    ],
    stats: {
      totalPoints: 1250,
      level: 8,
      experience: 750,
      experienceToNext: 1000,
      streakDays: 15,
      totalAchievements: 12,
      totalBadges: 8,
      completedGoals: 24,
      totalGoals: 30
    },
    privacySettings: {
      profileVisibility: 'family',
      showStats: true,
      showBadges: true,
      showAchievements: true,
      allowMessages: true,
      showOnlineStatus: true
    },
    createdAt: new Date('2024-01-01'),
    lastActive: new Date()
  };

  const mockFamily: Family = {
    id: 'family1',
    name: 'Johnson Family',
    members: [
      mockUser,
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: '/api/avatars/sarah.jpg',
        role: 'parent',
        familyId: 'family1',
        permissions: ['manage_family', 'view_analytics'],
        badges: [],
        achievements: [],
        goals: [],
        stats: {
          totalPoints: 890,
          level: 6,
          experience: 450,
          experienceToNext: 1000,
          streakDays: 8,
          totalAchievements: 8,
          totalBadges: 5,
          completedGoals: 15,
          totalGoals: 20
        },
        privacySettings: {
          profileVisibility: 'family',
          showStats: true,
          showBadges: true,
          showAchievements: true,
          allowMessages: true,
          showOnlineStatus: true
        },
        createdAt: new Date('2024-01-01'),
        lastActive: new Date()
      },
      {
        id: '3',
        name: 'Emma Johnson',
        email: 'emma@example.com',
        avatar: '/api/avatars/emma.jpg',
        role: 'child',
        familyId: 'family1',
        permissions: ['view_own_profile'],
        badges: [],
        achievements: [],
        goals: [],
        stats: {
          totalPoints: 320,
          level: 3,
          experience: 200,
          experienceToNext: 500,
          streakDays: 5,
          totalAchievements: 4,
          totalBadges: 2,
          completedGoals: 8,
          totalGoals: 12
        },
        privacySettings: {
          profileVisibility: 'family',
          showStats: true,
          showBadges: true,
          showAchievements: true,
          allowMessages: false,
          showOnlineStatus: true
        },
        createdAt: new Date('2024-01-01'),
        lastActive: new Date()
      }
    ],
    admins: ['1', '2'],
    settings: {
      allowChildProfiles: true,
      requireApproval: true,
      contentFiltering: true,
      timeLimits: true,
      spendingLimits: true
    },
    createdAt: new Date('2024-01-01')
  };

  useEffect(() => {
    setCurrentUser(mockUser);
    setFamily(mockFamily);
  }, []);

  const handleProfileUpdate = (updates: Partial<UserProfile>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  const handleAddFamilyMember = (member: Omit<UserProfile, 'id' | 'createdAt' | 'lastActive'>) => {
    const newMember: UserProfile = {
      ...member,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastActive: new Date()
    };
    if (family) {
      setFamily({
        ...family,
        members: [...family.members, newMember]
      });
    }
  };

  const handleAddGoal = (goal: Omit<Goal, 'id' | 'completed'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      completed: false
    };
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        goals: [...currentUser.goals, newGoal]
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return 'text-purple-600';
    if (level >= 15) return 'text-blue-600';
    if (level >= 10) return 'text-green-600';
    if (level >= 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (!currentUser || !family) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profiles & Gamification</h1>
          <p className="text-gray-600">Manage family profiles, achievements, and gamification features</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8">
          {[
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'family', label: 'Family', icon: Users },
            { key: 'badges', label: 'Badges', icon: Trophy },
            { key: 'achievements', label: 'Achievements', icon: Award },
            { key: 'goals', label: 'Goals', icon: Target },
            { key: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                view === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Profile View */}
            {view === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-center mb-6">
                      <div className="relative inline-block">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mt-4">{currentUser.name}</h2>
                      <p className="text-gray-600">{currentUser.email}</p>
                      <div className="flex items-center justify-center space-x-2 mt-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600 capitalize">{currentUser.role}</span>
                      </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Level</span>
                        <span className={`font-bold ${getLevelColor(currentUser.stats.level)}`}>
                          {currentUser.stats.level}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(currentUser.stats.experience / currentUser.stats.experienceToNext) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{currentUser.stats.experience} XP</span>
                        <span>{currentUser.stats.experienceToNext} XP to next level</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{currentUser.stats.totalPoints}</div>
                          <div className="text-sm text-gray-600">Total Points</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{currentUser.stats.streakDays}</div>
                          <div className="text-sm text-gray-600">Day Streak</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingProfile(true)}
                      className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Trophy className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{currentUser.stats.totalAchievements}</div>
                        <div className="text-sm text-gray-600">Achievements</div>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Badge className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{currentUser.stats.totalBadges}</div>
                        <div className="text-sm text-gray-600">Badges</div>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Target className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{currentUser.stats.completedGoals}</div>
                        <div className="text-sm text-gray-600">Goals Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <TrendingUp className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.round((currentUser.stats.completedGoals / currentUser.stats.totalGoals) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Family View */}
            {view === 'family' && (
              <div className="space-y-6">
                {/* Family Overview */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{family.name}</h3>
                      <p className="text-gray-600">{family.members.length} members</p>
                    </div>
                    <button
                      onClick={() => setShowAddMember(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Member</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {family.members.map((member) => (
                      <motion.div
                        key={member.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-50 rounded-lg p-4 cursor-pointer border-2 border-transparent hover:border-blue-200 transition-all"
                        onClick={() => setSelectedMember(member)}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{member.name}</h4>
                            <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                          </div>
                          {family.admins.includes(member.id) && (
                            <Crown className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-gray-600">Level {member.stats.level}</span>
                          <span className="text-blue-600 font-medium">{member.stats.totalPoints} pts</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Family Settings */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Family Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(family.settings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {value ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors ${
                          value ? 'bg-blue-600' : 'bg-gray-300'
                        }`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Badges View */}
            {view === 'badges' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Your Badges</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentUser.badges.map((badge) => (
                      <motion.div
                        key={badge.id}
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-3">{badge.icon}</div>
                          <h4 className="font-bold text-gray-900 mb-2">{badge.name}</h4>
                          <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                          
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                            {badge.rarity}
                          </div>

                          {badge.unlockedAt ? (
                            <div className="mt-4 text-sm text-green-600">
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              Unlocked {badge.unlockedAt.toLocaleDateString()}
                            </div>
                          ) : (
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                <span>Progress</span>
                                <span>{badge.progress}/{badge.maxProgress}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${((badge.progress || 0) / (badge.maxProgress || 1)) * 100}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Achievements View */}
            {view === 'achievements' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentUser.achievements.map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 border border-blue-200"
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-3">{achievement.icon}</div>
                          <h4 className="font-bold text-gray-900 mb-2">{achievement.name}</h4>
                          <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                          
                          <div className="flex items-center justify-center space-x-2 mb-4">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold text-blue-600">{achievement.points} points</span>
                          </div>

                          {achievement.unlockedAt && (
                            <div className="text-sm text-green-600">
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              Unlocked {achievement.unlockedAt.toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Goals View */}
            {view === 'goals' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Goals</h3>
                    <button
                      onClick={() => setShowAddGoal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Goal</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {currentUser.goals.map((goal) => (
                      <motion.div
                        key={goal.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2">{goal.title}</h4>
                            <p className="text-gray-600 mb-3">{goal.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="capitalize">{goal.category}</span>
                              {goal.deadline && (
                                <span className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {goal.deadline.toLocaleDateString()}
                                </span>
                              )}
                              {goal.reward && (
                                <span className="text-blue-600 font-medium">{goal.reward}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {goal.current}/{goal.target} {goal.unit}
                            </div>
                            <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${(goal.current / goal.target) * 100}%`
                                }}
                              ></div>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {Math.round((goal.current / goal.target) * 100)}% complete
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings View */}
            {view === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Privacy Settings</h3>
                  <div className="space-y-4">
                    {Object.entries(currentUser.privacySettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : value}
                          </p>
                        </div>
                        {typeof value === 'boolean' ? (
                          <div className={`w-12 h-6 rounded-full transition-colors ${
                            value ? 'bg-blue-600' : 'bg-gray-300'
                          }`}>
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}></div>
                          </div>
                        ) : (
                          <select
                            value={value}
                            onChange={(e) => handleProfileUpdate({
                              privacySettings: {
                                ...currentUser.privacySettings,
                                [key]: e.target.value
                              }
                            })}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="public">Public</option>
                            <option value="family">Family</option>
                            <option value="private">Private</option>
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilesAndGamification;
