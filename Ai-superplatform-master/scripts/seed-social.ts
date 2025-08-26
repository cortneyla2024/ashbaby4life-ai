import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Social Connection Hub data...');

  // Create test user if not exists
  let testUser = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashed_password_here',
        name: 'Test User',
      },
    });
    console.log('✅ Created test user');
  }

  // Create sample communities
  const communities = [
    {
      name: 'Tech Enthusiasts',
      description: 'A community for technology lovers, developers, and innovators. Share your projects, discuss the latest tech trends, and connect with fellow tech enthusiasts.',
      isPublic: true,
      ownerId: testUser.id,
    },
    {
      name: 'Mental Health Support',
      description: 'A safe space for discussing mental health, sharing experiences, and supporting each other on our wellness journeys.',
      isPublic: true,
      ownerId: testUser.id,
    },
    {
      name: 'Financial Independence',
      description: 'Join us in our journey toward financial freedom. Share tips, strategies, and support for achieving financial goals.',
      isPublic: true,
      ownerId: testUser.id,
    },
    {
      name: 'Creative Writers',
      description: 'A community for writers of all levels. Share your work, get feedback, and connect with fellow creative minds.',
      isPublic: true,
      ownerId: testUser.id,
    },
    {
      name: 'Fitness & Wellness',
      description: 'Support each other in achieving fitness and wellness goals. Share workouts, nutrition tips, and motivation.',
      isPublic: true,
      ownerId: testUser.id,
    },
    {
      name: 'Book Lovers',
      description: 'Discuss your favorite books, discover new reads, and connect with fellow bibliophiles.',
      isPublic: true,
      ownerId: testUser.id,
    },
    {
      name: 'Startup Founders',
      description: 'A private community for startup founders to share experiences, challenges, and advice.',
      isPublic: false,
      ownerId: testUser.id,
    },
    {
      name: 'Remote Workers',
      description: 'Connect with fellow remote workers, share productivity tips, and discuss the future of work.',
      isPublic: true,
      ownerId: testUser.id,
    },
  ];

  for (const communityData of communities) {
    const existingCommunity = await prisma.community.findUnique({
      where: { name: communityData.name },
    });

    if (!existingCommunity) {
      const community = await prisma.community.create({
        data: communityData,
      });

      // Add the creator as a member
      await prisma.communityMember.create({
        data: {
          userId: testUser.id,
          communityId: community.id,
          role: 'ADMIN',
        },
      });

      console.log(`✅ Created community: ${community.name}`);
    }
  }

  // Create sample events
  const events = [
    {
      name: 'Tech Meetup: AI & Machine Learning',
      description: 'Join us for an evening of discussions about the latest developments in AI and machine learning. Network with professionals and enthusiasts in the field.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      location: 'Virtual Event (Zoom)',
      isPublic: true,
      organizerId: testUser.id,
    },
    {
      name: 'Mental Health Workshop: Stress Management',
      description: 'Learn practical techniques for managing stress and anxiety. This workshop will include guided exercises and group discussions.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      location: 'Community Center, Downtown',
      isPublic: true,
      organizerId: testUser.id,
    },
    {
      name: 'Financial Planning Seminar',
      description: 'Expert-led seminar on personal finance, investment strategies, and building wealth for the future.',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      location: 'Business District Conference Room',
      isPublic: true,
      organizerId: testUser.id,
    },
    {
      name: 'Creative Writing Workshop',
      description: 'Unlock your creativity in this hands-on writing workshop. Suitable for all levels, from beginners to experienced writers.',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      location: 'Local Library',
      isPublic: true,
      organizerId: testUser.id,
    },
    {
      name: 'Fitness Challenge Kickoff',
      description: 'Start your fitness journey with our 30-day challenge. Meet like-minded individuals and support each other in achieving your goals.',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      location: 'City Park',
      isPublic: true,
      organizerId: testUser.id,
    },
    {
      name: 'Book Club: Science Fiction Edition',
      description: 'Join our monthly book club discussion. This month we\'re reading "The Three-Body Problem" by Liu Cixin.',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      location: 'Coffee Shop, Main Street',
      isPublic: true,
      organizerId: testUser.id,
    },
  ];

  for (const eventData of events) {
    const existingEvent = await prisma.event.findFirst({
      where: { 
        name: eventData.name,
        organizerId: eventData.organizerId,
      },
    });

    if (!existingEvent) {
      const event = await prisma.event.create({
        data: eventData,
      });

      console.log(`✅ Created event: ${event.name}`);
    }
  }

  // Create sample posts in communities
  const communitiesWithPosts = await prisma.community.findMany({
    where: { isPublic: true },
    take: 3,
  });

  const samplePosts = [
    {
      title: 'Welcome to our community!',
      content: 'Hello everyone! I\'m excited to be part of this amazing community. Looking forward to connecting with all of you and sharing our experiences.',
    },
    {
      title: 'What\'s everyone working on?',
      content: 'I\'d love to hear about the projects you\'re currently working on. Let\'s share our progress and maybe collaborate on something interesting!',
    },
    {
      title: 'Tips for beginners',
      content: 'For those who are just starting out, here are some resources I found helpful when I was beginning my journey. Feel free to ask questions!',
    },
    {
      title: 'Weekly check-in',
      content: 'How is everyone doing this week? Any wins to celebrate or challenges you\'re facing? Let\'s support each other!',
    },
    {
      title: 'Interesting article I found',
      content: 'I came across this fascinating article that I think would be relevant to our community. What are your thoughts on this topic?',
    },
  ];

  for (const community of communitiesWithPosts) {
    for (let i = 0; i < 2; i++) {
      const postData = samplePosts[i];
      await prisma.communityPost.create({
        data: {
          title: postData.title,
          content: postData.content,
          authorId: testUser.id,
          communityId: community.id,
        },
      });
    }
    console.log(`✅ Added sample posts to community: ${community.name}`);
  }

  // Create some RSVPs for events
  const eventsToRSVP = await prisma.event.findMany({
    take: 3,
  });

  for (const event of eventsToRSVP) {
    await prisma.eventRSVP.create({
      data: {
        userId: testUser.id,
        eventId: event.id,
        status: Math.random() > 0.5 ? 'ATTENDING' : 'INTERESTED',
      },
    });
  }

  console.log('✅ Added sample RSVPs to events');

  console.log('🎉 Social Connection Hub seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`- Created ${communities.length} communities`);
  console.log(`- Created ${events.length} events`);
  console.log(`- Added sample posts to ${communitiesWithPosts.length} communities`);
  console.log(`- Added RSVPs to ${eventsToRSVP.length} events`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding social data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
