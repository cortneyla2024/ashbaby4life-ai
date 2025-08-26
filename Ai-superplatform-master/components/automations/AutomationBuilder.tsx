"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Settings } from "lucide-react";

interface Trigger {
  type: string;
  params: Record<string, any>;
}

interface Action {
  type: string;
  params: Record<string, any>;
}

interface AutomationBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (routine: { name: string; description?: string; triggers: Trigger[]; actions: Action[] }) => void;
  initialData?: any;
}

const TRIGGER_TYPES = [
  { value: "MOOD_BELOW_THRESHOLD", label: "Mood Below Threshold" },
  { value: "HABIT_COMPLETED", label: "Habit Completed" },
  { value: "HABIT_MISSED", label: "Habit Missed" },
  { value: "TRANSACTION_CREATED", label: "Transaction Created" },
  { value: "BUDGET_EXCEEDED", label: "Budget Exceeded" },
  { value: "GOAL_COMPLETED", label: "Goal Completed" },
  { value: "JOURNAL_CREATED", label: "Journal Created" },
  { value: "ASSESSMENT_COMPLETED", label: "Assessment Completed" },
  { value: "SCHEDULED_TIME", label: "Scheduled Time" },
];

const ACTION_TYPES = [
  { value: "CREATE_JOURNAL_PROMPT", label: "Create Journal Prompt" },
  { value: "SUGGEST_COPING_STRATEGY", label: "Suggest Coping Strategy" },
  { value: "CREATE_TRANSACTION", label: "Create Transaction" },
  { value: "CREATE_GOAL", label: "Create Goal" },
  { value: "SEND_NOTIFICATION", label: "Send Notification" },
  { value: "GENERATE_AI_INSIGHT", label: "Generate AI Insight" },
  { value: "CREATE_HABIT_REMINDER", label: "Create Habit Reminder" },
  { value: "ANALYZE_SPENDING_PATTERN", label: "Analyze Spending Pattern" },
  { value: "SUGGEST_ACTIVITY", label: "Suggest Activity" },
  { value: "CREATE_MOOD_CHECK_IN", label: "Create Mood Check-in" },
];

