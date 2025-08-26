import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Load seed data
  const dataDir = path.join(process.cwd(), 'data')
  
  // Create organization
  const orgsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'orgs.json'), 'utf-8'))
  const org = await prisma.org.upsert({
    where: { slug: orgsData[0].slug },
    update: {},
    create: {
      name: orgsData[0].name,
      slug: orgsData[0].slug,
      region: orgsData[0].region,
      timezone: orgsData[0].timezone,
    },
  })

  // Create users
  const usersData = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf-8'))
  for (const userData of usersData) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
      },
    })

    // Create membership
    await prisma.membership.upsert({
      where: { userId_orgId: { userId: user.id, orgId: org.id } },
      update: {},
      create: {
        userId: user.id,
        orgId: org.id,
        role: userData.role,
      },
    })

    // Create mood entries
    const moodData = JSON.parse(fs.readFileSync(path.join(dataDir, 'mood.json'), 'utf-8'))
    for (const moodEntry of moodData) {
      await prisma.moodEntry.upsert({
        where: { 
          userId_createdAt: { 
            userId: user.id, 
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) 
          } 
        },
        update: {},
        create: {
          userId: user.id,
          mood: moodEntry.score,
          notes: moodEntry.note,
          activities: moodEntry.tags,
        },
      })
    }

    // Create mental health assessments
    const assessmentsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'assessments.json'), 'utf-8'))
    for (const assessment of assessmentsData) {
      await prisma.mentalHealthAssessment.create({
        data: {
          userId: user.id,
          type: assessment.type,
          answers: assessment.answers,
          score: assessment.answers.reduce((a: number, b: number) => a + b, 0),
        },
      })
    }

    // Create coping strategies
    const copingData = JSON.parse(fs.readFileSync(path.join(dataDir, 'coping.json'), 'utf-8'))
    for (const strategy of copingData) {
      await prisma.copingStrategy.upsert({
        where: { 
          userId_title: { userId: user.id, title: strategy.title } 
        },
        update: {},
        create: {
          userId: user.id,
          title: strategy.title,
          category: strategy.category,
          content: strategy.content,
        },
      })
    }

    // Create finance data
    const financeData = JSON.parse(fs.readFileSync(path.join(dataDir, 'finance.json'), 'utf-8'))
    
    // Create budgets
    for (const budget of financeData.budgets) {
      await prisma.budget.upsert({
        where: { 
          userId_name: { userId: user.id, name: budget.name } 
        },
        update: {},
        create: {
          userId: user.id,
          name: budget.name,
          category: budget.name.toLowerCase(),
          amount: budget.limit,
          period: budget.period,
        },
      })
    }

    // Create transactions
    for (const transaction of financeData.transactions) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: transaction.amount,
          description: transaction.note,
          category: transaction.category,
          type: transaction.amount > 0 ? 'income' : 'expense',
          date: new Date(),
        },
      })
    }

    // Create financial goals
    for (const goal of financeData.goals) {
      await prisma.financialGoal.upsert({
        where: { 
          userId_name: { userId: user.id, name: goal.name } 
        },
        update: {},
        create: {
          userId: user.id,
          name: goal.name,
          targetAmount: goal.target,
          currentAmount: 0,
        },
      })
    }

    // Create learning data
    const learningData = JSON.parse(fs.readFileSync(path.join(dataDir, 'learning.json'), 'utf-8'))
    
    // Create skills
    for (const skill of learningData.skills) {
      await prisma.skill.upsert({
        where: { 
          userId_name: { userId: user.id, name: skill.name } 
        },
        update: {},
        create: {
          userId: user.id,
          name: skill.name,
          level: skill.level,
          masteryLevel: skill.level * 10,
        },
      })
    }

    // Create habits
    for (const habit of learningData.habits) {
      await prisma.habit.upsert({
        where: { 
          userId_name: { userId: user.id, name: habit.name } 
        },
        update: {},
        create: {
          userId: user.id,
          name: habit.name,
          frequency: habit.frequency,
          streak: Math.floor(Math.random() * 30),
        },
      })
    }

    // Create learning resources
    for (const resource of learningData.resources) {
      await prisma.learningResource.upsert({
        where: { 
          userId_title: { userId: user.id, title: resource.title } 
        },
        update: {},
        create: {
          userId: user.id,
          title: resource.title,
          url: resource.url,
          type: 'article',
        },
      })
    }

    // Create creative data
    const creativeData = JSON.parse(fs.readFileSync(path.join(dataDir, 'creative.json'), 'utf-8'))
    
    // Create creative projects
    for (const project of creativeData.projects) {
      await prisma.creativeProject.upsert({
        where: { 
          userId_title: { userId: user.id, title: project.name } 
        },
        update: {},
        create: {
          userId: user.id,
          title: project.name,
          type: project.type.toUpperCase(),
        },
      })
    }

    // Create community data
    const communityData = JSON.parse(fs.readFileSync(path.join(dataDir, 'community.json'), 'utf-8'))
    
    // Create communities
    for (const community of communityData.communities) {
      const createdCommunity = await prisma.community.upsert({
        where: { name: community.name },
        update: {},
        create: {
          name: community.name,
          isPublic: community.privacy === 'open',
        },
      })

      // Add user to community
      await prisma.communityMember.upsert({
        where: { 
          userId_communityId: { userId: user.id, communityId: createdCommunity.id } 
        },
        update: {},
        create: {
          userId: user.id,
          communityId: createdCommunity.id,
          role: 'member',
        },
      })
    }

    // Create events
    for (const event of communityData.events) {
      await prisma.event.create({
        data: {
          title: event.title,
          startDate: new Date(event.when),
          endDate: new Date(new Date(event.when).getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        },
      })
    }

    // Create automation data
    const automationData = JSON.parse(fs.readFileSync(path.join(dataDir, 'automation.json'), 'utf-8'))
    
    // Create automation routines
    for (const routine of automationData.routines) {
      const createdRoutine = await prisma.automationRoutine.upsert({
        where: { 
          userId_name: { userId: user.id, name: routine.name } 
        },
        update: {},
        create: {
          userId: user.id,
          name: routine.name,
          description: `Automated ${routine.name.toLowerCase()} support`,
        },
      })

      // Create triggers
      for (const trigger of routine.triggers) {
        await prisma.automationTrigger.create({
          data: {
            routineId: createdRoutine.id,
            type: 'condition',
            config: { condition: trigger },
          },
        })
      }

      // Create actions
      for (let i = 0; i < routine.actions.length; i++) {
        await prisma.automationAction.create({
          data: {
            routineId: createdRoutine.id,
            type: 'notification',
            config: { action: routine.actions[i] },
            order: i,
          },
        })
      }
    }
  }

  console.log('✅ Database seeded successfully')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
