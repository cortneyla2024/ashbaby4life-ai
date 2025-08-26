import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  try {
    // Clear existing data (optional - comment out if you want to preserve data)
    console.log('🧹 Clearing existing data...');
    await prisma.automationLog.deleteMany();
    await prisma.automationAction.deleteMany();
    await prisma.automationTrigger.deleteMany();
    await prisma.automationRoutine.deleteMany();
    await prisma.proactiveInsight.deleteMany();
    await prisma.voiceCommandLog.deleteMany();
    await prisma.userAPIToken.deleteMany();
    await prisma.generatedActivity.deleteMany();
    await prisma.generatedGame.deleteMany();
    await prisma.familyCircle.deleteMany();
    await prisma.guidedConversation.deleteMany();
    await prisma.mediaPreference.deleteMany();
    await prisma.generatedAsset.deleteMany();
    await prisma.creativeProject.deleteMany();
    await prisma.habitLog.deleteMany();
    await prisma.habit.deleteMany();
    await prisma.learningResource.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.eventRSVP.deleteMany();
    await prisma.event.deleteMany();
    await prisma.postComment.deleteMany();
    await prisma.communityPost.deleteMany();
    await prisma.communityMember.deleteMany();
    await prisma.community.deleteMany();
    await prisma.financialGoal.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.savedStrategy.deleteMany();
    await prisma.copingStrategy.deleteMany();
    await prisma.moodEntry.deleteMany();
    await prisma.mentalHealthAssessment.deleteMany();
    await prisma.aIInsight.deleteMany();
    await prisma.journalEntry.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.aIMessage.deleteMany();
    await prisma.aIConversation.deleteMany();
    await prisma.healthMetric.deleteMany();
    await prisma.musicComposition.deleteMany();
    await prisma.searchHistory.deleteMany();
    await prisma.analyticsEvent.deleteMany();
    await prisma.aIPersona.deleteMany();
    await prisma.user.deleteMany();

    // Create demo user
    console.log('👤 Creating demo user...');
    const hashedPassword = await bcrypt.hash('demo123', 12);
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@ailifecompanion.com',
        username: 'demo_user',
        passwordHash: hashedPassword,
        name: 'Demo User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
      }
    });

    // Create AI Persona
    console.log('🤖 Creating AI Persona...');
    await prisma.aIPersona.create({
      data: {
        userId: demoUser.id,
        personaName: 'Companion',
        communicationStyle: 'Empathetic',
        systemPrompt: `You are a compassionate AI life companion designed to support personal growth, mental wellness, and life optimization. You provide thoughtful, evidence-based guidance while maintaining a warm, understanding presence. You help users navigate challenges, celebrate successes, and build meaningful habits.`
      }
    });

    // Seed Mental Health Module
    console.log('🧠 Seeding mental health data...');
    await prisma.copingStrategy.createMany({
      data: [
        {
          title: 'Deep Breathing Exercise',
          description: 'A simple breathing technique to reduce anxiety and stress',
          category: 'Anxiety',
          type: 'Breathing Exercise',
          content: JSON.stringify({
            steps: [
              'Find a comfortable position',
              'Breathe in slowly through your nose for 4 counts',
              'Hold your breath for 4 counts',
              'Exhale slowly through your mouth for 6 counts',
              'Repeat 5-10 times'
            ],
            duration: '5 minutes'
          })
        },
        {
          title: '5-4-3-2-1 Grounding Technique',
          description: 'A sensory grounding exercise to help with anxiety and dissociation',
          category: 'Anxiety',
          type: 'Grounding Technique',
          content: JSON.stringify({
            steps: [
              'Name 5 things you can see',
              'Name 4 things you can touch',
              'Name 3 things you can hear',
              'Name 2 things you can smell',
              'Name 1 thing you can taste'
            ],
            duration: '3 minutes'
          })
        }
      ]
    });

    // Create some mood entries
    await prisma.moodEntry.createMany({
      data: [
        {
          userId: demoUser.id,
          moodScore: 8,
          notes: 'Had a great day at work, completed all my tasks',
          tags: 'work,productive,accomplished',
          aiInsight: 'You seem to thrive when you have clear goals and accomplish them. Consider setting daily priorities to maintain this positive momentum.'
        },
        {
          userId: demoUser.id,
          moodScore: 6,
          notes: 'Feeling a bit tired but overall okay',
          tags: 'tired,neutral',
          aiInsight: 'It\'s normal to have days where you feel tired. Consider getting some rest or doing a light activity you enjoy.'
        }
      ]
    });

    // Seed Financial Wellness Module
    console.log('💰 Seeding financial data...');
    await prisma.budget.createMany({
      data: [
        {
          userId: demoUser.id,
          name: 'Monthly Groceries',
          category: 'Food',
          amount: 400,
          period: 'Monthly'
        },
        {
          userId: demoUser.id,
          name: 'Entertainment',
          category: 'Leisure',
          amount: 200,
          period: 'Monthly'
        }
      ]
    });

    await prisma.transaction.createMany({
      data: [
        {
          userId: demoUser.id,
          description: 'Grocery shopping',
          amount: 85.50,
          type: 'Expense',
          category: 'Food',
          date: new Date()
        },
        {
          userId: demoUser.id,
          description: 'Salary deposit',
          amount: 3000,
          type: 'Income',
          category: 'Salary',
          date: new Date()
        }
      ]
    });

    await prisma.financialGoal.createMany({
      data: [
        {
          userId: demoUser.id,
          name: 'Emergency Fund',
          targetAmount: 10000,
          currentAmount: 2500,
          targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          priority: 'High',
          aiSuggestion: 'Consider setting up automatic transfers of $625/month to reach your goal on time.'
        }
      ]
    });

    // Seed Social Connection Hub
    console.log('👥 Seeding social data...');
    const community = await prisma.community.create({
      data: {
        name: 'Wellness Warriors',
        description: 'A supportive community for mental health and personal growth',
        isPublic: true,
        ownerId: demoUser.id
      }
    });

    await prisma.communityMember.create({
      data: {
        userId: demoUser.id,
        communityId: community.id,
        role: 'ADMIN'
      }
    });

    // Seed Personal Growth & Learning
    console.log('📚 Seeding learning data...');
    const skill = await prisma.skill.create({
      data: {
        userId: demoUser.id,
        name: 'JavaScript Programming',
        masteryLevel: 45,
        aiLearningPlan: 'Focus on ES6+ features, async/await, and modern frameworks like React or Vue.js.'
      }
    });

    await prisma.learningResource.createMany({
      data: [
        {
          skillId: skill.id,
          title: 'JavaScript: The Good Parts',
          url: 'https://www.oreilly.com/library/view/javascript-the-good/9780596517748/',
          type: 'BOOK',
          notes: 'Classic book on JavaScript best practices'
        },
        {
          skillId: skill.id,
          title: 'Modern JavaScript Tutorial',
          url: 'https://javascript.info/',
          type: 'ARTICLE',
          notes: 'Comprehensive online tutorial'
        }
      ]
    });

    await prisma.habit.createMany({
      data: [
        {
          userId: demoUser.id,
          name: 'Daily Meditation',
          frequency: 'Daily',
          goal: 'Improve mental clarity and reduce stress'
        },
        {
          userId: demoUser.id,
          name: 'Read 30 minutes',
          frequency: 'Daily',
          goal: 'Expand knowledge and improve focus'
        }
      ]
    });

    // Seed Creative Expression
    console.log('🎨 Seeding creative data...');
    await prisma.creativeProject.create({
      data: {
        userId: demoUser.id,
        title: 'My First AI Art Collection',
        description: 'A collection of AI-generated artwork exploring themes of nature and technology',
        type: 'AI_ART_COLLECTION'
      }
    });

    await prisma.mediaPreference.createMany({
      data: [
        {
          userId: demoUser.id,
          type: 'MUSIC_GENRE',
          likes: 'ambient,electronic,classical',
          dislikes: 'heavy metal,country'
        },
        {
          userId: demoUser.id,
          type: 'MOVIE',
          likes: 'sci-fi,documentary,comedy',
          dislikes: 'horror,romance'
        }
      ]
    });

    // Seed Automation Routines
    console.log('⚙️ Seeding automation data...');
    const automationRoutine = await prisma.automationRoutine.create({
      data: {
        userId: demoUser.id,
        name: 'Mood Check-in Reminder',
        description: 'Daily reminder to log mood and reflect on the day',
        isEnabled: true
      }
    });

    await prisma.automationTrigger.create({
      data: {
        routineId: automationRoutine.id,
        type: 'SCHEDULED_TIME',
        params: JSON.stringify({ cron: '0 20 * * *' }) // 8 PM daily
      }
    });

    await prisma.automationAction.create({
      data: {
        routineId: automationRoutine.id,
        type: 'CREATE_JOURNAL_PROMPT',
        params: JSON.stringify({ 
          prompt: 'How are you feeling today? Take a moment to reflect on your mood and any significant events.'
        })
      }
    });

    // Seed Goals
    console.log('🎯 Seeding goals data...');
    const goal = await prisma.goal.create({
      data: {
        userId: demoUser.id,
        title: 'Learn React Framework',
        description: 'Master React fundamentals and build a portfolio project',
        category: 'learning',
        status: 'active',
        priority: 'high',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        progress: 25
      }
    });

    await prisma.milestone.createMany({
      data: [
        {
          goalId: goal.id,
          title: 'Complete React Basics Course',
          description: 'Finish the fundamentals section of the React course',
          completed: true,
          completedAt: new Date()
        },
        {
          goalId: goal.id,
          title: 'Build First React App',
          description: 'Create a simple todo application using React',
          completed: false
        }
      ]
    });

    // Seed Journal Entries
    console.log('📝 Seeding journal data...');
    await prisma.journalEntry.createMany({
      data: [
        {
          userId: demoUser.id,
          title: 'Reflection on Personal Growth',
          content: 'Today I realized how much I\'ve grown in the past year. My ability to handle stress has improved significantly, and I\'m more confident in my decision-making.',
          mood: 'grateful',
          tags: 'growth,reflection,gratitude',
          isPrivate: true
        },
        {
          userId: demoUser.id,
          title: 'Learning JavaScript',
          content: 'Started learning JavaScript today. The concepts are challenging but exciting. I can see how powerful this language is for web development.',
          mood: 'excited',
          tags: 'learning,javascript,programming',
          isPrivate: false
        }
      ]
    });

    // Seed Health Metrics
    console.log('🏥 Seeding health data...');
    await prisma.healthMetric.createMany({
      data: [
        {
          userId: demoUser.id,
          type: 'sleep',
          value: 7.5,
          unit: 'hours',
          notes: 'Good quality sleep, felt rested'
        },
        {
          userId: demoUser.id,
          type: 'steps',
          value: 8500,
          unit: 'steps',
          notes: 'Walked around the neighborhood'
        }
      ]
    });

    // Seed AI Conversations
    console.log('💬 Seeding AI conversations...');
    const conversation = await prisma.aIConversation.create({
      data: {
        userId: demoUser.id,
        title: 'Goal Setting Discussion',
        context: 'Planning personal and professional goals for the upcoming year'
      }
    });

    await prisma.aIMessage.createMany({
      data: [
        {
          conversationId: conversation.id,
          role: 'user',
          content: 'I want to improve my productivity and learn new skills this year. Can you help me create a plan?'
        },
        {
          conversationId: conversation.id,
          role: 'assistant',
          content: 'I\'d be happy to help you create a comprehensive plan! Let\'s start by identifying your key areas for improvement and setting SMART goals. What specific skills are you most interested in learning?'
        }
      ]
    });

    // Seed Proactive Insights
    console.log('💡 Seeding proactive insights...');
    await prisma.proactiveInsight.createMany({
      data: [
        {
          userId: demoUser.id,
          content: 'Based on your recent mood patterns, you tend to feel more energized in the mornings. Consider scheduling important tasks during this time.',
          category: 'WELLNESS',
          priority: 'MEDIUM'
        },
        {
          userId: demoUser.id,
          content: 'You\'re making great progress on your emergency fund! At this rate, you\'ll reach your goal ahead of schedule.',
          category: 'FINANCE',
          priority: 'LOW'
        }
      ]
    });

    // Seed Family Circle (for future use)
    console.log('👨‍👩‍👧‍👦 Seeding family circle data...');
    await prisma.familyCircle.create({
      data: {
        name: 'Demo Family',
        members: {
          connect: { id: demoUser.id }
        }
      }
    });

    // Seed Generated Games
    console.log('🎮 Seeding generated games...');
    await prisma.generatedGame.create({
      data: {
        userId: demoUser.id,
        title: 'Mindfulness Memory Game',
        description: 'A memory game that helps improve focus and mindfulness',
        gameType: 'puzzle',
        code: '// Simple memory game implementation\nconst game = {\n  cards: [],\n  score: 0\n};',
        assets: JSON.stringify({
          images: ['card1.png', 'card2.png'],
          sounds: ['flip.mp3', 'match.mp3']
        }),
        isPublic: true
      }
    });

    // Seed Generated Activities
    console.log('🎯 Seeding generated activities...');
    await prisma.generatedActivity.create({
      data: {
        userId: demoUser.id,
        title: 'Nature Photography Walk',
        description: 'A guided walk to practice mindfulness and photography',
        activityType: 'art_project',
        plan: 'Walk through local park, take photos of interesting patterns in nature, practice mindful observation',
        materials: JSON.stringify([
          'Camera or smartphone',
          'Comfortable walking shoes',
          'Water bottle'
        ]),
        duration: 60,
        isPublic: true
      }
    });

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created data for user: ${demoUser.email}`);
    console.log('🔑 Demo credentials: demo@ailifecompanion.com / demo123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
