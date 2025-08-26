"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  functions?: Array<{
    name: string;
    success: boolean;
    result?: any;
    error?: string;
  }>;
  renderComponent?: {
    type: string;
    data: any;
  };
}

interface Persona {
  name: string;
  style: string;
}

const UnifiedChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth-token");
    if (token) {
      fetch("/api/auth/verify", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
            setIsAuthenticated(true);
            loadPersona(token);
          }
        })
        .catch(() => {
          localStorage.removeItem("auth-token");
        });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadPersona = async(token: string) => {
    try {
      const response = await fetch("/api/ai/persona", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success && data.persona) {
        setPersona({
          name: data.persona.personaName,
          style: data.persona.communicationStyle,
        });
      }
    } catch (error) {
      console.error("Failed to load persona:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async() => {
    if (!inputMessage.trim() || !isAuthenticated) {
return;
}

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: inputMessage,
          context: "Unified conversational interface",
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          functions: data.functions,
        };

        // Check if we need to render a component based on function results
        if (data.functions && data.functions.length > 0) {
          const componentData = determineComponentToRender(data.functions);
          if (componentData) {
            aiMessage.renderComponent = componentData;
          }
        }

        setMessages(prev => [...prev, aiMessage]);

        // Update persona if provided
        if (data.persona) {
          setPersona(data.persona);
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const determineComponentToRender = (functions: any[]): { type: string; data: any } | null => {
    for (const func of functions) {
      if (func.success) {
        switch (func.name) {
          case "GET_FINANCIAL_SUMMARY":
            return { type: "FINANCE_CHART", data: func.result };
          case "GET_MOOD_HISTORY":
            return { type: "MOOD_CHART", data: func.result };
          case "SUGGEST_COPING_STRATEGY":
            return { type: "COPING_STRATEGIES", data: func.result };
          default:
            return null;
        }
      }
    }
    return null;
  };

  const renderComponent = (component: { type: string; data: any }) => {
    switch (component.type) {
      case "FINANCE_CHART":
        return <FinanceSummaryCard data={component.data} />;
      case "MOOD_CHART":
        return <MoodHistoryCard data={component.data} />;
      case "COPING_STRATEGIES":
        return <CopingStrategiesCard data={component.data} />;
      default:
        return null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">
            Please log in to access your AI Life Companion.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Log In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Life Companion</h1>
              {persona && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{persona.name}</Badge>
                  <Badge variant="outline">{persona.style}</Badge>
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {user?.name || user?.email}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex">
        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-4">🤖</div>
                <p className="text-lg font-medium mb-2">Welcome to your AI Life Companion!</p>
                <p className="text-sm">I&apos;m here to help with your goals, health, finances, and personal growth.</p>
                <p className="text-sm mt-2">Try asking me to:</p>
                <div className="mt-4 space-y-2">
                  <p className="text-xs">• &quot;Log my mood as a 7 today&quot;</p>
                  <p className="text-xs">• &quot;Add $25 for lunch to my expenses&quot;</p>
                  <p className="text-xs">• &quot;Show me my financial summary&quot;</p>
                  <p className="text-xs">• &quot;I need help with stress management&quot;</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-100"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Function Results */}
                  {message.functions && message.functions.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 rounded-lg p-3 max-w-md">
                        <div className="text-xs text-gray-400 mb-2">Actions taken:</div>
                        {message.functions.map((func, index) => (
                          <div key={index} className="flex items-center space-x-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${func.success ? "bg-green-500" : "bg-red-500"}`} />
                            <span className="text-xs text-gray-300">
                              {func.name.replace(/_/g, " ").toLowerCase()}
                            </span>
                            {!func.success && (
                              <span className="text-xs text-red-400">({func.error})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rendered Component */}
                  {message.renderComponent && (
                    <div className="flex justify-start">
                      {renderComponent(message.renderComponent)}
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send)"
                className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600"
              >
                Send
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => setInputMessage("I'd like to set some personal goals. Can you help me?")}
            >
              <span className="mr-2">🎯</span>
              Set Goals
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => setInputMessage("I'm feeling stressed today. Can you help me relax?")}
            >
              <span className="mr-2">😌</span>
              Stress Relief
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => setInputMessage("Can you give me some health and wellness tips?")}
            >
              <span className="mr-2">❤️</span>
              Health Tips
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => setInputMessage("Show me my financial summary")}
            >
              <span className="mr-2">💰</span>
              Finance Summary
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => setInputMessage("Show me my mood history")}
            >
              <span className="mr-2">📊</span>
              Mood History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component renderers
const FinanceSummaryCard: React.FC<{ data: any }> = ({ data }) => {
  const { transactions, budgets } = data;

  return (
    <Card className="p-4 bg-gray-800 border-gray-700 max-w-md">
      <h4 className="text-sm font-semibold text-white mb-3">Financial Summary</h4>
      <div className="space-y-3">
        <div>
          <div className="text-xs text-gray-400 mb-1">Recent Transactions</div>
          <div className="space-y-1">
            {transactions?.slice(0, 3).map((tx: any, index: number) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-300">{tx.description}</span>
                <span className={tx.type === "Income" ? "text-green-400" : "text-red-400"}>
                  {tx.type === "Income" ? "+" : "-"}${tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Active Budgets</div>
          <div className="space-y-1">
            {budgets?.slice(0, 2).map((budget: any, index: number) => (
              <div key={index} className="text-xs text-gray-300">
                {budget.name}: ${budget.amount}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

const MoodHistoryCard: React.FC<{ data: any }> = ({ data }) => {
  const { moodEntries } = data;

  return (
    <Card className="p-4 bg-gray-800 border-gray-700 max-w-md">
      <h4 className="text-sm font-semibold text-white mb-3">Mood History</h4>
      <div className="space-y-2">
        {moodEntries?.slice(0, 5).map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <div className="text-xs text-gray-300">
              {new Date(entry.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-400">
                Score: {entry.moodScore}/10
              </div>
              <div className={`w-3 h-3 rounded-full ${
                entry.moodScore >= 7 ? "bg-green-500" :
                entry.moodScore >= 4 ? "bg-yellow-500" : "bg-red-500"
              }`} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const CopingStrategiesCard: React.FC<{ data: any }> = ({ data }) => {
  const { strategies } = data;

  return (
    <Card className="p-4 bg-gray-800 border-gray-700 max-w-md">
      <h4 className="text-sm font-semibold text-white mb-3">Coping Strategies</h4>
      <div className="space-y-2">
        {strategies?.map((strategy: any, index: number) => (
          <div key={index} className="text-xs">
            <div className="text-gray-300 font-medium">{strategy.title}</div>
            <div className="text-gray-400">{strategy.description}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default UnifiedChat;
