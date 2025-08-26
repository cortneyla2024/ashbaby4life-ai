import React from 'react'
import { Search, Command } from 'lucide-react'
import { Input } from '@/components/ui/Input'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-w-md">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Command className="h-4 w-4" />
            <span className="font-medium">Command Palette</span>
          </div>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Type a command..."
              className="pl-10"
              autoFocus
            />
          </div>
          <div className="mt-4 space-y-2">
            <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
              <div className="flex items-center justify-between">
                <span>New Task</span>
                <span className="text-xs text-gray-500">Ctrl+T</span>
              </div>
            </div>
            <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
              <div className="flex items-center justify-between">
                <span>New Goal</span>
                <span className="text-xs text-gray-500">Ctrl+G</span>
              </div>
            </div>
            <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
              <div className="flex items-center justify-between">
                <span>Search</span>
                <span className="text-xs text-gray-500">Ctrl+K</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
