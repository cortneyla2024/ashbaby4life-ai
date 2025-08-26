"use client";

import React, { useState, useEffect } from "react";

interface GeneratedAsset {
  id: string;
  type: string;
  prompt: string;
  content: string;
  createdAt: string;
}

interface WritingAssistantProps {
  projectId: string;
  projectTitle: string;
}

const WritingAssistant: React.FC<WritingAssistantProps> = ({ projectId, projectTitle }) => {
  const [currentText, setCurrentText] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [texts, setTexts] = useState<GeneratedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAiPanel, setShowAiPanel] = useState(false);

  const aiSuggestions = [
    { prompt: "suggest a character name", icon: "👤" },
    { prompt: "describe the setting", icon: "🏰" },
    { prompt: "continue the story", icon: "📖" },
    { prompt: "add dialogue", icon: "💬" },
    { prompt: "create a plot twist", icon: "🎭" },
    { prompt: "write a poem about", icon: "📝" },
  ];

  useEffect(() => {
    fetchTexts();
  }, [projectId]);

  const fetchTexts = async() => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/creative/projects", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const project = data.projects.find((p: any) => p.id === projectId);
        if (project) {
          const textAssets = project.assets.filter((asset: GeneratedAsset) => asset.type === "TEXT");
          setTexts(textAssets);
        }
      }
    } catch (error) {
      console.error("Error fetching texts:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateText = async(e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
return;
}

    setGenerating(true);
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/creative/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          projectId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTexts([data.asset, ...texts]);
        setAiPrompt("");
        setShowAiPanel(false);
      }
    } catch (error) {
      console.error("Error generating text:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAiPrompt(suggestion);
    setShowAiPanel(true);
  };

  const saveCurrentText = async() => {
    if (!currentText.trim()) {
return;
}

    setGenerating(true);
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/creative/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: "User-written content",
          projectId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the asset with the user's text
        const updatedAsset = { ...data.asset, content: currentText };
        setTexts([updatedAsset, ...texts]);
        setCurrentText("");
      }
    } catch (error) {
      console.error("Error saving text:", error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Writing Assistant</h2>
        <p className="text-gray-400">Create and edit your writing for: {projectTitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Writing Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Text Editor */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Your Writing</h3>
              <button
                onClick={() => setShowAiPanel(!showAiPanel)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {showAiPanel ? "Hide AI" : "Show AI"}
              </button>
            </div>

            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Start writing your story, poem, or any creative text here..."
              rows={12}
            />

            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-400">
                {currentText.length} characters
              </span>
              <button
                onClick={saveCurrentText}
                disabled={!currentText.trim() || generating}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Save Text
              </button>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick AI Suggestions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.prompt)}
                  className="p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-left"
                >
                  <div className="text-2xl mb-1">{suggestion.icon}</div>
                  <div className="text-sm">{suggestion.prompt}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Panel */}
        {showAiPanel && (
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-white mb-4">AI Writing Assistant</h3>

              <form onSubmit={generateText} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    What would you like me to help you with?
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="e.g., 'Write a character description for a brave knight'"
                    rows={3}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={generating || !aiPrompt.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  {generating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    "Generate Text"
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-3">💡 Writing Tips</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li>• Start with a strong opening line</li>
                  <li>• Show, don&apos;t tell</li>
                  <li>• Use sensory details</li>
                  <li>• Vary sentence structure</li>
                  <li>• Read your work aloud</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generated Texts */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Your Writing Collection</h3>
        {texts.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <div className="text-6xl mb-4">📝</div>
            <h4 className="text-lg font-semibold text-gray-300 mb-2">No Writings Yet</h4>
            <p className="text-gray-400">
              Start writing in the editor above or use AI assistance to generate creative content!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {texts.map((text) => (
              <div key={text.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm text-gray-400">
                    {text.prompt === "User-written content" ? "Your Writing" : `AI Generated: ${text.prompt}`}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(text.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 whitespace-pre-wrap">{text.content}</div>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(text.content)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Copy Text
                  </button>
                  <button
                    onClick={() => setCurrentText(text.content)}
                    className="text-green-400 hover:text-green-300 text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WritingAssistant;
