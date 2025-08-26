import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const conciergeRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  context: z.object({
    currentPage: z.string().optional(),
    userHistory: z.array(z.any()).optional(),
    preferences: z.record(z.any()).optional(),
    currentData: z.record(z.any()).optional(),
  }).optional(),
  requestType: z.enum([
    'general_question',
    'task_help',
    'data_analysis',
    'recommendation',
    'automation_suggestion',
    'health_guidance',
    'financial_advice',
    'learning_support',
    'emotional_support',
    'technical_support'
  ]).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  expectResponse: z.boolean().optional(),
});

// Mock AI knowledge base and capabilities
const knowledgeBase = {
  health: {
    mentalHealth: {
      copingStrategies: [
        'Deep breathing exercises (4-7-8 technique)',
        'Progressive muscle relaxation',
        'Mindfulness meditation',
        'Journaling thoughts and feelings',
        'Physical exercise or gentle movement',
        'Connecting with supportive friends or family',
        'Engaging in creative activities',
        'Practicing gratitude',
        'Setting healthy boundaries',
        'Seeking professional help when needed'
      ],
      emergencyResources: [
        { name: 'National Suicide Prevention Lifeline', phone: '988', available: '24/7' },
        { name: 'Crisis Text Line', contact: 'Text HOME to 741741', available: '24/7' },
        { name: 'SAMHSA National Helpline', phone: '1-800-662-4357', available: '24/7' }
      ],
      moodBoostActivities: [
        'Listen to uplifting music',
        'Take a walk in nature',
        'Practice gratitude by listing 3 good things',
        'Do a small act of kindness',
        'Watch a funny video or read jokes',
        'Call a friend or family member',
        'Engage in a hobby you enjoy',
        'Take a warm bath or shower',
        'Practice yoga or stretching',
        'Cook or bake something you love'
      ]
    },
    physical: {
      dailyWellnessTips: [
        'Drink at least 8 glasses of water daily',
        'Aim for 7-9 hours of quality sleep',
        'Take regular breaks from screens (20-20-20 rule)',
        'Incorporate 30 minutes of physical activity',
        'Eat a balanced diet with fruits and vegetables',
        'Practice good posture throughout the day',
        'Limit caffeine intake, especially in the afternoon',
        'Get some sunlight exposure for vitamin D',
        'Practice stress reduction techniques',
        'Maintain social connections'
      ]
    }
  },
  finance: {
    budgetingTips: [
      'Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
      'Track all expenses for at least a month to understand spending patterns',
      'Set up automatic transfers to savings accounts',
      'Use the envelope method for discretionary spending',
      'Review and cancel unused subscriptions regularly',
      'Compare prices before making large purchases',
      'Build an emergency fund covering 3-6 months of expenses',
      'Pay off high-interest debt first',
      'Take advantage of employer 401k matching',
      'Review your budget monthly and adjust as needed'
    ],
    savingStrategies: [
      'Set specific, measurable savings goals',
      'Use high-yield savings accounts',
      'Automate your savings',
      'Save windfalls like tax refunds or bonuses',
      'Use cashback and rewards programs strategically',
      'Consider the 52-week savings challenge',
      'Reduce recurring expenses where possible',
      'Cook at home more often',
      'Buy generic brands when quality is comparable',
      'Use coupons and shop sales strategically'
    ]
  },
  productivity: {
    timeManagement: [
      'Use the Pomodoro Technique: 25 minutes work, 5 minutes break',
      'Prioritize tasks using the Eisenhower Matrix',
      'Time-block your calendar for important activities',
      'Batch similar tasks together',
      'Eliminate or minimize distractions during focused work',
      'Use the two-minute rule: if it takes less than 2 minutes, do it now',
      'Plan your day the night before',
      'Learn to say no to non-essential commitments',
      'Delegate tasks when possible',
      'Take regular breaks to maintain energy and focus'
    ],
    goalSetting: [
      'Use SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound',
      'Break large goals into smaller, actionable steps',
      'Write down your goals and review them regularly',
      'Create accountability by sharing goals with others',
      'Track progress visually with charts or apps',
      'Celebrate small wins along the way',
      'Adjust goals as circumstances change',
      'Focus on process goals, not just outcome goals',
      'Link goals to your deeper values and purpose',
      'Review and set new goals quarterly'
    ]
  }
};

