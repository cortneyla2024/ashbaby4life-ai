import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { Widget } from '@/types/widgets'

interface MarketplaceWidgetProps {
  widget: Widget
  isEditing: boolean
  onRemove: () => void
  onMinimize: () => void
  onPin: () => void
  onSettings: () => void
  onSelect: () => void
  isSelected: boolean
}

export const MarketplaceWidget: React.FC<MarketplaceWidgetProps> = ({
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
        <ShoppingCart className="h-5 w-5" />
        <h3 className="font-semibold">Marketplace</h3>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm">Premium AI Assistant</h4>
          <p className="text-xs text-gray-600 mt-1">Enhanced AI capabilities</p>
          <p className="text-sm font-bold text-green-600 mt-2">$9.99/month</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm">Advanced Analytics</h4>
          <p className="text-xs text-gray-600 mt-1">Detailed insights and reports</p>
          <p className="text-sm font-bold text-green-600 mt-2">$4.99/month</p>
        </div>
      </div>
    </div>
  )
}
