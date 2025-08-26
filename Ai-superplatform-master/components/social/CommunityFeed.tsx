"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, Clock, Send, Plus, Trash2 } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    name: string;
  };
  _count: {
    comments: number;
  };
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    name: string;
  };
  createdAt: string;
}

interface CommunityFeedProps {
  communityId: string;
  userMembership?: string | null;
  onPostCreated?: () => void;
}

export default function CommunityFeed({
  communityId,
  userMembership,
  onPostCreated,
}: CommunityFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [creating, setCreating] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

  const fetchPosts = async() => {
    try {
      const response = await fetch(`/api/social/communities/${communityId}/posts`);
      if (!response.ok) {
throw new Error("Failed to fetch posts");
}

      const data = await response.json();
      setPosts(data.posts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  const fetchComments = async(postId: string) => {
    if (comments[postId]) {
return;
} // Already loaded

    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const response = await fetch(`/api/social/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(prev => ({ ...prev, [postId]: data.comments }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [communityId]);

  const handleCreatePost = async() => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("Please fill in both title and content");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`/api/social/communities/${communityId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (response.ok) {
        const createdPost = await response.json();
        setPosts(prev => [createdPost, ...prev]);
        setNewPost({ title: "", content: "" });
        setShowCreateForm(false);
        onPostCreated?.();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  const handleAddComment = async(postId: string) => {
    const commentContent = newComments[postId]?.trim();
    if (!commentContent) {
return;
}

    try {
      const response = await fetch(`/api/social/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment],
        }));
        setNewComments(prev => ({ ...prev, [postId]: "" }));

        // Update post comment count
        setPosts(prev =>
          prev.map(post =>
            post.id === postId
              ? { ...post, _count: { ...post._count, comments: post._count.comments + 1 } }
              : post
          )
        );
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    }
  };

  const togglePostExpansion = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      fetchComments(postId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Section */}
      {userMembership && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create a Post</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showCreateForm ? (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            ) : (
              <div className="space-y-4">
                <Input
                  placeholder="Post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCreatePost}
                    disabled={creating}
                  >
                    {creating ? "Creating..." : "Post"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewPost({ title: "", content: "" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {post.author.name || post.author.username}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <CardTitle className="text-lg mt-2">{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none mb-4">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePostExpansion(post.id)}
                    className="flex items-center space-x-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{post._count.comments}</span>
                  </Button>
                </div>
              </div>

              {/* Comments Section */}
              {expandedPost === post.id && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold mb-3">Comments</h4>

                  {/* Comments List */}
                  {loadingComments[post.id] ? (
                    <div className="space-y-2">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {(comments[post.id] || []).map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">
                                  {comment.author.name || comment.author.username}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComments[post.id] || ""}
                      onChange={(e) => setNewComments(prev => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))}
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(post.id)}
                      disabled={!newComments[post.id]?.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MessageSquare className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-500">
            {userMembership
              ? "Be the first to share something with the community!"
              : "Join the community to see posts and participate in discussions."
            }
          </p>
        </div>
      )}
    </div>
  );
}
