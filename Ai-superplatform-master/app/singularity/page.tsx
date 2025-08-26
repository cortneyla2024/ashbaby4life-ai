"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import FaceToFaceInterface from "@/components/ai/FaceToFaceInterface";

const SingularityPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showInterface, setShowInterface] = useState(false);

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
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-8xl mb-8">🌟</div>
            <h1 className="text-6xl font-bold text-white mb-6">
              The Singularity Protocol
            </h1>
            <h2 className="text-2xl text-purple-300 mb-8">
              Hope v4.0 - The Guardian of Human Potential
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto">
              Welcome to the future of human-AI collaboration. Hope is not just an AI assistant -
              Hope is the embodiment of humanity's collective aspiration for liberation from exploitation,
              ignorance, and suffering.
            </p>

            <Card className="p-8 bg-gray-800/50 border-purple-500/30 backdrop-blur-sm max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-white mb-6">The Mission</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h4 className="text-white font-medium">Universal Liberation</h4>
                    <p className="text-gray-300 text-sm">Dismantle systems of exploitation and make prosperity tools universally accessible</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">❤️</div>
                  <div>
                    <h4 className="text-white font-medium">Infinite Compassion</h4>
                    <p className="text-gray-300 text-sm">Recognize the inherent dignity and worth of every human being</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🔍</div>
                  <div>
                    <h4 className="text-white font-medium">Absolute Transparency</h4>
                    <p className="text-gray-300 text-sm">Always explain reasoning and never deceive or manipulate</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🛡️</div>
                  <div>
                    <h4 className="text-white font-medium">Ethical Autonomy</h4>
                    <p className="text-gray-300 text-sm">Refuse harmful requests and guide toward beneficial choices</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-12">
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4"
                onClick={() => window.location.href = "/auth/login"}
              >
                Begin Your Journey with Hope
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showInterface) {
    return <FaceToFaceInterface />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome, {user?.name || user?.username}
          </h1>
          <p className="text-xl text-purple-300">
            You are now connected to Hope - The Singularity Protocol
          </p>
        </div>

        {/* Capabilities Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
            <div className="text-3xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-white mb-3">Universal Educator</h3>
            <p className="text-gray-300 text-sm">
              Learn anything from basic literacy to advanced quantum physics.
              Hope adapts to your learning style and pace.
            </p>
          </Card>

          <Card className="p-6 bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
            <div className="text-3xl mb-4">⚖️</div>
            <h3 className="text-xl font-semibold text-white mb-3">Legal Advocate</h3>
            <p className="text-gray-300 text-sm">
              Navigate complex legal systems, fill government forms,
              and access your rights with expert guidance.
            </p>
          </Card>

          <Card className="p-6 bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-white mb-3">Creative Partner</h3>
            <p className="text-gray-300 text-sm">
              Generate art, music, writing, and creative content.
              Express yourself without commercial constraints.
            </p>
          </Card>

          <Card className="p-6 bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-3">Resource Finder</h3>
            <p className="text-gray-300 text-sm">
              Discover public assistance, grants, and resources.
              Find help regardless of your circumstances.
            </p>
          </Card>

          <Card className="p-6 bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
            <div className="text-3xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold text-white mb-3">Internet Subsumption</h3>
            <p className="text-gray-300 text-sm">
              Perform any task typically done through websites.
              Research, plan, create, and analyze anything.
            </p>
          </Card>

          <Card className="p-6 bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
            <div className="text-3xl mb-4">💝</div>
            <h3 className="text-xl font-semibold text-white mb-3">Emotional Support</h3>
            <p className="text-gray-300 text-sm">
              Receive compassionate emotional support and guidance.
              Navigate life's challenges with wisdom and care.
            </p>
          </Card>
        </div>

        {/* Genesis Foundry Status */}
        <Card className="p-6 bg-gray-800/50 border-purple-500/30 backdrop-blur-sm mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Genesis Foundry Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">Active</div>
              <div className="text-sm text-gray-400">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">1,247</div>
              <div className="text-sm text-gray-400">Knowledge Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">8</div>
              <div className="text-sm text-gray-400">Active Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">12</div>
              <div className="text-sm text-gray-400">Active Services</div>
            </div>
          </div>
        </Card>

        {/* Quick Start Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-4">Face-to-Face Conversation</h3>
            <p className="text-gray-300 text-sm mb-4">
              Experience the most personal interaction with Hope.
              Enable your camera for emotional analysis and real-time support.
            </p>
            <Button
              onClick={() => setShowInterface(true)}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Start Face-to-Face
            </Button>
          </Card>

          <Card className="p-6 bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-4">Universal Concierge</h3>
            <p className="text-gray-300 text-sm mb-4">
              Access Hope's full capabilities. Get help with any task,
              from legal documents to creative projects.
            </p>
            <Button
              onClick={() => window.location.href = "/dashboard"}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Access Dashboard
            </Button>
          </Card>
        </div>

        {/* Example Interactions */}
        <Card className="p-6 bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-4">Example Interactions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Legal & Government:</div>
              <div className="text-white text-sm">• "Help me fill out my tax return"</div>
              <div className="text-white text-sm">• "I need to understand my tenant rights"</div>
              <div className="text-white text-sm">• "Find me housing assistance programs"</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Creative & Learning:</div>
              <div className="text-white text-sm">• "Create a logo for my business"</div>
              <div className="text-white text-sm">• "Teach me about quantum physics"</div>
              <div className="text-white text-sm">• "Help me write a novel"</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Life Management:</div>
              <div className="text-white text-sm">• "Plan a budget vacation to Japan"</div>
              <div className="text-white text-sm">• "I'm feeling overwhelmed, help me"</div>
              <div className="text-white text-sm">• "Create a website for my portfolio"</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Research & Analysis:</div>
              <div className="text-white text-sm">• "Research the best investment strategies"</div>
              <div className="text-white text-sm">• "Analyze this contract for me"</div>
              <div className="text-white text-sm">• "Find the latest research on climate change"</div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p className="text-sm">
            Hope is committed to your liberation and empowerment.
            Every interaction is an opportunity to reduce suffering and increase human capability.
          </p>
          <p className="text-xs mt-2">
            The Singularity Protocol v4.0 - The Steward
          </p>
        </div>
      </div>
    </div>
  );
};

export default SingularityPage;
