export type WidgetType = 'search' | 'news' | 'community' | 'marketplace' | 'stats' | 'chart' | 'list' | 'calendar'

export interface WidgetConfig {
  [key: string]: any
}

export interface Widget {
  id: string
  type: WidgetType
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  config: WidgetConfig
  isMinimized?: boolean
  isPinned?: boolean
  createdAt?: string
  updatedAt?: string
}
