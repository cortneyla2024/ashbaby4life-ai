"use client";

import React, { useState, useEffect } from "react";

interface MusicComposition {
  title: string;
  bpm: number;
  key: string;
  notes: Array<{
    note: string;
    duration: string;
    time: number;
  }>;
}

const SonicCanvas: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [composition, setComposition] = useState<MusicComposition | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem("auth-token");
    setToken(storedToken);
  }, []);

  const generateMusic = async() => {
    if (!prompt.trim() || !token) {
      setError("Please enter a prompt and ensure you are logged in");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/music/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate music");
      }

      setComposition(data.composition);
    } catch (error) {
      console.error("Error generating music:", error);
      setError(error instanceof Error ? error.message : "Failed to generate music");
    } finally {
      setIsLoading(false);
    }
  };

  const playMusic = () => {
    if (!composition) {
return;
}

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    // Simulate music playback
    setTimeout(() => {
      setIsPlaying(false);
    }, 5000);
  };

  const stopMusic = () => {
    setIsPlaying(false);
  };

  return (
    <div className="container mx-auto p-8 bg-gray-950 text-white rounded-xl shadow-2xl min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        Sonic Canvas
      </h1>
      <p className="text-lg text-gray-400 mb-8 max-w-2xl text-center">
        Describe your musical vision, and our AI composer will bring it to life.
      </p>

      <div className="w-full max-w-xl">
        <div className="flex space-x-2 mb-6">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-full py-2 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="A calming piano piece with gentle arpeggios..."
            disabled={isLoading}
            onKeyPress={(e) => e.key === "Enter" && generateMusic()}
          />
          <button
            onClick={generateMusic}
            disabled={isLoading || !prompt.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? "Composing..." : "Generate"}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {composition && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-purple-300">
              {composition.title}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="text-gray-400">BPM:</span>
                <span className="ml-2 text-white">{composition.bpm}</span>
              </div>
              <div>
                <span className="text-gray-400">Key:</span>
                <span className="ml-2 text-white">{composition.key}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={playMusic}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={stopMusic}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Stop
              </button>
            </div>
          </div>
        )}

        {!token && (
          <div className="bg-yellow-900/20 border border-yellow-500 text-yellow-300 px-4 py-3 rounded-lg mt-6">
            Please log in to generate music compositions.
          </div>
        )}
      </div>
    </div>
  );
};

export default SonicCanvas;
