import React from 'react'
import { TrendingUp, Target, Heart, DollarSign } from 'lucide-react'
import { Widget } from '@/types/widgets'

interface StatsWidgetProps {
  widget: Widget
  isEditing: boolean
  onRemove: () => void
  onMinimize: () => void
  onPin: () => void
  onSettings: () => void
  onSelect: () => void
  isSelected: boolean
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({
  widget,
  isEditing,
  onRemove,
  onMinimize,
  onPin,
  onSettings,
  onSelect,
  isSelected
}) => {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">Quick Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Goals</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">12</p>
          <p className="text-xs text-gray-600">Completed: 8</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Progress</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">67%</p>
          <p className="text-xs text-gray-600">This week</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium">Health</span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">85</p>
          <p className="text-xs text-gray-600">Score</p>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">Savings</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">$2.4k</p>
          <p className="text-xs text-gray-600">This month</p>
        </div>
      </div>
    </div>
  )
}
