"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BookOpen, Save, Plus, X, Search, Filter, Calendar, Heart, Smile, Meh, Frown, Zap } from "lucide-react";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

const moodOptions = [
  { value: "amazing", label: "Amazing", icon: Zap, color: "text-purple-500" },
  { value: "great", label: "Great", icon: Heart, color: "text-pink-500" },
  { value: "good", label: "Good", icon: Smile, color: "text-green-500" },
  { value: "okay", label: "Okay", icon: Meh, color: "text-yellow-500" },
  { value: "difficult", label: "Difficult", icon: Frown, color: "text-orange-500" },
  { value: "challenging", label: "Challenging", icon: Frown, color: "text-red-500" },
];

export default function JournalEditor() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMood, setFilterMood] = useState("");
  const [filterTag, setFilterTag] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, [searchTerm, filterMood, filterTag]);

  const fetchEntries = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterMood) params.append("mood", filterMood);
      if (filterTag) params.append("tag", filterTag);

      const response = await fetch(`/api/journal?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.journalEntries);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      toast.error("Failed to load journal entries");
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setMood("");
    setTags([]);
    setNewTag("");
    setIsPrivate(true);
    setSelectedEntry(null);
    setIsEditing(false);
  };

  const handleNewEntry = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood || "");
    setTags(entry.tags);
    setIsPrivate(entry.isPrivate);
    setSelectedEntry(entry);
    setIsEditing(true);
  };

  const handleSaveEntry = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsLoading(true);
    try {
      const entryData = {
        title: title.trim(),
        content: content.trim(),
        mood: mood || undefined,
        tags,
        isPrivate,
      };

      let response;
      if (selectedEntry) {
        // Update existing entry
        response = await fetch(`/api/journal/${selectedEntry.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entryData),
        });
      } else {
        // Create new entry
        response = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entryData),
        });
      }

      if (response.ok) {
        toast.success(selectedEntry ? "Entry updated!" : "Entry saved!");
        resetForm();
        fetchEntries();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save entry");
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      toast.error("Failed to save entry");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(`/api/journal/${entryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Entry deleted");
        if (selectedEntry?.id === entryId) {
          resetForm();
        }
        fetchEntries();
      } else {
        toast.error("Failed to delete entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMoodIcon = (moodValue: string) => {
    const moodOption = moodOptions.find(option => option.value === moodValue);
    if (!moodOption) return null;
    
    const IconComponent = moodOption.icon;
    return <IconComponent className={`h-4 w-4 ${moodOption.color}`} />;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold">Personal Journal</h1>
        </div>
        <Button onClick={handleNewEntry} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entries List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterMood} onValueChange={setFilterMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All moods</SelectItem>
                  {moodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {React.createElement(option.icon, { className: `h-4 w-4 ${option.color}` })}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Filter by tag..."
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Entries List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {entries.map((entry) => (
              <Card
                key={entry.id}
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedEntry?.id === entry.id ? "ring-2 ring-purple-500" : ""
                }`}
                onClick={() => handleEditEntry(entry)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm truncate flex-1">{entry.title}</h3>
                    {entry.mood && getMoodIcon(entry.mood)}
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{entry.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(entry.createdAt)}</span>
                    {!entry.isPrivate && <span className="text-blue-500">Public</span>}
                  </div>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {entry.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{entry.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedEntry ? "Edit Entry" : "New Entry"}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveEntry}
                      disabled={isLoading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's on your mind?"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="mood">Mood (Optional)</Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="How are you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No mood selected</SelectItem>
                      {moodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {React.createElement(option.icon, { className: `h-4 w-4 ${option.color}` })}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your thoughts..."
                    rows={12}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="private"
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                  />
                  <Label htmlFor="private">Keep this entry private</Label>
                </div>

                {selectedEntry && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteEntry(selectedEntry.id)}
                      className="w-full"
                    >
                      Delete Entry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Welcome to your Journal</p>
                <p className="text-sm mb-4">
                  Select an entry to edit or create a new one to get started
                </p>
                <Button onClick={handleNewEntry} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Write Your First Entry
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}