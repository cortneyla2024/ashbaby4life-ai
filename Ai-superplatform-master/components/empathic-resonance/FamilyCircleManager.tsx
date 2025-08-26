"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface FamilyCircle {
  id: string
  name: string
  members: User[]
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
}

interface GuidedConversation {
  id: string
  topic: string
  aiModerator: string
  createdAt: string
}

export default function FamilyCircleManager() {
  const [circles, setCircles] = useState<FamilyCircle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<FamilyCircle | null>(null);
  const [conversations, setConversations] = useState<GuidedConversation[]>([]);
  const [newCircleName, setNewCircleName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isCreatingCircle, setIsCreatingCircle] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    fetchCircles();
  }, []);

  useEffect(() => {
    if (selectedCircle) {
      fetchConversations(selectedCircle.id);
    }
  }, [selectedCircle]);

  const fetchCircles = async() => {
    try {
      const response = await fetch("/api/empathic-resonance/circles");
      if (response.ok) {
        const data = await response.json();
        setCircles(data.circles);
      }
    } catch (error) {
      console.error("Error fetching circles:", error);
    }
  };

  const fetchConversations = async(circleId: string) => {
    try {
      const response = await fetch(`/api/empathic-resonance/circles/${circleId}/conversations`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const createCircle = async() => {
    if (!newCircleName.trim()) {
return;
}

    try {
      const response = await fetch("/api/empathic-resonance/circles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCircleName }),
      });

      if (response.ok) {
        setNewCircleName("");
        setIsCreatingCircle(false);
        fetchCircles();
      }
    } catch (error) {
      console.error("Error creating circle:", error);
    }
  };

  const addMember = async() => {
    if (!selectedCircle || !newMemberEmail.trim()) {
return;
}

    try {
      const response = await fetch(`/api/empathic-resonance/circles/${selectedCircle.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newMemberEmail }),
      });

      if (response.ok) {
        setNewMemberEmail("");
        setIsAddingMember(false);
        fetchCircles();
      }
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const startGuidedConversation = async(topic: string) => {
    if (!selectedCircle) {
return;
}

    try {
      const response = await fetch(`/api/empathic-resonance/circles/${selectedCircle.id}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (response.ok) {
        fetchConversations(selectedCircle.id);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Family Circles</h2>
        <Button onClick={() => setIsCreatingCircle(true)}>
          Create New Circle
        </Button>
      </div>

      {/* Create Circle Modal */}
      {isCreatingCircle && (
        <Card>
          <CardHeader>
            <CardTitle>Create Family Circle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Circle name"
              value={newCircleName}
              onChange={(e) => setNewCircleName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={createCircle}>Create</Button>
              <Button variant="outline" onClick={() => setIsCreatingCircle(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Circles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {circles.map((circle) => (
          <Card
            key={circle.id}
            className={`cursor-pointer transition-colors ${
              selectedCircle?.id === circle.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedCircle(circle)}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {circle.name}
                <Badge variant="secondary">{circle.members.length} members</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Created {new Date(circle.createdAt).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-1">
                  {circle.members.slice(0, 3).map((member) => (
                    <Badge key={member.id} variant="outline">
                      {member.name}
                    </Badge>
                  ))}
                  {circle.members.length > 3 && (
                    <Badge variant="outline">+{circle.members.length - 3} more</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Circle Details */}
      {selectedCircle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {selectedCircle.name}
              <Button onClick={() => setIsAddingMember(true)}>
                Add Member
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Member */}
            {isAddingMember && (
              <div className="space-y-4">
                <Input
                  placeholder="Member email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={addMember}>Add</Button>
                  <Button variant="outline" onClick={() => setIsAddingMember(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Guided Conversations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Guided Conversations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Resolving Conflict",
                  "Expressing Gratitude",
                  "Planning the Future",
                  "Sharing Memories",
                  "Setting Boundaries",
                  "Celebrating Achievements",
                ].map((topic) => (
                  <Button
                    key={topic}
                    variant="outline"
                    onClick={() => startGuidedConversation(topic)}
                    className="h-auto p-4 text-left"
                  >
                    <div>
                      <div className="font-medium">{topic}</div>
                      <div className="text-sm text-muted-foreground">
                        Start an AI-moderated conversation
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Recent Conversations */}
            {conversations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Conversations</h3>
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <Card key={conversation.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{conversation.topic}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(conversation.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Continue
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
