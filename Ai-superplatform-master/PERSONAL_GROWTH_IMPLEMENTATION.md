# Personal Growth & Learning Hub - Implementation Guide

## Overview

The Personal Growth & Learning Hub is a comprehensive module that transforms the AI Life Companion from a supportive agent into a proactive mentor. This system enables users to define skills they want to learn, track progress, manage learning resources, and build consistent habits with AI-powered guidance.

## Features Implemented

### 🎯 Skill Development
- **Skill Management**: Create and track skills with mastery levels (0-100 scale)
- **AI Learning Plans**: Generate personalized, step-by-step learning plans using Ollama AI
- **Progress Tracking**: Visual progress bars and mastery level indicators
- **Resource Organization**: Link learning resources to specific skills

### 📅 Habit Tracker
- **Habit Creation**: Define habits with frequency (daily/weekly) and goals
- **Visual Calendar**: Grid-based interface showing daily habit completion
- **Progress Visualization**: Color-coded days (completed, today, missed)
- **Monthly Overview**: Track habit consistency across the month

### 📚 Resource Management
- **Resource Types**: Support for articles, videos, books, and courses
- **AI Summaries**: Generate AI-powered summaries of learning resources
- **URL Integration**: Fetch and summarize content from external URLs
- **Progress Tracking**: Mark resources as completed

### 🤖 AI Integration
- **Learning Plan Generation**: AI creates personalized learning roadmaps
- **Content Summarization**: AI summarizes learning resources
- **Local Processing**: All AI features use local Ollama instance
- **Contextual Guidance**: AI provides learning tips and recommendations

## Database Schema

### New Models Added

```prisma
model Skill {
  id                String              @id @default(cuid())
  userId            String
  user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  name              String              // e.g., "Python Programming"
  masteryLevel      Int                 @default(0) // 0-100 scale
  aiLearningPlan    String?             @db.Text // AI-generated learning plan
  resources         LearningResource[]
  createdAt         DateTime            @default(now())
}

model LearningResource {
  id          String    @id @default(cuid())
  skillId     String
  skill       Skill     @relation(fields: [skillId], references: [id], onDelete: Cascade)
  title       String
  url         String?   // URL to an article, video, etc.
  notes       String?   @db.Text
  type        String    // "ARTICLE", "VIDEO", "BOOK", "COURSE"
  isCompleted Boolean   @default(false)
  aiSummary   String?   @db.Text // AI-generated summary of the resource
  createdAt   DateTime  @default(now())
}

model Habit {
  id          String     @id @default(cuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String     // e.g., "Meditate for 10 minutes"
  frequency   String     // "Daily", "Weekly"
  goal        String     // Why the user is building this habit
  logs        HabitLog[]
  createdAt   DateTime   @default(now())
}

model HabitLog {
  id        String   @id @default(cuid())
  habitId   String
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  date      DateTime @db.Date
  isCompleted Boolean  @default(false)

  @@unique([habitId, date])
}
```

## API Endpoints

### Skills Management
- `GET /api/growth/skills` - List all user skills
- `POST /api/growth/skills` - Create a new skill
- `POST /api/growth/skills/[id]/plan` - Generate AI learning plan for a skill

### Learning Resources
- `POST /api/growth/resources` - Add a new learning resource
- `POST /api/growth/resources/[id]/summarize` - Generate AI summary of a resource

### Habit Tracking
- `GET /api/growth/habits` - List all habits with current month logs
- `POST /api/growth/habits` - Create a new habit
- `POST /api/growth/habits/log` - Log habit completion for a specific date

## Frontend Components

### Core Components
- **SkillDashboard**: Main view for managing skills
- **SkillCard**: Individual skill display with progress and AI plan generation
- **HabitTracker**: Visual calendar interface for habit tracking
- **ResourceManager**: Resource management within skill pages

### Pages
- **Growth Hub Dashboard** (`/dashboard/growth`): Main hub with tabs for habits and skills
- **Individual Skill Page** (`/skills/[id]`): Detailed skill view with learning plan and resources

## AI Integration

### Learning Plan Generation
The AI generates comprehensive learning plans using prompts like:
```
Create a detailed, step-by-step learning plan for mastering "[SKILL_NAME]". 
Current mastery level: [LEVEL]/100

The plan should include:
1. Foundation concepts to learn
2. Practical exercises and projects
3. Recommended learning resources
4. Milestones and progress indicators
5. Time estimates for each phase
6. Tips for effective learning
```

### Resource Summarization
AI summarizes learning resources with prompts like:
```
Please provide a concise summary of the following learning resource:
Title: [TITLE]
Type: [TYPE]
Content: [CONTENT]

Please create a summary that includes:
1. Key concepts and main points
2. Practical applications or takeaways
3. Difficulty level and prerequisites
4. Estimated time to complete
```

## Usage Instructions

### Getting Started
1. Navigate to the Growth Hub from the main navigation
2. Start by adding your first skill or habit
3. Use the AI learning plan generation for personalized guidance
4. Add learning resources and generate AI summaries
5. Track your daily habits using the visual calendar

### Best Practices
- Set realistic mastery levels for skills
- Use the habit tracker consistently
- Generate AI learning plans for new skills
- Add diverse learning resources (articles, videos, books)
- Review and update progress regularly

## Technical Implementation

### Prerequisites
- Ollama running locally with a language model
- PostgreSQL database
- Next.js 14+ with TypeScript

### Environment Variables
```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
DATABASE_URL=postgresql://...
```

### Running the Application
1. Start the database: `docker-compose up -d`
2. Run migrations: `npx prisma db push`
3. Seed data: `npx tsx scripts/seed-growth.ts`
4. Start the development server: `npm run dev`

## Future Enhancements

### Planned Features
- **Skill Assessment Quizzes**: AI-generated assessments to measure progress
- **Learning Paths**: Pre-defined learning paths for common skills
- **Social Learning**: Share progress and resources with other users
- **Advanced Analytics**: Detailed progress reports and insights
- **Mobile Optimization**: Responsive design for mobile devices
- **Integration APIs**: Connect with external learning platforms

### AI Improvements
- **Adaptive Learning**: AI adjusts learning plans based on user progress
- **Personalized Recommendations**: AI suggests resources based on learning style
- **Progress Prediction**: AI predicts completion timelines
- **Difficulty Adjustment**: AI adjusts content difficulty based on performance

## Conclusion

The Personal Growth & Learning Hub successfully transforms the AI Life Companion into a comprehensive learning and habit-building platform. With AI-powered guidance, visual progress tracking, and resource management, users can effectively develop skills and build lasting habits in a structured, engaging environment.

The implementation maintains the platform's core principles of privacy (local AI processing), zero external dependencies, and comprehensive life support, while adding powerful new capabilities for personal development and growth.
