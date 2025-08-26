import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const courseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  category: z.string().min(1).max(50),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().positive(), // in minutes
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  learning_objectives: z.array(z.string()),
  modules: z.array(z.object({
    title: z.string(),
    description: z.string(),
    duration: z.number(),
    content_type: z.enum(['video', 'text', 'interactive', 'quiz', 'assignment']),
    content_url: z.string().optional(),
    is_free: z.boolean().optional(),
  })),
  instructor: z.object({
    name: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    credentials: z.array(z.string()).optional(),
  }),
  pricing: z.object({
    type: z.enum(['free', 'paid', 'subscription']),
    amount: z.number().optional(),
    currency: z.string().optional(),
  }),
  is_published: z.boolean().optional(),
  language: z.string().optional(),
  certificate_available: z.boolean().optional(),
});

const enrollmentSchema = z.object({
  courseId: z.string(),
  goals: z.array(z.string()).optional(),
  expected_completion_date: z.string().datetime().optional(),
  study_schedule: z.object({
    days_per_week: z.number().min(1).max(7),
    hours_per_session: z.number().positive(),
    preferred_times: z.array(z.string()),
  }).optional(),
});

// Mock data store
let courses = [
  {
    id: '1',
    title: 'Mindfulness and Stress Management',
    description: 'Learn practical mindfulness techniques to reduce stress and improve mental well-being. This comprehensive course covers meditation, breathing exercises, and daily mindfulness practices.',
    category: 'Mental Health',
    difficulty: 'beginner',
    duration: 360, // 6 hours
    tags: ['mindfulness', 'stress', 'meditation', 'wellness'],
    prerequisites: [],
    learning_objectives: [
      'Understand the science behind mindfulness and stress',
      'Learn 5 different meditation techniques',
      'Develop a personal daily mindfulness routine',
      'Apply mindfulness to reduce workplace stress',
      'Create healthy stress management habits'
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Introduction to Mindfulness',
        description: 'What is mindfulness and why it matters for mental health',
        duration: 45,
        content_type: 'video',
        content_url: '/courses/mindfulness/intro.mp4',
        is_free: true,
        completed: false,
      },
      {
        id: 'mod-2',
        title: 'Basic Breathing Techniques',
        description: 'Learn fundamental breathing exercises for instant calm',
        duration: 60,
        content_type: 'interactive',
        content_url: '/courses/mindfulness/breathing.html',
        is_free: true,
        completed: false,
      },
      {
        id: 'mod-3',
        title: 'Body Scan Meditation',
        description: 'Progressive relaxation through body awareness',
        duration: 75,
        content_type: 'video',
        content_url: '/courses/mindfulness/body-scan.mp4',
        is_free: false,
        completed: false,
      },
      {
        id: 'mod-4',
        title: 'Mindful Daily Activities',
        description: 'Incorporating mindfulness into everyday tasks',
        duration: 90,
        content_type: 'text',
        content_url: '/courses/mindfulness/daily-practice.pdf',
        is_free: false,
        completed: false,
      },
      {
        id: 'mod-5',
        title: 'Stress Response and Recovery',
        description: 'Understanding and managing your stress response',
        duration: 90,
        content_type: 'interactive',
        content_url: '/courses/mindfulness/stress-response.html',
        is_free: false,
        completed: false,
      }
    ],
    instructor: {
      name: 'Dr. Sarah Chen',
      bio: 'Licensed clinical psychologist specializing in mindfulness-based stress reduction',
      avatar: '/instructors/sarah-chen.jpg',
      credentials: ['PhD Psychology', 'MBSR Certified', '10+ years experience']
    },
    pricing: {
      type: 'paid',
      amount: 49.99,
      currency: 'USD'
    },
    is_published: true,
    language: 'English',
    certificate_available: true,
    rating: 4.8,
    enrolled_count: 1247,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-10').toISOString(),
  },
  {
    id: '2',
    title: 'Personal Finance Fundamentals',
    description: 'Master the basics of personal finance including budgeting, saving, investing, and debt management. Build a solid foundation for financial wellness.',
    category: 'Finance',
    difficulty: 'beginner',
    duration: 480, // 8 hours
    tags: ['finance', 'budgeting', 'investing', 'savings'],
    prerequisites: [],
    learning_objectives: [
      'Create and maintain a personal budget',
      'Understand different types of investments',
      'Build an emergency fund strategy',
      'Learn debt reduction techniques',
      'Plan for long-term financial goals'
    ],
    modules: [
      {
        id: 'fin-1',
        title: 'Financial Goal Setting',
        description: 'Define and prioritize your financial objectives',
        duration: 60,
        content_type: 'video',
        content_url: '/courses/finance/goals.mp4',
        is_free: true,
        completed: false,
      },
      {
        id: 'fin-2',
        title: 'Budgeting Basics',
        description: 'Learn the 50/30/20 rule and budget tracking',
        duration: 90,
        content_type: 'interactive',
        content_url: '/courses/finance/budgeting.html',
        is_free: true,
        completed: false,
      },
      {
        id: 'fin-3',
        title: 'Emergency Fund Building',
        description: 'How to build and maintain your safety net',
        duration: 75,
        content_type: 'video',
        content_url: '/courses/finance/emergency-fund.mp4',
        is_free: false,
        completed: false,
      },
      {
        id: 'fin-4',
        title: 'Debt Management Strategies',
        description: 'Snowball vs avalanche methods and debt consolidation',
        duration: 120,
        content_type: 'text',
        content_url: '/courses/finance/debt-management.pdf',
        is_free: false,
        completed: false,
      },
      {
        id: 'fin-5',
        title: 'Investment Basics',
        description: 'Introduction to stocks, bonds, and retirement accounts',
        duration: 135,
        content_type: 'video',
        content_url: '/courses/finance/investing.mp4',
        is_free: false,
        completed: false,
      }
    ],
    instructor: {
      name: 'Michael Rodriguez, CFP',
      bio: 'Certified Financial Planner with 15 years of experience helping people achieve financial independence',
      avatar: '/instructors/michael-rodriguez.jpg',
      credentials: ['CFP Certified', 'MBA Finance', 'Financial Advisor']
    },
    pricing: {
      type: 'paid',
      amount: 79.99,
      currency: 'USD'
    },
    is_published: true,
    language: 'English',
    certificate_available: true,
    rating: 4.9,
    enrolled_count: 2156,
    created_at: new Date('2024-01-05').toISOString(),
    updated_at: new Date('2024-01-12').toISOString(),
  },
  {
    id: '3',
    title: 'Productivity Mastery',
    description: 'Transform your productivity with proven systems and techniques. Learn time management, goal setting, and habit formation strategies.',
    category: 'Productivity',
    difficulty: 'intermediate',
    duration: 420, // 7 hours
    tags: ['productivity', 'time management', 'habits', 'goals'],
    prerequisites: ['Basic time management knowledge'],
    learning_objectives: [
      'Implement the Getting Things Done (GTD) system',
      'Master the Pomodoro Technique',
      'Build powerful daily and weekly routines',
      'Create systems for habit formation',
      'Optimize your workspace and digital tools'
    ],
    modules: [
      {
        id: 'prod-1',
        title: 'Productivity Assessment',
        description: 'Evaluate your current productivity patterns',
        duration: 45,
        content_type: 'quiz',
        content_url: '/courses/productivity/assessment.html',
        is_free: true,
        completed: false,
      },
      {
        id: 'prod-2',
        title: 'The GTD Method',
        description: 'Comprehensive guide to Getting Things Done',
        duration: 120,
        content_type: 'video',
        content_url: '/courses/productivity/gtd.mp4',
        is_free: false,
        completed: false,
      },
      {
        id: 'prod-3',
        title: 'Time Blocking and Calendar Management',
        description: 'Advanced calendar strategies for maximum efficiency',
        duration: 90,
        content_type: 'interactive',
        content_url: '/courses/productivity/time-blocking.html',
        is_free: false,
        completed: false,
      },
      {
        id: 'prod-4',
        title: 'Habit Formation Science',
        description: 'Build lasting habits using behavioral psychology',
        duration: 105,
        content_type: 'text',
        content_url: '/courses/productivity/habits.pdf',
        is_free: false,
        completed: false,
      },
      {
        id: 'prod-5',
        title: 'Digital Tools and Automation',
        description: 'Leverage technology to boost your productivity',
        duration: 60,
        content_type: 'video',
        content_url: '/courses/productivity/tools.mp4',
        is_free: false,
        completed: false,
      }
    ],
    instructor: {
      name: 'Emma Thompson',
      bio: 'Productivity coach and author helping professionals optimize their performance',
      avatar: '/instructors/emma-thompson.jpg',
      credentials: ['Productivity Coach', 'Best-selling Author', 'Corporate Trainer']
    },
    pricing: {
      type: 'paid',
      amount: 59.99,
      currency: 'USD'
    },
    is_published: true,
    language: 'English',
    certificate_available: true,
    rating: 4.7,
    enrolled_count: 892,
    created_at: new Date('2024-01-08').toISOString(),
    updated_at: new Date('2024-01-15').toISOString(),
  }
];