// Mock user data for personalized responses
const mockUserData = {
  'user-1': {
    name: 'Alex',
    preferences: {
      communicationStyle: 'friendly',
      detailLevel: 'moderate',
      interests: ['health', 'finance', 'productivity'],
      goals: ['improve mental health', 'save money', 'learn new skills']
    },
    recentActivity: {
      lastMoodEntry: { mood: 6, date: '2024-01-15', notes: 'Feeling okay today' },
      lastFinancialEntry: { type: 'expense', amount: 50, category: 'groceries' },
      currentStreak: { type: 'mood_tracking', days: 7 }
    }
  }
};

// AI response generation functions
function generatePersonalizedResponse(request: any, userContext: any) {
  const message = request.message.toLowerCase();
  const user = userContext || mockUserData['user-1'];
  
  // Intent detection (simplified)
  if (message.includes('help') || message.includes('assist')) {
    return generateHelpResponse(message, user);
  } else if (message.includes('mood') || message.includes('feeling') || message.includes('sad') || message.includes('anxious')) {
    return generateMentalHealthResponse(message, user);
  } else if (message.includes('money') || message.includes('budget') || message.includes('save') || message.includes('expense')) {
    return generateFinancialResponse(message, user);
  } else if (message.includes('goal') || message.includes('productive') || message.includes('time') || message.includes('focus')) {
    return generateProductivityResponse(message, user);
  } else if (message.includes('learn') || message.includes('study') || message.includes('education')) {
    return generateLearningResponse(message, user);
  } else {
    return generateGeneralResponse(message, user);
  }
}

function generateHelpResponse(message: string, user: any) {
  return {
    response: `Hi ${user.name}! I'm here to help you with anything you need. I can assist with:

🧠 **Mental Health & Wellbeing**
- Track and analyze your mood patterns
- Suggest coping strategies and stress management techniques
- Provide emotional support and guidance

💰 **Financial Management**
- Help you create and stick to budgets
- Track expenses and savings goals
- Provide personalized financial advice

📚 **Learning & Growth**
- Create personalized learning plans
- Track your progress and celebrate achievements
- Connect you with relevant resources

🎯 **Productivity & Goals**
- Help you set and achieve meaningful goals
- Suggest time management strategies
- Create automation to streamline your life

What would you like to work on today?`,
    actionItems: [
      { title: 'Check your mood', action: 'navigate', target: '/dashboard/mental-health' },
      { title: 'Review budget', action: 'navigate', target: '/dashboard/financial' },
      { title: 'Set a new goal', action: 'open_modal', target: 'goal_setting' }
    ],
    followUpQuestions: [
      'How are you feeling today?',
      'What\'s your biggest challenge right now?',
      'Is there a specific goal you\'d like to work on?'
    ]
  };
}

