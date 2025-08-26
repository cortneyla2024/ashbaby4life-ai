'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Users, Video, PenTool, Plus, Search, Edit, X,
  Lock, Unlock, Mic, MicOff, Camera, CameraOff, Phone
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProductivity } from '@/hooks/useProductivity';
import { useNotifications } from '@/hooks/useNotifications';

interface Notebook {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPublic: boolean;
  collaborators: string[];
  lastModified: Date;
}

interface VideoCall {
  id: string;
  title: string;
  participants: number;
  isActive: boolean;
}

export const ProductivityHub: React.FC = () => {
  const { user } = useAuth();
  const { notebooks, videoCalls, createNotebook, loading } = useProductivity();
  const { showNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'notebooks' | 'whiteboards' | 'calls'>('notebooks');
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isInCall, setIsInCall] = useState(false);

  const filteredNotebooks = notebooks.filter(notebook =>
    notebook.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNotebook = useCallback(async () => {
    try {
      await createNotebook({ 
        title: 'New Notebook', 
        content: '', 
        tags: [], 
        isArchived: false,
        isPublic: false,
        collaborators: [],
        lastModified: new Date()
      });
      showNotification('Notebook created!', 'success');
    } catch (error) {
      showNotification('Failed to create notebook', 'error');
    }
  }, [createNotebook, showNotification]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Productivity & Collaboration
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Create, collaborate, and communicate seamlessly
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notebooks, whiteboards, calls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={handleCreateNotebook}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </button>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'notebooks', label: 'Notebooks', icon: FileText, count: filteredNotebooks.length },
            { id: 'whiteboards', label: 'Whiteboards', icon: PenTool, count: 0 },
            { id: 'calls', label: 'Video Calls', icon: Video, count: videoCalls.length }
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
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'notebooks' && (
            <div className="space-y-6">
              {filteredNotebooks.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notebooks yet</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Create your first notebook to start organizing your thoughts
                  </p>
                  <button
                    onClick={handleCreateNotebook}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Create Notebook
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNotebooks.map((notebook) => (
                    <motion.div
                      key={notebook.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedNotebook(notebook)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                          {notebook.title}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {notebook.isPublic ? (
                            <Unlock className="w-4 h-4 text-green-500" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {notebook.content}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Modified {new Date(notebook.lastModified).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-2">
                          <Users className="w-3 h-3" />
                          <span>{notebook.collaborators.length}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'whiteboards' && (
            <div className="text-center py-12">
              <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Interactive Whiteboards</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Create collaborative whiteboards for brainstorming and visual thinking
              </p>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                Create Whiteboard
              </button>
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Video Calls</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Start or join video calls for real-time collaboration
              </p>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                Start Call
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectedNotebook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedNotebook(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedNotebook.title}
                </h2>
                <button
                  onClick={() => setSelectedNotebook(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedNotebook.content }} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
