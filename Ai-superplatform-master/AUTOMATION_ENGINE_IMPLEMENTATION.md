# Automation & Routines Engine - Implementation Guide

## Overview

The Automation & Routines Engine is a powerful system that allows users to create intelligent workflows that automatically respond to life patterns. This implementation transforms CareConnect from a passive observation platform to an active, helpful AI companion.

## Architecture

### 1. Database Schema

The automation system uses four main models:

```prisma
model AutomationRoutine {
  id          String               @id @default(cuid())
  userId      String
  user        User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  description String?
  isEnabled   Boolean              @default(true)
  triggers    AutomationTrigger[]
  actions     AutomationAction[]
  logs        AutomationLog[]
  createdAt   DateTime             @default(now())
}

model AutomationTrigger {
  id         String            @id @default(cuid())
  routineId  String
  routine    AutomationRoutine @relation(fields: [routineId], references: [id], onDelete: Cascade)
  type       String            // e.g., "MOOD_BELOW_THRESHOLD", "HABIT_COMPLETED", "SCHEDULED_TIME"
  params     Json              // e.g., { "threshold": 4 }, { "habitName": "Exercise" }, { "cron": "0 20 * * 0" }
}

model AutomationAction {
  id        String            @id @default(cuid())
  routineId String
  routine   AutomationRoutine @relation(fields: [routineId], references: [id], onDelete: Cascade)
  type      String            // e.g., "CREATE_JOURNAL_PROMPT", "SUGGEST_COPING_STRATEGY", "CREATE_TRANSACTION"
  params    Json              // e.g., { "prompt": "Reflect on your week." }, { "category": "Mindfulness" }
}

model AutomationLog {
  id        String    @id @default(cuid())
  routineId String
  routine   AutomationRoutine @relation(fields: [routineId], references: [id], onDelete: Cascade)
  status    String    // "SUCCESS", "FAILED"
  message   String
  createdAt DateTime  @default(now())
}
```

### 2. Event-Driven Architecture

The system uses an event-driven architecture with the following components:

#### Event Bus (`lib/automation/event-bus.ts`)
- Global event emitter for cross-module communication
- Defines automation event types and interfaces
- Provides helper functions for emitting events

#### Automation Engine (`lib/automation/engine.ts`)
- Core engine that processes automation events
- Evaluates triggers and executes actions
- Handles scheduled routines via cron-like expressions
- Maintains execution logs

#### Action Executor (`lib/automation/action-executor.ts`)
- Executes different types of automation actions
- Integrates with existing platform services
- Provides comprehensive action types for various use cases

## Supported Triggers

1. **MOOD_BELOW_THRESHOLD** - Triggers when mood score is below a specified threshold
2. **HABIT_COMPLETED** - Triggers when a habit is marked as completed
3. **HABIT_MISSED** - Triggers when a habit is missed
4. **TRANSACTION_CREATED** - Triggers when a financial transaction is created
5. **BUDGET_EXCEEDED** - Triggers when a budget limit is exceeded
6. **GOAL_COMPLETED** - Triggers when a goal is achieved
7. **JOURNAL_CREATED** - Triggers when a journal entry is created
8. **ASSESSMENT_COMPLETED** - Triggers when a mental health assessment is completed
9. **SCHEDULED_TIME** - Triggers based on cron-like schedule expressions

## Supported Actions

1. **CREATE_JOURNAL_PROMPT** - Creates a journal entry with a specified prompt
2. **SUGGEST_COPING_STRATEGY** - Suggests coping strategies based on category
3. **CREATE_TRANSACTION** - Creates a financial transaction
4. **CREATE_GOAL** - Creates a new goal
5. **SEND_NOTIFICATION** - Sends a notification with specified priority
6. **GENERATE_AI_INSIGHT** - Generates AI-powered insights
7. **CREATE_HABIT_REMINDER** - Creates a habit reminder
8. **ANALYZE_SPENDING_PATTERN** - Analyzes spending patterns
9. **SUGGEST_ACTIVITY** - Suggests activities based on mood and time
10. **CREATE_MOOD_CHECK_IN** - Creates a mood check-in prompt

## API Endpoints

### Main Automation Routes

- `GET /api/automations` - List all automation routines for the user
- `POST /api/automations` - Create a new automation routine
- `PUT /api/automations/[id]` - Update an existing automation routine
- `DELETE /api/automations/[id]` - Delete an automation routine

### AI Suggestions

- `POST /api/automations/suggestions` - Get AI-powered automation suggestions based on goals

## Frontend Components