let enrollments = [
  {
    id: 'enroll-1',
    userId: 'user-1',
    courseId: '1',
    enrolled_at: new Date('2024-01-10').toISOString(),
    progress: 40, // percentage
    completed_modules: ['mod-1', 'mod-2'],
    current_module: 'mod-3',
    goals: ['Reduce daily stress', 'Improve sleep quality'],
    expected_completion_date: new Date('2024-02-10').toISOString(),
    study_schedule: {
      days_per_week: 3,
      hours_per_session: 1,
      preferred_times: ['morning', 'evening']
    },
    last_accessed: new Date('2024-01-14').toISOString(),
    certificate_earned: false,
    notes: [],
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const enrolled = searchParams.get('enrolled') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Get user ID from auth (mock for now)
    const userId = 'user-1';
    
    // Filter courses
    let filteredCourses = [...courses];
    
    if (category) {
      filteredCourses = filteredCourses.filter(course =>
        course.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (difficulty) {
      filteredCourses = filteredCourses.filter(course =>
        course.difficulty === difficulty
      );
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    if (enrolled) {
      const userEnrollments = enrollments.filter(e => e.userId === userId);
      const enrolledCourseIds = userEnrollments.map(e => e.courseId);
      filteredCourses = filteredCourses.filter(course =>
        enrolledCourseIds.includes(course.id)
      );
      
      // Add enrollment data to courses
      filteredCourses = filteredCourses.map(course => {
        const enrollment = userEnrollments.find(e => e.courseId === course.id);
        return {
          ...course,
          enrollment_data: enrollment
        };
      });
    }
    
    // Sort by rating and enrolled count
    filteredCourses.sort((a, b) => {
      return (b.rating * b.enrolled_count) - (a.rating * a.enrolled_count);
    });
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);
    
    // Calculate categories and statistics
    const categories = [...new Set(courses.map(c => c.category))];
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    
    const stats = {
      total_courses: courses.length,
      categories: categories.map(cat => ({
        name: cat,
        count: courses.filter(c => c.category === cat).length
      })),
      average_rating: courses.reduce((sum, c) => sum + c.rating, 0) / courses.length,
      total_enrolled: courses.reduce((sum, c) => sum + c.enrolled_count, 0),
    };
    
    return NextResponse.json({
      courses: paginatedCourses,
      pagination: {
        page,
        limit,
        total: filteredCourses.length,
        totalPages: Math.ceil(filteredCourses.length / limit),
      },
      filters: {
        categories,
        difficulties,
      },
      stats,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is an enrollment request
    if (body.courseId && !body.title) {
      return handleEnrollment(body);
    }
    
    // Otherwise, create a new course
    const validatedData = courseSchema.parse(body);
    
    const newCourse = {
      id: `course-${Date.now()}`,
      ...validatedData,
      modules: validatedData.modules.map((module, index) => ({
        id: `mod-${Date.now()}-${index}`,
        ...module,
        content_url: module.content_url || '',
        is_free: module.is_free ?? false,
        completed: false,
      })),
      instructor: {
        ...validatedData.instructor,
        bio: validatedData.instructor.bio || '',
        avatar: validatedData.instructor.avatar || '',
        credentials: validatedData.instructor.credentials || [],
      },
      pricing: {
        ...validatedData.pricing,
        amount: validatedData.pricing.amount || 0,
        currency: validatedData.pricing.currency || 'USD',
      },
      tags: validatedData.tags || [],
      prerequisites: validatedData.prerequisites || [],
      is_published: validatedData.is_published ?? true,
      language: validatedData.language || 'English',
      certificate_available: validatedData.certificate_available ?? false,
      rating: 0,
      enrolled_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    courses.push(newCourse);
    
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

async function handleEnrollment(body: any) {
  try {
    const validatedData = enrollmentSchema.parse(body);
    const userId = 'user-1'; // Mock user ID
    
    // Check if already enrolled
    const existingEnrollment = enrollments.find(e =>
      e.userId === userId && e.courseId === validatedData.courseId
    );
    
    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 409 }
      );
    }
    
    // Check if course exists
    const course = courses.find(c => c.id === validatedData.courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Create enrollment
    const newEnrollment = {
      id: `enroll-${Date.now()}`,
      userId,
      courseId: validatedData.courseId,
      enrolled_at: new Date().toISOString(),
      progress: 0,
      completed_modules: [],
      current_module: course.modules[0]?.id || '',
      goals: validatedData.goals || [],
      expected_completion_date: validatedData.expected_completion_date || new Date().toISOString(),
      study_schedule: validatedData.study_schedule || {
        days_per_week: 3,
        hours_per_session: 1,
        preferred_times: ['evening'],
      },
      last_accessed: new Date().toISOString(),
      certificate_earned: false,
      notes: [],
    };
    
    enrollments.push(newEnrollment);
    
    // Update course enrollment count
    course.enrolled_count += 1;
    
    // Generate personalized learning plan
    const learningPlan = generateLearningPlan(course, newEnrollment);
    
    return NextResponse.json({
      enrollment: newEnrollment,
      course: course,
      learning_plan: learningPlan,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}

function generateLearningPlan(course: any, enrollment: any) {
  const schedule = enrollment.study_schedule;
  const totalMinutes = course.duration;
  
  if (!schedule) {
    return {
      message: 'Complete the course at your own pace',
      estimated_completion: 'Self-paced learning',
    };
  }
  
  const sessionsPerWeek = schedule.days_per_week;
  const minutesPerSession = schedule.hours_per_session * 60;
  const totalWeeks = Math.ceil(totalMinutes / (sessionsPerWeek * minutesPerSession));
  
  const startDate = new Date();
  const estimatedCompletion = new Date(startDate.getTime() + (totalWeeks * 7 * 24 * 60 * 60 * 1000));
  
  return {
    total_duration: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
    sessions_per_week: sessionsPerWeek,
    minutes_per_session: minutesPerSession,
    estimated_weeks: totalWeeks,
    estimated_completion: estimatedCompletion.toISOString(),
    weekly_schedule: schedule.preferred_times,
    milestones: course.modules.map((module: any, index: number) => ({
      week: Math.ceil((index + 1) * totalWeeks / course.modules.length),
      module: module.title,
      goal: `Complete ${module.title}`,
    })),
  };
}
