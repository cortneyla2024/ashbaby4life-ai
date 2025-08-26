import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Widget } from '@/types/widgets'

interface SearchWidgetProps {
  widget: Widget
  isEditing: boolean
  onRemove: () => void
  onMinimize: () => void
  onPin: () => void
  onSettings: () => void
  onSelect: () => void
  isSelected: boolean
}

export const SearchWidget: React.FC<SearchWidgetProps> = ({
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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search across the platform..."
          className="pl-10"
        />
      </div>
    </div>
  )
}
