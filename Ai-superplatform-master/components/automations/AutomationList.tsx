"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Play,
  Pause,
  Edit,
  Trash2,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface AutomationRoutine {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  triggers: Array<{
    id: string;
    type: string;
    params: any;
  }>;
  actions: Array<{
    id: string;
    type: string;
    params: any;
  }>;
  logs: Array<{
    id: string;
    status: string;
    message: string;
    createdAt: string;
  }>;
  createdAt: string;
}

interface AutomationListProps {
  routines: AutomationRoutine[];
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (routine: AutomationRoutine) => void;
  onDelete: (id: string) => void;
}

const TRIGGER_LABELS: Record<string, string> = {
  "MOOD_BELOW_THRESHOLD": "Mood Below Threshold",
  "HABIT_COMPLETED": "Habit Completed",
  "HABIT_MISSED": "Habit Missed",
  "TRANSACTION_CREATED": "Transaction Created",
  "BUDGET_EXCEEDED": "Budget Exceeded",
  "GOAL_COMPLETED": "Goal Completed",
  "JOURNAL_CREATED": "Journal Created",
  "ASSESSMENT_COMPLETED": "Assessment Completed",
  "SCHEDULED_TIME": "Scheduled Time",
};

const ACTION_LABELS: Record<string, string> = {
  "CREATE_JOURNAL_PROMPT": "Create Journal Prompt",
  "SUGGEST_COPING_STRATEGY": "Suggest Coping Strategy",
  "CREATE_TRANSACTION": "Create Transaction",
  "CREATE_GOAL": "Create Goal",
  "SEND_NOTIFICATION": "Send Notification",
  "GENERATE_AI_INSIGHT": "Generate AI Insight",
  "CREATE_HABIT_REMINDER": "Create Habit Reminder",
  "ANALYZE_SPENDING_PATTERN": "Analyze Spending Pattern",
  "SUGGEST_ACTIVITY": "Suggest Activity",
  "CREATE_MOOD_CHECK_IN": "Create Mood Check-in",
};

export default function AutomationList({ routines, onToggle, onEdit, onDelete }: AutomationListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async(id: string) => {
    if (confirm("Are you sure you want to delete this automation? This action cannot be undone.")) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatTriggerDescription = (trigger: any) => {
    switch (trigger.type) {
      case "MOOD_BELOW_THRESHOLD":
        return `when mood is below ${trigger.params.threshold || 5}`;
      case "HABIT_COMPLETED":
        return `when habit "${trigger.params.habitName || "any"}" is completed`;
      case "HABIT_MISSED":
        return `when habit "${trigger.params.habitName || "any"}" is missed`;
      case "TRANSACTION_CREATED":
        const conditions = [];
        if (trigger.params.category) {
conditions.push(`category: ${trigger.params.category}`);
}
        if (trigger.params.minAmount) {
conditions.push(`min: $${trigger.params.minAmount}`);
}
        if (trigger.params.maxAmount) {
conditions.push(`max: $${trigger.params.maxAmount}`);
}
        return `when transaction is created${conditions.length ? ` (${conditions.join(", ")})` : ""}`;
      case "BUDGET_EXCEEDED":
        return `when budget "${trigger.params.budgetName || "any"}" is exceeded`;
      case "GOAL_COMPLETED":
        return `when goal in category "${trigger.params.category || "any"}" is completed`;
      case "JOURNAL_CREATED":
        return "when journal entry is created";
      case "ASSESSMENT_COMPLETED":
        return `when assessment "${trigger.params.assessmentType || "any"}" is completed`;
      case "SCHEDULED_TIME":
        return `on schedule: ${trigger.params.cron || "not set"}`;
      default:
        return trigger.type;
    }
  };

  const formatActionDescription = (action: any) => {
    switch (action.type) {
      case "CREATE_JOURNAL_PROMPT":
        return `create journal prompt: "${action.params.prompt?.substring(0, 50) || "not set"}..."`;
      case "SUGGEST_COPING_STRATEGY":
        return `suggest coping strategy for ${action.params.category || "general"}`;
      case "CREATE_TRANSACTION":
        return `create ${action.params.type || "transaction"}: ${action.params.description || "not set"}`;
      case "CREATE_GOAL":
        return `create goal: ${action.params.title || "not set"}`;
      case "SEND_NOTIFICATION":
        return `send notification: "${action.params.message?.substring(0, 50) || "not set"}..."`;
      case "GENERATE_AI_INSIGHT":
        return `generate AI insight: "${action.params.prompt?.substring(0, 50) || "not set"}..."`;
      case "CREATE_HABIT_REMINDER":
        return `create reminder for habit: ${action.params.habitName || "not set"}`;
      case "ANALYZE_SPENDING_PATTERN":
        return "analyze spending patterns";
      case "SUGGEST_ACTIVITY":
        return `suggest activity for ${action.params.timeOfDay || "any time"}`;
      case "CREATE_MOOD_CHECK_IN":
        return "create mood check-in prompt";
      default:
        return action.type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getRecentLogs = (logs: any[]) => {
    return logs.slice(0, 3); // Show last 3 logs
  };

  if (routines.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Zap className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No automations yet</h3>
          <p className="text-gray-500 text-center mb-4">
            Create your first automation to start automating your life with AI
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {routines.map((routine) => (
        <Card key={routine.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={routine.isEnabled}
                    onCheckedChange={(enabled) => onToggle(routine.id, enabled)}
                  />
                  {routine.isEnabled ? (
                    <Play className="h-4 w-4 text-green-500" />
                  ) : (
                    <Pause className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">{routine.name}</CardTitle>
                  {routine.description && (
                    <p className="text-sm text-gray-600 mt-1">{routine.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(routine)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(routine.id)}
                  disabled={deletingId === routine.id}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {deletingId === routine.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Triggers */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Triggers
                </h4>
                <div className="space-y-1">
                  {routine.triggers.map((trigger, index) => (
                    <div key={trigger.id} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {TRIGGER_LABELS[trigger.type] || trigger.type}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatTriggerDescription(trigger)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Actions
                </h4>
                <div className="space-y-1">
                  {routine.actions.map((action, index) => (
                    <div key={action.id} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {ACTION_LABELS[action.type] || action.type}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatActionDescription(action)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Logs */}
              {routine.logs.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
                  <div className="space-y-1">
                    {getRecentLogs(routine.logs).map((log) => (
                      <div key={log.id} className="flex items-center gap-2 text-sm">
                        {getStatusIcon(log.status)}
                        <span className="text-gray-600">
                          {log.message.length > 60
                            ? `${log.message.substring(0, 60)}...`
                            : log.message
                          }
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="text-xs text-gray-400 pt-2 border-t">
                Created {new Date(routine.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
