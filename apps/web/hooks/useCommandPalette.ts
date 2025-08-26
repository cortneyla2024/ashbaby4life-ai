import { useState, useCallback, useEffect } from 'react'

export interface Command {
  id: string
  title: string
  description: string
  action: () => void
  shortcut?: string
}

export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands: Command[] = [
    {
      id: 'new-task',
      title: 'New Task',
      description: 'Create a new task',
      action: () => console.log('Create new task'),
      shortcut: 'Ctrl+T'
    },
    {
      id: 'new-goal',
      title: 'New Goal',
      description: 'Create a new goal',
      action: () => console.log('Create new goal'),
      shortcut: 'Ctrl+G'
    },
    {
      id: 'search',
      title: 'Search',
      description: 'Search across the platform',
      action: () => console.log('Open search'),
      shortcut: 'Ctrl+K'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Open settings',
      action: () => console.log('Open settings'),
      shortcut: 'Ctrl+,'
    }
  ]

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase())
  )

  const open = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const executeCommand = useCallback((command: Command) => {
    command.action()
    close()
  }, [close])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'k' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      open()
    }

    if (!isOpen) return

    switch (event.key) {
      case 'Escape':
        close()
        break
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        )
        break
      case 'Enter':
        event.preventDefault()
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex])
        }
        break
    }
  }, [isOpen, filteredCommands, selectedIndex, open, close, executeCommand])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    isOpen,
    open,
    close,
    query,
    setQuery,
    selectedIndex,
    filteredCommands,
    executeCommand
  }
}
