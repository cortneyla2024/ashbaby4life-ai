import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const copingStrategies = [
  {
    title: '4-7-8 Breathing Exercise',
    description: 'A simple breathing technique to help reduce anxiety and promote relaxation.',
    category: 'Anxiety',
    type: 'Breathing Exercise',
    content: {
      steps: [
        'Sit or lie down in a comfortable position',
        'Place your tongue against the roof of your mouth',
        'Close your mouth and inhale through your nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale through your mouth for 8 counts',
        'Repeat this cycle 4 times',
        'Practice twice daily for best results'
      ],
      duration: '5-10 minutes',
      difficulty: 'Beginner'
    }
  },
  {
    title: '5-4-3-2-1 Grounding Technique',
    description: 'A sensory grounding exercise to help you stay present and reduce overwhelming feelings.',
    category: 'Anxiety',
    type: 'Grounding Technique',
    content: {
      steps: [
        'Look around and name 5 things you can see',
        'Touch 4 things and notice their texture',
        'Listen for 3 sounds around you',
        'Identify 2 things you can smell',
        'Name 1 thing you can taste',
        'Take a deep breath and notice how you feel'
      ],
      duration: '2-3 minutes',
      difficulty: 'Beginner'
    }
  },
  {
    title: 'Progressive Muscle Relaxation',
    description: 'A technique that involves tensing and relaxing different muscle groups to reduce physical tension.',
    category: 'Stress',
    type: 'Physical Activity',
    content: {
      steps: [
        'Find a quiet, comfortable place to sit or lie down',
        'Start with your toes - tense them for 5 seconds, then relax',
        'Move up to your calves, thighs, stomach, chest, arms, hands, neck, and face',
        'Tense each muscle group for 5 seconds, then relax for 10 seconds',
        'Notice the difference between tension and relaxation',
        'End with a few deep breaths'
      ],
      duration: '10-15 minutes',
      difficulty: 'Beginner'
    }
  },
  {
    title: 'Mindful Walking',
    description: 'A form of meditation that combines walking with mindfulness to reduce stress and improve mood.',
    category: 'Mindfulness',
    type: 'Physical Activity',
    content: {
      steps: [
        'Find a safe place to walk (indoor or outdoor)',
        'Walk at a natural, comfortable pace',
        'Focus on the sensation of your feet touching the ground',
        'Notice your breathing as you walk',
        'If your mind wanders, gently bring it back to your walking',
        'Continue for 10-20 minutes'
      ],
      duration: '10-20 minutes',
      difficulty: 'Beginner'
    }
  },
  {
    title: 'Gratitude Journaling',
    description: 'Writing down things you\'re grateful for to improve mood and mental well-being.',
    category: 'Self-Care',
    type: 'Creative Expression',
    content: {
      steps: [
        'Set aside 5-10 minutes each day',
        'Write down 3 things you\'re grateful for',
        'Be specific and detailed in your descriptions',
        'Include both big and small things',
        'Reflect on why each item makes you grateful',
        'Try to notice new things each day'
      ],
      duration: '5-10 minutes',
      difficulty: 'Beginner'
    }
  },
  {
    title: 'Body Scan Meditation',
    description: 'A mindfulness practice that helps you become aware of physical sensations throughout your body.',
    category: 'Mindfulness',
    type: 'Mindfulness',
    content: {
      steps: [
        'Lie down in a comfortable position',
        'Close your eyes and take a few deep breaths',
        'Start at your toes and work your way up to your head',
        'Notice any sensations, tension, or relaxation in each area',
        'Don\'t try to change anything, just observe',
        'Spend 30-60 seconds on each body part'
      ],
      duration: '10-20 minutes',
      difficulty: 'Beginner'
    }
  },
  {
    title: 'Social Connection Time',
    description: 'Intentionally spending time with others to improve mood and reduce feelings of isolation.',
    category: 'Self-Care',
    type: 'Social Connection',
    content: {
      steps: [
        'Reach out to a friend or family member',
        'Schedule a phone call, video chat, or in-person meetup',
        'Share something positive from your day',
        'Ask about their day and really listen',
        'Express appreciation for their friendship',
        'Make plans for future connection'
      ],
      duration: '15-30 minutes',
      difficulty: 'Beginner'
    }
  },
  {
    title: 'Sleep Hygiene Routine',
    description: 'Establishing healthy habits to improve sleep quality and overall mental health.',
    category: 'Sleep',
    type: 'Self-Care',
    content: {
      steps: [
        'Go to bed and wake up at the same time every day',
        'Create a relaxing bedtime routine',
        'Avoid screens 1 hour before bed',
        'Keep your bedroom cool, dark, and quiet',
        'Avoid caffeine after 2 PM',
        'Exercise regularly, but not close to bedtime'
      ],
      duration: 'Ongoing',
      difficulty: 'Beginner'
    }
  },
  {
    title: 'Creative Expression',
    description: 'Using art, music, writing, or other creative outlets to process emotions and reduce stress.',
    category: 'Self-Care',
    type: 'Creative Expression',
    content: {
      steps: [
        'Choose a creative activity you enjoy',
        'Set aside 15-30 minutes for your activity',
        'Focus on the process, not the outcome',
        'Express your feelings through your chosen medium',
        'Don\'t worry about being "good" at it',
        'Enjoy the therapeutic benefits of creation'
      ],
      duration: '15-30 minutes',
      difficulty: 'Beginner'
    }
  },
  {
    title: 'Mindful Eating',
    description: 'Paying attention to the experience of eating to improve relationship with food and reduce stress.',
    category: 'Self-Care',
    type: 'Mindfulness',
    content: {
      steps: [
        'Eat without distractions (no TV, phone, etc.)',
        'Take time to notice the appearance and smell of your food',
        'Take small bites and chew slowly',
        'Notice the taste, texture, and temperature',
        'Pay attention to hunger and fullness cues',
        'Express gratitude for your meal'
      ],
      duration: '20-30 minutes',
      difficulty: 'Beginner'
    }
  }
];

async function seedMentalHealth() {
  try {
    console.log('🌱 Seeding mental health data...');

    // Clear existing coping strategies
    await prisma.copingStrategy.deleteMany();
    console.log('Cleared existing coping strategies');

    // Insert new coping strategies
    for (const strategy of copingStrategies) {
      await prisma.copingStrategy.create({
        data: strategy
      });
    }
    console.log(`✅ Created ${copingStrategies.length} coping strategies`);

    console.log('🎉 Mental health seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding mental health data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedMentalHealth();
