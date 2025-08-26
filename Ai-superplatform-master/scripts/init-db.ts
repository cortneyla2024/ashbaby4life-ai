import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

async function ensureFileExists(fileName: string, defaultContent: any[] = []): Promise<void> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const filePath = path.join(dataDir, fileName);
    
    try {
      await fs.access(filePath);
      console.log(`✓ ${fileName} already exists`);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2), 'utf-8');
      console.log(`✓ Created ${fileName}`);
    }
  } catch (error) {
    console.error(`✗ Error creating ${fileName}:`, error);
  }
}

async function initializeDatabase(): Promise<void> {
  console.log('Initializing ASHBABY4LIFE AI Superplatform database...\n');

  // Create empty JSON files for all data types
  await ensureFileExists('users.json');
  await ensureFileExists('sessions.json');
  await ensureFileExists('posts.json');
  await ensureFileExists('comments.json');
  await ensureFileExists('chat.json');
  await ensureFileExists('songs.json');
  await ensureFileExists('analytics.json');

  // Create knowledge.json with sample entries
  const sampleKnowledge = [
    {
      id: '1',
      title: 'Getting Started with AI',
      content: 'Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines that work and react like humans. Some of the activities computers with artificial intelligence are designed for include speech recognition, learning, planning, and problem solving.',
      category: 'AI Basics',
      tags: ['ai', 'introduction', 'basics'],
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Machine Learning Fundamentals',
      content: 'Machine Learning is a subset of AI that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. Machine learning focuses on the development of computer programs that can access data and use it to learn for themselves.',
      category: 'Machine Learning',
      tags: ['machine-learning', 'algorithms', 'data'],
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Neural Networks Explained',
      content: 'Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) that process information and can learn patterns from data. Neural networks are the foundation of deep learning.',
      category: 'Deep Learning',
      tags: ['neural-networks', 'deep-learning', 'neurons'],
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      title: 'Music Generation with AI',
      content: 'AI-powered music generation uses machine learning algorithms to create original compositions. These systems can analyze existing music patterns and generate new melodies, harmonies, and rhythms that follow similar musical structures.',
      category: 'Creative AI',
      tags: ['music', 'generation', 'creative'],
      createdAt: new Date().toISOString()
    },
    {
      id: '5',
      title: 'Natural Language Processing',
      content: 'Natural Language Processing (NLP) is a field of AI that focuses on the interaction between computers and human language. It enables computers to understand, interpret, and generate human language in a meaningful way.',
      category: 'NLP',
      tags: ['nlp', 'language', 'processing'],
      createdAt: new Date().toISOString()
    }
  ];

  await ensureFileExists('knowledge.json', sampleKnowledge);

  console.log('\n✓ Database initialization complete!');
  console.log('✓ All data files created successfully');
  console.log('✓ Sample knowledge entries added');
  console.log('\nYou can now start the application with: npm run dev');
}

// Run the initialization
initializeDatabase().catch(console.error);
