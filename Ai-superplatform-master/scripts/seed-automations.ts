import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAutomations() {
  try {
    console.log('🌱 Seeding automation routines...');

    // Get the first user (or create one if none exists)
    let user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found, creating a test user...');
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          passwordHash: 'hashedpassword',
          name: 'Test User'
        }
      });
    }

    // Create sample automation routines
    const automations = [
      {
        name: 'Mood Check-in Reminder',
        description: 'Automatically creates a mood check-in prompt when you log a low mood score',
        triggers: [
          {
            type: 'MOOD_BELOW_THRESHOLD',
            params: { threshold: 4 }
          }
        ],
        actions: [
          {
            type: 'CREATE_MOOD_CHECK_IN',
            params: { 
              prompt: 'I noticed you\'re feeling down. Would you like to take a moment to reflect on what might be causing this and how you can support yourself?' 
            }
          }
        ]
      },
      {
        name: 'Exercise Habit Celebration',
        description: 'Sends a congratulatory message when you complete your exercise habit',
        triggers: [
          {
            type: 'HABIT_COMPLETED',
            params: { habitName: 'Exercise' }
          }
        ],
        actions: [
          {
            type: 'SEND_NOTIFICATION',
            params: { 
              message: '🎉 Great job completing your exercise! You\'re building a healthy habit that will benefit you for years to come.',
              priority: 'MEDIUM'
            }
          }
        ]
      },
      {
        name: 'Weekly Reflection',
        description: 'Creates a journal prompt every Sunday evening for weekly reflection',
        triggers: [
          {
            type: 'SCHEDULED_TIME',
            params: { cron: '0 20 * * 0' } // Every Sunday at 8 PM
          }
        ],
        actions: [
          {
            type: 'CREATE_JOURNAL_PROMPT',
            params: { 
              prompt: 'Take a moment to reflect on your week. What went well? What challenges did you face? What are you grateful for? What would you like to focus on next week?' 
            }
          }
        ]
      },
      {
        name: 'High Spending Alert',
        description: 'Analyzes spending patterns when you make a large transaction',
        triggers: [
          {
            type: 'TRANSACTION_CREATED',
            params: { minAmount: 100 }
          }
        ],
        actions: [
          {
            type: 'ANALYZE_SPENDING_PATTERN',
            params: {}
          }
        ]
      },
      {
        name: 'Stress Relief Assistant',
        description: 'Suggests coping strategies when you log a stressful mood',
        triggers: [
          {
            type: 'MOOD_BELOW_THRESHOLD',
            params: { threshold: 3 }
          }
        ],
        actions: [
          {
            type: 'SUGGEST_COPING_STRATEGY',
            params: { category: 'Stress' }
          },
          {
            type: 'SUGGEST_ACTIVITY',
            params: { mood: 3, timeOfDay: 'afternoon' }
          }
        ]
      },
      {
        name: 'Morning Motivation',
        description: 'Sends an encouraging message every weekday morning',
        triggers: [
          {
            type: 'SCHEDULED_TIME',
            params: { cron: '0 8 * * 1-5' } // Weekdays at 8 AM
          }
        ],
        actions: [
          {
            type: 'SEND_NOTIFICATION',
            params: { 
              message: 'Good morning! 🌅 Today is a new opportunity to make progress toward your goals. What would you like to accomplish today?',
              priority: 'LOW'
            }
          }
        ]
      },
      {
        name: 'Goal Achievement Celebration',
        description: 'Celebrates when you complete a goal',
        triggers: [
          {
            type: 'GOAL_COMPLETED',
            params: {}
          }
        ],
        actions: [
          {
            type: 'SEND_NOTIFICATION',
            params: { 
              message: '🎉 Congratulations on achieving your goal! You\'ve shown dedication and perseverance. Take a moment to celebrate this accomplishment!',
              priority: 'HIGH'
            }
          },
          {
            type: 'CREATE_JOURNAL_PROMPT',
            params: { 
              prompt: 'You just achieved a goal! Take some time to reflect on this accomplishment. What did you learn? How did you grow? What\'s next on your journey?' 
            }
          }
        ]
      },
      {
        name: 'Evening Wind-down',
        description: 'Helps you wind down in the evening with relaxation suggestions',
        triggers: [
          {
            type: 'SCHEDULED_TIME',
            params: { cron: '0 21 * * *' } // Every day at 9 PM
          }
        ],
        actions: [
          {
            type: 'SUGGEST_ACTIVITY',
            params: { timeOfDay: 'evening' }
          },
          {
            type: 'CREATE_JOURNAL_PROMPT',
            params: { 
              prompt: 'As you wind down for the day, take a moment to reflect. What are you grateful for today? What\'s one thing you\'re looking forward to tomorrow?' 
            }
          }
        ]
      }
    ];

    // Create each automation routine
    for (const automation of automations) {
      const routine = await prisma.automationRoutine.create({
        data: {
          userId: user.id,
          name: automation.name,
          description: automation.description,
          triggers: {
            create: automation.triggers.map(trigger => ({
              type: trigger.type,
              params: trigger.params
            }))
          },
          actions: {
            create: automation.actions.map(action => ({
              type: action.type,
              params: action.params
            }))
          }
        }
      });

      console.log(`✅ Created automation: ${routine.name}`);
    }

    console.log('🎉 Automation seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding automations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAutomations();
