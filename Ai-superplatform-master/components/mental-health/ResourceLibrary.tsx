"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Filter, Heart, HeartOff, Sparkles, Brain, Activity, Sun, Moon } from "lucide-react";
import { toast } from "sonner";

interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  content: any;
  isSaved?: boolean;
}

const categories = [
  { value: "", label: "All Categories" },
  { value: "Anxiety", label: "Anxiety" },
  { value: "Stress", label: "Stress" },
  { value: "Depression", label: "Depression" },
  { value: "Mindfulness", label: "Mindfulness" },
  { value: "Sleep", label: "Sleep" },
  { value: "Self-Care", label: "Self-Care" },
];

const types = [
  { value: "", label: "All Types" },
  { value: "Breathing Exercise", label: "Breathing Exercise" },
  { value: "Mindfulness", label: "Mindfulness" },
  { value: "Grounding Technique", label: "Grounding Technique" },
  { value: "Physical Activity", label: "Physical Activity" },
  { value: "Creative Expression", label: "Creative Expression" },
  { value: "Social Connection", label: "Social Connection" },
];

const categoryIcons: { [key: string]: any } = {
  "Anxiety": Brain,
  "Stress": Activity,
  "Depression": Moon,
  "Mindfulness": Sparkles,
  "Sleep": Moon,
  "Self-Care": Heart,
};

export default function ResourceLibrary() {
  const [strategies, setStrategies] = useState<CopingStrategy[]>([]);
  const [filteredStrategies, setFilteredStrategies] = useState<CopingStrategy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStrategies();
  }, []);

  useEffect(() => {
    filterStrategies();
  }, [strategies, searchTerm, selectedCategory, selectedType]);

  const fetchStrategies = async() => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) {
params.append("category", selectedCategory);
}
      if (selectedType) {
params.append("type", selectedType);
}
      if (searchTerm) {
params.append("search", searchTerm);
}

      const response = await fetch(`/api/mental-health/strategies?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStrategies(data.strategies);
      }
    } catch (error) {
      console.error("Error fetching strategies:", error);
      toast.error("Failed to load resources");
    } finally {
      setIsLoading(false);
    }
  };

  const filterStrategies = () => {
    let filtered = strategies;

    if (searchTerm) {
      filtered = filtered.filter(strategy =>
        strategy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(strategy => strategy.category === selectedCategory);
    }

    if (selectedType) {
      filtered = filtered.filter(strategy => strategy.type === selectedType);
    }

    setFilteredStrategies(filtered);
  };

  const handleSaveStrategy = async(strategyId: string) => {
    try {
      const response = await fetch("/api/mental-health/strategies/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ strategyId }),
      });

      if (response.ok) {
        setStrategies(prev =>
          prev.map(strategy =>
            strategy.id === strategyId
              ? { ...strategy, isSaved: true }
              : strategy
          )
        );
        toast.success("Strategy saved to your collection");
      } else {
        toast.error("Failed to save strategy");
      }
    } catch (error) {
      toast.error("Failed to save strategy");
    }
  };

  const handleRemoveStrategy = async(strategyId: string) => {
    try {
      const response = await fetch(`/api/mental-health/strategies/save?strategyId=${strategyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStrategies(prev =>
          prev.map(strategy =>
            strategy.id === strategyId
              ? { ...strategy, isSaved: false }
              : strategy
          )
        );
        toast.success("Strategy removed from your collection");
      } else {
        toast.error("Failed to remove strategy");
      }
    } catch (error) {
      toast.error("Failed to remove strategy");
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Anxiety": "bg-blue-100 text-blue-800",
      "Stress": "bg-orange-100 text-orange-800",
      "Depression": "bg-purple-100 text-purple-800",
      "Mindfulness": "bg-green-100 text-green-800",
      "Sleep": "bg-indigo-100 text-indigo-800",
      "Self-Care": "bg-pink-100 text-pink-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Resource Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading resources...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Resource Library
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Discover coping strategies and mental wellness resources
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={fetchStrategies}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Apply
            </Button>
          </div>

          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredStrategies.length} resource{filteredStrategies.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {filteredStrategies.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStrategies.map((strategy) => {
                const CategoryIcon = categoryIcons[strategy.category] || BookOpen;
                return (
                  <Card key={strategy.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-lg">{strategy.title}</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            strategy.isSaved
                              ? handleRemoveStrategy(strategy.id)
                              : handleSaveStrategy(strategy.id)
                          }
                          className="h-8 w-8 p-0"
                        >
                          {strategy.isSaved ? (
                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                          ) : (
                            <HeartOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className={getCategoryColor(strategy.category)}>
                          {strategy.category}
                        </Badge>
                        <Badge variant="outline">
                          {strategy.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {strategy.description}
                      </p>
                      {strategy.content && strategy.content.steps && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Quick Steps:
                          </p>
                          <ol className="text-xs text-muted-foreground space-y-1">
                            {strategy.content.steps.slice(0, 3).map((step: string, index: number) => (
                              <li key={index} className="line-clamp-1">
                                {index + 1}. {step}
                              </li>
                            ))}
                            {strategy.content.steps.length > 3 && (
                              <li className="text-xs text-muted-foreground">
                                ... and {strategy.content.steps.length - 3} more
                              </li>
                            )}
                          </ol>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No resources found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
