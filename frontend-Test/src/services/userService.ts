import { api } from './api'
import { User } from '../types'

export const userService = {
  async getUsers(): Promise<User[]> {
    // api est branchée sur mockApi actuellement
    // @ts-ignore - getUsers est exposé par le mock
    return await api.getUsers()
  },
}


