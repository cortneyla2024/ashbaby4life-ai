"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ClipboardList, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle,
  Brain,
  Heart,
  Activity,
  Sparkles,
  BookOpen,
  Shield
} from "lucide-react";

interface AssessmentQuestion {
  id: string;
  text: string;
  category: string;
}

interface AssessmentResult {
  score: number;
  severity: 'Minimal' | 'Mild' | 'Moderate' | 'Moderately Severe' | 'Severe';
  interpretation: string;
  recommendations: string[];
  nextSteps: string[];
}

const phq9Questions: AssessmentQuestion[] = [
  {
    id: 'phq1',
    text: 'Little interest or pleasure in doing things',
    category: 'Depression'
  },
  {
    id: 'phq2',
    text: 'Feeling down, depressed, or hopeless',
    category: 'Depression'
  },
  {
    id: 'phq3',
    text: 'Trouble falling or staying asleep, or sleeping too much',
    category: 'Depression'
  },
  {
    id: 'phq4',
    text: 'Feeling tired or having little energy',
    category: 'Depression'
  },
  {
    id: 'phq5',
    text: 'Poor appetite or overeating',
    category: 'Depression'
  },
  {
    id: 'phq6',
    text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
    category: 'Depression'
  },
  {
    id: 'phq7',
    text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
    category: 'Depression'
  },
  {
    id: 'phq8',
    text: 'Moving or speaking slowly enough that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
    category: 'Depression'
  },
  {
    id: 'phq9',
    text: 'Thoughts that you would be better off dead or of hurting yourself in some way',
    category: 'Depression'
  }
];

const gad7Questions: AssessmentQuestion[] = [
  {
    id: 'gad1',
    text: 'Feeling nervous, anxious, or on edge',
    category: 'Anxiety'
  },
  {
    id: 'gad2',
    text: 'Not being able to stop or control worrying',
    category: 'Anxiety'
  },
  {
    id: 'gad3',
    text: 'Worrying too much about different things',
    category: 'Anxiety'
  },
  {
    id: 'gad4',
    text: 'Trouble relaxing',
    category: 'Anxiety'
  },
  {
    id: 'gad5',
    text: 'Being so restless that it is hard to sit still',
    category: 'Anxiety'
  },
  {
    id: 'gad6',
    text: 'Becoming easily annoyed or irritable',
    category: 'Anxiety'
  },
  {
    id: 'gad7',
    text: 'Feeling afraid as if something awful might happen',
    category: 'Anxiety'
  }
];

const responseOptions = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' }
];

const calculatePHQ9Result = (score: number): AssessmentResult => {
  let severity: AssessmentResult['severity'];
  let interpretation: string;
  let recommendations: string[];
  let nextSteps: string[];

  if (score <= 4) {
    severity = 'Minimal';
    interpretation = 'Your responses suggest minimal depression symptoms. This is great news!';
    recommendations = [
      'Continue with your current routine and self-care practices',
      'Maintain healthy sleep, exercise, and social connections',
      'Consider regular mood tracking to monitor your well-being'
    ];
    nextSteps = [
      'Continue with preventive mental health practices',
      'Consider periodic reassessment every few months'
    ];
  } else if (score <= 9) {
    severity = 'Mild';
    interpretation = 'Your responses suggest mild depression symptoms. This is common and manageable.';
    recommendations = [
      'Practice self-care activities regularly',
      'Consider talking to a trusted friend or family member',
      'Try stress-reduction techniques like meditation or exercise',
      'Maintain a regular sleep schedule'
    ];
    nextSteps = [
      'Monitor your symptoms over the next few weeks',
      'Consider speaking with a mental health professional if symptoms persist',
      'Reassess in 2-4 weeks'
    ];
  } else if (score <= 14) {
    severity = 'Moderate';
    interpretation = 'Your responses suggest moderate depression symptoms that may benefit from professional support.';
    recommendations = [
      'Consider speaking with a mental health professional',
      'Practice daily self-care and stress management',
      'Maintain social connections and support systems',
      'Consider lifestyle changes like regular exercise and healthy eating'
    ];
    nextSteps = [
      'Schedule an appointment with a mental health professional',
      'Consider therapy or counseling options',
      'Reassess in 1-2 weeks'
    ];
  } else if (score <= 19) {
    severity = 'Moderately Severe';
    interpretation = 'Your responses suggest moderately severe depression symptoms that likely require professional treatment.';
    recommendations = [
      'Seek professional mental health support as soon as possible',
      'Consider medication evaluation with a psychiatrist',
      'Engage in regular therapy or counseling',
      'Build a strong support network of friends and family'
    ];
    nextSteps = [
      'Contact a mental health professional immediately',
      'Consider crisis resources if needed',
      'Involve trusted family or friends in your care plan'
    ];
  } else {
    severity = 'Severe';
    interpretation = 'Your responses suggest severe depression symptoms that require immediate professional attention.';
    recommendations = [
      'Seek immediate professional mental health support',
      'Consider medication evaluation with a psychiatrist',
      'Engage in intensive therapy or treatment programs',
      'Build a comprehensive support network'
    ];
    nextSteps = [
      'Contact a mental health professional immediately',
      'Consider crisis hotlines or emergency services if needed',
      'Involve trusted family or friends in your care plan',
      'Consider inpatient treatment if recommended by professionals'
    ];
  }

  return {
    score,
    severity,
    interpretation,
    recommendations,
    nextSteps
  };
};

