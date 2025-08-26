'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
  };
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'voice';
  reactions: string[];
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'channel';
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  members: number;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  category: string;
  image: string;
}

export default function CommunityPage() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const chatRooms: ChatRoom[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      type: 'direct',
      avatar: '/avatars/sarah.jpg',
      lastMessage: 'Thanks for the help with the project!',
      lastMessageTime: '2:30 PM',
      unreadCount: 2,
      online: true,
      members: 2,
    },
    {
      id: '2',
      name: 'Design Team',
      type: 'group',
      avatar: '/avatars/design-team.jpg',
      lastMessage: 'New mockups are ready for review',
      lastMessageTime: '1:45 PM',
      unreadCount: 0,
      online: false,
      members: 8,
    },
    {
      id: '3',
      name: 'Tech Discussion',
      type: 'channel',
      avatar: '/avatars/tech.jpg',
      lastMessage: 'Anyone tried the new AI framework?',
      lastMessageTime: '12:20 PM',
      unreadCount: 5,
      online: true,
      members: 24,
    },
    {
      id: '4',
      name: 'Mike Chen',
      type: 'direct',
      avatar: '/avatars/mike.jpg',
      lastMessage: 'Meeting at 3 PM today',
      lastMessageTime: '11:15 AM',
      unreadCount: 0,
      online: false,
      members: 2,
    },
  ];

  const messages: Message[] = [
    {
      id: '1',
      sender: {
        id: '1',
        name: 'Sarah Johnson',
        avatar: '/avatars/sarah.jpg',
        online: true,
      },
      content: 'Hey! How are you doing today?',
      timestamp: '2:25 PM',
      type: 'text',
      reactions: ['👍'],
    },
    {
      id: '2',
      sender: {
        id: 'me',
        name: 'You',
        avatar: '/avatars/me.jpg',
        online: true,
      },
      content: 'I\'m doing great! Just finished working on the new feature.',
      timestamp: '2:27 PM',
      type: 'text',
      reactions: [],
    },
    {
      id: '3',
      sender: {
        id: '1',
        name: 'Sarah Johnson',
        avatar: '/avatars/sarah.jpg',
        online: true,
      },
      content: 'That sounds exciting! Can you show me what you built?',
      timestamp: '2:28 PM',
      type: 'text',
      reactions: ['👀'],
    },
    {
      id: '4',
      sender: {
        id: '1',
        name: 'Sarah Johnson',
        avatar: '/avatars/sarah.jpg',
        online: true,
      },
      content: 'Thanks for the help with the project!',
      timestamp: '2:30 PM',
      type: 'text',
      reactions: ['❤️', '🙏'],
    },
  ];

  const events: CommunityEvent[] = [
    {
      id: '1',
      title: 'Tech Meetup: AI & Machine Learning',
      description: 'Join us for an evening of discussions about the latest developments in AI and ML.',
      date: '2024-01-15',
      time: '7:00 PM',
      location: 'Tech Hub Downtown',
      attendees: 45,
      maxAttendees: 60,
      category: 'Technology',
      image: '/events/ai-meetup.jpg',
    },
    {
      id: '2',
      title: 'Design Workshop: UI/UX Best Practices',
      description: 'Learn the latest design principles and tools for creating amazing user experiences.',
      date: '2024-01-20',
      time: '2:00 PM',
      location: 'Creative Studio',
      attendees: 28,
      maxAttendees: 30,
      category: 'Design',
      image: '/events/design-workshop.jpg',
    },
    {
      id: '3',
      title: 'Networking Mixer',
      description: 'Connect with professionals from various industries in a relaxed setting.',
      date: '2024-01-25',
      time: '6:30 PM',
      location: 'Downtown Lounge',
      attendees: 62,
      maxAttendees: 80,
      category: 'Networking',
      image: '/events/networking.jpg',
    },
  ];

  const handleSendMessage = () => {
    if (message.trim() && activeChat) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chatRooms.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-gray-600">Connect, chat, and collaborate with your community</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Create Group</Button>
          <Button>New Event</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      activeChat === chat.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setActiveChat(chat.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <img src={chat.avatar} alt={chat.name} />
                        </Avatar>
                        {chat.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{chat.name}</p>
                          <span className="text-xs text-gray-500">{chat.lastMessageTime}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            {activeChat ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <img src={chatRooms.find(c => c.id === activeChat)?.avatar} alt="Chat" />
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {chatRooms.find(c => c.id === activeChat)?.name}
                      </CardTitle>
                      <CardDescription>
                        {chatRooms.find(c => c.id === activeChat)?.online ? 'Online' : 'Offline'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col">
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender.id === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender.id === 'me'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {msg.sender.id !== 'me' && (
                            <p className="text-xs font-medium mb-1">{msg.sender.name}</p>
                          )}
                          <p className="text-sm">{msg.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">{msg.timestamp}</span>
                            {msg.reactions.length > 0 && (
                              <div className="flex space-x-1">
                                {msg.reactions.map((reaction, index) => (
                                  <span key={index} className="text-xs">
                                    {reaction}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage}>Send</Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a chat to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Community Events */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <Button variant="outline">View All Events</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary">{event.category}</Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium">{event.date}</p>
                  <p className="text-sm opacity-90">{event.time}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                <CardDescription className="mb-4">{event.description}</CardDescription>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>📍 {event.location}</span>
                  <span>👥 {event.attendees}/{event.maxAttendees}</span>
                </div>
                <Button className="w-full">Join Event</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Contacts</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <div className="text-2xl">👥</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Groups</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="text-2xl">🏘️</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Events This Month</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <div className="text-2xl">📅</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Messages Today</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <div className="text-2xl">💬</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
