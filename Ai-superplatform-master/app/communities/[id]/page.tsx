/* eslint-disable indent */
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  MessageSquare,
  Calendar,
  Settings,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Crown,
} from "lucide-react";
import CommunityFeed from "@/components/social/CommunityFeed";

interface Community {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  owner: {
    id: string;
    username: string;
    name: string;
  };
  members: Array<{
    id: string;
    role: string;
    joinedAt: string;
    user: {
      id: string;
      username: string;
      name: string;
    };
  }>;
  _count: {
    members: number;
    posts: number;
  };
  userMembership: string | null;
}

export default function CommunityPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");

  const fetchCommunity = async() => {
    try {
      const response = await fetch(`/api/social/communities/${communityId}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/dashboard/social");
          return;
        }
        throw new Error("Failed to fetch community");
      }

      const data = await response.json();
      setCommunity(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching community:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
    }
  }, [communityId]);

  const handleJoinCommunity = async() => {
    setJoining(true);
    try {
      const response = await fetch(`/api/social/communities/${communityId}/membership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        fetchCommunity(); // Refresh community data
      } else {
        const error = await response.json();
        alert(error.error || "Failed to join community");
      }
    } catch (error) {
      console.error("Error joining community:", error);
      alert("Failed to join community");
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveCommunity = async() => {
    if (!confirm("Are you sure you want to leave this community?")) {
      return;
    }

    setLeaving(true);
    try {
      const response = await fetch(`/api/social/communities/${communityId}/membership`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/social");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to leave community");
      }
    } catch (error) {
      console.error("Error leaving community:", error);
      alert("Failed to leave community");
    } finally {
      setLeaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOwner = community?.userMembership === "ADMIN" && community?.owner.id === community?.members.find(m => m.userId === community?.owner.id)?.user.id;

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Community Not Found</h1>
          <p className="text-gray-600 mb-6">The community you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Button onClick={() => router.push("/dashboard/social")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Social Hub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/social")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
          <p className="text-gray-600 mt-1">{community.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          {community.userMembership ? (
            <>
              {isOwner && (
                <Badge variant="default" className="flex items-center space-x-1">
                  <Crown className="h-3 w-3" />
                  <span>Owner</span>
                </Badge>
              )}
              <Button
                variant="outline"
                onClick={handleLeaveCommunity}
                disabled={leaving || isOwner}
                className="flex items-center space-x-2"
              >
                <UserMinus className="h-4 w-4" />
                <span>{leaving ? "Leaving..." : "Leave"}</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={handleJoinCommunity}
              disabled={joining}
              className="flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>{joining ? "Joining..." : "Join Community"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{community._count.members}</div>
                <div className="text-sm text-gray-600">Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{community._count.posts}</div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {formatDate(community.createdAt).split(" ")[0]}
                </div>
                <div className="text-sm text-gray-600">Created</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Badge variant={community.isPublic ? "default" : "secondary"} className="h-8">
                {community.isPublic ? "Public" : "Private"}
              </Badge>
              <div className="text-sm text-gray-600">Access</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Community Feed */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feed" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Feed</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Members</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed">
              <CommunityFeed
                communityId={communityId}
                userMembership={community.userMembership}
                onPostCreated={fetchCommunity}
              />
            </TabsContent>

            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Community Members</span>
                    <Badge variant="secondary">{community.members.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {community.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {(member.user.name || member.user.username).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {member.user.name || member.user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              Joined {formatDate(member.joinedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {member.user.id === community.owner.id && (
                            <Badge variant="default" className="flex items-center space-x-1">
                              <Crown className="h-3 w-3" />
                              <span>Owner</span>
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Community Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Community Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Owner</h4>
                <p className="text-sm text-gray-600">
                  {community.owner.name || community.owner.username}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Created</h4>
                <p className="text-sm text-gray-600">
                  {formatDate(community.createdAt)}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Access</h4>
                              <Badge variant={community.isPublic ? "default" : "secondary"}>
                {community.isPublic ? "Public" : "Private"}
              </Badge>
              </div>
              {community.userMembership && (
                <div>
                  <h4 className="font-semibold text-gray-900">Your Role</h4>
                  <Badge variant="outline">
                    {community.userMembership}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {community.userMembership && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab("feed")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/dashboard/social/events")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