function generateMentalHealthResponse(message: string, user: any) {
  const recentMood = user.recentActivity?.lastMoodEntry?.mood || 5;
  const strategies = knowledgeBase.health.mentalHealth.copingStrategies.slice(0, 3);
  
  let response = `I understand you're reaching out about how you're feeling. `;
  
  if (message.includes('sad') || message.includes('down') || message.includes('depressed')) {
    response += `It's completely normal to have difficult days. Here are some strategies that might help:

${strategies.map((strategy, index) => `${index + 1}. ${strategy}`).join('\n')}

Remember, if you're experiencing persistent sadness or thoughts of self-harm, please reach out to a mental health professional or call 988 for immediate support.`;
  } else if (message.includes('anxious') || message.includes('worried') || message.includes('stress')) {
    response += `Anxiety and stress are very common experiences. Here are some techniques to help you feel more grounded:

• **Immediate relief**: Try the 4-7-8 breathing technique (inhale for 4, hold for 7, exhale for 8)
• **Physical**: Go for a short walk or do some gentle stretching
• **Mental**: Practice the 5-4-3-2-1 grounding technique (5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste)

Would you like me to guide you through a quick relaxation exercise?`;
  } else {
    response += `Based on your recent mood tracking, I see you've been maintaining a ${recentMood}/10 average. That's great self-awareness! 

Here are some mood-boosting activities you might enjoy:
${knowledgeBase.health.mentalHealth.moodBoostActivities.slice(0, 4).map(activity => `• ${activity}`).join('\n')}`;
  }
  
  return {
    response,
    actionItems: [
      { title: 'Log your mood', action: 'navigate', target: '/dashboard/mental-health' },
      { title: 'Try guided meditation', action: 'start_activity', target: 'meditation' },
      { title: 'Emergency resources', action: 'show_info', target: 'crisis_resources' }
    ],
    resources: knowledgeBase.health.mentalHealth.emergencyResources,
    followUpQuestions: [
      'Would you like to track your mood today?',
      'Are there specific triggers you\'d like to discuss?',
      'Would you like me to remind you to check in later?'
    ]
  };
}

function generateFinancialResponse(message: string, user: any) {
  let response = `I'd be happy to help you with your financial goals! `;
  
  if (message.includes('budget')) {
    response += `Creating and maintaining a budget is one of the best steps for financial health. Here's a simple approach:

**The 50/30/20 Rule:**
• 50% for needs (rent, utilities, groceries, minimum debt payments)
• 30% for wants (entertainment, dining out, hobbies)
• 20% for savings and extra debt payments

**Getting Started:**
1. Track your expenses for a week to see where your money goes
2. Categorize your spending
3. Set realistic limits for each category
4. Review weekly and adjust as needed

I can help you set up budget categories and track your progress!`;
  } else if (message.includes('save')) {
    response += `Saving money is a great goal! Here are some effective strategies:

${knowledgeBase.finance.savingStrategies.slice(0, 5).map((tip, index) => `${index + 1}. ${tip}`).join('\n')}

**Quick Start Tips:**
• Start small - even $25/week adds up to $1,300/year
• Automate your savings so you don't have to think about it
• Find one expense to cut this week

What's your savings goal? I can help you create a plan to reach it!`;
  } else {
    response += `Let's work on improving your financial wellness. Here are some key areas we can focus on:

• **Budgeting**: Track and control your spending
• **Saving**: Build your emergency fund and reach your goals
• **Debt Management**: Create a plan to pay off any debts
• **Investment Planning**: Start building wealth for the future

Your recent activity shows you're already tracking expenses - that's a great start!`;
  }
  
  return {
    response,
    actionItems: [
      { title: 'Add a transaction', action: 'navigate', target: '/dashboard/financial' },
      { title: 'Set up a budget', action: 'open_modal', target: 'budget_setup' },
      { title: 'View spending analysis', action: 'navigate', target: '/dashboard/financial?tab=analytics' }
    ],
    followUpQuestions: [
      'What\'s your main financial goal right now?',
      'Would you like help creating a budget?',
      'Are you interested in saving for something specific?'
    ]
  };
}

function generateProductivityResponse(message: string, user: any) {
  const response = `Great question about productivity! Here are some strategies that can help:

**Time Management:**
${knowledgeBase.productivity.timeManagement.slice(0, 4).map(tip => `• ${tip}`).join('\n')}

**Goal Achievement:**
${knowledgeBase.productivity.goalSetting.slice(0, 3).map(tip => `• ${tip}`).join('\n')}

**Quick Wins for Today:**
• Choose your top 3 priorities and focus on those first
• Eliminate one distraction from your workspace
• Take a 5-minute break every hour
• End your day by planning tomorrow

What specific area of productivity would you like to work on?`;
  
  return {
    response,
    actionItems: [
      { title: 'Set a daily goal', action: 'open_modal', target: 'goal_setting' },
      { title: 'Start focus timer', action: 'start_activity', target: 'pomodoro' },
      { title: 'Review your goals', action: 'navigate', target: '/dashboard/goals' }
    ],
    followUpQuestions: [
      'What\'s your biggest productivity challenge?',
      'Would you like help setting up a daily routine?',
      'Are there specific goals you\'d like to work on?'
    ]
  };
}

