import { PrismaClient } from '@prisma/client';
import { ASCENDED_SYSTEM_PROMPT } from '../lib/ai/ascended-core';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AI Persona data...');

  // Create a test user if it doesn't exist
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashedpassword',
      name: 'Test User'
    }
  });

  // Create default AI persona for the test user
  const persona = await prisma.aIPersona.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      personaName: 'Companion',
      communicationStyle: 'Balanced',
      systemPrompt: ASCENDED_SYSTEM_PROMPT
    }
  });

  console.log('✅ AI Persona seeded successfully!');
  console.log('User ID:', testUser.id);
  console.log('Persona ID:', persona.id);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding AI Persona:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
