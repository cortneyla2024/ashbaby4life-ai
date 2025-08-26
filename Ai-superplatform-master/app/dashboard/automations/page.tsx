"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Zap,
  Lightbulb,
  Settings,
  Search,
  Filter,
} from "lucide-react";
import AutomationBuilder from "@/components/automations/AutomationBuilder";
import AutomationList from "@/components/automations/AutomationList";

interface AutomationRoutine {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  triggers: Array<{
    id: string;
    type: string;
    params: any;
  }>;
  actions: Array<{
    id: string;
    type: string;
    params: any;
  }>;
  logs: Array<{
    id: string;
    status: string;
    message: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export default function AutomationsPage() {
  const [routines, setRoutines] = useState<AutomationRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<AutomationRoutine | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "enabled" | "disabled">("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionGoal, setSuggestionGoal] = useState("");
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  // Fetch automation routines
  const fetchRoutines = async() => {
    try {
      const response = await fetch("/api/automations");
      if (response.ok) {
        const data = await response.json();
        setRoutines(data.routines || []);
      }
    } catch (error) {
      console.error("Error fetching routines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  // Create new automation routine
  const handleCreateRoutine = async(routineData: any) => {
    try {
      const response = await fetch("/api/automations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(routineData),
      });

      if (response.ok) {
        setShowBuilder(false);
        setEditingRoutine(null);
        fetchRoutines();
      } else {
        const error = await response.json();
        alert(`Error creating automation: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating routine:", error);
      alert("Failed to create automation routine");
    }
  };

  // Update automation routine
  const handleUpdateRoutine = async(routineData: any) => {
    if (!editingRoutine) {
return;
}

    try {
      const response = await fetch(`/api/automations/${editingRoutine.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(routineData),
      });

      if (response.ok) {
        setShowBuilder(false);
        setEditingRoutine(null);
        fetchRoutines();
      } else {
        const error = await response.json();
        alert(`Error updating automation: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating routine:", error);
      alert("Failed to update automation routine");
    }
  };

  // Toggle automation enabled/disabled
  const handleToggleRoutine = async(id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/automations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isEnabled: enabled }),
      });

      if (response.ok) {
        fetchRoutines();
      } else {
        alert("Failed to update automation status");
      }
    } catch (error) {
      console.error("Error toggling routine:", error);
      alert("Failed to update automation status");
    }
  };

  // Delete automation routine
  const handleDeleteRoutine = async(id: string) => {
    try {
      const response = await fetch(`/api/automations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchRoutines();
      } else {
        alert("Failed to delete automation");
      }
    } catch (error) {
      console.error("Error deleting routine:", error);
      alert("Failed to delete automation");
    }
  };

  // Edit automation routine
  const handleEditRoutine = (routine: AutomationRoutine) => {
    setEditingRoutine(routine);
    setShowBuilder(true);
  };

  // Get AI suggestion
  const handleGetSuggestion = async() => {
    if (!suggestionGoal.trim()) {
      alert("Please enter a goal to get AI suggestions");
      return;
    }

    setSuggestionLoading(true);
    try {
      const response = await fetch("/api/automations/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal: suggestionGoal }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestion(data.suggestion);
        setShowSuggestions(true);
      } else {
        alert("Failed to get AI suggestion");
      }
    } catch (error) {
      console.error("Error getting suggestion:", error);
      alert("Failed to get AI suggestion");
    } finally {
      setSuggestionLoading(false);
    }
  };

  // Use AI suggestion
  const handleUseSuggestion = () => {
    if (aiSuggestion) {
      setEditingRoutine(null);
      setShowBuilder(true);
      // The AutomationBuilder will use the suggestion data
    }
  };

  // Filter routines based on search and status
  const filteredRoutines = routines.filter((routine) => {
    const matchesSearch = routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (routine.description && routine.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === "all" ||
                         (filterStatus === "enabled" && routine.isEnabled) ||
                         (filterStatus === "disabled" && !routine.isEnabled);

    return matchesSearch && matchesStatus;
  });

  const enabledCount = routines.filter(r => r.isEnabled).length;
  const disabledCount = routines.filter(r => !r.isEnabled).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading automations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Automations Hub</h1>
        <p className="text-gray-600">
          Create intelligent workflows that automatically respond to your life patterns
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Automations</p>
                    <p className="text-2xl font-bold text-gray-900">{routines.length}</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">{enabledCount}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Running
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Paused</p>
                    <p className="text-2xl font-bold text-gray-600">{disabledCount}</p>
                  </div>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700">
                    Stopped
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search automations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                  >
                    All ({routines.length})
                  </Button>
                  <Button
                    variant={filterStatus === "enabled" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("enabled")}
                  >
                    Active ({enabledCount})
                  </Button>
                  <Button
                    variant={filterStatus === "disabled" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("disabled")}
                  >
                    Paused ({disabledCount})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automation List */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Automations</h2>
            <Button onClick={() => setShowBuilder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Automation
            </Button>
          </div>

          <AutomationList
            routines={filteredRoutines}
            onToggle={handleToggleRoutine}
            onEdit={handleEditRoutine}
            onDelete={handleDeleteRoutine}
          />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Create New Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Build a custom automation routine by defining triggers and actions.
                Your automation will run automatically when the specified conditions are met.
              </p>
              <Button onClick={() => setShowBuilder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Start Building
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI-Powered Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Let AI help you create automations based on your goals.
                Describe what you want to achieve, and we&apos;ll suggest a complete automation routine.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    What would you like to automate?
                  </label>
                  <Input
                    placeholder="e.g., Help me save more money, Remind me to exercise daily, Track my mood patterns..."
                    value={suggestionGoal}
                    onChange={(e) => setSuggestionGoal(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleGetSuggestion}
                  disabled={suggestionLoading || !suggestionGoal.trim()}
                >
                  {suggestionLoading ? "Getting Suggestion..." : "Get AI Suggestion"}
                </Button>
              </div>

              {aiSuggestion && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">AI Suggestion</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium">{aiSuggestion.name}</h4>
                      <p className="text-sm text-gray-600">{aiSuggestion.description}</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-2">Triggers:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {aiSuggestion.triggers?.map((trigger: any, index: number) => (
                          <li key={index}>• {trigger.type}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-2">Actions:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {aiSuggestion.actions?.map((action: any, index: number) => (
                          <li key={index}>• {action.type}</li>
                        ))}
                      </ul>
                    </div>

                    <Button onClick={handleUseSuggestion} className="w-full">
                      Use This Suggestion
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Automation Builder Modal */}
      <AutomationBuilder
        isOpen={showBuilder}
        onClose={() => {
          setShowBuilder(false);
          setEditingRoutine(null);
          setAiSuggestion(null);
        }}
        onSave={editingRoutine ? handleUpdateRoutine : handleCreateRoutine}
        initialData={editingRoutine || aiSuggestion}
      />
    </div>
  );
}
