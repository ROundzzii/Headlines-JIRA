import { create } from 'zustand'
import { Attachment, Project, Ticket } from '../types'
import { projectService } from '../services/projectService'
import { ticketService } from '../services/ticketService'
import { devtools } from 'zustand/middleware'

interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  fetchProjects: () => Promise<void>
  getProject: (id: number) => Project | undefined
  setCurrentProject: (project: Project | null) => void
}

export const useProjectStore = create<ProjectStore>()(
  devtools(
    (set, get) => ({
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
    }),
    { name: 'ProjectStore' } // Nom pour les DevTools
  )
)

interface TicketStore {
  tickets: Ticket[]
  currentTicket: Ticket | null
  isLoading: boolean
  attachmentsByTicket: Record<number, Attachment[]>
  fetchTickets: (projectId?: number) => Promise<void>
  getTicket: (id: number) => Ticket | undefined
  setCurrentTicket: (ticket: Ticket | null) => void
  updateTicketStatus: (ticketId: number, status: string) => void
  addAttachments: (
    ticketId: number,
    items: Array<{ name: string; size: number; type: string; dataUrl?: string }>,
    uploadedBy?: number
  ) => void
  removeAttachment: (ticketId: number, attachmentId: number) => void
}

function loadAttachmentsFromStorage(): Record<number, Attachment[]> {
  try {
    const raw = localStorage.getItem('attachmentsByTicket')
    return raw ? (JSON.parse(raw) as Record<number, Attachment[]>) : {}
  } catch {
    return {}
  }
}

function saveAttachmentsToStorage(map: Record<number, Attachment[]>) {
  try {
    localStorage.setItem('attachmentsByTicket', JSON.stringify(map))
  } catch {
    // noop
  }
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  currentTicket: null,
  isLoading: false,
  attachmentsByTicket: loadAttachmentsFromStorage(),

  fetchTickets: async (projectId?: number) => {
    set({ isLoading: true })
    try {
      const tickets = await ticketService.getTickets(projectId)
      const map = get().attachmentsByTicket
      const merged = tickets.map(t => ({
        ...t,
        attachments: map[t.id] ?? t.attachments ?? [],
      }))
      set({ tickets: merged, isLoading: false })
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

  addAttachments: (ticketId, items, uploadedBy = 1) => {
    const now = new Date().toISOString()
    const newAttachments: Attachment[] = items.map((it, idx) => ({
      id: Number(`${Date.now()}${idx}`),
      filename: it.name,
      file_path: it.dataUrl || `local:${it.name}`,
      file_size: it.size,
      mime_type: it.type || 'application/octet-stream',
      ticket_id: ticketId,
      uploaded_by: uploadedBy,
      created_at: now,
    }))

    set(state => {
      const currentList = state.attachmentsByTicket[ticketId] ?? []
      const updatedMap = { ...state.attachmentsByTicket, [ticketId]: [...newAttachments, ...currentList] }
      saveAttachmentsToStorage(updatedMap)

      return {
        attachmentsByTicket: updatedMap,
        tickets: state.tickets.map(t =>
          t.id === ticketId ? { ...t, attachments: updatedMap[ticketId] } : t
        ),
        currentTicket:
          state.currentTicket && state.currentTicket.id === ticketId
            ? { ...state.currentTicket, attachments: updatedMap[ticketId] }
            : state.currentTicket,
      }
    })
  },

  removeAttachment: (ticketId, attachmentId) => {
    set(state => {
      const list = state.attachmentsByTicket[ticketId] ?? []
      const updated = list.filter(a => a.id !== attachmentId)
      const updatedMap = { ...state.attachmentsByTicket, [ticketId]: updated }
      saveAttachmentsToStorage(updatedMap)

      return {
        attachmentsByTicket: updatedMap,
        tickets: state.tickets.map(t => (t.id === ticketId ? { ...t, attachments: updated } : t)),
        currentTicket:
          state.currentTicket && state.currentTicket.id === ticketId
            ? { ...state.currentTicket, attachments: updated }
            : state.currentTicket,
      }
    })
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


if (process.env.NODE_ENV === 'development') {
  (window as any).stores = {
    projects: useProjectStore,
    tickets: useTicketStore,
    dashboard: useDashboardStore
  }
}