export default function AutomationBuilder({ isOpen, onClose, onSave, initialData }: AutomationBuilderProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [triggers, setTriggers] = useState<Trigger[]>(initialData?.triggers || []);
  const [actions, setActions] = useState<Action[]>(initialData?.actions || []);

  const addTrigger = () => {
    setTriggers([...triggers, { type: "", params: {} }]);
  };

  const removeTrigger = (index: number) => {
    setTriggers(triggers.filter((_, i) => i !== index));
  };

  const updateTrigger = (index: number, field: string, value: any) => {
    const newTriggers = [...triggers];
    if (field === "type") {
      newTriggers[index] = { type: value, params: {} };
    } else {
      newTriggers[index] = { ...newTriggers[index], params: { ...newTriggers[index].params, [field]: value } };
    }
    setTriggers(newTriggers);
  };

  const addAction = () => {
    setActions([...actions, { type: "", params: {} }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, field: string, value: any) => {
    const newActions = [...actions];
    if (field === "type") {
      newActions[index] = { type: value, params: {} };
    } else {
      newActions[index] = { ...newActions[index], params: { ...newActions[index].params, [field]: value } };
    }
    setActions(newActions);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a name for the automation");
      return;
    }
    if (triggers.length === 0) {
      alert("Please add at least one trigger");
      return;
    }
    if (actions.length === 0) {
      alert("Please add at least one action");
      return;
    }
    onSave({ name, description, triggers, actions });
  };

  const renderTriggerParams = (trigger: Trigger, index: number) => {
    switch (trigger.type) {
      case "MOOD_BELOW_THRESHOLD":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Threshold (1-10)</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={trigger.params.threshold || ""}
              onChange={(e) => updateTrigger(index, "threshold", parseInt(e.target.value))}
              placeholder="5"
            />
          </div>
        );

      case "HABIT_COMPLETED":
      case "HABIT_MISSED":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Habit Name (optional)</label>
            <Input
              value={trigger.params.habitName || ""}
              onChange={(e) => updateTrigger(index, "habitName", e.target.value)}
              placeholder="Any habit"
            />
          </div>
        );

      case "TRANSACTION_CREATED":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Category (optional)</label>
            <Input
              value={trigger.params.category || ""}
              onChange={(e) => updateTrigger(index, "category", e.target.value)}
              placeholder="Any category"
            />
            <label className="text-sm font-medium">Min Amount (optional)</label>
            <Input
              type="number"
              value={trigger.params.minAmount || ""}
              onChange={(e) => updateTrigger(index, "minAmount", parseFloat(e.target.value))}
              placeholder="0"
            />
            <label className="text-sm font-medium">Max Amount (optional)</label>
            <Input
              type="number"
              value={trigger.params.maxAmount || ""}
              onChange={(e) => updateTrigger(index, "maxAmount", parseFloat(e.target.value))}
              placeholder="No limit"
            />
          </div>
        );

      case "BUDGET_EXCEEDED":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Budget Name (optional)</label>
            <Input
              value={trigger.params.budgetName || ""}
              onChange={(e) => updateTrigger(index, "budgetName", e.target.value)}
              placeholder="Any budget"
            />
          </div>
        );

      case "GOAL_COMPLETED":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Goal Category (optional)</label>
            <Input
              value={trigger.params.category || ""}
              onChange={(e) => updateTrigger(index, "category", e.target.value)}
              placeholder="Any category"
            />
          </div>
        );

      case "ASSESSMENT_COMPLETED":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Assessment Type (optional)</label>
            <Input
              value={trigger.params.assessmentType || ""}
              onChange={(e) => updateTrigger(index, "assessmentType", e.target.value)}
              placeholder="Any assessment"
            />
          </div>
        );

      case "SCHEDULED_TIME":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Cron Expression</label>
            <Input
              value={trigger.params.cron || ""}
              onChange={(e) => updateTrigger(index, "cron", e.target.value)}
              placeholder="0 9 * * 1 (Every Monday at 9 AM)"
            />
            <p className="text-xs text-gray-500">
              Format: minute hour day month dayOfWeek
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const renderActionParams = (action: Action, index: number) => {
    switch (action.type) {
      case "CREATE_JOURNAL_PROMPT":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt</label>
            <Textarea
              value={action.params.prompt || ""}
              onChange={(e) => updateAction(index, "prompt", e.target.value)}
              placeholder="Reflect on your day and how you're feeling..."
            />
          </div>
        );

      case "SUGGEST_COPING_STRATEGY":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Input
              value={action.params.category || ""}
              onChange={(e) => updateAction(index, "category", e.target.value)}
              placeholder="General"
            />
          </div>
        );

      case "CREATE_TRANSACTION":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={action.params.description || ""}
              onChange={(e) => updateAction(index, "description", e.target.value)}
              placeholder="Transaction description"
            />
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              value={action.params.amount || ""}
              onChange={(e) => updateAction(index, "amount", parseFloat(e.target.value))}
              placeholder="0.00"
            />
            <label className="text-sm font-medium">Category</label>
            <Input
              value={action.params.category || ""}
              onChange={(e) => updateAction(index, "category", e.target.value)}
              placeholder="Category"
            />
            <label className="text-sm font-medium">Type</label>
            <Select value={action.params.type || ""} onValueChange={(value) => updateAction(index, "type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "CREATE_GOAL":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={action.params.title || ""}
              onChange={(e) => updateAction(index, "title", e.target.value)}
              placeholder="Goal title"
            />
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={action.params.description || ""}
              onChange={(e) => updateAction(index, "description", e.target.value)}
              placeholder="Goal description"
            />
            <label className="text-sm font-medium">Category</label>
            <Input
              value={action.params.category || ""}
              onChange={(e) => updateAction(index, "category", e.target.value)}
              placeholder="Category"
            />
            <label className="text-sm font-medium">Target Date (optional)</label>
            <Input
              type="date"
              value={action.params.targetDate || ""}
              onChange={(e) => updateAction(index, "targetDate", e.target.value)}
            />
          </div>
        );

      case "SEND_NOTIFICATION":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={action.params.message || ""}
              onChange={(e) => updateAction(index, "message", e.target.value)}
              placeholder="Notification message"
            />
            <label className="text-sm font-medium">Priority</label>
            <Select value={action.params.priority || "MEDIUM"} onValueChange={(value) => updateAction(index, "priority", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "GENERATE_AI_INSIGHT":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt</label>
            <Textarea
              value={action.params.prompt || ""}
              onChange={(e) => updateAction(index, "prompt", e.target.value)}
              placeholder="AI insight prompt"
            />
            <label className="text-sm font-medium">Context (optional)</label>
            <Input
              value={action.params.context || ""}
              onChange={(e) => updateAction(index, "context", e.target.value)}
              placeholder="Additional context"
            />
          </div>
        );

      case "CREATE_HABIT_REMINDER":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Habit Name</label>
            <Input
              value={action.params.habitName || ""}
              onChange={(e) => updateAction(index, "habitName", e.target.value)}
              placeholder="Habit name"
            />
            <label className="text-sm font-medium">Message (optional)</label>
            <Input
              value={action.params.message || ""}
              onChange={(e) => updateAction(index, "message", e.target.value)}
              placeholder="Custom reminder message"
            />
          </div>
        );

      case "SUGGEST_ACTIVITY":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Mood (optional)</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={action.params.mood || ""}
              onChange={(e) => updateAction(index, "mood", parseInt(e.target.value))}
              placeholder="Current mood (1-10)"
            />
            <label className="text-sm font-medium">Time of Day</label>
            <Select value={action.params.timeOfDay || ""} onValueChange={(value) => updateAction(index, "timeOfDay", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "CREATE_MOOD_CHECK_IN":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt (optional)</label>
            <Input
              value={action.params.prompt || ""}
              onChange={(e) => updateAction(index, "prompt", e.target.value)}
              placeholder="How are you feeling right now?"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) {
return null;
}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create Automation Routine</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My automation routine"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this automation do?"
                />
              </div>
            </CardContent>
          </Card>

          {/* Triggers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Triggers (When)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {triggers.map((trigger, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">Trigger {index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTrigger(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select value={trigger.type} onValueChange={(value) => updateTrigger(index, "type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {trigger.type && renderTriggerParams(trigger, index)}
                </div>
              ))}
              <Button variant="outline" onClick={addTrigger} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Trigger
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Actions (Then)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {actions.map((action, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">Action {index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAction(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select value={action.type} onValueChange={(value) => updateAction(index, "type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {action.type && renderActionParams(action, index)}
                </div>
              ))}
              <Button variant="outline" onClick={addAction} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Automation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
