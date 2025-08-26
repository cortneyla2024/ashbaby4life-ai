'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  email: string;
  permissions: string[];
}

interface GuidedConversation {
  id: string;
  type: 'conflict-resolution' | 'gratitude' | 'future-planning' | 'memories' | 'boundaries' | 'achievements';
  title: string;
  description: string;
  participants: string[];
  status: 'scheduled' | 'active' | 'completed';
  aiModerator: boolean;
}

interface FamilyCircle {
  id: string;
  name: string;
  description: string;
  members: FamilyMember[];
  conversations: GuidedConversation[];
  createdAt: Date;
}

export function FamilyCircleManager() {
  const [circles, setCircles] = useState<FamilyCircle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<FamilyCircle | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);

  const [newCircle, setNewCircle] = useState({
    name: '',
    description: ''
  });

  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    email: ''
  });

  const [newConversation, setNewConversation] = useState({
    type: 'gratitude' as GuidedConversation['type'],
    title: '',
    description: ''
  });

  const conversationTypes = [
    { value: 'conflict-resolution', label: 'Conflict Resolution' },
    { value: 'gratitude', label: 'Express Gratitude' },
    { value: 'future-planning', label: 'Plan the Future' },
    { value: 'memories', label: 'Share Memories' },
    { value: 'boundaries', label: 'Set Boundaries' },
    { value: 'achievements', label: 'Celebrate Achievements' }
  ];

  const createCircle = () => {
    if (!newCircle.name.trim()) return;

    const circle: FamilyCircle = {
      id: `circle_${Date.now()}`,
      name: newCircle.name,
      description: newCircle.description,
      members: [],
      conversations: [],
      createdAt: new Date()
    };

    setCircles([...circles, circle]);
    setNewCircle({ name: '', description: '' });
    setShowCreateForm(false);
  };

  const addMember = () => {
    if (!selectedCircle || !newMember.name.trim()) return;

    const member: FamilyMember = {
      id: `member_${Date.now()}`,
      name: newMember.name,
      role: newMember.role,
      email: newMember.email,
      permissions: ['view', 'participate']
    };

    const updatedCircle = {
      ...selectedCircle,
      members: [...selectedCircle.members, member]
    };

    setCircles(circles.map(c => c.id === selectedCircle.id ? updatedCircle : c));
    setSelectedCircle(updatedCircle);
    setNewMember({ name: '', role: '', email: '' });
    setShowAddMember(false);
  };

  const createConversation = () => {
    if (!selectedCircle || !newConversation.title.trim()) return;

    const conversation: GuidedConversation = {
      id: `conv_${Date.now()}`,
      type: newConversation.type,
      title: newConversation.title,
      description: newConversation.description,
      participants: selectedCircle.members.map(m => m.id),
      status: 'scheduled',
      aiModerator: true
    };

    const updatedCircle = {
      ...selectedCircle,
      conversations: [...selectedCircle.conversations, conversation]
    };

    setCircles(circles.map(c => c.id === selectedCircle.id ? updatedCircle : c));
    setSelectedCircle(updatedCircle);
    setNewConversation({ type: 'gratitude', title: '', description: '' });
    setShowNewConversation(false);
  };

  const startConversation = (conversationId: string) => {
    if (!selectedCircle) return;

    const updatedCircle = {
      ...selectedCircle,
      conversations: selectedCircle.conversations.map(c =>
        c.id === conversationId ? { ...c, status: 'active' as const } : c
      )
    };

    setCircles(circles.map(c => c.id === selectedCircle.id ? updatedCircle : c));
    setSelectedCircle(updatedCircle);
  };

  const getConversationGuidance = (type: GuidedConversation['type']) => {
    const guidance = {
      'conflict-resolution': {
        title: 'Conflict Resolution Framework',
        steps: [
          'Each person shares their perspective without interruption',
          'Identify the underlying needs and concerns',
          'Brainstorm solutions together',
          'Agree on next steps and follow-up'
        ],
        aiPrompts: [
          'What would help you feel heard in this situation?',
          'What is most important to you in resolving this?',
          'How can we move forward in a way that works for everyone?'
        ]
      },
      'gratitude': {
        title: 'Gratitude Expression',
        steps: [
          'Share specific things you appreciate about each person',
          'Express how their actions have impacted you positively',
          'Acknowledge the effort and care they show',
          'Discuss ways to continue showing appreciation'
        ],
        aiPrompts: [
          'What specific action or quality are you grateful for?',
          'How has this person made your life better?',
          'What would you like to thank them for today?'
        ]
      },
      'future-planning': {
        title: 'Future Planning Together',
        steps: [
          'Share individual goals and dreams',
          'Identify shared aspirations',
          'Discuss how to support each other',
          'Create actionable steps and timelines'
        ],
        aiPrompts: [
          'What are your hopes for the future?',
          'How can we support each other in achieving our goals?',
          'What would success look like for our family?'
        ]
      },
      'memories': {
        title: 'Memory Sharing',
        steps: [
          'Share a favorite memory involving the family',
          'Describe what made it special',
          'Reflect on how it shaped your relationships',
          'Discuss creating new meaningful memories'
        ],
        aiPrompts: [
          'What memory brings you the most joy when you think about it?',
          'What made this moment so special?',
          'How can we create more moments like this?'
        ]
      },
      'boundaries': {
        title: 'Setting Healthy Boundaries',
        steps: [
          'Express your needs and limits clearly',
          'Listen to others\' boundaries with respect',
          'Discuss how to honor each other\'s boundaries',
          'Agree on ways to communicate when boundaries are crossed'
        ],
        aiPrompts: [
          'What do you need to feel safe and respected?',
          'How can we better support each other\'s boundaries?',
          'What would help you feel more comfortable in our interactions?'
        ]
      },
      'achievements': {
        title: 'Celebrating Achievements',
        steps: [
          'Share recent accomplishments and milestones',
          'Acknowledge the effort and growth involved',
          'Express pride and support for each other',
          'Discuss goals and aspirations for the future'
        ],
        aiPrompts: [
          'What are you most proud of accomplishing recently?',
          'How did you overcome challenges to achieve this?',
          'What support helped you reach this milestone?'
        ]
      }
    };

    return guidance[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Family Circle Manager</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          Create New Circle
        </Button>
      </div>

      {/* Create Circle Form */}
      {showCreateForm && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create Family Circle</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Circle Name
              </label>
              <Input
                value={newCircle.name}
                onChange={(e) => setNewCircle({ ...newCircle, name: e.target.value })}
                placeholder="Enter circle name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={newCircle.description}
                onChange={(e) => setNewCircle({ ...newCircle, description: e.target.value })}
                placeholder="Describe the purpose of this circle"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button onClick={createCircle}>Create Circle</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Circles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {circles.map((circle) => (
          <Card
            key={circle.id}
            className={`p-6 cursor-pointer transition-shadow hover:shadow-lg ${
              selectedCircle?.id === circle.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedCircle(circle)}
          >
            <h3 className="text-lg font-semibold mb-2">{circle.name}</h3>
            <p className="text-gray-600 mb-4">{circle.description}</p>
            <div className="text-sm text-gray-500">
              {circle.members.length} members • {circle.conversations.length} conversations
            </div>
          </Card>
        ))}
      </div>

      {/* Selected Circle Details */}
      {selectedCircle && (
        <Card className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedCircle.name}</h2>
              <p className="text-gray-600">{selectedCircle.description}</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => setShowAddMember(true)}>
                Add Member
              </Button>
              <Button onClick={() => setShowNewConversation(true)}>
                New Conversation
              </Button>
            </div>
          </div>

          {/* Members Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedCircle.members.map((member) => (
                <div key={member.id} className="p-4 border rounded-lg">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-600">{member.role}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversations Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Guided Conversations</h3>
            <div className="space-y-4">
              {selectedCircle.conversations.map((conversation) => {
                const guidance = getConversationGuidance(conversation.type);
                return (
                  <Card key={conversation.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{conversation.title}</h4>
                        <p className="text-sm text-gray-600">{conversation.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            conversation.status === 'active' ? 'bg-green-100 text-green-800' :
                            conversation.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {conversation.status}
                          </span>
                          {conversation.aiModerator && (
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              AI Moderated
                            </span>
                          )}
                        </div>
                      </div>
                      {conversation.status === 'scheduled' && (
                        <Button size="sm" onClick={() => startConversation(conversation.id)}>
                          Start
                        </Button>
                      )}
                    </div>
                    
                    {conversation.status === 'active' && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium mb-2">{guidance.title}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="font-medium text-sm mb-2">Steps:</h6>
                            <ol className="text-sm space-y-1">
                              {guidance.steps.map((step, index) => (
                                <li key={index} className="flex">
                                  <span className="font-medium mr-2">{index + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                          <div>
                            <h6 className="font-medium text-sm mb-2">AI Prompts:</h6>
                            <ul className="text-sm space-y-1">
                              {guidance.aiPrompts.map((prompt, index) => (
                                <li key={index} className="flex">
                                  <span className="font-medium mr-2">•</span>
                                  <span>{prompt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Add Member Modal */}
      {showAddMember && selectedCircle && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add Family Member</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <Input
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Enter member name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <Input
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                placeholder="e.g., Parent, Child, Sibling"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="flex space-x-3">
              <Button onClick={addMember}>Add Member</Button>
              <Button variant="outline" onClick={() => setShowAddMember(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* New Conversation Modal */}
      {showNewConversation && selectedCircle && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create Guided Conversation</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversation Type
              </label>
              <Select
                value={newConversation.type}
                onChange={(e) => setNewConversation({ ...newConversation, type: e.target.value as GuidedConversation['type'] })}
                options={conversationTypes}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <Input
                value={newConversation.title}
                onChange={(e) => setNewConversation({ ...newConversation, title: e.target.value })}
                placeholder="Enter conversation title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={newConversation.description}
                onChange={(e) => setNewConversation({ ...newConversation, description: e.target.value })}
                placeholder="Describe the purpose of this conversation"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button onClick={createConversation}>Create Conversation</Button>
              <Button variant="outline" onClick={() => setShowNewConversation(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
