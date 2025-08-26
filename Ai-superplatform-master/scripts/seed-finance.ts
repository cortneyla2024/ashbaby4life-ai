import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFinance() {
  try {
    console.log('🌱 Seeding financial data...');

    // Create a test user if it doesn't exist
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashedpassword',
        name: 'Test User',
      },
    });

    console.log('✅ User created/updated:', user.username);

    // Create sample budgets
    const budgets = await Promise.all([
      prisma.budget.create({
        data: {
          userId: user.id,
          name: 'Monthly Groceries',
          category: 'Groceries',
          amount: 500,
          period: 'Monthly',
        },
      }),
      prisma.budget.create({
        data: {
          userId: user.id,
          name: 'Entertainment Budget',
          category: 'Entertainment',
          amount: 200,
          period: 'Monthly',
        },
      }),
      prisma.budget.create({
        data: {
          userId: user.id,
          name: 'Transportation',
          category: 'Transportation',
          amount: 150,
          period: 'Monthly',
        },
      }),
    ]);

    console.log('✅ Budgets created:', budgets.length);

    // Create sample transactions
    const transactions = await Promise.all([
      // Income transactions
      prisma.transaction.create({
        data: {
          userId: user.id,
          description: 'Salary Payment',
          amount: 3000,
          type: 'Income',
          category: 'Salary',
          date: new Date(),
          notes: 'Monthly salary',
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          description: 'Freelance Project',
          amount: 500,
          type: 'Income',
          category: 'Freelance',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          notes: 'Web development project',
        },
      }),
      // Expense transactions
      prisma.transaction.create({
        data: {
          userId: user.id,
          description: 'Grocery Shopping',
          amount: 120,
          type: 'Expense',
          category: 'Groceries',
          date: new Date(),
          notes: 'Weekly groceries',
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          description: 'Movie Tickets',
          amount: 45,
          type: 'Expense',
          category: 'Entertainment',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          notes: 'Weekend movie',
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          description: 'Gas Station',
          amount: 60,
          type: 'Expense',
          category: 'Transportation',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          notes: 'Fuel for car',
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          description: 'Restaurant Dinner',
          amount: 85,
          type: 'Expense',
          category: 'Dining',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          notes: 'Date night dinner',
        },
      }),
    ]);

    console.log('✅ Transactions created:', transactions.length);

    // Create sample financial goals
    const goals = await Promise.all([
      prisma.financialGoal.create({
        data: {
          userId: user.id,
          name: 'Emergency Fund',
          targetAmount: 10000,
          currentAmount: 3500,
          targetDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months
          priority: 'High',
          aiSuggestion: 'Consider setting up automatic transfers of $1,083 per month to reach your goal on time. Look for ways to reduce dining expenses to free up more money.',
        },
      }),
      prisma.financialGoal.create({
        data: {
          userId: user.id,
          name: 'Vacation Fund',
          targetAmount: 3000,
          currentAmount: 1200,
          targetDate: new Date(Date.now() + 4 * 30 * 24 * 60 * 60 * 1000), // 4 months
          priority: 'Medium',
          aiSuggestion: 'You\'re on track! Save $450 per month to reach your vacation goal. Consider cutting back on entertainment expenses.',
        },
      }),
      prisma.financialGoal.create({
        data: {
          userId: user.id,
          name: 'New Laptop',
          targetAmount: 1500,
          currentAmount: 800,
          targetDate: new Date(Date.now() + 2 * 30 * 24 * 60 * 60 * 1000), // 2 months
          priority: 'Low',
          aiSuggestion: 'Great progress! You need $350 more. Consider using your freelance income specifically for this goal.',
        },
      }),
    ]);

    console.log('✅ Financial goals created:', goals.length);

    console.log('🎉 Financial data seeding completed successfully!');
    console.log('\n📊 Sample data created:');
    console.log(`- User: ${user.username}`);
    console.log(`- Budgets: ${budgets.length}`);
    console.log(`- Transactions: ${transactions.length}`);
    console.log(`- Financial Goals: ${goals.length}`);

  } catch (error) {
    console.error('❌ Error seeding financial data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFinance();
