import { useState, useCallback } from 'react'
import { Widget, WidgetType } from '@/types/widgets'

export interface WidgetWithExtras extends Widget {
  isMinimized?: boolean
  isPinned?: boolean
  createdAt?: string
  updatedAt?: string
}

export const useWidgets = () => {
  const [widgets, setWidgets] = useState<WidgetWithExtras[]>([
    {
      id: 'stats-1',
      type: 'stats',
      title: 'Goals Progress',
      position: { x: 0, y: 0 },
      size: { width: 300, height: 200 },
      config: { metric: 'goals_completed' }
    },
    {
      id: 'chart-1',
      type: 'chart',
      title: 'Health Trends',
      position: { x: 320, y: 0 },
      size: { width: 400, height: 250 },
      config: { chartType: 'line', data: 'health_metrics' }
    },
    {
      id: 'list-1',
      type: 'list',
      title: 'Recent Tasks',
      position: { x: 0, y: 220 },
      size: { width: 300, height: 300 },
      config: { limit: 10, type: 'tasks' }
    }
  ])

  const addWidget = useCallback((widget: Omit<WidgetWithExtras, 'id'>) => {
    const newWidget: WidgetWithExtras = {
      ...widget,
      id: `${widget.type}-${Date.now()}`
    }
    setWidgets(prev => [...prev, newWidget])
  }, [])

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id))
  }, [])

  const updateWidget = useCallback((id: string, updates: Partial<WidgetWithExtras>) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, ...updates } : widget
    ))
  }, [])

  const moveWidget = useCallback((id: string, position: { x: number; y: number }) => {
    updateWidget(id, { position })
  }, [updateWidget])

  const resizeWidget = useCallback((id: string, size: { width: number; height: number }) => {
    updateWidget(id, { size })
  }, [updateWidget])

  const reorderWidgets = useCallback((newOrder: string[]) => {
    setWidgets(prev => {
      const widgetMap = new Map(prev.map(widget => [widget.id, widget]))
      return newOrder.map(id => widgetMap.get(id)).filter(Boolean) as WidgetWithExtras[]
    })
  }, [])

  return {
    widgets,
    addWidget,
    removeWidget,
    updateWidget,
    moveWidget,
    resizeWidget,
    reorderWidgets
  }
}
