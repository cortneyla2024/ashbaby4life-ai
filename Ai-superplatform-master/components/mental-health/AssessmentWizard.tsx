"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, ArrowLeft, ArrowRight, CheckCircle, Brain, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AssessmentQuestion {
  id: number;
  text: string;
  options: {
    value: number;
    label: string;
    description: string;
  }[];
}

interface AssessmentResult {
  type: string;
  scores: { [key: number]: number };
  totalScore: number;
  summary?: string;
}

const phq9Questions: AssessmentQuestion[] = [
  {
    id: 1,
    text: "Little interest or pleasure in doing things",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
  {
    id: 2,
    text: "Feeling down, depressed, or hopeless",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
  {
    id: 3,
    text: "Trouble falling or staying asleep, or sleeping too much",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
  {
    id: 4,
    text: "Feeling tired or having little energy",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
  {
    id: 5,
    text: "Poor appetite or overeating",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
  {
    id: 6,
    text: "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
  {
    id: 7,
    text: "Trouble concentrating on things, such as reading the newspaper or watching television",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
  {
    id: 8,
    text: "Moving or speaking slowly enough that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
  {
    id: 9,
    text: "Thoughts that you would be better off dead or of hurting yourself in some way",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
];

const gad7Questions: AssessmentQuestion[] = [
  {
    id: 1,
    text: "Feeling nervous, anxious, or on edge",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
  {
    id: 2,
    text: "Not being able to stop or control worrying",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
  {
    id: 3,
    text: "Worrying too much about different things",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
  {
    id: 4,
    text: "Trouble relaxing",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
  {
    id: 5,
    text: "Being so restless that it's hard to sit still",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
  {
    id: 6,
    text: "Becoming easily annoyed or irritable",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
  {
    id: 7,
    text: "Feeling afraid as if something awful might happen",
    options: [
      { value: 0, label: "Not at all", description: "No problems" },
      { value: 1, label: "Several days", description: "1-2 days in the past week" },
      { value: 2, label: "More than half the days", description: "3-4 days in the past week" },
      { value: 3, label: "Nearly every day", description: "5-7 days in the past week" },
    ],
  },
];

const assessments = {
  "PHQ-9": {
    title: "Patient Health Questionnaire (PHQ-9)",
    description: "A 9-item depression screening tool",
    questions: phq9Questions,
    maxScore: 27,
  },
  "GAD-7": {
    title: "Generalized Anxiety Disorder (GAD-7)",
    description: "A 7-item anxiety screening tool",
    questions: gad7Questions,
    maxScore: 21,
  },
};

export default function AssessmentWizard() {
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const assessment = selectedAssessment ? assessments[selectedAssessment as keyof typeof assessments] : null;
  const questions = assessment?.questions || [];
  const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;

  const handleAnswerSelect = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async() => {
    if (!selectedAssessment) {
return;
}

    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const resultData: AssessmentResult = {
      type: selectedAssessment,
      scores: answers,
      totalScore,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/mental-health/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: selectedAssessment,
          scores: resultData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          ...resultData,
          summary: data.summary,
        });
        toast.success("Assessment completed successfully!");
      } else {
        toast.error("Failed to submit assessment");
      }
    } catch (error) {
      toast.error("Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityLevel = (score: number, type: string) => {
    if (type === "PHQ-9") {
      if (score <= 4) {
return { level: "Minimal", color: "bg-green-100 text-green-800" };
}
      if (score <= 9) {
return { level: "Mild", color: "bg-yellow-100 text-yellow-800" };
}
      if (score <= 14) {
return { level: "Moderate", color: "bg-orange-100 text-orange-800" };
}
      if (score <= 19) {
return { level: "Moderately Severe", color: "bg-red-100 text-red-800" };
}
      return { level: "Severe", color: "bg-red-200 text-red-900" };
    } else if (type === "GAD-7") {
      if (score <= 4) {
return { level: "Minimal", color: "bg-green-100 text-green-800" };
}
      if (score <= 9) {
return { level: "Mild", color: "bg-yellow-100 text-yellow-800" };
}
      if (score <= 14) {
return { level: "Moderate", color: "bg-orange-100 text-orange-800" };
}
      return { level: "Severe", color: "bg-red-100 text-red-800" };
    }
    return { level: "Unknown", color: "bg-gray-100 text-gray-800" };
  };

  const handleRestart = () => {
    setSelectedAssessment("");
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  };

  // Assessment Selection Screen
  if (!selectedAssessment) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Mental Health Assessment
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose an assessment to evaluate your mental health status
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(assessments).map(([key, assessment]) => (
            <Card
              key={key}
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
              onClick={() => setSelectedAssessment(key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{assessment.title}</h3>
                    <p className="text-sm text-muted-foreground">{assessment.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {assessment.questions.length} questions • ~5 minutes
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important Note:</p>
                <p>
                  These assessments are for self-screening purposes only and should not replace professional medical advice.
                  If you&apos;re experiencing severe symptoms, please consult with a mental health professional.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Results Screen
  if (result) {
    const severity = getSeverityLevel(result.totalScore, result.type);
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Assessment Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{assessments[selectedAssessment as keyof typeof assessments].title}</h3>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{result.totalScore}</p>
                <p className="text-sm text-muted-foreground">Total Score</p>
              </div>
              <div className="text-center">
                <Badge className={severity.color}>
                  {severity.level}
                </Badge>
              </div>
            </div>
          </div>

          {result.summary && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Analysis
              </h4>
              <p className="text-sm text-muted-foreground">{result.summary}</p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium">Your Responses:</h4>
            {questions.map((question) => (
              <div key={question.id} className="text-sm">
                <p className="font-medium">{question.id}. {question.text}</p>
                <p className="text-muted-foreground">
                  Response: {question.options.find(opt => opt.value === answers[question.id])?.label || "Not answered"}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRestart} variant="outline" className="flex-1">
              Take Another Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Question Screen
  const currentQuestion = questions[currentStep];
  const isAnswered = answers[currentQuestion?.id] !== undefined;
  const canProceed = isAnswered || currentStep === 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {assessment?.title}
          </CardTitle>
          <Badge variant="outline">
            {currentStep + 1} of {questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        {currentQuestion && (
          <>
            <div>
              <h3 className="text-lg font-medium mb-4">
                {currentQuestion.text}
              </h3>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option.value)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      answers[currentQuestion.id] === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {answers[currentQuestion.id] === option.value && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? "Submitting..." : "Complete Assessment"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
