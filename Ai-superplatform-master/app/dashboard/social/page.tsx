"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Search,
  Plus,
  MessageSquare,
  TrendingUp,
  Globe,
  UserPlus,
} from "lucide-react";
import CommunityBrowser from "@/components/social/CommunityBrowser";
import EventCalendar from "@/components/social/EventCalendar";
import DiscoveryQueue from "@/components/social/DiscoveryQueue";
import { useRouter } from "next/navigation";

interface UserMembership {
  communityId: string;
  role: string;
  community: {
    id: string;
    name: string;
    description: string;
    _count: {
      members: number;
      posts: number;
    };
  };
}

interface UserEvent {
  eventId: string;
  status: string;
  event: {
    id: string;
    name: string;
    date: string;
    location: string;
    _count: {
      rsvps: number;
    };
  };
}

export default function SocialDashboard() {
  const router = useRouter();
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("discovery");

  const fetchUserData = async() => {
    try {
      // Fetch user's community memberships
      const membershipsResponse = await fetch("/api/social/user/memberships");
      if (membershipsResponse.ok) {
        const membershipsData = await membershipsResponse.json();
        setUserMemberships(membershipsData.memberships || []);
      }

      // Fetch user's event RSVPs
      const eventsResponse = await fetch("/api/social/user/events");
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setUserEvents(eventsData.events || []);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleJoinCommunity = (communityId: string) => {
    // Refresh user data after joining
    fetchUserData();
  };

  const handleViewCommunity = (communityId: string) => {
    router.push(`/communities/${communityId}`);
  };

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleRSVP = (eventId: string, status: string) => {
    // Refresh user data after RSVP
    fetchUserData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Connection Hub</h1>
          <p className="text-gray-600 mt-2">
            Build meaningful connections and discover communities that align with your interests
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => router.push("/dashboard/social/communities")}>
            <Search className="h-4 w-4 mr-2" />
            Browse Communities
          </Button>
          <Button onClick={() => router.push("/dashboard/social/events")}>
            <Calendar className="h-4 w-4 mr-2" />
            View Events
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{userMemberships.length}</div>
                <div className="text-sm text-gray-600">Communities</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{userEvents.length}</div>
                <div className="text-sm text-gray-600">Events</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {userMemberships.reduce((total, membership) => total + membership.community._count.posts, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Posts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {userMemberships.reduce((total, membership) => total + membership.community._count.members, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discovery" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>AI Discovery</span>
          </TabsTrigger>
          <TabsTrigger value="communities" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>My Communities</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>My Events</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discovery" className="space-y-6">
          <DiscoveryQueue
            onJoinCommunity={handleJoinCommunity}
            onViewCommunity={handleViewCommunity}
            onViewEvent={handleViewEvent}
            onRSVP={handleRSVP}
          />
        </TabsContent>

        <TabsContent value="communities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Communities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>My Communities</span>
                  </span>
                  <Badge variant="secondary">{userMemberships.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userMemberships.length > 0 ? (
                  <div className="space-y-3">
                    {userMemberships.map((membership) => (
                      <div
                        key={membership.communityId}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewCommunity(membership.communityId)}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {membership.community.name}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {membership.community.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>{membership.community._count.members} members</span>
                            <span>{membership.community._count.posts} posts</span>
                            <Badge variant="outline" className="text-xs">
                              {membership.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">You haven&apos;t joined any communities yet</p>
                    <Button onClick={() => setActiveTab("discovery")}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Discover Communities
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Community Browser */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Discover Communities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CommunityBrowser
                  onJoinCommunity={handleJoinCommunity}
                  onViewCommunity={handleViewCommunity}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>My Events</span>
                  </span>
                  <Badge variant="secondary">{userEvents.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userEvents.length > 0 ? (
                  <div className="space-y-3">
                    {userEvents.map((userEvent) => (
                      <div
                        key={userEvent.eventId}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewEvent(userEvent.eventId)}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {userEvent.event.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(userEvent.event.date)} • {userEvent.event.location}
                          </p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>{userEvent.event._count.rsvps} attending</span>
                            <Badge variant="outline" className="text-xs">
                              {userEvent.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">You haven&apos;t RSVP&apos;d to any events yet</p>
                    <Button onClick={() => setActiveTab("discovery")}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Discover Events
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Event Calendar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventCalendar
                  onViewEvent={handleViewEvent}
                  onRSVP={handleRSVP}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
