"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, MessageSquare, Plus, Eye } from "lucide-react";

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
  _count: {
    members: number;
    posts: number;
  };
  createdAt: string;
}

interface CommunityBrowserProps {
  onJoinCommunity?: (communityId: string) => void;
  onViewCommunity?: (communityId: string) => void;
}

export default function CommunityBrowser({
  onJoinCommunity,
  onViewCommunity,
}: CommunityBrowserProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  const fetchCommunities = async(pageNum: number = 1, search: string = "") => {
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "12",
        ...(search && { search }),
      });

      const response = await fetch(`/api/social/communities?${params}`);
      if (!response.ok) {
throw new Error("Failed to fetch communities");
}

      const data = await response.json();

      if (pageNum === 1) {
        setCommunities(data.communities);
      } else {
        setCommunities(prev => [...prev, ...data.communities]);
      }

      setHasMore(data.pagination.page < data.pagination.pages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching communities:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
    setHasMore(true);
    fetchCommunities(1, value);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCommunities(nextPage, searchTerm);
  };

  const handleJoinCommunity = async(communityId: string) => {
    setJoining(communityId);
    try {
      const response = await fetch(`/api/social/communities/${communityId}/membership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Update the community to show joined status
        setCommunities(prev =>
          prev.map(community =>
            community.id === communityId
              ? { ...community, _count: { ...community._count, members: community._count.members + 1 } }
              : community
          )
        );
        onJoinCommunity?.(communityId);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input placeholder="Search communities..." disabled />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search communities..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {communities.map((community) => (
          <Card key={community.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {community.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    by {community.owner.name || community.owner.username}
                  </p>
                </div>
                <Badge variant={community.isPublic ? "default" : "secondary"}>
                  {community.isPublic ? "Public" : "Private"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-3">
                {community.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{community._count.members}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{community._count.posts}</span>
                  </div>
                </div>
                <span className="text-xs">
                  {formatDate(community.createdAt)}
                </span>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewCommunity?.(community.id)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleJoinCommunity(community.id)}
                  disabled={joining === community.id}
                  className="flex-1"
                >
                  {joining === community.id ? (
                    "Joining..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Join
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More Communities"}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && communities.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No communities found
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Be the first to create a community!"
            }
          </p>
        </div>
      )}
    </div>
  );
}
