import { mockApi } from './mockApi'
import { User } from '../types'

interface LoginResponse {
  token: string
  user: User
}

interface RegisterData {
  email: string
  username: string
  full_name: string
  password: string
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const r = await mockApi.login(email, password)
    return { token: r.access_token, user: r.user }
  },

  async register(userData: RegisterData) {
    const r = await mockApi.register(userData)
    return r
  },

  async getCurrentUser(): Promise<User> {
    return await mockApi.me()
  },
}

