import { mockApi } from './mockApi'
import { User } from '../types'

interface ProfileUpdateData {
  full_name?: string
  email?: string
  username?: string
}

interface PreferencesData {
  theme?: 'light' | 'dark'
  language?: 'fr' | 'en'
  email_notifications?: boolean
  push_notifications?: boolean
  notification_types?: {
    new_tickets?: boolean
    ticket_updates?: boolean
    comments?: boolean
    new_projects?: boolean
    deadline_reminders?: boolean
  }
  email_frequency?: 'immediate' | 'daily' | 'weekly' | 'never'
}

export const settingsService = {
  async updateUserProfile(userId: number, data: ProfileUpdateData): Promise<User> {
    return await mockApi.updateUserProfile(userId, data)
  },

  async updateUserPreferences(userId: number, preferences: PreferencesData) {
    return await mockApi.updateUserPreferences(userId, preferences)
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    return await mockApi.changePassword(userId, currentPassword, newPassword)
  }
}
