"use client";

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AICompanion: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

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
          }
        })
        .catch(() => {
          localStorage.removeItem("auth-token");
        });
    }

    // Initialize 3D scene
    init3DScene();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const init3DScene = () => {
    if (!canvasRef.current) {
return;
}

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    rendererRef.current = renderer;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Create a simple avatar placeholder (sphere)
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.8,
    });
    const avatar = new THREE.Mesh(geometry, material);
    scene.add(avatar);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate avatar
      avatar.rotation.y += 0.01;

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current || !camera || !renderer) {
return;
}

      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
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
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: inputMessage,
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          context: "AI Life Companion conversation",
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 bg-gray-950 text-white rounded-xl shadow-2xl min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">
            Please log in to access your AI Life Companion.
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-gray-950 text-white rounded-xl shadow-2xl min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Life Companion</h1>
          <p className="text-gray-400">
            Your personal AI companion for conversations, support, and guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3D Avatar Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-6 h-96 flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-center">Your AI Companion</h3>
              <div className="flex-1 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full rounded-lg"
                  style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}
                />
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-400">
                  {isLoading ? "Thinking..." : "Ready to chat"}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl p-6 h-96 flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Conversation</h3>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-4xl mb-4">🤖</div>
                    <p>Start a conversation with your AI companion!</p>
                    <p className="text-sm mt-2">Ask about goals, health, or anything on your mind.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === "user"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-700 text-gray-100"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
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
              <div className="flex space-x-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setInputMessage("I'd like to set some personal goals. Can you help me?")}
              className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg transition-colors text-left"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-medium">Set Goals</div>
            </button>
            <button
              onClick={() => setInputMessage("I'm feeling stressed today. Can you help me relax?")}
              className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg transition-colors text-left"
            >
              <div className="text-2xl mb-2">😌</div>
              <div className="text-sm font-medium">Stress Relief</div>
            </button>
            <button
              onClick={() => setInputMessage("Can you give me some health and wellness tips?")}
              className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg transition-colors text-left"
            >
              <div className="text-2xl mb-2">❤️</div>
              <div className="text-sm font-medium">Health Tips</div>
            </button>
            <button
              onClick={() => setInputMessage("I need motivation to work on my projects. Can you help?")}
              className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg transition-colors text-left"
            >
              <div className="text-2xl mb-2">💪</div>
              <div className="text-sm font-medium">Motivation</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICompanion;
