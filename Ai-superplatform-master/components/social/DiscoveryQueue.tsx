"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Users, Calendar, Lightbulb, TrendingUp, Heart } from "lucide-react";

interface Recommendation {
  id: string;
  name: string;
  description: string;
  reason: string;
}

interface DiscoveryData {
  recommendations: {
    communities: Recommendation[];
    events: Recommendation[];
    insights: string;
    suggestions: string;
  };
  userProfile: {
    goalCount: number;
    journalEntryCount: number;
    communityCount: number;
    eventCount: number;
  };
}

interface DiscoveryQueueProps {
  onJoinCommunity?: (communityId: string) => void;
  onViewCommunity?: (communityId: string) => void;
  onViewEvent?: (eventId: string) => void;
  onRSVP?: (eventId: string, status: string) => void;
}

export default function DiscoveryQueue({
  onJoinCommunity,
  onViewCommunity,
  onViewEvent,
  onRSVP,
}: DiscoveryQueueProps) {
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [rsvping, setRsvping] = useState<string | null>(null);

  const fetchDiscoveryData = async() => {
    try {
      const response = await fetch("/api/social/discover");
      if (!response.ok) {
throw new Error("Failed to fetch discovery data");
}

      const data = await response.json();
      setDiscoveryData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching discovery data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoveryData();
  }, []);

  const handleJoinCommunity = async(communityId: string) => {
    setJoining(communityId);
    try {
      const response = await fetch(`/api/social/communities/${communityId}/membership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        onJoinCommunity?.(communityId);
        // Refresh discovery data to update recommendations
        fetchDiscoveryData();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to join community");
      }
    } catch (error) {
      console.error("Error joining community:", error);
      alert("Failed to join community");
    } finally {
      setJoining(null);
    }
  };

  const handleRSVP = async(eventId: string, status: string) => {
    setRsvping(eventId);
    try {
      const response = await fetch(`/api/social/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        onRSVP?.(eventId, status);
        // Refresh discovery data to update recommendations
        fetchDiscoveryData();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to RSVP");
      }
    } catch (error) {
      console.error("Error RSVPing to event:", error);
      alert("Failed to RSVP to event");
    } finally {
      setRsvping(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>AI Discovery</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!discoveryData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>AI Discovery</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Unable to load personalized recommendations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5" />
          <span>AI Discovery</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Profile Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Your Social Profile
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{discoveryData.userProfile.goalCount}</div>
              <div className="text-sm text-gray-600">Active Goals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{discoveryData.userProfile.journalEntryCount}</div>
              <div className="text-sm text-gray-600">Journal Entries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{discoveryData.userProfile.communityCount}</div>
              <div className="text-sm text-gray-600">Communities</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{discoveryData.userProfile.eventCount}</div>
              <div className="text-sm text-gray-600">Events</div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
            AI Insights
          </h3>
          <p className="text-sm text-gray-700 mb-3">{discoveryData.recommendations.insights}</p>
          <p className="text-sm text-gray-600">{discoveryData.recommendations.suggestions}</p>
        </div>

        {/* Recommendations Tabs */}
        <Tabs defaultValue="communities" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="communities" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Communities</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="communities" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {discoveryData.recommendations.communities.map((community) => (
                <Card key={community.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{community.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        <Heart className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {community.description}
                    </p>
                    <p className="text-xs text-blue-600 mb-4 italic">
                      &quot;{community.reason}&quot;
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewCommunity?.(community.id)}
                        className="flex-1"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleJoinCommunity(community.id)}
                        disabled={joining === community.id}
                        className="flex-1"
                      >
                        {joining === community.id ? "Joining..." : "Join"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {discoveryData.recommendations.communities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No community recommendations available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {discoveryData.recommendations.events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{event.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        <Heart className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {event.description}
                    </p>
                    <p className="text-xs text-blue-600 mb-4 italic">
                      &quot;{event.reason}&quot;
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewEvent?.(event.id)}
                        className="flex-1"
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRSVP(event.id, "ATTENDING")}
                        disabled={rsvping === event.id}
                        className="flex-1"
                      >
                        {rsvping === event.id ? "RSVPing..." : "Attend"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {discoveryData.recommendations.events.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No event recommendations available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Refresh Button */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={fetchDiscoveryData}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Refresh Recommendations</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
