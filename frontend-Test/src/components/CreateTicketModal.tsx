import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Modal from './Modal'
import { useTicketStore } from '../stores/dataStore'
import { useProjectStore } from '../stores/dataStore'
import { useNotificationStore } from '../stores/notificationStore'
import { ticketService } from '../services/ticketService'

interface CreateTicketModalProps {
  isOpen: boolean
  onClose: () => void
  defaultProjectId?: number
}

interface TicketFormData {
  title: string
  description: string
  type: 'bug' | 'feature' | 'task' | 'epic'
  priority: 'low' | 'medium' | 'high' | 'critical'
  project_id: number
  assignee_id?: number
  tags: string
}

export default function CreateTicketModal({ isOpen, onClose, defaultProjectId }: CreateTicketModalProps) {
  const { fetchTickets } = useTicketStore()
  const { projects, fetchProjects } = useProjectStore()
  const { addNotification } = useNotificationStore()
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<TicketFormData>({
    defaultValues: {
      title: '',
      description: '',
      type: 'task',
      priority: 'medium',
      project_id: defaultProjectId || 0,
      tags: ''
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchProjects()
      if (defaultProjectId) {
        setValue('project_id', defaultProjectId)
      }
    }
  }, [isOpen, defaultProjectId, setValue, fetchProjects])

  const onSubmit = async (data: TicketFormData) => {
    setIsLoading(true)
    try {
      const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      
      const ticketData = {
        ...data,
        assignee_id: data.assignee_id || undefined,
        tags: tagsArray
      }
      
      await ticketService.createTicket(ticketData)
      addNotification('Ticket créé avec succès !', 'success')
      await fetchTickets(data.project_id)
      reset()
      onClose()
    } catch (error) {
      addNotification('Erreur lors de la création du ticket', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un nouveau ticket" size="lg">
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
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="input w-full"
            placeholder="Description du ticket..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            disabled={!!defaultProjectId}
          >
            <option value="">Sélectionner un projet</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.key})
              </option>
            ))}
          </select>
          {errors.project_id && (
            <p className="mt-1 text-sm text-red-600">{errors.project_id.message}</p>
          )}
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
            {isLoading ? 'Création...' : 'Créer le ticket'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

