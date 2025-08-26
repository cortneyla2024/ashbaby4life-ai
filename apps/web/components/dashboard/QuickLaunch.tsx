import React from 'react'
import { Plus, Target, Calendar, MessageSquare, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const QuickLaunch: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">Quick Launch</h3>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 flex-col gap-1">
          <Plus className="h-4 w-4" />
          <span className="text-xs">New Task</span>
        </Button>
        <Button variant="outline" className="h-12 flex-col gap-1">
          <Target className="h-4 w-4" />
          <span className="text-xs">New Goal</span>
        </Button>
        <Button variant="outline" className="h-12 flex-col gap-1">
          <Calendar className="h-4 w-4" />
          <span className="text-xs">Schedule</span>
        </Button>
        <Button variant="outline" className="h-12 flex-col gap-1">
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs">AI Chat</span>
        </Button>
        <Button variant="outline" className="h-12 flex-col gap-1">
          <Settings className="h-4 w-4" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </div>
  )
}
