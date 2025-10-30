// In-memory mock API pour tests sans backend
import { mockUser, mockProjects, mockTickets, mockUsers } from '../data/mockData'
import { Project, ProjectCreate, Ticket, TicketCreate, User } from '../types'

let projects = [...mockProjects]
let tickets = [...mockTickets]
let users: User[] = [...mockUsers]
let currentToken: string | null = 'demo-token'

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms))

export const mockApi = {
  async login(email: string, _password: string) {
    await delay()
    currentToken = 'demo-token'
    const user = users.find(u => u.email === email) ?? mockUser
    return { access_token: currentToken, token_type: 'bearer', user }
  },

  async register(data: { email: string; username: string; full_name: string; password: string }) {
    await delay()
    const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1
    const now = new Date().toISOString()
    const user: User = {
      id,
      email: data.email,
      username: data.username,
      full_name: data.full_name,
      is_active: true,
      role: 'developer',
      created_at: now,
      updated_at: now,
    }
    users.push(user)
    return { message: 'registered', user }
  },

  async me() {
    await delay()
    if (!currentToken) throw new Error('Unauthorized')
    return mockUser
  },

  async getProjects() {
    await delay()
    return projects
  },

  async getProject(id: number) {
    await delay()
    const p = projects.find(p => p.id === id)
    if (!p) throw new Error('Not found')
    return p
  },

  async createProject(data: ProjectCreate) {
    await delay()
    const id = projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1
    const now = new Date().toISOString()
    const project: Project = {
      id,
      name: data.name,
      key: data.key,
      description: data.description,
      is_active: data.is_active ?? true,
      owner_id: mockUser.id,
      workflow_id: data.workflow_id,
      created_at: now,
      updated_at: now,
      members: [],
    }
    projects = [project, ...projects]
    return project
  },

  async updateProject(id: number, data: Partial<ProjectCreate>) {
    await delay()
    projects = projects.map(p => (p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p))
    const prj = projects.find(p => p.id === id)!
    return prj
  },

  async deleteProject(id: number) {
    await delay()
    projects = projects.filter(p => p.id !== id)
    tickets = tickets.filter(t => t.project_id !== id)
  },

  async addMember(projectId: number, userId: number, role: string) {
    await delay()
    const project = projects.find(p => p.id === projectId)
    if (!project) throw new Error('Not found')
    const memberId = project.members.length ? Math.max(...project.members.map(m => m.id)) + 1 : 1
    const member = { id: memberId, user_id: userId, role, joined_at: new Date().toISOString() }
    project.members = [...project.members, member]
    return member
  },

  async removeMember(projectId: number, userId: number) {
    await delay()
    const project = projects.find(p => p.id === projectId)
    if (!project) throw new Error('Not found')
    project.members = project.members.filter(m => m.user_id !== userId)
  },

  async updateMemberRole(projectId: number, userId: number, role: string) {
    await delay()
    const project = projects.find(p => p.id === projectId)
    if (!project) throw new Error('Not found')
    project.members = project.members.map(m => (m.user_id === userId ? { ...m, role } : m))
    return project.members.find(m => m.user_id === userId)!
  },

  async getTickets(projectId?: number) {
    await delay()
    return projectId ? tickets.filter(t => t.project_id === projectId) : tickets
  },

  async getTicket(id: number) {
    await delay()
    const t = tickets.find(t => t.id === id)
    if (!t) throw new Error('Not found')
    return t
  },

  async createTicket(data: TicketCreate) {
    await delay()
    const id = tickets.length ? Math.max(...tickets.map(t => t.id)) + 1 : 1
    const now = new Date().toISOString()
    const ticket: Ticket = {
      id,
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      status: 'To Do',
      assignee_id: data.assignee_id,
      creator_id: mockUser.id,
      project_id: data.project_id,
      tags: data.tags ?? [],
      created_at: now,
      updated_at: now,
      assignee: users.find(u => u.id === data.assignee_id) ?? mockUser,
      creator: mockUser,
      project: projects.find(p => p.id === data.project_id)!,
      comments: [],
      attachments: [],
    }
    tickets = [ticket, ...tickets]
    return ticket
  },

  async updateTicket(id: number, data: Partial<TicketCreate>) {
    await delay()
    tickets = tickets.map(t => (t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t))
    return tickets.find(t => t.id === id)!
  },

  async deleteTicket(id: number) {
    await delay()
    tickets = tickets.filter(t => t.id !== id)
  },

  async updateTicketStatus(id: number, status: string) {
    await delay()
    tickets = tickets.map(t => (t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t))
    return tickets.find(t => t.id === id)!
  },

  async assignTicket(id: number, assigneeId: number) {
    await delay()
    const assignee = users.find(u => u.id === assigneeId) ?? mockUser
    tickets = tickets.map(t => (t.id === id ? { ...t, assignee_id: assigneeId, assignee, updated_at: new Date().toISOString() } : t))
    return tickets.find(t => t.id === id)!
  },

  async getUsers() {
    await delay()
    return users
  },

  // Méthodes pour les settings
  async updateUserProfile(userId: number, data: { full_name?: string; email?: string; username?: string }) {
    await delay()
    users = users.map(u => (u.id === userId ? { ...u, ...data, updated_at: new Date().toISOString() } : u))
    return users.find(u => u.id === userId)!
  },

  async updateUserPreferences(_userId: number, preferences: any) {
    await delay()
    // Simulation de la sauvegarde des préférences
    return { message: 'Préférences mises à jour', preferences }
  },

  async changePassword(_userId: number, currentPassword: string, _newPassword: string) {
    await delay()
    // Simulation du changement de mot de passe
    if (currentPassword.length < 6) {
      throw new Error('Mot de passe actuel incorrect')
    }
    return { message: 'Mot de passe changé avec succès' }
  },
}
