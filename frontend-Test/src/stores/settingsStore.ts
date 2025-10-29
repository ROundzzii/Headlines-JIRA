import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserPreferences {
  theme: 'light' | 'dark'
  language: 'fr' | 'en'
  email_notifications: boolean
  push_notifications: boolean
  notification_types: {
    new_tickets: boolean
    ticket_updates: boolean
    comments: boolean
    new_projects: boolean
    deadline_reminders: boolean
  }
  email_frequency: 'immediate' | 'daily' | 'weekly' | 'never'
}

interface SettingsStore {
  preferences: UserPreferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  resetPreferences: () => void
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'fr',
  email_notifications: true,
  push_notifications: false,
  notification_types: {
    new_tickets: true,
    ticket_updates: true,
    comments: true,
    new_projects: false,
    deadline_reminders: true
  },
  email_frequency: 'immediate'
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,

      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
            // Merge nested objects properly
            notification_types: {
              ...state.preferences.notification_types,
              ...(newPreferences.notification_types || {})
            }
          }
        }))
      },

      resetPreferences: () => {
        set({ preferences: defaultPreferences })
      }
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        preferences: state.preferences
      })
    }
  )
)