const calculateGAD7Result = (score: number): AssessmentResult => {
  let severity: AssessmentResult['severity'];
  let interpretation: string;
  let recommendations: string[];
  let nextSteps: string[];

  if (score <= 4) {
    severity = 'Minimal';
    interpretation = 'Your responses suggest minimal anxiety symptoms. This is great news!';
    recommendations = [
      'Continue with your current routine and stress management practices',
      'Maintain healthy sleep, exercise, and relaxation techniques',
      'Consider regular anxiety tracking to monitor your well-being'
    ];
    nextSteps = [
      'Continue with preventive mental health practices',
      'Consider periodic reassessment every few months'
    ];
  } else if (score <= 9) {
    severity = 'Mild';
    interpretation = 'Your responses suggest mild anxiety symptoms. This is common and manageable.';
    recommendations = [
      'Practice relaxation techniques like deep breathing or meditation',
      'Consider talking to a trusted friend or family member',
      'Try stress-reduction activities like exercise or hobbies',
      'Maintain a regular sleep schedule'
    ];
    nextSteps = [
      'Monitor your symptoms over the next few weeks',
      'Consider speaking with a mental health professional if symptoms persist',
      'Reassess in 2-4 weeks'
    ];
  } else if (score <= 14) {
    severity = 'Moderate';
    interpretation = 'Your responses suggest moderate anxiety symptoms that may benefit from professional support.';
    recommendations = [
      'Consider speaking with a mental health professional',
      'Practice daily relaxation and stress management techniques',
      'Consider cognitive-behavioral therapy techniques',
      'Maintain regular exercise and healthy lifestyle habits'
    ];
    nextSteps = [
      'Schedule an appointment with a mental health professional',
      'Consider therapy or counseling options',
      'Reassess in 1-2 weeks'
    ];
  } else {
    severity = 'Severe';
    interpretation = 'Your responses suggest severe anxiety symptoms that likely require professional treatment.';
    recommendations = [
      'Seek professional mental health support as soon as possible',
      'Consider medication evaluation with a psychiatrist',
      'Engage in regular therapy or counseling',
      'Practice daily anxiety management techniques'
    ];
    nextSteps = [
      'Contact a mental health professional immediately',
      'Consider crisis resources if needed',
      'Involve trusted family or friends in your care plan'
    ];
  }

  return {
    score,
    severity,
    interpretation,
    recommendations,
    nextSteps
  };
};

export default function AssessmentWizard() {
  const [selectedAssessment, setSelectedAssessment] = useState<'phq9' | 'gad7' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const questions = selectedAssessment === 'phq9' ? phq9Questions : gad7Questions;
  const progress = (currentQuestion / questions.length) * 100;

  const handleAnswer = (value: number) => {
    const questionId = questions[currentQuestion].id;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate results
      const totalScore = questions.reduce((sum, question) => {
        return sum + (answers[question.id] || 0);
      }, 0);

      const assessmentResult = selectedAssessment === 'phq9' 
        ? calculatePHQ9Result(totalScore)
        : calculateGAD7Result(totalScore);

      setResult(assessmentResult);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRestart = () => {
    setSelectedAssessment(null);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResult(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Minimal': return 'bg-green-100 text-green-800';
      case 'Mild': return 'bg-yellow-100 text-yellow-800';
      case 'Moderate': return 'bg-orange-100 text-orange-800';
      case 'Moderately Severe': return 'bg-red-100 text-red-800';
      case 'Severe': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!selectedAssessment) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-500" />
            Mental Health Assessment
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose an assessment to evaluate your mental health status
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAssessment('phq9')}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">PHQ-9 Depression Assessment</h3>
                    <p className="text-muted-foreground mb-3">
                      A 9-question assessment to screen for depression symptoms. Takes about 5 minutes to complete.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>9 questions • 5 minutes</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAssessment('gad7')}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">GAD-7 Anxiety Assessment</h3>
                    <p className="text-muted-foreground mb-3">
                      A 7-question assessment to screen for anxiety symptoms. Takes about 3 minutes to complete.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>7 questions • 3 minutes</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Important Disclaimer</p>
                <p className="text-blue-700">
                  These assessments are screening tools and not a substitute for professional diagnosis. 
                  If you're experiencing severe symptoms or thoughts of self-harm, please contact a mental 
                  health professional or crisis hotline immediately.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults && result) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Assessment Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold">{result.score}</div>
            <div className="text-lg text-muted-foreground">Total Score</div>
            <Badge className={`text-sm ${getSeverityColor(result.severity)}`}>
              {result.severity} Severity
            </Badge>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Interpretation</h3>
            <p className="text-muted-foreground">{result.interpretation}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Recommendations</h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Next Steps</h3>
            <ul className="space-y-2">
              {result.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Activity className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRestart} variant="outline" className="flex-1">
              Take Another Assessment
            </Button>
            <Button onClick={() => setShowResults(false)} className="flex-1">
              View Detailed Results
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const currentAnswer = answers[currentQuestionData.id];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-blue-500" />
          {selectedAssessment === 'phq9' ? 'PHQ-9 Depression Assessment' : 'GAD-7 Anxiety Assessment'}
        </CardTitle>
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {currentQuestionData.text}
          </h3>
          <p className="text-sm text-muted-foreground">
            Over the last 2 weeks, how often have you been bothered by this problem?
          </p>
        </div>

        <div className="space-y-3">
          {responseOptions.map((option) => (
            <Button
              key={option.value}
              variant={currentAnswer === option.value ? "default" : "outline"}
              className="w-full justify-start h-auto p-4"
              onClick={() => handleAnswer(option.value)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  currentAnswer === option.value 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300'
                }`} />
                <div className="text-left">
                  <div className="font-medium">{option.label}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentAnswer === undefined}
            className="flex-1"
          >
            {currentQuestion === questions.length - 1 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Get Results
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

