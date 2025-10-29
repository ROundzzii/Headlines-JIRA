import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Modal from './Modal'
import { useProjectStore } from '../stores/dataStore'
import { useNotificationStore } from '../stores/notificationStore'
import { projectService } from '../services/projectService'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ProjectFormData {
  name: string
  key: string
  description: string
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { fetchProjects } = useProjectStore()
  const { addNotification } = useNotificationStore()
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      key: '',
      description: ''
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const projectName = watch('name')

  // Auto-générer la clé à partir du nom du projet
  const generateKey = (name: string) => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10)
  }

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)
    try {
      const projectData = {
        ...data,
        key: data.key.toUpperCase().replace(/[^A-Z0-9]/g, '')
      }
      
      await projectService.createProject(projectData)
      addNotification('Projet créé avec succès !', 'success')
      await fetchProjects()
      reset()
      onClose()
    } catch (error) {
      addNotification('Erreur lors de la création du projet', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un nouveau projet" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Nom du projet *
          </label>
          <input
            {...register('name', { required: 'Le nom est requis' })}
            type="text"
            className="input w-full"
            placeholder="Mon Projet"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Clé du projet *
          </label>
          <div className="flex items-center gap-2">
            <input
              {...register('key', { 
                required: 'La clé est requise',
                pattern: {
                  value: /^[A-Z0-9]+$/,
                  message: 'La clé doit contenir uniquement des lettres majuscules et des chiffres'
                }
              })}
              type="text"
              className="input w-full"
              placeholder="MP"
              style={{ textTransform: 'uppercase' }}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase()
              }}
            />
            {projectName && (
              <button
                type="button"
                onClick={() => {
                  const autoKey = generateKey(projectName)
                  const event = { target: { value: autoKey } } as any
                  register('key').onChange(event)
                }}
                className="text-xs text-primary-600 hover:text-primary-700 whitespace-nowrap"
              >
                Auto
              </button>
            )}
          </div>
          {errors.key && (
            <p className="mt-1 text-sm text-red-600">{errors.key.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Exemple: MP, EC, AM
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="input w-full"
            placeholder="Description du projet..."
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
            {isLoading ? 'Création...' : 'Créer le projet'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

