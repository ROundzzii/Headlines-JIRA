import { create } from 'zustand'
import { Project, Ticket } from '../types'
import { projectService } from '../services/projectService'
import { ticketService } from '../services/ticketService'

interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  fetchProjects: () => Promise<void>
  getProject: (id: number) => Project | undefined
  setCurrentProject: (project: Project | null) => void
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true })
    try {
      const projects = await projectService.getProjects()
      set({ projects, isLoading: false })
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error)
      set({ isLoading: false })
    }
  },

  getProject: (id: number) => {
    return get().projects.find(project => project.id === id)
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project })
  },
}))

interface TicketStore {
  tickets: Ticket[]
  currentTicket: Ticket | null
  isLoading: boolean
  fetchTickets: (projectId?: number) => Promise<void>
  getTicket: (id: number) => Ticket | undefined
  setCurrentTicket: (ticket: Ticket | null) => void
  updateTicketStatus: (ticketId: number, status: string) => void
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  currentTicket: null,
  isLoading: false,

  fetchTickets: async (projectId?: number) => {
    set({ isLoading: true })
    try {
      const tickets = await ticketService.getTickets(projectId)
      set({ tickets, isLoading: false })
    } catch (error) {
      console.error('Erreur lors du chargement des tickets:', error)
      set({ isLoading: false })
    }
  },

  getTicket: (id: number) => {
    return get().tickets.find(ticket => ticket.id === id)
  },

  setCurrentTicket: (ticket: Ticket | null) => {
    set({ currentTicket: ticket })
  },

  updateTicketStatus: async (ticketId: number, status: string) => {
    try {
      await ticketService.updateTicketStatus(ticketId, status)
      set(state => ({
        tickets: state.tickets.map(ticket =>
          ticket.id === ticketId ? { ...ticket, status, updated_at: new Date().toISOString() } : ticket
        )
      }))
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  },
}))

interface DashboardStats {
  totalProjects: number
  totalTickets: number
  ticketsByStatus: Record<string, number>
  ticketsByPriority: Record<string, number>
}

interface DashboardStore {
  stats: DashboardStats | null
  isLoading: boolean
  fetchStats: () => Promise<void>
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  isLoading: false,

  fetchStats: async () => {
    set({ isLoading: true })
    try {
      // Récupérer les projets et tickets pour calculer les statistiques
      const [projects, tickets] = await Promise.all([
        projectService.getProjects(),
        ticketService.getTickets()
      ])

      const stats: DashboardStats = {
        totalProjects: projects.length,
        totalTickets: tickets.length,
        ticketsByStatus: tickets.reduce((acc, ticket) => {
          acc[ticket.status] = (acc[ticket.status] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        ticketsByPriority: tickets.reduce((acc, ticket) => {
          acc[ticket.priority] = (acc[ticket.priority] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }

      set({ stats, isLoading: false })
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      set({ isLoading: false })
    }
  },
}))


