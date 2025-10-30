// Couche API unifiée.
// Actuellement branchée sur le mock en mémoire, mais expose une config basée sur VITE_API_BASE_URL
// afin de faciliter un futur branchement sur un vrai backend sans refactor massif.

import { mockApi } from './mockApi'

// Configuration API lue depuis les variables d'environnement Vite
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL as string | undefined,
  // Timeout réseau par défaut (utilisé pour simuler des comportements réseau si nécessaire)
  timeoutMs: 10000,
}

// Placeholder pour une implémentation future via fetch/axios
// Nous restons sur le mock pour l'instant.
// L'objectif est que les services consomment `api` et non directement `mockApi`.
export const api = {
  // Auth
  login: mockApi.login,
  register: mockApi.register,
  me: mockApi.me,

  // Users
  getUsers: mockApi.getUsers,

  // Projects
  getProjects: mockApi.getProjects,
  getProject: mockApi.getProject,
  createProject: mockApi.createProject,
  updateProject: mockApi.updateProject,
  deleteProject: mockApi.deleteProject,
  addMember: mockApi.addMember,
  removeMember: mockApi.removeMember,
  updateMemberRole: mockApi.updateMemberRole,

  // Tickets
  getTickets: mockApi.getTickets,
  getTicket: mockApi.getTicket,
  createTicket: mockApi.createTicket,
  updateTicket: mockApi.updateTicket,
  deleteTicket: mockApi.deleteTicket,
  updateTicketStatus: mockApi.updateTicketStatus,
  assignTicket: mockApi.assignTicket,

  // Settings
  updateUserProfile: mockApi.updateUserProfile,
  updateUserPreferences: mockApi.updateUserPreferences,
  changePassword: mockApi.changePassword,
}

export type ApiLayer = typeof api

