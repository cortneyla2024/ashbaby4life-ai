import React from 'react'
import { Newspaper } from 'lucide-react'
import { Widget } from '@/types/widgets'

interface NewsWidgetProps {
  widget: Widget
  isEditing: boolean
  onRemove: () => void
  onMinimize: () => void
  onPin: () => void
  onSettings: () => void
  onSelect: () => void
  isSelected: boolean
}

export const NewsWidget: React.FC<NewsWidgetProps> = ({
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
        <Newspaper className="h-5 w-5" />
        <h3 className="font-semibold">Latest News</h3>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm">New AI Features Released</h4>
          <p className="text-xs text-gray-600 mt-1">Enhanced personalization and improved recommendations</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm">Community Update</h4>
          <p className="text-xs text-gray-600 mt-1">New members joined this week</p>
        </div>
      </div>
    </div>
  )
}
