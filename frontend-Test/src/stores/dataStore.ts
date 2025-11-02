import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Attachment, Comment, CommentAttachment, Project, Ticket, User } from '../types'
import { projectService } from '../services/projectService'
import { ticketService } from '../services/ticketService'
import { userService } from '../services/userService'
import { mockComments, mockUsers } from '../data/mockData'

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
  setTicketAssignee: (ticketId: number, assignee: { userId: number | null; user?: any }) => void
  addAttachments: (
    ticketId: number,
    items: Array<{ name: string; size: number; type: string; dataUrl?: string }>,
    uploadedBy?: number
  ) => void
  removeAttachment: (ticketId: number, attachmentId: number) => void
  addTempAttachment: (
    ticketId: number,
    item: { tempId: string; name: string; size: number; type: string; dataUrl?: string; uploadedBy?: number }
  ) => void
  updateAttachmentProgress: (ticketId: number, tempId: string, progress: number) => void
  finalizeTempAttachment: (ticketId: number, tempId: string) => void
  failTempAttachment: (ticketId: number, tempId: string, error: string) => void
}
interface UserStore {
  users: User[]
  isLoadingUsers: boolean
  fetchUsers: () => Promise<void>
}

export const useUserStore = create<UserStore>()(
  devtools(
    (set) => ({
      users: [],
      isLoadingUsers: false,
      fetchUsers: async () => {
        set({ isLoadingUsers: true })
        try {
          const users = await userService.getUsers()
          set({ users, isLoadingUsers: false })
        } catch (err) {
          console.error('Erreur chargement utilisateurs:', err)
          set({ isLoadingUsers: false })
        }
      },
    }),
    { name: 'UserStore' }
  )
)


const COMMENTS_STORAGE_KEY = 'commentsByTicket'

export type CommentAttachmentInput = {
  id?: string
  filename: string
  mime_type: string
  size: number
  data: string
  preview_url?: string
  uploaded_by?: number
  uploaded_at?: string
  tempId?: string
  isUploading?: boolean
  progress?: number
  error?: string
}

type CommentAttachmentLike = CommentAttachment | CommentAttachmentInput

export interface CreateCommentInput {
  ticketId: number
  author: User
  content: string
  attachments?: CommentAttachmentInput[]
  mentions?: number[]
}

export interface UpdateCommentInput {
  ticketId: number
  commentId: number
  content?: string
  attachments?: CommentAttachmentLike[]
  mentions?: number[]
}

export type CommentFlagUpdate = Partial<Pick<Comment, 'is_editing' | 'is_saving' | 'is_deleting' | 'error'>>

