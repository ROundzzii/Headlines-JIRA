import { useEffect, useCallback } from 'react'
import { useSettingsStore } from '../stores/settingsStore'

export function useTheme() {
  const { preferences, updatePreferences } = useSettingsStore()
  const theme = preferences.theme

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    updatePreferences({ theme: theme === 'dark' ? 'light' : 'dark' })
  }, [theme, updatePreferences])

  return { theme, toggleTheme }
}
