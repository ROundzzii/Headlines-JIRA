import { ReactNode, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // useTheme applique la classe 'dark' selon les préférences
  const { theme } = useTheme()

  // Evite flash en forçant une synchro initiale (no-op ici car useTheme le fait déjà)
  useEffect(() => {
    // Intentionnellement vide
  }, [theme])

  return <>{children}</>
}