### AutomationBuilder (`components/automations/AutomationBuilder.tsx`)
- Step-by-step modal for creating automation routines
- User-friendly interface for selecting triggers and actions
- Dynamic parameter inputs based on trigger/action type
- Validation and error handling

### AutomationList (`components/automations/AutomationList.tsx`)
- Displays all automation routines as cards
- Toggle switches for enabling/disabling routines
- Edit and delete functionality
- Recent activity logs display

### Automations Dashboard (`app/dashboard/automations/page.tsx`)
- Central hub for managing automations
- Overview with statistics
- Search and filtering capabilities
- AI suggestion integration

## Integration Points

### Event Emission
The following modules have been updated to emit automation events:

1. **Mood Tracking** (`app/api/mental-health/mood/route.ts`)
   - Emits `mood.created` and `mood.below_threshold` events

2. **Habit Logging** (`app/api/growth/habits/log/route.ts`)
   - Emits `habit.completed` and `habit.missed` events

3. **Transaction Creation** (`app/api/finance/transactions/route.ts`)
   - Emits `transaction.created` events

4. **Cron Job** (`app/api/cron/wellness-check/route.ts`)
   - Processes scheduled automation routines

## Sample Automation Routines

The system includes several pre-built automation examples:

1. **Mood Check-in Reminder** - Creates prompts when mood is low
2. **Exercise Habit Celebration** - Sends congratulatory messages
3. **Weekly Reflection** - Creates journal prompts every Sunday
4. **High Spending Alert** - Analyzes spending patterns
5. **Stress Relief Assistant** - Suggests coping strategies
6. **Morning Motivation** - Sends encouraging messages
7. **Goal Achievement Celebration** - Celebrates goal completion
8. **Evening Wind-down** - Helps with evening relaxation

## Setup Instructions

### 1. Database Setup
```bash
# Generate Prisma client with new schema
npx prisma generate

# Push schema changes to database
npx prisma db push
```

### 2. Seed Sample Data
```bash
# Run the automation seeding script
npx ts-node scripts/seed-automations.ts
```

### 3. Environment Configuration
Ensure the following environment variables are set:
- `DATABASE_URL` - Database connection string
- `CRON_SECRET` - Secret for cron job authentication

## Usage Examples

### Creating a Simple Automation
```javascript
const automation = {
  name: "Daily Motivation",
  description: "Sends a motivational message every morning",
  triggers: [
    {
      type: "SCHEDULED_TIME",
      params: { cron: "0 8 * * *" } // Every day at 8 AM
    }
  ],
  actions: [
    {
      type: "SEND_NOTIFICATION",
      params: {
        message: "Good morning! Today is a new opportunity to achieve your goals.",
        priority: "LOW"
      }
    }
  ]
};
```

### AI-Powered Suggestion
```javascript
const response = await fetch('/api/automations/suggestions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    goal: "Help me save more money"
  })
});
```

## Security Considerations

1. **User Isolation** - All automations are scoped to individual users
2. **Input Validation** - All trigger and action parameters are validated
3. **Rate Limiting** - Automation execution is rate-limited to prevent abuse
4. **Logging** - All automation executions are logged for audit purposes

## Performance Considerations

1. **Event Batching** - Events are processed efficiently to minimize database load
2. **Caching** - Frequently accessed automation data is cached
3. **Background Processing** - Heavy automation tasks run in the background
4. **Database Indexing** - Proper indexes on automation tables for fast queries

## Future Enhancements

1. **Advanced Trigger Logic** - Support for complex trigger combinations
2. **External Integrations** - Connect with third-party services
3. **Machine Learning** - AI-powered automation optimization
4. **Templates** - Pre-built automation templates for common use cases
5. **Analytics** - Detailed automation performance analytics

## Troubleshooting

### Common Issues

1. **Automations not triggering**
   - Check if the automation is enabled
   - Verify trigger parameters are correct
   - Check automation logs for errors

2. **Actions not executing**
   - Verify action parameters are valid
   - Check if required services are available
   - Review automation logs for error messages

3. **Scheduled automations not running**
   - Ensure cron job is properly configured
   - Verify cron expression syntax
   - Check server timezone settings

### Debug Mode
Enable debug logging by setting the environment variable:
```
DEBUG_AUTOMATION=true
```

## Conclusion

The Automation & Routines Engine represents a significant evolution of the CareConnect platform, transforming it from a passive observation tool to an active, intelligent life companion. This implementation provides users with powerful automation capabilities while maintaining security, performance, and ease of use.

The system is designed to be extensible, allowing for future enhancements and integrations while providing immediate value through intelligent automation of common life patterns and goals.
