'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { AIChatInterface } from '@/components/ai/AIChatInterface';
import { FaceToFaceInterface } from '@/components/ai/FaceToFaceInterface';
import { DailyMoodTracker } from '@/components/mental-health/DailyMoodTracker';
import { BudgetTracker } from '@/components/finance/BudgetTracker';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  persona?: string;
  reasoning?: string[];
  suggestions?: string[];
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentPersona, setCurrentPersona] = useState('balanced');

  // Mock data for demonstration
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [moodData, setMoodData] = useState({
    todayEntry: null,
    weeklyData: []
  });

  useEffect(() => {
    if (user) {
      // Load user data
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    // In a real implementation, this would fetch data from APIs
    console.log('Loading user data...');
  };

  const handleSendMessage = async (message: string, persona?: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          persona: persona || currentPersona
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response.content,
          sender: 'ai',
          timestamp: new Date(),
          persona: data.response.persona,
          reasoning: data.response.reasoning,
          suggestions: data.response.suggestions
        };

        setChatMessages(prev => [...prev, aiMessage]);
        setCurrentPersona(data.response.persona);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSaveMood = async (moodData: any) => {
    try {
      const response = await fetch('/api/mental-health/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moodData)
      });

      const data = await response.json();
      if (data.success) {
        console.log('Mood saved successfully');
        // Refresh mood data
        loadUserData();
      }
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  const handleAddBudget = async (budget: any) => {
    try {
      const response = await fetch('/api/finance/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budget)
      });

      const data = await response.json();
      if (data.success) {
        console.log('Budget added successfully');
        // Refresh budget data
        loadUserData();
      }
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  const handleAddTransaction = async (transaction: any) => {
    try {
      const response = await fetch('/api/finance/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction)
      });

      const data = await response.json();
      if (data.success) {
        console.log('Transaction added successfully');
        // Refresh transaction data
        loadUserData();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to access the dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be authenticated to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <div className="flex">
        <DashboardSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue={activeTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ai-chat">AI Chat</TabsTrigger>
                <TabsTrigger value="video-call">Video Call</TabsTrigger>
                <TabsTrigger value="mental-health">Mental Health</TabsTrigger>
                <TabsTrigger value="finance">Finance</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Welcome Section */}
                <WelcomeCard user={user} />
                
                {/* Quick Actions */}
                <QuickActions />
                
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Modules */}
                  <div className="lg:col-span-2 space-y-6">
                    <ModuleGrid />
                    <RecentActivity />
                  </div>
                  
                  {/* Right Column - AI Insights */}
                  <div className="space-y-6">
                    <AIInsights />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai-chat" className="h-[calc(100vh-200px)]">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full">
                  <AIChatInterface
                    onSendMessage={handleSendMessage}
                    messages={chatMessages}
                    isLoading={isChatLoading}
                    currentPersona={currentPersona}
                    onPersonaChange={setCurrentPersona}
                  />
                </div>
              </TabsContent>

              <TabsContent value="video-call">
                <FaceToFaceInterface
                  onStartCall={() => setIsCallActive(true)}
                  onEndCall={() => setIsCallActive(false)}
                  isCallActive={isCallActive}
                  aiPersona={currentPersona}
                  userAvatar={user.avatar}
                />
              </TabsContent>

              <TabsContent value="mental-health">
                <DailyMoodTracker
                  onSaveMood={handleSaveMood}
                  todayEntry={moodData.todayEntry}
                  weeklyData={moodData.weeklyData}
                />
              </TabsContent>

              <TabsContent value="finance">
                <BudgetTracker
                  budgets={budgets}
                  transactions={transactions}
                  onAddBudget={handleAddBudget}
                  onAddTransaction={handleAddTransaction}
                  onUpdateBudget={async () => {}}
                />
              </TabsContent>

              <TabsContent value="settings">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Settings
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        AI Preferences
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Default AI Persona
                          </label>
                          <select
                            value={currentPersona}
                            onChange={(e) => setCurrentPersona(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            <option value="balanced">Balanced</option>
                            <option value="educator">Educator</option>
                            <option value="therapist">Therapist</option>
                            <option value="creative">Creative</option>
                            <option value="legal_advocate">Legal Advocate</option>
                            <option value="financial_advisor">Financial Advisor</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Notifications
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            defaultChecked={user.notifications}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            Enable notifications
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Privacy & Security
                      </h3>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Your data is encrypted and stored securely. We never share your personal information with third parties.
                        </p>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
