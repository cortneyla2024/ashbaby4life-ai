"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LMSSystem, Course, StudentProgress } from "@/lib/education/lms-system";
import { BookOpen, GraduationCap, Target, Clock, Star, Play, CheckCircle, Award } from "lucide-react";

interface EducationalInterfaceProps {
  userId: string;
  onCourseSelect?: (course: Course) => void;
}

const EducationalInterface: React.FC<EducationalInterfaceProps> = ({
  userId,
  onCourseSelect,
}) => {
  const [lmsSystem] = useState(() => new LMSSystem());
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [recommendations, setRecommendations] = useState<{ courses: Course[]; reasons: string[] }>({ courses: [], reasons: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: "",
    level: "",
    gradeLevel: "",
  });

  useEffect(() => {
    loadCourses();
    loadRecommendations();
  }, []);

  const loadCourses = async() => {
    try {
      const allCourses = await lmsSystem.getCourses();
      setCourses(allCourses);

      // Load enrolled courses
      const enrolled: Course[] = [];
      for (const course of allCourses) {
        const progress = await lmsSystem.getStudentProgress(userId, course.id);
        if (progress) {
          enrolled.push(course);
        }
      }
      setEnrolledCourses(enrolled);
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async() => {
    try {
      const recs = await lmsSystem.generatePersonalizedRecommendations(userId);
      setRecommendations(recs);
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    }
  };

  const enrollInCourse = async(course: Course) => {
    try {
      await lmsSystem.enrollStudent(userId, course.id);
      setEnrolledCourses(prev => [...prev, course]);
      setSelectedCourse(course);

      if (onCourseSelect) {
        onCourseSelect(course);
      }
    } catch (error) {
      console.error("Failed to enroll in course:", error);
    }
  };

  const selectCourse = async(course: Course) => {
    setSelectedCourse(course);
    const progress = await lmsSystem.getStudentProgress(userId, course.id);
    setStudentProgress(progress);

    if (onCourseSelect) {
      onCourseSelect(course);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) {
return "bg-green-500";
}
    if (difficulty <= 6) {
return "bg-yellow-500";
}
    return "bg-red-500";
  };

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-blue-100 text-blue-800",
      advanced: "bg-purple-100 text-purple-800",
      expert: "bg-red-100 text-red-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading educational content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <GraduationCap className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Universal Educator</h1>
        </div>
        <p className="text-purple-100">
          Your personal AI teacher for any subject, from kindergarten to PhD level.
        </p>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">All Courses</TabsTrigger>
          <TabsTrigger value="enrolled">My Learning</TabsTrigger>
          <TabsTrigger value="recommendations">Recommended</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Language Arts">Language Arts</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Philosophy">Philosophy</option>
              </select>

              <select
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>

              <select
                value={filters.gradeLevel}
                onChange={(e) => setFilters(prev => ({ ...prev, gradeLevel: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Grade Levels</option>
                <option value="kindergarten">Kindergarten</option>
                <option value="elementary">Elementary</option>
                <option value="middle">Middle School</option>
                <option value="high">High School</option>
                <option value="college">College</option>
                <option value="graduate">Graduate</option>
              </select>
            </div>
          </Card>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses
              .filter(course => {
                if (filters.subject && course.subject !== filters.subject) {
return false;
}
                if (filters.level && course.level !== filters.level) {
return false;
}
                if (filters.gradeLevel && course.gradeLevel !== filters.gradeLevel) {
return false;
}
                return true;
              })
              .map(course => (
                <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-3 h-3 rounded-full ${getDifficultyColor(course.difficulty)}`}></div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                      {course.gradeLevel && (
                        <Badge variant="secondary">{course.gradeLevel}</Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.estimatedDuration}h</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.modules.length} modules</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {course.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => selectCourse(course)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      onClick={() => enrollInCourse(course)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Enroll
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-6">
          {enrolledCourses.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Enrolled Courses</h3>
              <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course.</p>
              <Button onClick={() => document.querySelector("[data-value=\"courses\"]")?.click()}>
                Browse Courses
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => {
                const progress = studentProgress?.courseId === course.id ? studentProgress : null;
                return (
                  <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>

                    {progress && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-500">{progress.overallProgress}%</span>
                        </div>
                        <Progress value={progress.overallProgress} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.estimatedDuration}h</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{progress?.completedLessons.length || 0}/{course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => selectCourse(course)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {recommendations.courses.length === 0 ? (
            <Card className="p-8 text-center">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Yet</h3>
              <p className="text-gray-600 mb-4">Complete some courses to get personalized recommendations.</p>
              <Button onClick={() => document.querySelector("[data-value=\"courses\"]")?.click()}>
                Browse Courses
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Why These Recommendations?</h3>
                <ul className="space-y-1">
                  {recommendations.reasons.map((reason, index) => (
                    <li key={index} className="text-blue-800 text-sm flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.courses.map(course => (
                  <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow border-2 border-blue-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getLevelColor(course.level)}>
                          {course.level}
                        </Badge>
                        {course.gradeLevel && (
                          <Badge variant="secondary">{course.gradeLevel}</Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.estimatedDuration}h</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.modules.length} modules</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => enrollInCourse(course)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Enroll Now
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {enrolledCourses.length === 0 ? (
            <Card className="p-8 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Learning Progress</h3>
              <p className="text-gray-600 mb-4">Enroll in courses to track your learning progress.</p>
              <Button onClick={() => document.querySelector("[data-value=\"courses\"]")?.click()}>
                Browse Courses
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {enrolledCourses.map(course => {
                const progress = studentProgress?.courseId === course.id ? studentProgress : null;
                if (!progress) {
return null;
}

                const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
                const completedLessons = progress.completedLessons.length;
                const totalAssessments = course.modules.reduce((acc, m) => acc + m.assessments.length, 0);
                const completedAssessments = progress.completedAssessments.length;
                const avgGrade = Object.values(progress.grades).length > 0
                  ? Object.values(progress.grades).reduce((a, b) => a + b, 0) / Object.values(progress.grades).length
                  : 0;

                return (
                  <Card key={course.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                      <Badge variant="outline" className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{progress.overallProgress}%</div>
                        <div className="text-sm text-gray-600">Overall Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{completedLessons}/{totalLessons}</div>
                        <div className="text-sm text-gray-600">Lessons Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{completedAssessments}/{totalAssessments}</div>
                        <div className="text-sm text-gray-600">Assessments Passed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{avgGrade.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Average Grade</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Course Progress</span>
                          <span className="text-sm text-gray-500">{progress.overallProgress}%</span>
                        </div>
                        <Progress value={progress.overallProgress} className="h-3" />
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Time Spent: {Math.round(progress.timeSpent / 60)} hours</span>
                        <span>Last Accessed: {progress.lastAccessed.toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        onClick={() => selectCourse(course)}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Continue Learning
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EducationalInterface;
