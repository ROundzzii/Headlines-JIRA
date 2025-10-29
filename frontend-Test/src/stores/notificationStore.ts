import { create } from 'zustand'

export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

interface NotificationStore {
  notifications: Notification[]
  addNotification: (message: string, type: Notification['type']) => void
  removeNotification: (id: string) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (message, type) => {
    const id = Date.now().toString()
    set(state => ({
      notifications: [...state.notifications, { id, message, type }]
    }))
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }))
    }, 5000)
  },
  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  }
}))

