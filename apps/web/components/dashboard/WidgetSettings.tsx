import React from 'react'
import { Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WidgetWithExtras } from '@/hooks/useWidgets'

interface WidgetSettingsProps {
  widget: WidgetWithExtras
  isOpen: boolean
  onClose: () => void
  onSave: (config: any) => void
}

export const WidgetSettings: React.FC<WidgetSettingsProps> = ({ widget, isOpen, onClose, onSave }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-w-md">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="font-medium">Widget Settings</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Widget Title</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Enter widget title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Widget Size</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Refresh Interval</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Never</option>
                <option>5 minutes</option>
                <option>15 minutes</option>
                <option>1 hour</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={() => onSave({})}>Save</Button>
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
