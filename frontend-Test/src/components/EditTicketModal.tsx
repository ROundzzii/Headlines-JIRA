import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from 'react-query'
import Modal from './Modal'
import { Ticket } from '../types'
import { useTicketStore } from '../stores/dataStore'
import { useProjectStore } from '../stores/dataStore'
import { useNotificationStore } from '../stores/notificationStore'
import { ticketService } from '../services/ticketService'
import UserSelector from './UserSelector'
import { useUserStore } from '../stores/dataStore'

interface EditTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: Ticket | null
}

interface TicketFormData {
  title: string
  description: string
  type: 'bug' | 'feature' | 'task' | 'epic'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: string
  project_id: number
  tags: string
  assignee_id?: number | null
}

export default function EditTicketModal({ isOpen, onClose, ticket }: EditTicketModalProps) {
  const { fetchTickets } = useTicketStore()
  const { projects, fetchProjects } = useProjectStore()
  const { addNotification } = useNotificationStore()
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<TicketFormData>()
  const [isLoading, setIsLoading] = useState(false)
  const { users, fetchUsers } = useUserStore()
  const queryClient = useQueryClient()
  const [assigneeIdDraft, setAssigneeIdDraft] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen && ticket) {
      fetchProjects()
      if (!users.length) fetchUsers()
      setValue('title', ticket.title)
      setValue('description', ticket.description || '')
      setValue('type', ticket.type)
      setValue('priority', ticket.priority)
      setValue('status', ticket.status)
      setValue('project_id', ticket.project_id)
      setValue('tags', ticket.tags.join(', '))
      const initialAssignee = ticket.assignee_id ?? null
      setAssigneeIdDraft(initialAssignee)
      setValue('assignee_id', initialAssignee)
    }
  }, [isOpen, ticket, setValue, fetchProjects, users.length, fetchUsers])

  const onSubmit = async (data: TicketFormData) => {
    if (!ticket) return

    setIsLoading(true)
    try {
      const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      
      const ticketData = {
        ...data,
        tags: tagsArray
      }
      
      await ticketService.updateTicket(ticket.id, ticketData)
      if (data.assignee_id !== undefined) {
        const updated = await ticketService.assignTicket(ticket.id, data.assignee_id ?? ticket.assignee_id ?? 1)
        // Synchroniser le cache du ticket si ouvert en détail
        queryClient.setQueryData(['ticket', String(ticket.id)], (old: any) => ({ ...(old || {}), assignee_id: updated.assignee_id, assignee: updated.assignee, updated_at: updated.updated_at }))
      }
      addNotification('Ticket modifié avec succès !', 'success')
      await fetchTickets()
      onClose()
    } catch (error) {
      addNotification('Erreur lors de la modification du ticket', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!ticket) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le ticket" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Titre *
          </label>
          <input
            {...register('title', { required: 'Le titre est requis' })}
            type="text"
            className="input w-full"
            placeholder="Titre du ticket"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Assigné à
          </label>
          <UserSelector
            value={assigneeIdDraft}
            onChange={(userId) => { setAssigneeIdDraft(userId); setValue('assignee_id', userId) }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="input w-full"
            placeholder="Description du ticket..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Type *
            </label>
            <select {...register('type', { required: true })} className="input w-full">
              <option value="task">Tâche</option>
              <option value="bug">Bug</option>
              <option value="feature">Fonctionnalité</option>
              <option value="epic">Epic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Priorité *
            </label>
            <select {...register('priority', { required: true })} className="input w-full">
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="critical">Critique</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Statut *
            </label>
            <select {...register('status', { required: true })} className="input w-full">
              <option value="To Do">À faire</option>
              <option value="In Progress">En cours</option>
              <option value="Done">Terminé</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Projet *
          </label>
          <select 
            {...register('project_id', { 
              required: 'Le projet est requis',
              valueAsNumber: true
            })} 
            className="input w-full"
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.key})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Tags (séparés par des virgules)
          </label>
          <input
            {...register('tags')}
            type="text"
            className="input w-full"
            placeholder="frontend, urgent, mobile"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-outline"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Modification...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

