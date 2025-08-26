import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Personal Growth & Learning Hub data...');

  // Create a sample user (if not exists)
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      username: 'demo_user',
      passwordHash: 'hashed_password_here',
      name: 'Demo User'
    }
  });

  // Create sample skills
  const pythonSkill = await prisma.skill.create({
    data: {
      userId: user.id,
      name: 'Python Programming',
      masteryLevel: 25,
      aiLearningPlan: `# Python Programming Learning Plan

## Phase 1: Foundations (Weeks 1-4)
- **Week 1-2**: Python basics, variables, data types, control structures
- **Week 3-4**: Functions, modules, and basic OOP concepts

## Phase 2: Intermediate (Weeks 5-8)
- **Week 5-6**: Advanced data structures, file handling, exceptions
- **Week 7-8**: Object-oriented programming, decorators, generators

## Phase 3: Advanced (Weeks 9-12)
- **Week 9-10**: Web development with Flask/Django
- **Week 11-12**: Data science with pandas, numpy, matplotlib

## Recommended Resources:
- Python.org official tutorial
- "Automate the Boring Stuff with Python" book
- Real Python website tutorials
- LeetCode Python problems

## Practice Projects:
1. Simple calculator
2. To-do list application
3. Web scraper
4. Data analysis project

## Tips for Success:
- Code daily, even if just 30 minutes
- Work on real projects, not just tutorials
- Join Python communities and forums
- Practice with coding challenges`
    }
  });

  const reactSkill = await prisma.skill.create({
    data: {
      userId: user.id,
      name: 'React Development',
      masteryLevel: 15,
      aiLearningPlan: `# React Development Learning Plan

## Phase 1: JavaScript Fundamentals (Weeks 1-3)
- **Week 1**: Modern JavaScript (ES6+), arrow functions, destructuring
- **Week 2**: Promises, async/await, modules
- **Week 3**: DOM manipulation, event handling

## Phase 2: React Basics (Weeks 4-7)
- **Week 4-5**: Components, JSX, props, state
- **Week 6-7**: Hooks (useState, useEffect), conditional rendering

## Phase 3: Advanced React (Weeks 8-12)
- **Week 8-9**: Context API, custom hooks, performance optimization
- **Week 10-11**: Routing with React Router, state management
- **Week 12**: Testing with Jest and React Testing Library

## Recommended Resources:
- React official documentation
- "React: Up & Running" book
- Kent C. Dodds blog and courses
- React Tutorial on reactjs.org

## Practice Projects:
1. Todo app with local storage
2. Weather app with API integration
3. E-commerce product catalog
4. Social media clone

## Tips for Success:
- Build projects from scratch
- Learn by reading other people's code
- Contribute to open source React projects
- Stay updated with React ecosystem`
    }
  });

  // Create sample learning resources
  await prisma.learningResource.createMany({
    data: [
      {
        skillId: pythonSkill.id,
        title: 'Python Official Tutorial',
        url: 'https://docs.python.org/3/tutorial/',
        type: 'ARTICLE',
        notes: 'Comprehensive official Python tutorial covering all basics'
      },
      {
        skillId: pythonSkill.id,
        title: 'Automate the Boring Stuff with Python',
        url: 'https://automatetheboringstuff.com/',
        type: 'BOOK',
        notes: 'Free online book perfect for beginners'
      },
      {
        skillId: pythonSkill.id,
        title: 'Real Python Tutorials',
        url: 'https://realpython.com/',
        type: 'ARTICLE',
        notes: 'High-quality Python tutorials and articles'
      },
      {
        skillId: reactSkill.id,
        title: 'React Official Documentation',
        url: 'https://reactjs.org/docs/getting-started.html',
        type: 'ARTICLE',
        notes: 'Essential reading for all React developers'
      },
      {
        skillId: reactSkill.id,
        title: 'React Tutorial: Intro to React',
        url: 'https://reactjs.org/tutorial/tutorial.html',
        type: 'COURSE',
        notes: 'Interactive tutorial building a tic-tac-toe game'
      }
    ]
  });

  // Create sample habits
  const codingHabit = await prisma.habit.create({
    data: {
      userId: user.id,
      name: 'Code for 30 minutes',
      frequency: 'Daily',
      goal: 'Build consistent coding practice and improve programming skills'
    }
  });

  const readingHabit = await prisma.habit.create({
    data: {
      userId: user.id,
      name: 'Read technical documentation',
      frequency: 'Daily',
      goal: 'Stay updated with latest technologies and best practices'
    }
  });

  // Create some habit logs for the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const habitLogs = [];
  for (let day = 1; day <= Math.min(daysInMonth, now.getDate()); day++) {
    const date = new Date(now.getFullYear(), now.getMonth(), day);
    
    // Randomly mark some days as completed (70% completion rate)
    if (Math.random() > 0.3) {
      habitLogs.push({
        habitId: codingHabit.id,
        date: date,
        isCompleted: true
      });
      
      if (Math.random() > 0.4) {
        habitLogs.push({
          habitId: readingHabit.id,
          date: date,
          isCompleted: true
        });
      }
    }
  }

  await prisma.habitLog.createMany({
    data: habitLogs
  });

  console.log('✅ Personal Growth & Learning Hub data seeded successfully!');
  console.log(`📊 Created ${await prisma.skill.count()} skills`);
  console.log(`📚 Created ${await prisma.learningResource.count()} learning resources`);
  console.log(`📅 Created ${await prisma.habit.count()} habits`);
  console.log(`✅ Created ${await prisma.habitLog.count()} habit logs`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
