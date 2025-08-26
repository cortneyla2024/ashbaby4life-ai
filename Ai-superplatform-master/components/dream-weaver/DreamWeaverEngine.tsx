"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GeneratedGame {
  id: string
  title: string
  description: string
  gameType: string
  code: string
  assets: string
  isPublic: boolean
  createdAt: string
}

interface GeneratedActivity {
  id: string
  title: string
  description: string
  activityType: string
  plan: string
  materials: string
  duration: number
  isPublic: boolean
  createdAt: string
}

export default function DreamWeaverEngine() {
  const [games, setGames] = useState<GeneratedGame[]>([]);
  const [activities, setActivities] = useState<GeneratedActivity[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [generationType, setGenerationType] = useState<"game" | "activity">("game");

  useEffect(() => {
    fetchGames();
    fetchActivities();
  }, []);

  const fetchGames = async() => {
    try {
      const response = await fetch("/api/dream-weaver/games");
      if (response.ok) {
        const data = await response.json();
        setGames(data.games);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const fetchActivities = async() => {
    try {
      const response = await fetch("/api/dream-weaver/activities");
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const generateContent = async() => {
    if (!generationPrompt.trim()) {
return;
}

    setIsGenerating(true);
    try {
      const endpoint = generationType === "game" ? "/api/dream-weaver/games" : "/api/dream-weaver/activities";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: generationPrompt }),
      });

      if (response.ok) {
        setGenerationPrompt("");
        if (generationType === "game") {
          fetchGames();
        } else {
          fetchActivities();
        }
      }
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const playGame = (game: GeneratedGame) => {
    // In a real implementation, this would open the game in a new window or modal
    window.open(`/games/${game.id}`, "_blank");
  };

  const viewActivity = (activity: GeneratedActivity) => {
    // In a real implementation, this would show the activity details
    console.log("Viewing activity:", activity);
  };

  const getGameTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      puzzle: "🧩",
      trivia: "❓",
      adventure: "🗺️",
      social: "👥",
      strategy: "🎯",
      creative: "🎨",
    };
    return icons[type] || "🎮";
  };

  const getActivityTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      art_project: "🎨",
      storytelling: "📖",
      scavenger_hunt: "🔍",
      workshop: "🔧",
      cooking: "👨‍🍳",
      exercise: "🏃‍♂️",
    };
    return icons[type] || "🎯";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dream Weaver Engine</h2>
          <p className="text-muted-foreground">
            Create custom games and activities with AI
          </p>
        </div>
      </div>

      {/* Generation Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={generationType} onValueChange={(value) => setGenerationType(value as "game" | "activity")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="game">Game</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
          </Tabs>

          <Textarea
            placeholder={
              generationType === "game"
                ? "Describe the game you'd like to create (e.g., 'A puzzle game about history for my family')"
                : "Describe the activity you'd like to create (e.g., 'A creative art project for my community group')"
            }
            value={generationPrompt}
            onChange={(e) => setGenerationPrompt(e.target.value)}
            rows={3}
          />

          <Button
            onClick={generateContent}
            disabled={isGenerating || !generationPrompt.trim()}
            className="w-full"
          >
            {isGenerating ? "Generating..." : `Generate ${generationType === "game" ? "Game" : "Activity"}`}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content */}
      <Tabs defaultValue="games" className="space-y-4">
        <TabsList>
          <TabsTrigger value="games">Games ({games.length})</TabsTrigger>
          <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <Card key={game.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{getGameTypeIcon(game.gameType)}</span>
                    {game.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{game.gameType}</Badge>
                    {game.isPublic && <Badge variant="outline">Public</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{game.description}</p>
                  <div className="flex gap-2">
                    <Button onClick={() => playGame(game)} size="sm">
                      Play
                    </Button>
                    <Button variant="outline" size="sm">
                      Share
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(game.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity) => (
              <Card key={activity.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{getActivityTypeIcon(activity.activityType)}</span>
                    {activity.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{activity.activityType.replace("_", " ")}</Badge>
                    <Badge variant="outline">{activity.duration} min</Badge>
                    {activity.isPublic && <Badge variant="outline">Public</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <div className="flex gap-2">
                    <Button onClick={() => viewActivity(activity)} size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Share
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Generation Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Popular Games</h4>
              <div className="space-y-1">
                {[
                  "Family trivia night",
                  "Historical puzzle adventure",
                  "Math challenge game",
                  "Word association game",
                ].map((template) => (
                  <Button
                    key={template}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setGenerationType("game");
                      setGenerationPrompt(template);
                    }}
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Popular Activities</h4>
              <div className="space-y-1">
                {[
                  "Community art project",
                  "Guided storytelling session",
                  "Local scavenger hunt",
                  "Creative workshop",
                ].map((template) => (
                  <Button
                    key={template}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setGenerationType("activity");
                      setGenerationPrompt(template);
                    }}
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
