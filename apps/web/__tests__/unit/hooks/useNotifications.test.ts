import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications } from '@/hooks/useNotifications';

describe('useNotifications', () => {
  it('should initialize with default notifications', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toHaveLength(3);
    expect(result.current.unreadCount).toBe(2); // 2 unread notifications
    expect(result.current.notifications[0].type).toBe('info');
    expect(result.current.notifications[1].type).toBe('success');
    expect(result.current.notifications[2].type).toBe('warning');
  });

  it('should add a new notification', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        type: 'success',
        title: 'Test Notification',
        message: 'This is a test notification'
      });
    });

    expect(result.current.notifications).toHaveLength(4);
    expect(result.current.notifications[0].type).toBe('success');
    expect(result.current.notifications[0].title).toBe('Test Notification');
    expect(result.current.notifications[0].message).toBe('This is a test notification');
    expect(result.current.notifications[0].read).toBe(false);
    expect(result.current.unreadCount).toBe(3);
  });

  it('should mark a notification as read', () => {
    const { result } = renderHook(() => useNotifications());

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.markAsRead(notificationId);
    });

    const updatedNotification = result.current.notifications.find(n => n.id === notificationId);
    expect(updatedNotification?.read).toBe(true);
    expect(result.current.unreadCount).toBe(1);
  });

  it('should mark all notifications as read', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.notifications.every(n => n.read)).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should remove a notification', () => {
    const { result } = renderHook(() => useNotifications());

    const initialCount = result.current.notifications.length;
    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.removeNotification(notificationId);
    });

    expect(result.current.notifications).toHaveLength(initialCount - 1);
    expect(result.current.notifications.find(n => n.id === notificationId)).toBeUndefined();
  });

  it('should clear all notifications', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should show a notification with default type', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showNotification('Test message');
    });

    expect(result.current.notifications[0].type).toBe('info');
    expect(result.current.notifications[0].title).toBe('Info');
    expect(result.current.notifications[0].message).toBe('Test message');
  });

  it('should show a notification with custom type', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showNotification('Test message', 'success');
    });

    expect(result.current.notifications[0].type).toBe('success');
    expect(result.current.notifications[0].title).toBe('Success');
    expect(result.current.notifications[0].message).toBe('Test message');
  });

  it('should handle notification with action', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        type: 'success',
        title: 'Test with Action',
        message: 'This notification has an action',
        action: {
          label: 'Click Here',
          url: '/test-url'
        }
      });
    });

    const newNotification = result.current.notifications[0];
    expect(newNotification.action).toEqual({
      label: 'Click Here',
      url: '/test-url'
    });
  });

  it('should generate unique IDs for notifications', () => {
    const { result } = renderHook(() => useNotifications());

    // Mock Date.now to return different values
    const originalDateNow = Date.now;
    let callCount = 0;
    Date.now = jest.fn(() => {
      callCount++;
      return originalDateNow() + callCount;
    });

    act(() => {
      result.current.addNotification({
        type: 'info',
        title: 'First',
        message: 'First notification'
      });
    });

    act(() => {
      result.current.addNotification({
        type: 'info',
        title: 'Second',
        message: 'Second notification'
      });
    });

    const ids = result.current.notifications.slice(0, 2).map(n => n.id);
    expect(ids[0]).not.toBe(ids[1]);

    // Restore original Date.now
    Date.now = originalDateNow;
  });

  it('should maintain notification order (newest first)', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        type: 'info',
        title: 'First',
        message: 'First notification'
      });
    });

    act(() => {
      result.current.addNotification({
        type: 'success',
        title: 'Second',
        message: 'Second notification'
      });
    });

    expect(result.current.notifications[0].title).toBe('Second');
    expect(result.current.notifications[1].title).toBe('First');
  });

  it('should handle multiple operations in sequence', () => {
    const { result } = renderHook(() => useNotifications());

    // Add notification
    act(() => {
      result.current.addNotification({
        type: 'warning',
        title: 'Test',
        message: 'Test message'
      });
    });

    expect(result.current.notifications).toHaveLength(4);
    expect(result.current.unreadCount).toBe(3);

    // Mark as read
    const notificationId = result.current.notifications[0].id;
    act(() => {
      result.current.markAsRead(notificationId);
    });

    expect(result.current.unreadCount).toBe(2);

    // Remove notification
    act(() => {
      result.current.removeNotification(notificationId);
    });

    expect(result.current.notifications).toHaveLength(3);
    expect(result.current.unreadCount).toBe(2);
  });

  it('should handle edge cases', () => {
    const { result } = renderHook(() => useNotifications());

    // Try to mark non-existent notification as read
    act(() => {
      result.current.markAsRead('non-existent-id');
    });

    expect(result.current.notifications).toHaveLength(3);

    // Try to remove non-existent notification
    act(() => {
      result.current.removeNotification('non-existent-id');
    });

    expect(result.current.notifications).toHaveLength(3);
  });
});
