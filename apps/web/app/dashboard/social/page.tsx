"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Plus,
  Send,
  UserPlus,
  UserCheck,
  Calendar,
  MapPin
} from "lucide-react";

interface Post {
  id: string;
  author: {
    name: string;
    verified: boolean;
  };
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked: boolean;
}

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
  category: string;
}

export default function SocialDashboard() {
  const [activeTab, setActiveTab] = useState("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [newPostContent, setNewPostContent] = useState("");

  useEffect(() => {
    const mockPosts: Post[] = [
      {
        id: '1',
        author: {
          name: 'Sarah Johnson',
          verified: true
        },
        content: 'Just completed my mindfulness course! Feeling so much more centered and focused. 🧘‍♀️✨',
        likes: 24,
        comments: 8,
        timestamp: '2 hours ago',
        isLiked: true
      },
      {
        id: '2',
        author: {
          name: 'Mike Chen',
          verified: false
        },
        content: 'Great discussion in the Personal Finance community today about emergency funds. 💰',
        likes: 15,
        comments: 12,
        timestamp: '4 hours ago',
        isLiked: false
      }
    ];

    const mockCommunities: Community[] = [
      {
        id: '1',
        name: 'Mindfulness & Wellness',
        description: 'A supportive community for mental health and wellness practices',
        memberCount: 1247,
        isJoined: true,
        category: 'Health & Wellness'
      },
      {
        id: '2',
        name: 'Personal Finance Masters',
        description: 'Learn and share strategies for financial independence',
        memberCount: 2156,
        isJoined: false,
        category: 'Finance'
      }
    ];

    setPosts(mockPosts);
    setCommunities(mockCommunities);
  }, []);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleJoinCommunity = (communityId: string) => {
    setCommunities(prev => prev.map(community => 
      community.id === communityId 
        ? { ...community, isJoined: !community.isJoined, memberCount: community.isJoined ? community.memberCount - 1 : community.memberCount + 1 }
        : community
    ));
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        verified: true
      },
      content: newPostContent,
      likes: 0,
      comments: 0,
      timestamp: 'Just now',
      isLiked: false
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent("");
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Social Dashboard</h1>
          <p className="text-muted-foreground">
            Connect with others and join communities
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <textarea
                  placeholder="What's on your mind?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{post.author.name}</span>
                        {post.author.verified && (
                          <Badge variant="outline" className="text-xs">Verified</Badge>
                        )}
                        <span className="text-sm text-muted-foreground">• {post.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <p className="mb-4">{post.content}</p>

                  <div className="flex items-center gap-6 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={post.isLiked ? 'text-red-500' : ''}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="communities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <Card key={community.id} className="overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{community.category}</Badge>
                    {community.isJoined && (
                      <Badge className="bg-green-100 text-green-800">Joined</Badge>
                    )}
                  </div>
                  
                  <h3 className="font-medium mb-2">{community.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {community.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{community.memberCount} members</span>
                  </div>
                  
                  <Button 
                    className="w-full"
                    variant={community.isJoined ? "outline" : "default"}
                    onClick={() => handleJoinCommunity(community.id)}
                  >
                    {community.isJoined ? 'Leave Community' : 'Join Community'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">Mindfulness Workshop</h3>
                      <p className="text-sm text-muted-foreground">
                        Join us for a guided meditation session
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Free</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Tomorrow, 2:00 PM</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>Virtual Event</span>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    Join Event
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">Financial Planning Meetup</h3>
                      <p className="text-sm text-muted-foreground">
                        Learn about investment strategies and retirement planning
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">$15</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Dec 20, 6:30 PM</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>Community Center</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
