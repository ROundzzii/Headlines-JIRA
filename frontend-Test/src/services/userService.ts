import { api } from './api'
import { User } from '../types'

export const userService = {
  async getUsers(): Promise<User[]> {
    // api est branchée sur mockApi actuellement
    return await api.getUsers()
  },
}


