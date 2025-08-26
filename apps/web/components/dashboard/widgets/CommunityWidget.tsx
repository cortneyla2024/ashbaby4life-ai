import React from 'react'
import { Users } from 'lucide-react'
import { Widget } from '@/types/widgets'

interface CommunityWidgetProps {
  widget: Widget
  isEditing: boolean
  onRemove: () => void
  onMinimize: () => void
  onPin: () => void
  onSettings: () => void
  onSelect: () => void
  isSelected: boolean
}

export const CommunityWidget: React.FC<CommunityWidgetProps> = ({
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
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5" />
        <h3 className="font-semibold">Community</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-gray-600">Shared a new goal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full"></div>
          <div>
            <p className="text-sm font-medium">Jane Smith</p>
            <p className="text-xs text-gray-600">Completed a milestone</p>
          </div>
        </div>
      </div>
    </div>
  )
}
