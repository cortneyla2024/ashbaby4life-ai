"use client";

import React, { useState, useEffect } from "react";

interface Recommendation {
  title: string;
  description: string;
  reason: string;
  genre: string;
}

interface Recommendations {
  movies: Recommendation[];
  books: Recommendation[];
  music: Recommendation[];
}

const RecommendationFeed: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"movies" | "books" | "music">("movies");

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async() => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/creative/recommendations", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCoverImage = (title: string, type: string) => {
    // Generate placeholder cover images based on title and type
    const colors = ["6366f1", "ec4899", "f59e0b", "10b981", "ef4444", "8b5cf6"];
    const color = colors[Math.abs(title.length) % colors.length];
    return `https://via.placeholder.com/200x300/${color}/ffffff?text=${encodeURIComponent(title.substring(0, 15))}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "movies": return "🎬";
      case "books": return "📚";
      case "music": return "🎵";
      default: return "📄";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="text-center py-12 bg-gray-800 rounded-lg">
        <div className="text-6xl mb-4">🎭</div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No Recommendations Yet</h3>
        <p className="text-gray-400 mb-4">
          We need to learn more about your preferences to provide personalized recommendations.
        </p>
        <button
          onClick={fetchRecommendations}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Refresh Recommendations
        </button>
      </div>
    );
  }

  const currentRecommendations = recommendations[activeTab] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Personalized Recommendations</h2>
        <p className="text-gray-400">AI-curated suggestions based on your preferences and activities</p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center">
        <div className="bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("movies")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "movies"
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
          >
            🎬 Movies
          </button>
          <button
            onClick={() => setActiveTab("books")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "books"
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
          >
            📚 Books
          </button>
          <button
            onClick={() => setActiveTab("music")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "music"
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
          >
            🎵 Music
          </button>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div>
        {currentRecommendations.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <div className="text-6xl mb-4">{getTypeIcon(activeTab)}</div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No {activeTab} recommendations</h3>
            <p className="text-gray-400">
              We&apos;re still learning about your preferences. Check back later for personalized suggestions!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRecommendations.map((item, index) => (
              <div key={index} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-colors">
                <div className="aspect-[2/3] bg-gray-700 relative">
                  <img
                    src={getCoverImage(item.title, activeTab)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                    {item.genre}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                    <p className="text-xs text-purple-300 font-medium mb-1">Why Recommended:</p>
                    <p className="text-xs text-gray-300">
                      {item.reason}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <button
                      onClick={() => {
                        // In a real app, this would open the item in a streaming service or store
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(item.title)}`, "_blank");
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Learn More →
                    </button>
                    <button
                      onClick={() => {
                        // In a real app, this would add to favorites or watchlist
                        console.log("Added to favorites:", item.title);
                      }}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      ♡ Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchRecommendations}
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          🔄 Refresh Recommendations
        </button>
      </div>

      {/* Info Panel */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-3">🤖 How AI Recommendations Work</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
          <div>
            <div className="font-medium text-purple-300 mb-1">Your Preferences</div>
            <p>We analyze your likes and dislikes to understand your taste</p>
          </div>
          <div>
            <div className="font-medium text-purple-300 mb-1">Recent Activity</div>
            <p>Your journal entries and goals help us understand your current mood and interests</p>
          </div>
          <div>
            <div className="font-medium text-purple-300 mb-1">AI Analysis</div>
            <p>Our AI combines all this information to suggest content you&apos;ll love</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationFeed;
