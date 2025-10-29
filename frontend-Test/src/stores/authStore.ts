import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthState } from '../types'
import { authService } from '../services/authService'
import { mockUser } from '../data/mockData'

// Mode démo - désactiver l'authentification réelle
const DEMO_MODE = true

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

interface RegisterData {
  email: string
  username: string
  full_name: string
  password: string
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: DEMO_MODE ? mockUser : null,
      token: DEMO_MODE ? 'demo-token' : null,
      isAuthenticated: DEMO_MODE,

      login: async (email: string, password: string) => {
        if (DEMO_MODE) {
          // Mode démo - connexion automatique
          set({ user: mockUser, token: 'demo-token', isAuthenticated: true })
          return
        }

        try {
          const response = await authService.login(email, password)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
          })
        } catch (error) {
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        if (DEMO_MODE) {
          // Mode démo - inscription automatique
          set({ user: mockUser, token: 'demo-token', isAuthenticated: true })
          return
        }

        try {
          await authService.register(userData)
          // Après inscription, on peut automatiquement connecter l'utilisateur
          await get().login(userData.email, userData.password)
        } catch (error) {
          throw error
        }
      },

      logout: () => {
        if (DEMO_MODE) {
          // Mode démo - reste connecté
          return
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      updateUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)