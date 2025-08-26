import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Creative Expression & Entertainment Hub data...');

  // Create a demo user if it doesn't exist
  const user = await prisma.user.upsert({
    where: { email: 'demo@careconnect.com' },
    update: {},
    create: {
      email: 'demo@careconnect.com',
      username: 'demo_user',
      passwordHash: 'hashed_password_placeholder',
      name: 'Demo User'
    }
  });

  console.log('✅ User created/updated:', user.username);

  // Create sample creative projects
  const artProject = await prisma.creativeProject.create({
    data: {
      userId: user.id,
      title: 'Fantasy Art Collection',
      description: 'A collection of AI-generated fantasy artwork for my novel',
      type: 'AI_ART_COLLECTION'
    }
  });

  const writingProject = await prisma.creativeProject.create({
    data: {
      userId: user.id,
      title: 'Sci-Fi Short Stories',
      description: 'A collection of science fiction short stories with AI assistance',
      type: 'WRITING_PROJECT'
    }
  });

  console.log('✅ Creative projects created');

  // Create sample generated assets
  const imageAssets = [
    {
      projectId: artProject.id,
      type: 'IMAGE',
      prompt: 'A majestic dragon soaring over a medieval castle at sunset',
      content: 'https://via.placeholder.com/512x512/6366f1/ffffff?text=Fantasy+Dragon'
    },
    {
      projectId: artProject.id,
      type: 'IMAGE',
      prompt: 'A magical forest with glowing mushrooms and fairy lights',
      content: 'https://via.placeholder.com/512x512/10b981/ffffff?text=Magical+Forest'
    },
    {
      projectId: artProject.id,
      type: 'IMAGE',
      prompt: 'A steampunk airship flying through clouds',
      content: 'https://via.placeholder.com/512x512/f59e0b/ffffff?text=Steampunk+Airship'
    }
  ];

  const textAssets = [
    {
      projectId: writingProject.id,
      type: 'TEXT',
      prompt: 'Write a character description for a brave space explorer',
      content: `Captain Elena Vasquez stood at the helm of the starship Aurora, her dark eyes scanning the endless expanse of space. At thirty-five, she had already logged more light-years than most pilots twice her age. Her short, practical hair was streaked with silver from years of radiation exposure, and her hands bore the calluses of someone who had spent a lifetime gripping control sticks and manual override switches.

Born on Mars Colony Alpha, Elena had never known Earth's gravity, which gave her a natural advantage in zero-g environments. Her lean, muscular frame was perfectly adapted to the rigors of space travel, and her quick reflexes had saved her crew more times than she could count.

But it wasn't just her physical prowess that made her an exceptional captain. Elena possessed an uncanny ability to read situations and make split-second decisions that often meant the difference between life and death. Her crew trusted her implicitly, not just because of her skills, but because she had proven time and again that she would never abandon them, no matter the cost.`
    },
    {
      projectId: writingProject.id,
      type: 'TEXT',
      prompt: 'Describe a futuristic cityscape',
      content: `The city of Neo-Tokyo stretched endlessly into the horizon, a glittering testament to human ingenuity and the relentless march of progress. Towering skyscrapers of glass and steel pierced the clouds, their surfaces alive with holographic advertisements that danced and shimmered in the perpetual twilight of the urban canyon.

At street level, the city was a symphony of movement and light. Autonomous vehicles glided silently along magnetic rails, while pedestrians navigated the crowded walkways with augmented reality displays floating before their eyes. The air was thick with the hum of technology - the gentle whir of drones delivering packages, the soft beep of security scanners, and the distant thrum of the city's massive fusion reactors.

Neon signs in every color of the spectrum bathed the streets in an otherworldly glow, reflecting off the rain-slicked pavement and the chrome surfaces of the buildings. Above it all, flying cars zipped between the towers like metallic birds, their navigation lights blinking in the perpetual twilight.

The city never slept. Twenty-four hours a day, seven days a week, the streets buzzed with activity as people from all walks of life pursued their dreams in this technological paradise. It was a place where the impossible became possible, where the future was being written in real-time.`
    }
  ];

  for (const asset of [...imageAssets, ...textAssets]) {
    await prisma.generatedAsset.create({
      data: asset
    });
  }

  console.log('✅ Generated assets created');

  // Create sample media preferences
  const mediaPreferences = [
    {
      userId: user.id,
      type: 'MOVIE',
      likes: ['The Matrix', 'Blade Runner', 'Inception', 'Interstellar', 'Arrival'],
      dislikes: ['Romantic comedies', 'Horror films']
    },
    {
      userId: user.id,
      type: 'BOOK',
      likes: ['Dune', 'Neuromancer', 'The Martian', 'Ready Player One', 'Snow Crash'],
      dislikes: ['Romance novels', 'Self-help books']
    },
    {
      userId: user.id,
      type: 'MUSIC_GENRE',
      likes: ['Electronic', 'Ambient', 'Synthwave', 'Progressive Rock', 'Classical'],
      dislikes: ['Country', 'Heavy Metal']
    }
  ];

  for (const preference of mediaPreferences) {
    await prisma.mediaPreference.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type: preference.type
        }
      },
      update: {
        likes: preference.likes,
        dislikes: preference.dislikes
      },
      create: preference
    });
  }

  console.log('✅ Media preferences created');

  console.log('🎉 Creative Expression & Entertainment Hub seeding completed!');
  console.log(`📊 Created:`);
  console.log(`   - 1 user`);
  console.log(`   - 2 creative projects`);
  console.log(`   - 5 generated assets (3 images, 2 texts)`);
  console.log(`   - 3 media preference categories`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding creative data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
