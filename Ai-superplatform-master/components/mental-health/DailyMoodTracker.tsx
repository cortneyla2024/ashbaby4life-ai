"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Smile, Meh, Frown, Heart, Zap, Coffee, Book, Music, Users, Home } from "lucide-react";
import { toast } from "sonner";

interface MoodEntry {
  moodScore: number;
  notes?: string;
  tags: string[];
}

const moodIcons = [
  { score: 1, icon: Frown, label: "Very Low", color: "text-red-500" },
  { score: 2, icon: Frown, label: "Low", color: "text-orange-500" },
  { score: 3, icon: Meh, label: "Below Average", color: "text-yellow-500" },
  { score: 4, icon: Meh, label: "Average", color: "text-yellow-400" },
  { score: 5, icon: Meh, label: "Neutral", color: "text-gray-500" },
  { score: 6, icon: Smile, label: "Above Average", color: "text-blue-400" },
  { score: 7, icon: Smile, label: "Good", color: "text-blue-500" },
  { score: 8, icon: Heart, label: "Great", color: "text-pink-500" },
  { score: 9, icon: Heart, label: "Excellent", color: "text-pink-600" },
  { score: 10, icon: Zap, label: "Amazing", color: "text-purple-600" },
];

const suggestedTags = [
  { icon: Coffee, label: "work" },
  { icon: Home, label: "family" },
  { icon: Users, label: "social" },
  { icon: Music, label: "hobby" },
  { icon: Book, label: "learning" },
  { icon: Zap, label: "stress" },
  { icon: Heart, label: "love" },
  { icon: Smile, label: "achievement" },
];

export default function DailyMoodTracker() {
  const [moodScore, setMoodScore] = useState(5);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentMood = moodIcons.find(mood => mood.score === moodScore);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = async() => {
    if (moodScore < 1 || moodScore > 10) {
      toast.error("Please select a valid mood score");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/mental-health/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moodScore,
          notes: notes.trim() || undefined,
          tags,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Mood entry saved successfully!");

        // Reset form
        setMoodScore(5);
        setNotes("");
        setTags([]);

        // Show AI insight if available
        if (result.aiInsight) {
          toast.info(result.aiInsight, {
            duration: 5000,
          });
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save mood entry");
      }
    } catch (error) {
      toast.error("Failed to save mood entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Score Section */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {currentMood && (
                <currentMood.icon className={`h-12 w-12 ${currentMood.color}`} />
              )}
            </div>
            <p className="text-lg font-medium">{currentMood?.label}</p>
            <p className="text-sm text-muted-foreground">Score: {moodScore}/10</p>
          </div>

          <Slider
            value={[moodScore]}
            onValueChange={(value) => setMoodScore(value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Very Low</span>
            <span>Very High</span>
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">How was your day? (optional)</label>
          <Textarea
            placeholder="Share what's on your mind, what made you feel this way, or any thoughts you'd like to remember..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Tags Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Tags (optional)</label>

          {/* Suggested Tags */}
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <Button
                key={tag.label}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedTag(tag.label)}
                disabled={tags.includes(tag.label)}
                className="h-8"
              >
                <tag.icon className="h-3 w-3 mr-1" />
                {tag.label}
              </Button>
            ))}
          </div>

          {/* Custom Tag Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              size="sm"
            >
              Add
            </Button>
          </div>

          {/* Selected Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? "Saving..." : "Save Mood Entry"}
        </Button>
      </CardContent>
    </Card>
  );
}
