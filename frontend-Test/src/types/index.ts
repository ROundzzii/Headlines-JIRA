// Types pour l'authentification
export interface User {
  id: number
  email: string
  username: string
  full_name: string
  is_active: boolean
  role: 'admin' | 'project_manager' | 'developer' | 'viewer'
  created_at: string
  updated_at?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// Types pour les projets
export interface Project {
  id: number
  name: string
  key: string
  description?: string
  is_active: boolean
  owner_id: number
  workflow_id?: number
  created_at: string
  updated_at?: string
  members: ProjectMember[]
}

export interface ProjectMember {
  id: number
  user_id: number
  role: string
  joined_at: string
}

export interface ProjectCreate {
  name: string
  key: string
  description?: string
  is_active?: boolean
  workflow_id?: number
}

// Types pour les workflows
export interface Workflow {
  id: number
  name: string
  description?: string
  is_default: boolean
  created_at: string
  statuses: WorkflowStatus[]
  transitions: WorkflowTransition[]
}

export interface WorkflowStatus {
  id: number
  name: string
  color: string
  is_initial: boolean
  is_final: boolean
  order: number
}

export interface WorkflowTransition {
  id: number
  from_status_id: number
  to_status_id: number
  name: string
  is_automatic: boolean
}

// Types pour les tickets
export interface Ticket {
  id: number
  title: string
  description?: string
  type: 'bug' | 'feature' | 'task' | 'epic'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: string
  assignee_id?: number
  creator_id: number
  project_id: number
  tags: string[]
  created_at: string
  updated_at?: string
  assignee?: User
  creator: User
  project: Project
  comments: Comment[]
  attachments: Attachment[]
}

export interface CommentAttachment {
  id: string
  filename: string
  mime_type: string
  size: number
  data: string
  file_path?: string
  uploaded_by: number
  uploaded_at: string
  preview_url?: string
  tempId?: string
  isUploading?: boolean
  progress?: number
  error?: string
  isNew?: boolean
}

export interface Comment {
  id: number
  content: string
  author_id: number
  ticket_id: number
  created_at: string
  updated_at?: string
  deleted_at?: string
  author: User
  attachments?: CommentAttachment[]
  mentions?: number[]
  mentions_details?: User[]
  is_editing?: boolean
  is_saving?: boolean
  is_deleting?: boolean
  error?: string
}

export interface Attachment {
  id: number
  filename: string
  file_path: string
  file_size: number
  mime_type: string
  ticket_id: number
  uploaded_by: number
  created_at: string
  // Champs frontend optionnels pour upload local/mock
  tempId?: string
  isUploading?: boolean
  progress?: number // 0..100
  error?: string
}

export interface TicketCreate {
  title: string
  description?: string
  type: 'bug' | 'feature' | 'task' | 'epic'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee_id?: number
  project_id: number
  tags?: string[]
}

// Types pour l'API
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

// Types pour les notifications
export interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  user_id: number
  created_at: string
}