function generateLearningResponse(message: string, user: any) {
  const response = `I love that you're focused on learning and growth! Here's how I can support your learning journey:

**Effective Learning Strategies:**
• Set specific, measurable learning goals
• Break complex topics into smaller chunks
• Use active recall and spaced repetition
• Connect new information to what you already know
• Practice regularly and consistently

**Learning Resources I Can Help With:**
• Creating personalized learning plans
• Tracking your progress and celebrating milestones
• Finding relevant courses and materials
• Setting up learning reminders and accountability

**Quick Learning Tips:**
• Dedicate 20-30 minutes daily to focused learning
• Teach someone else what you've learned
• Take notes by hand when possible
• Review material within 24 hours of learning

What would you like to learn or improve on?`;
  
  return {
    response,
    actionItems: [
      { title: 'Browse courses', action: 'navigate', target: '/dashboard/learning' },
      { title: 'Set learning goal', action: 'open_modal', target: 'learning_goal' },
      { title: 'View progress', action: 'navigate', target: '/dashboard/learning?tab=progress' }
    ],
    followUpQuestions: [
      'What subject interests you most right now?',
      'Do you prefer structured courses or self-directed learning?',
      'How much time can you dedicate to learning each day?'
    ]
  };
}

function generateGeneralResponse(message: string, user: any) {
  const response = `Hi ${user.name}! I'm here to help you with all aspects of your personal growth and wellbeing. 

I can assist you with:
• 🧠 Mental health and mood tracking
• 💰 Financial planning and budgeting  
• 📚 Learning and skill development
• 🎯 Goal setting and productivity
• 🏥 Health and wellness guidance
• 📱 Using CareConnect features effectively

Based on your recent activity, I notice you've been consistently tracking your mood - that's fantastic for building self-awareness! 

How can I help you today? Feel free to ask me anything or let me know what you'd like to work on.`;
  
  return {
    response,
    actionItems: [
      { title: 'Quick mood check', action: 'navigate', target: '/dashboard/mental-health' },
      { title: 'View dashboard', action: 'navigate', target: '/dashboard' },
      { title: 'Explore features', action: 'open_modal', target: 'feature_tour' }
    ],
    followUpQuestions: [
      'How are you feeling today?',
      'What\'s your main focus area right now?',
      'Is there something specific you\'d like help with?'
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedRequest = conciergeRequestSchema.parse(body);
    
    // Get user context (mock for now)
    const userId = 'user-1';
    const userContext = mockUserData[userId as keyof typeof mockUserData];
    
    // Generate AI response
    const aiResponse = generatePersonalizedResponse(validatedRequest, userContext);
    
    // Log the interaction for learning (in production, this would go to a database)
    const interaction = {
      id: `interaction-${Date.now()}`,
      userId,
      timestamp: new Date().toISOString(),
      request: validatedRequest,
      response: aiResponse,
      context: validatedRequest.context,
    };
    
    return NextResponse.json({
      ...aiResponse,
      interactionId: interaction.id,
      timestamp: interaction.timestamp,
      metadata: {
        responseTime: '~200ms',
        confidence: 0.85,
        sources: ['knowledge_base', 'user_context', 'behavioral_patterns'],
      }
    });
  } catch (error) {
    console.error('Error processing concierge request:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        response: "I apologize, but I'm having trouble processing your request right now. Please try again or contact support if the issue persists.",
        error: 'Failed to process request' 
      },
      { status: 500 }
    );
  }
}
