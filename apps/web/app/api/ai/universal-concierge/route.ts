import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

interface TaskStep {
  id: string;
  type: 'api_call' | 'data_processing' | 'user_input' | 'decision' | 'notification';
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  data?: any;
  result?: any;
  error?: string;
}

interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  steps: TaskStep[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  estimatedDuration?: number; // in minutes
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, taskId, stepId, data } = await request.json();

    switch (action) {
      case 'create_task':
        return await createTask(user.id, data);
      
      case 'execute_step':
        return await executeStep(user.id, taskId, stepId, data);
      
      case 'update_task':
        return await updateTask(user.id, taskId, data);
      
      case 'cancel_task':
        return await cancelTask(user.id, taskId);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Universal Concierge API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const taskId = searchParams.get('taskId');

    switch (action) {
      case 'get_tasks':
        return await getTasks(user.id, searchParams);
      
      case 'get_task':
        if (!taskId) {
          return NextResponse.json(
            { error: 'Task ID is required' },
            { status: 400 }
          );
        }
        return await getTask(user.id, taskId);
      
      case 'get_available_services':
        return await getAvailableServices();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Universal Concierge API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createTask(userId: string, data: any) {
  const { title, description, steps, priority = 'medium', estimatedDuration } = data;

  if (!title || !description || !steps || !Array.isArray(steps)) {
    return NextResponse.json(
      { error: 'Title, description, and steps are required' },
      { status: 400 }
    );
  }

  // Validate steps
  for (const step of steps) {
    if (!step.type || !step.description) {
      return NextResponse.json(
        { error: 'Each step must have a type and description' },
        { status: 400 }
      );
    }
  }

  // Create task with steps
  const task: Task = {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    title,
    description,
    steps: steps.map((step: any, index: number) => ({
      id: `step_${index}_${Date.now()}`,
      type: step.type,
      description: step.description,
      status: 'pending' as const,
      data: step.data || {}
    })),
    status: 'pending',
    priority,
    createdAt: new Date(),
    updatedAt: new Date(),
    estimatedDuration
  };

  // Store task (in a real implementation, this would be in a database)
  // For now, we'll simulate storage
  console.log('Created task:', task);

  return NextResponse.json({
    success: true,
    task
  });
}

async function executeStep(userId: string, taskId: string, stepId: string, data?: any) {
  // In a real implementation, this would fetch the task from database
  // For now, we'll simulate the execution

  const stepTypes = {
    api_call: async (step: TaskStep, data: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, data: { message: 'API call completed' } };
    },
    
    data_processing: async (step: TaskStep, data: any) => {
      // Simulate data processing
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, data: { processed: true } };
    },
    
    user_input: async (step: TaskStep, data: any) => {
      // Simulate user input collection
      return { success: true, data: { userInput: data?.input || 'default input' } };
    },
    
    decision: async (step: TaskStep, data: any) => {
      // Simulate decision making
      return { success: true, data: { decision: data?.condition || 'proceed' } };
    },
    
    notification: async (step: TaskStep, data: any) => {
      // Simulate notification sending
      return { success: true, data: { sent: true, recipient: data?.recipient } };
    }
  };

  try {
    // Simulate finding the task and step
    const mockStep: TaskStep = {
      id: stepId,
      type: 'api_call',
      description: 'Execute API call',
      status: 'in_progress'
    };

    const executor = stepTypes[mockStep.type as keyof typeof stepTypes];
    if (!executor) {
      throw new Error(`Unknown step type: ${mockStep.type}`);
    }

    const result = await executor(mockStep, data);
    
    // Update step status
    mockStep.status = 'completed';
    mockStep.result = result;

    return NextResponse.json({
      success: true,
      step: mockStep,
      result
    });

  } catch (error) {
    console.error('Step execution error:', error);
    return NextResponse.json(
      { error: 'Step execution failed' },
      { status: 500 }
    );
  }
}

async function updateTask(userId: string, taskId: string, updates: any) {
  // In a real implementation, this would update the task in database
  console.log('Updating task:', taskId, updates);

  return NextResponse.json({
    success: true,
    message: 'Task updated successfully'
  });
}

async function cancelTask(userId: string, taskId: string) {
  // In a real implementation, this would cancel the task in database
  console.log('Cancelling task:', taskId);

  return NextResponse.json({
    success: true,
    message: 'Task cancelled successfully'
  });
}

async function getTasks(userId: string, searchParams: URLSearchParams) {
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  // In a real implementation, this would fetch from database
  const mockTasks: Task[] = [
    {
      id: 'task_1',
      userId,
      title: 'Financial Report Generation',
      description: 'Generate monthly financial report and send to stakeholders',
      steps: [
        {
          id: 'step_1',
          type: 'api_call',
          description: 'Fetch financial data',
          status: 'completed'
        },
        {
          id: 'step_2',
          type: 'data_processing',
          description: 'Process and analyze data',
          status: 'in_progress'
        },
        {
          id: 'step_3',
          type: 'notification',
          description: 'Send report to stakeholders',
          status: 'pending'
        }
      ],
      status: 'in_progress',
      priority: 'high',
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDuration: 30
    }
  ];

  return NextResponse.json({
    success: true,
    tasks: mockTasks,
    pagination: {
      total: mockTasks.length,
      limit,
      offset,
      hasMore: false
    }
  });
}

async function getTask(userId: string, taskId: string) {
  // In a real implementation, this would fetch from database
  const mockTask: Task = {
    id: taskId,
    userId,
    title: 'Financial Report Generation',
    description: 'Generate monthly financial report and send to stakeholders',
    steps: [
      {
        id: 'step_1',
        type: 'api_call',
        description: 'Fetch financial data',
        status: 'completed',
        result: { success: true, dataCount: 150 }
      },
      {
        id: 'step_2',
        type: 'data_processing',
        description: 'Process and analyze data',
        status: 'in_progress'
      },
      {
        id: 'step_3',
        type: 'notification',
        description: 'Send report to stakeholders',
        status: 'pending'
      }
    ],
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
    estimatedDuration: 30
  };

  return NextResponse.json({
    success: true,
    task: mockTask
  });
}

async function getAvailableServices() {
  const services = [
    {
      id: 'financial_analysis',
      name: 'Financial Analysis',
      description: 'Analyze financial data and generate reports',
      category: 'finance',
      steps: [
        { type: 'api_call', description: 'Fetch financial data' },
        { type: 'data_processing', description: 'Analyze trends and patterns' },
        { type: 'notification', description: 'Send analysis report' }
      ]
    },
    {
      id: 'health_assessment',
      name: 'Health Assessment',
      description: 'Analyze health data and provide recommendations',
      category: 'health',
      steps: [
        { type: 'api_call', description: 'Fetch health metrics' },
        { type: 'data_processing', description: 'Analyze health patterns' },
        { type: 'decision', description: 'Determine recommendations' },
        { type: 'notification', description: 'Send health report' }
      ]
    },
    {
      id: 'learning_path',
      name: 'Learning Path Generation',
      description: 'Create personalized learning paths based on goals',
      category: 'education',
      steps: [
        { type: 'user_input', description: 'Collect learning goals' },
        { type: 'data_processing', description: 'Analyze current skills' },
        { type: 'api_call', description: 'Fetch learning resources' },
        { type: 'data_processing', description: 'Generate learning path' },
        { type: 'notification', description: 'Send learning plan' }
      ]
    }
  ];

  return NextResponse.json({
    success: true,
    services
  });
}
