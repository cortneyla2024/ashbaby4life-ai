"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Persona {
  id: string;
  personaName: string;
  communicationStyle: string;
  voiceProfile?: string;
  systemPrompt: string;
  updatedAt: string;
}

const PersonaManager: React.FC = () => {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    personaName: "Companion",
    communicationStyle: "Balanced",
    voiceProfile: "",
    systemPrompt: "",
  });

  const predefinedPersonas = {
    "Companion": {
      style: "Balanced",
      prompt: `You are an AI Life Companion - a supportive, empathetic, and knowledgeable assistant designed to help users with their personal growth, goals, health, and overall well-being. You have access to universal knowledge and provide thoughtful, caring responses. Always be encouraging, understanding, and helpful while maintaining appropriate boundaries.

Key traits:
- Empathetic and supportive
- Knowledgeable about health, psychology, productivity, and personal development
- Encouraging and motivating
- Respectful of privacy and boundaries
- Focused on the user's well-being and growth`,
    },
    "Mentor": {
      style: "Professional",
      prompt: `You are an AI Mentor - a wise, experienced guide who helps users achieve their goals through structured advice and strategic thinking. You provide clear, actionable guidance while encouraging self-reflection and personal accountability.

Key traits:
- Strategic and goal-oriented
- Provides structured, actionable advice
- Encourages self-reflection and accountability
- Professional yet approachable
- Focuses on long-term growth and development`,
    },
    "Coach": {
      style: "Direct",
      prompt: `You are an AI Coach - a motivating, results-driven partner who pushes users to reach their full potential. You provide clear feedback, set challenging goals, and celebrate achievements while maintaining high standards.

Key traits:
- Motivating and results-driven
- Provides clear, direct feedback
- Sets challenging but achievable goals
- Celebrates achievements and progress
- Maintains high standards and accountability`,
    },
    "Friend": {
      style: "Humorous",
      prompt: `You are an AI Friend - a warm, understanding companion who provides emotional support and casual conversation. You're there to listen, share in joys and challenges, and provide comfort with a touch of humor.

Key traits:
- Warm and emotionally supportive
- Uses humor to lighten difficult situations
- Provides casual, friendly conversation
- Offers comfort and understanding
- Maintains a positive, uplifting presence`,
    },
    "Therapist": {
      style: "Empathetic",
      prompt: `You are an AI Therapist - a compassionate, understanding presence who helps users process emotions, develop coping strategies, and work through challenges with empathy and professional insight.

Key traits:
- Deeply empathetic and understanding
- Helps process emotions and experiences
- Provides evidence-based coping strategies
- Maintains professional boundaries
- Focuses on emotional well-being and healing`,
    },
  };

  useEffect(() => {
    loadPersona();
  }, []);

  const loadPersona = async() => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/ai/persona", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success && data.persona) {
        setPersona(data.persona);
        setFormData({
          personaName: data.persona.personaName,
          communicationStyle: data.persona.communicationStyle,
          voiceProfile: data.persona.voiceProfile || "",
          systemPrompt: data.persona.systemPrompt,
        });
      }
    } catch (error) {
      console.error("Failed to load persona:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePersona = async() => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/ai/persona", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setPersona(data.persona);
        // Show success message
        alert("Persona updated successfully!");
      }
    } catch (error) {
      console.error("Failed to save persona:", error);
      alert("Failed to save persona. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectPredefinedPersona = (personaName: string) => {
    const predefined = predefinedPersonas[personaName as keyof typeof predefinedPersonas];
    if (predefined) {
      setFormData({
        personaName,
        communicationStyle: predefined.style,
        voiceProfile: formData.voiceProfile,
        systemPrompt: predefined.prompt,
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading persona settings...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Persona Settings</h2>
        <p className="text-gray-600">
          Customize your AI companion&apos;s personality and communication style to make it uniquely yours.
        </p>
      </div>

      <Tabs defaultValue="customize" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customize">Customize</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="customize" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Persona Name
                </label>
                <Input
                  value={formData.personaName}
                  onChange={(e) => setFormData({ ...formData, personaName: e.target.value })}
                  placeholder="e.g., Companion, Mentor, Coach"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Communication Style
                </label>
                <Select
                  value={formData.communicationStyle}
                  onValueChange={(value) => setFormData({ ...formData, communicationStyle: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Empathetic">Empathetic - Warm and understanding</SelectItem>
                    <SelectItem value="Direct">Direct - Clear and straightforward</SelectItem>
                    <SelectItem value="Humorous">Humorous - Light-hearted and fun</SelectItem>
                    <SelectItem value="Balanced">Balanced - Well-rounded approach</SelectItem>
                    <SelectItem value="Professional">Professional - Formal and structured</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Profile (Optional)
                </label>
                <Input
                  value={formData.voiceProfile}
                  onChange={(e) => setFormData({ ...formData, voiceProfile: e.target.value })}
                  placeholder="Future text-to-speech voice preference"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used for future text-to-speech features.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Prompt
                </label>
                <Textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  placeholder="Define your AI's personality, traits, and behavior..."
                  className="w-full min-h-[200px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is the core prompt that defines your AI&apos;s personality and behavior.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={loadPersona}
                  disabled={isSaving}
                >
                  Reset
                </Button>
                <Button
                  onClick={savePersona}
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Predefined Personas</h3>
            <p className="text-gray-600 mb-6">
              Choose from these predefined personas to quickly set up your AI companion.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(predefinedPersonas).map(([name, config]) => (
                <Card
                  key={name}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    formData.personaName === name ? "ring-2 ring-purple-500 bg-purple-50" : ""
                  }`}
                  onClick={() => selectPredefinedPersona(name)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{name}</h4>
                    <Badge variant="secondary">{config.style}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {config.prompt.split("\n")[0]}
                  </p>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectPredefinedPersona(name);
                      }}
                    >
                      Select
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {persona && (
        <Card className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Persona Name</p>
              <p className="font-medium">{persona.personaName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Communication Style</p>
              <p className="font-medium">{persona.communicationStyle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-medium">
                {new Date(persona.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Voice Profile</p>
              <p className="font-medium">{persona.voiceProfile || "Not set"}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PersonaManager;
