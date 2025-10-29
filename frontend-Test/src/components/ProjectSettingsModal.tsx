import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Modal from './Modal'
import { Project } from '../types'
import { useProjectStore } from '../stores/dataStore'
import { useNotificationStore } from '../stores/notificationStore'
import { projectService } from '../services/projectService'

interface ProjectSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
}

interface ProjectFormData {
  name: string
  description: string
  key: string
}

export default function ProjectSettingsModal({ isOpen, onClose, project }: ProjectSettingsModalProps) {
  const { updateProject } = useProjectStore()
  const { addNotification } = useNotificationStore()
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProjectFormData>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && project) {
      setValue('name', project.name)
      setValue('description', project.description || '')
      setValue('key', project.key)
    }
  }, [isOpen, project, setValue])

  const onSubmit = async (data: ProjectFormData) => {
    if (!project) return

    setIsLoading(true)
    try {
      await updateProject(project.id, data)
      addNotification('Projet modifié avec succès !', 'success')
      onClose()
    } catch (error) {
      addNotification('Erreur lors de la modification du projet', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!project) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Paramètres du projet" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Nom du projet *
          </label>
          <input
            {...register('name', { required: 'Le nom est requis' })}
            type="text"
            className="input w-full"
            placeholder="Nom du projet"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Clé du projet *
          </label>
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
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase()
            }}
          />
          {errors.key && (
            <p className="mt-1 text-sm text-red-600">{errors.key.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            La clé est utilisée pour identifier le projet (ex: MP, EC)
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Mode démo :</strong> Les modifications sont simulées. Dans la version complète, vous pourrez 
            également gérer les membres du projet, les workflows et les permissions.
          </p>
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
            {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

