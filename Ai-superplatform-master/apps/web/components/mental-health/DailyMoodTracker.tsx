"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smile, 
  Frown, 
  Meh, 
  Heart, 
  TrendingUp, 
  Calendar,
  MessageCircle,
  Sparkles
} from "lucide-react";

interface MoodEntry {
  id: string;
  mood: number;
  timestamp: Date;
  notes?: string;
}

const moodEmojis = [
  { value: 1, emoji: "😢", label: "Very Sad", color: "text-red-500" },
  { value: 2, emoji: "😞", label: "Sad", color: "text-orange-500" },
  { value: 3, emoji: "😐", label: "Neutral", color: "text-yellow-500" },
  { value: 4, emoji: "🙂", label: "Good", color: "text-blue-500" },
  { value: 5, emoji: "😊", label: "Very Good", color: "text-green-500" },
  { value: 6, emoji: "😄", label: "Great", color: "text-emerald-500" },
  { value: 7, emoji: "🤩", label: "Excellent", color: "text-purple-500" },
  { value: 8, emoji: "🥰", label: "Amazing", color: "text-pink-500" },
  { value: 9, emoji: "🤗", label: "Incredible", color: "text-indigo-500" },
  { value: 10, emoji: "🌟", label: "Perfect", color: "text-amber-500" },
];

const moodInsights = [
  "You're doing great! Keep up the positive energy.",
  "Remember, it's okay to have ups and downs.",
  "Consider trying a quick meditation or walk.",
  "Your mood is trending upward - that's wonderful!",
  "Take a moment to appreciate the good things today.",
  "You've been consistent with your mood tracking - that's commitment!",
];

export default function DailyMoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insight, setInsight] = useState("");

  useEffect(() => {
    // Check if user has already logged mood today
    const today = new Date().toDateString();
    const savedEntry = localStorage.getItem(`mood_${today}`);
    if (savedEntry) {
      setTodayEntry(JSON.parse(savedEntry));
      setSelectedMood(JSON.parse(savedEntry).mood);
      setNotes(JSON.parse(savedEntry).notes || "");
    }

    // Generate random insight
    setInsight(moodInsights[Math.floor(Math.random() * moodInsights.length)]);
  }, []);

  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood);
  };

  const handleSubmit = async () => {
    if (selectedMood === null) return;

    setIsSubmitting(true);
    
    try {
      const entry: MoodEntry = {
        id: Date.now().toString(),
        mood: selectedMood,
        timestamp: new Date(),
        notes: notes.trim() || undefined,
      };

      // Save to localStorage for demo
      const today = new Date().toDateString();
      localStorage.setItem(`mood_${today}`, JSON.stringify(entry));
      
      // In a real app, this would be an API call
      // await fetch('/api/mood', { method: 'POST', body: JSON.stringify(entry) });
      
      setTodayEntry(entry);
      
      // Show success feedback
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error saving mood:', error);
      setIsSubmitting(false);
    }
  };

  const getMoodColor = (mood: number) => {
    return moodEmojis.find(m => m.value === mood)?.color || "text-gray-500";
  };

  const getMoodLabel = (mood: number) => {
    return moodEmojis.find(m => m.value === mood)?.label || "Unknown";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          Daily Mood Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {todayEntry ? (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">
              {moodEmojis.find(m => m.value === todayEntry.mood)?.emoji}
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                {getMoodLabel(todayEntry.mood)}
              </h3>
              <p className="text-sm text-muted-foreground">
                You rated your mood as {todayEntry.mood}/10
              </p>
              {todayEntry.notes && (
                <p className="text-sm italic">"{todayEntry.notes}"</p>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              Logged today
            </Badge>
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>{insight}</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">How are you feeling today?</h3>
                <p className="text-sm text-muted-foreground">
                  Rate your mood on a scale of 1-10
                </p>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {moodEmojis.map((mood) => (
                  <Button
                    key={mood.value}
                    variant={selectedMood === mood.value ? "default" : "outline"}
                    size="sm"
                    className={`h-16 flex-col gap-1 ${
                      selectedMood === mood.value ? mood.color : ""
                    }`}
                    onClick={() => handleMoodSelect(mood.value)}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-xs">{mood.value}</span>
                  </Button>
                ))}
              </div>
              
              {selectedMood && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    Selected: <span className="font-medium">{getMoodLabel(selectedMood)}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Add notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How was your day? What influenced your mood?"
                className="w-full p-3 border rounded-md resize-none h-20"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {notes.length}/200
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={selectedMood === null || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <TrendingUp className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Log My Mood
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

