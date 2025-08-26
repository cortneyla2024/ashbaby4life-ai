import { useState, useCallback } from 'react'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    url: string
  }
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      title: 'Welcome to Hope',
      message: 'Your dashboard is ready. Start exploring your personalized experience.',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      type: 'success',
      title: 'Goal Completed',
      message: 'Congratulations! You completed your daily exercise goal.',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      action: {
        label: 'View Goal',
        url: '/goals/1'
      }
    },
    {
      id: '3',
      type: 'warning',
      title: 'Upcoming Task',
      message: 'You have a meeting in 30 minutes.',
      timestamp: new Date(Date.now() - 7200000),
      read: true
    }
  ])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })))
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    addNotification({
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message
    })
  }, [addNotification])

  const unreadCount = notifications.filter(notification => !notification.read).length

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    showNotification
  }
}