const generateCommentId = () => Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`)

const generateCommentAttachmentId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `comment-attachment-${Date.now()}-${Math.floor(Math.random() * 1000)}`

const getUsersSnapshot = (): User[] => {
  const { users } = useUserStore.getState()
  return users.length ? users : mockUsers
}

const resolveMentionDetails = (mentionIds: number[] = []): User[] => {
  if (!mentionIds.length) return []
  const snapshot = getUsersSnapshot()
  return mentionIds
    .map(id => snapshot.find(user => user.id === id))
    .filter((user): user is User => Boolean(user))
}

const normalizeAttachment = (
  attachment: CommentAttachmentLike,
  fallbackUploader: number
): CommentAttachment => {
  const {
    tempId,
    isUploading,
    progress,
    error,
    file_path,
    isNew,
  } = attachment as CommentAttachment

  const mimeType = attachment.mime_type || 'application/octet-stream'
  const rawData = (attachment as CommentAttachment).data ?? (attachment as CommentAttachmentInput).data ?? ''
  const dataValue = rawData || (attachment as CommentAttachment).preview_url || ''
  const filePathValue = file_path ?? (dataValue ? dataValue : undefined)
  const previewSource = attachment.preview_url ??
    (mimeType.startsWith('image/') ? (filePathValue ?? dataValue) : undefined)

  return {
    id: attachment.id ?? generateCommentAttachmentId(),
    filename: attachment.filename,
    mime_type: mimeType,
    size: attachment.size,
    data: dataValue,
    file_path: filePathValue,
    uploaded_by: attachment.uploaded_by ?? fallbackUploader,
    uploaded_at: attachment.uploaded_at ?? new Date().toISOString(),
    preview_url: previewSource,
    tempId,
    isUploading,
    progress,
    error,
    isNew: Boolean(isNew),
  }
}

const sortComments = (comments: Comment[]): Comment[] =>
  [...comments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

const normalizeComment = (comment: Comment): Comment => {
  const mentions = comment.mentions ?? comment.mentions_details?.map(user => user.id) ?? []
  const attachments = (comment.attachments ?? []).map(att =>
    normalizeAttachment(att, att.uploaded_by ?? comment.author_id)
  )

  return {
    ...comment,
    attachments,
    mentions,
    mentions_details: resolveMentionDetails(mentions),
    is_editing: Boolean(comment.is_editing),
    is_saving: Boolean(comment.is_saving),
    is_deleting: Boolean(comment.is_deleting),
    error: comment.error ?? undefined,
  }
}

const normalizeCommentsMap = (
  source: Record<number | string, Comment[]>
): Record<number, Comment[]> => {
  return Object.entries(source).reduce((acc, [key, comments]) => {
    const ticketId = Number(key)
    acc[ticketId] = sortComments(comments.map(normalizeComment))
    return acc
  }, {} as Record<number, Comment[]>)
}

const buildMockCommentsMap = (): Record<number, Comment[]> => {
  const grouped = mockComments.reduce((acc, comment) => {
    const ticketId = comment.ticket_id
    acc[ticketId] = [...(acc[ticketId] ?? []), comment]
    return acc
  }, {} as Record<number, Comment[]>)

  return normalizeCommentsMap(grouped)
}

const loadCommentsFromStorage = (): Record<number, Comment[]> => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(COMMENTS_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<number | string, Comment[]>
    return normalizeCommentsMap(parsed)
  } catch (error) {
    console.warn('Unable to load comments from storage:', error)
    return {}
  }
}

const saveCommentsToStorage = (map: Record<number, Comment[]>) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(map))
  } catch (error) {
    console.warn('Unable to persist comments to storage:', error)
  }
}

const getInitialComments = (): Record<number, Comment[]> => {
  const stored = loadCommentsFromStorage()
  if (Object.keys(stored).length > 0) {
    return stored
  }
  return buildMockCommentsMap()
}

let syncTicketComments: (ticketId: number, comments: Comment[]) => void = () => {}

interface CommentStore {
  commentsByTicket: Record<number, Comment[]>
  hydrateFromTickets: (tickets: Ticket[]) => void
  getComments: (ticketId: number) => Comment[]
  addComment: (input: CreateCommentInput) => Comment
  updateComment: (input: UpdateCommentInput) => void
  deleteComment: (ticketId: number, commentId: number) => void
  addCommentAttachments: (
    ticketId: number,
    commentId: number,
    attachments: CommentAttachmentInput[]
  ) => void
  removeCommentAttachment: (ticketId: number, commentId: number, attachmentId: string) => void
  setCommentFlags: (ticketId: number, commentId: number, flags: CommentFlagUpdate) => void
  reset: () => void
}

export const useCommentStore = create<CommentStore>()(
  devtools(
    (set, get) => ({
      commentsByTicket: getInitialComments(),

      hydrateFromTickets: (tickets: Ticket[]) => {
        const fromTickets = normalizeCommentsMap(
          tickets.reduce((acc, ticket) => {
            acc[ticket.id] = ticket.comments ?? []
            return acc
          }, {} as Record<number, Comment[]>)
        )

        set(state => {
          const merged: Record<number, Comment[]> = { ...fromTickets }
          Object.entries(state.commentsByTicket).forEach(([key, comments]) => {
            merged[Number(key)] = sortComments(comments.map(normalizeComment))
          })
          saveCommentsToStorage(merged)
          return { commentsByTicket: merged }
        })
      },

      getComments: (ticketId: number) => get().commentsByTicket[ticketId] ?? [],

      addComment: ({ ticketId, author, content, attachments = [], mentions = [] }) => {
        const timestamp = new Date().toISOString()
        const builtAttachments = attachments.map(att =>
          normalizeAttachment(att, att.uploaded_by ?? author.id)
        )

        const newComment = normalizeComment({
          id: generateCommentId(),
          content,
          author_id: author.id,
          ticket_id: ticketId,
          created_at: timestamp,
          updated_at: timestamp,
          author,
          attachments: builtAttachments,
          mentions,
          mentions_details: resolveMentionDetails(mentions),
        })

        set(state => {
          const current = state.commentsByTicket[ticketId] ?? []
          const updated = sortComments([...current, newComment])
          const next = { ...state.commentsByTicket, [ticketId]: updated }
          saveCommentsToStorage(next)
          syncTicketComments(ticketId, updated)
          return { commentsByTicket: next }
        })

        return newComment
      },

      updateComment: ({ ticketId, commentId, content, attachments, mentions }) => {
        set(state => {
          const current = state.commentsByTicket[ticketId] ?? []

          const updated = current.map(comment => {
            if (comment.id !== commentId) return comment

            const nextMentions = mentions ?? comment.mentions ?? []
            const nextAttachments =
              attachments !== undefined
                ? attachments.map(att =>
                    normalizeAttachment(
                      att as CommentAttachmentLike,
                      (att as CommentAttachmentLike).uploaded_by ?? comment.author_id
                    )
                  )
                : comment.attachments ?? []

            return normalizeComment({
              ...comment,
              content: content ?? comment.content,
              attachments: nextAttachments,
              mentions: nextMentions,
              updated_at: new Date().toISOString(),
              is_editing: false,
              is_saving: false,
              error: undefined,
            })
          })

          const sorted = sortComments(updated)
          const next = { ...state.commentsByTicket, [ticketId]: sorted }
          saveCommentsToStorage(next)
          syncTicketComments(ticketId, sorted)
          return { commentsByTicket: next }
        })
      },

      deleteComment: (ticketId: number, commentId: number) => {
        set(state => {
          const current = state.commentsByTicket[ticketId] ?? []
          const updated = current.filter(comment => comment.id !== commentId)
          const next = { ...state.commentsByTicket, [ticketId]: updated }
          saveCommentsToStorage(next)
          syncTicketComments(ticketId, updated)
          return { commentsByTicket: next }
        })
      },

      addCommentAttachments: (ticketId, commentId, attachmentsInput) => {
        set(state => {
          const current = state.commentsByTicket[ticketId] ?? []

          const updated = current.map(comment => {
            if (comment.id !== commentId) return comment
            const built = attachmentsInput.map(att =>
              normalizeAttachment(att, att.uploaded_by ?? comment.author_id)
            )

            return normalizeComment({
              ...comment,
              attachments: [...(comment.attachments ?? []), ...built],
              updated_at: new Date().toISOString(),
            })
          })

          const sorted = sortComments(updated)
          const next = { ...state.commentsByTicket, [ticketId]: sorted }
          saveCommentsToStorage(next)
          syncTicketComments(ticketId, sorted)
          return { commentsByTicket: next }
        })
      },

      removeCommentAttachment: (ticketId, commentId, attachmentId) => {
        set(state => {
          const current = state.commentsByTicket[ticketId] ?? []

          const updated = current.map(comment => {
            if (comment.id !== commentId) return comment

            const remaining = (comment.attachments ?? []).filter(
              att => att.id !== attachmentId && att.tempId !== attachmentId
            )

            return normalizeComment({
              ...comment,
              attachments: remaining,
              updated_at: new Date().toISOString(),
            })
          })

          const sorted = sortComments(updated)
          const next = { ...state.commentsByTicket, [ticketId]: sorted }
          saveCommentsToStorage(next)
          syncTicketComments(ticketId, sorted)
          return { commentsByTicket: next }
        })
      },

      setCommentFlags: (ticketId, commentId, flags) => {
        set(state => {
          const current = state.commentsByTicket[ticketId] ?? []

          const updated = current.map(comment =>
            comment.id === commentId ? { ...comment, ...flags } : comment
          )

          const next = { ...state.commentsByTicket, [ticketId]: updated }
          saveCommentsToStorage(next)
          return { commentsByTicket: next }
        })
      },

      reset: () => {
        const initial = getInitialComments()
        saveCommentsToStorage(initial)
        set({ commentsByTicket: initial })
      },
    }),
    { name: 'CommentStore' }
  )
)


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
      const commentStore = useCommentStore.getState()
      commentStore.hydrateFromTickets(tickets)
      const commentsMap = useCommentStore.getState().commentsByTicket

      const merged = tickets.map(t => ({
        ...t,
        attachments: map[t.id] ?? t.attachments ?? [],
        comments: commentsMap[t.id] ?? t.comments ?? [],
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
    if (!ticket) {
      set({ currentTicket: null })
      return
    }

    const comments = useCommentStore.getState().commentsByTicket[ticket.id] ?? ticket.comments ?? []
    const attachments = get().attachmentsByTicket[ticket.id] ?? ticket.attachments ?? []

    set({
      currentTicket: { ...ticket, comments, attachments },
    })
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

  setTicketAssignee: (ticketId, assignee) => {
    set(state => ({
      tickets: state.tickets.map(t =>
        t.id === ticketId
          ? {
              ...t,
              assignee_id: assignee.userId ?? undefined,
              assignee: assignee.user ?? undefined,
              updated_at: new Date().toISOString(),
            }
          : t
      ),
      currentTicket:
        state.currentTicket && state.currentTicket.id === ticketId
          ? {
              ...state.currentTicket,
              assignee_id: assignee.userId ?? undefined,
              assignee: assignee.user ?? undefined,
              updated_at: new Date().toISOString(),
            }
          : state.currentTicket,
    }))
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

  addTempAttachment: (ticketId, item) => {
    const now = new Date().toISOString()
    const tempAttachment: Attachment = {
      id: Number(`${Date.now()}${Math.floor(Math.random()*1000)}`),
      tempId: item.tempId,
      filename: item.name,
      file_path: item.dataUrl || `local:${item.name}`,
      file_size: item.size,
      mime_type: item.type || 'application/octet-stream',
      ticket_id: ticketId,
      uploaded_by: item.uploadedBy ?? 1,
      created_at: now,
      isUploading: true,
      progress: 0,
    }
    set(state => {
      const currentList = state.attachmentsByTicket[ticketId] ?? []
      const updatedMap = { ...state.attachmentsByTicket, [ticketId]: [tempAttachment, ...currentList] }
      saveAttachmentsToStorage(updatedMap)
      return {
        attachmentsByTicket: updatedMap,
        tickets: state.tickets.map(t => (t.id === ticketId ? { ...t, attachments: updatedMap[ticketId] } : t)),
        currentTicket:
          state.currentTicket && state.currentTicket.id === ticketId
            ? { ...state.currentTicket, attachments: updatedMap[ticketId] }
            : state.currentTicket,
      }
    })
  },

  updateAttachmentProgress: (ticketId, tempId, progress) => {
    set(state => {
      const list = state.attachmentsByTicket[ticketId] ?? []
      const updated = list.map(a => (a.tempId === tempId ? { ...a, progress } : a))
      const updatedMap = { ...state.attachmentsByTicket, [ticketId]: updated }
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

  finalizeTempAttachment: (ticketId, tempId) => {
    set(state => {
      const list = state.attachmentsByTicket[ticketId] ?? []
      const updated = list.map(a => (a.tempId === tempId ? { ...a, isUploading: false, progress: 100 } : a))
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

  failTempAttachment: (ticketId, tempId, error) => {
    set(state => {
      const list = state.attachmentsByTicket[ticketId] ?? []
      const updated = list.map(a => (a.tempId === tempId ? { ...a, isUploading: false, error, progress: 0 } : a))
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

syncTicketComments = (ticketId, comments) => {
  useTicketStore.setState(state => ({
    tickets: state.tickets.map(ticket =>
      ticket.id === ticketId ? { ...ticket, comments } : ticket
    ),
    currentTicket:
      state.currentTicket && state.currentTicket.id === ticketId
        ? { ...state.currentTicket, comments }
        : state.currentTicket,
  }))
}

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


// @ts-expect-error - process is available in build environment
if (process.env.NODE_ENV === 'development') {
  (window as any).stores = {
    projects: useProjectStore,
    tickets: useTicketStore,
    dashboard: useDashboardStore
  }
}


