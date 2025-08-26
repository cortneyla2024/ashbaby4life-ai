"use client";

import React, { useState, useEffect } from "react";

interface GeneratedAsset {
  id: string;
  type: string;
  prompt: string;
  content: string;
  createdAt: string;
}

interface ImageGeneratorProps {
  projectId: string;
  projectTitle: string;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ projectId, projectTitle }) => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const styleOptions = [
    { value: "photorealistic", label: "Photorealistic", icon: "📷" },
    { value: "anime", label: "Anime", icon: "🎌" },
    { value: "watercolor", label: "Watercolor", icon: "🎨" },
    { value: "digital-art", label: "Digital Art", icon: "💻" },
    { value: "oil-painting", label: "Oil Painting", icon: "🖼️" },
    { value: "sketch", label: "Sketch", icon: "✏️" },
  ];

  useEffect(() => {
    fetchImages();
  }, [projectId]);

  const fetchImages = async() => {
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
          const imageAssets = project.assets.filter((asset: GeneratedAsset) => asset.type === "IMAGE");
          setImages(imageAssets);
        }
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async(e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
return;
}

    setGenerating(true);
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/creative/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          projectId,
          style,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setImages([data.asset, ...images]);
        setPrompt("");
      }
    } catch (error) {
      console.error("Error generating image:", error);
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
        <h2 className="text-3xl font-bold text-white mb-2">AI Image Generator</h2>
        <p className="text-gray-400">Create stunning images for your project: {projectTitle}</p>
      </div>

      {/* Generation Form */}
      <div className="bg-gray-800 rounded-lg p-6">
        <form onSubmit={generateImage} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Describe the image you want to create... (e.g., 'A serene mountain landscape at sunset with a lone tree in the foreground')"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Art Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {styleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStyle(option.value)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    style === option.value
                      ? "border-purple-500 bg-purple-600 text-white"
                      : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-600"
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={generating || !prompt.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            {generating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Image...</span>
              </div>
            ) : (
              "Generate Image"
            )}
          </button>
        </form>
      </div>

      {/* Image Gallery */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Generated Images</h3>
        {images.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <div className="text-6xl mb-4">🎨</div>
            <h4 className="text-lg font-semibold text-gray-300 mb-2">No Images Yet</h4>
            <p className="text-gray-400">
              Start creating by entering a prompt above and generating your first image!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <div className="aspect-square bg-gray-700 relative">
                  <img
                    src={image.content}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/400x400/6366f1/ffffff?text=Image+Generated";
                    }}
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                    {image.prompt}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(image.content)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-3">💡 Tips for Better Images</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• Be specific about what you want to see in the image</li>
          <li>• Include details about lighting, mood, and composition</li>
          <li>• Mention specific objects, colors, or styles</li>
          <li>• Try different art styles to see which works best for your vision</li>
          <li>• Experiment with different prompts to refine your results</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageGenerator;
