"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Heart, 
  Brain, 
  Moon,
  Sun,
  Activity,
  Music,
  Users,
  Sparkles,
  Bookmark,
  Clock,
  Target
} from "lucide-react";

interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  saved: boolean;
}

const copingStrategies: CopingStrategy[] = [
  {
    id: '1',
    title: 'Deep Breathing Exercise',
    description: 'A simple 4-7-8 breathing technique to calm your nervous system and reduce anxiety.',
    category: 'Anxiety',
    type: 'Breathing Exercise',
    duration: '5-10 minutes',
    difficulty: 'Easy',
    tags: ['anxiety', 'stress', 'breathing', 'calm'],
    saved: false,
  },
  {
    id: '2',
    title: '5-4-3-2-1 Grounding Technique',
    description: 'Use your senses to ground yourself in the present moment and reduce overwhelming feelings.',
    category: 'Stress',
    type: 'Grounding Technique',
    duration: '2-5 minutes',
    difficulty: 'Easy',
    tags: ['stress', 'grounding', 'present', 'senses'],
    saved: false,
  },
  {
    id: '3',
    title: 'Progressive Muscle Relaxation',
    description: 'Systematically tense and relax muscle groups to release physical tension and mental stress.',
    category: 'Stress',
    type: 'Physical Activity',
    duration: '10-15 minutes',
    difficulty: 'Medium',
    tags: ['stress', 'tension', 'relaxation', 'muscles'],
    saved: false,
  },
  {
    id: '4',
    title: 'Gratitude Journaling',
    description: 'Write down three things you\'re grateful for each day to shift focus to positive aspects.',
    category: 'Depression',
    type: 'Journaling',
    duration: '5-10 minutes',
    difficulty: 'Easy',
    tags: ['depression', 'gratitude', 'journaling', 'positive'],
    saved: false,
  },
  {
    id: '5',
    title: 'Mindful Walking',
    description: 'Take a walk while focusing on your surroundings and the sensation of movement.',
    category: 'Mindfulness',
    type: 'Physical Activity',
    duration: '15-30 minutes',
    difficulty: 'Easy',
    tags: ['mindfulness', 'walking', 'nature', 'movement'],
    saved: false,
  },
  {
    id: '6',
    title: 'Body Scan Meditation',
    description: 'Focus attention on different parts of your body to increase body awareness and relaxation.',
    category: 'Mindfulness',
    type: 'Meditation',
    duration: '10-20 minutes',
    difficulty: 'Medium',
    tags: ['mindfulness', 'meditation', 'body', 'awareness'],
    saved: false,
  },
  {
    id: '7',
    title: 'Sleep Hygiene Routine',
    description: 'Create a consistent bedtime routine to improve sleep quality and mental health.',
    category: 'Sleep',
    type: 'Self-Care',
    duration: '30-60 minutes',
    difficulty: 'Medium',
    tags: ['sleep', 'routine', 'self-care', 'health'],
    saved: false,
  },
  {
    id: '8',
    title: 'Creative Expression',
    description: 'Express your feelings through art, music, writing, or other creative outlets.',
    category: 'Self-Care',
    type: 'Creative Activity',
    duration: '20-60 minutes',
    difficulty: 'Easy',
    tags: ['creative', 'expression', 'art', 'emotions'],
    saved: false,
  },
  {
    id: '9',
    title: 'Social Connection',
    description: 'Reach out to friends, family, or support groups to maintain social connections.',
    category: 'Self-Care',
    type: 'Social Activity',
    duration: '30-120 minutes',
    difficulty: 'Medium',
    tags: ['social', 'connection', 'support', 'relationships'],
    saved: false,
  },
  {
    id: '10',
    title: 'Cognitive Reframing',
    description: 'Challenge negative thoughts and reframe them in a more balanced, realistic way.',
    category: 'Depression',
    type: 'Cognitive Technique',
    duration: '5-15 minutes',
    difficulty: 'Hard',
    tags: ['depression', 'thinking', 'cognitive', 'reframing'],
    saved: false,
  },
];

const categories = ['All', 'Anxiety', 'Stress', 'Depression', 'Mindfulness', 'Sleep', 'Self-Care'];
const types = ['All', 'Breathing Exercise', 'Grounding Technique', 'Physical Activity', 'Journaling', 'Meditation', 'Creative Activity', 'Social Activity', 'Cognitive Technique'];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Anxiety': return Brain;
    case 'Stress': return Activity;
    case 'Depression': return Heart;
    case 'Mindfulness': return Sun;
    case 'Sleep': return Moon;
    case 'Self-Care': return Users;
    default: return BookOpen;
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return 'bg-green-100 text-green-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Hard': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function ResourceLibrary() {
  const [strategies, setStrategies] = useState<CopingStrategy[]>(copingStrategies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    // Load saved strategies from localStorage
    const savedIds = JSON.parse(localStorage.getItem('saved_strategies') || '[]');
    setStrategies(prev => prev.map(strategy => ({
      ...strategy,
      saved: savedIds.includes(strategy.id)
    })));
  }, []);

  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || strategy.category === selectedCategory;
    const matchesType = selectedType === 'All' || strategy.type === selectedType;
    const matchesSaved = !showSavedOnly || strategy.saved;

    return matchesSearch && matchesCategory && matchesType && matchesSaved;
  });

  const handleSaveStrategy = (strategyId: string) => {
    const updatedStrategies = strategies.map(strategy => 
      strategy.id === strategyId ? { ...strategy, saved: !strategy.saved } : strategy
    );
    setStrategies(updatedStrategies);

    // Update localStorage
    const savedIds = updatedStrategies.filter(s => s.saved).map(s => s.id);
    localStorage.setItem('saved_strategies', JSON.stringify(savedIds));
  };

  const savedCount = strategies.filter(s => s.saved).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-500" />
          Coping Strategy Library
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Discover and save strategies to support your mental wellness journey
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search strategies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {types.map(type => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showSavedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSavedOnly(!showSavedOnly)}
            >
              <Bookmark className="h-4 w-4 mr-1" />
              Saved Only ({savedCount})
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {filteredStrategies.length} strategy{filteredStrategies.length !== 1 ? 'ies' : 'y'} found
            </h3>
          </div>

          {filteredStrategies.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No strategies found matching your criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedType('All');
                  setShowSavedOnly(false);
                }}
                className="mt-2"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredStrategies.map(strategy => {
                const CategoryIcon = getCategoryIcon(strategy.category);
                return (
                  <Card key={strategy.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <CategoryIcon className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{strategy.title}</h4>
                                {strategy.saved && (
                                  <Bookmark className="h-4 w-4 text-blue-500 fill-current" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {strategy.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {strategy.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {strategy.type}
                                </Badge>
                                <Badge className={`text-xs ${getDifficultyColor(strategy.difficulty)}`}>
                                  {strategy.difficulty}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {strategy.duration}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveStrategy(strategy.id)}
                          className="ml-2"
                        >
                          <Bookmark className={`h-4 w-4 ${strategy.saved ? 'text-blue-500 fill-current' : ''}`} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-purple-800 mb-1">Tips for Using Coping Strategies</p>
              <ul className="text-purple-700 space-y-1">
                <li>• Try different strategies to find what works best for you</li>
                <li>• Practice regularly, even when you're feeling good</li>
                <li>• Combine multiple strategies for better results</li>
                <li>• Be patient - some strategies take time to become effective</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

