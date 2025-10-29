import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { 
  FolderOpen, 
  Users, 
  Calendar, 
  Settings,
  Ticket,
  BarChart3
} from 'lucide-react'
import { useProjectStore, useTicketStore } from '../stores/dataStore'
import { useEffect, useState } from 'react'
import ProjectSettingsModal from '../components/ProjectSettingsModal'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { getProject } = useProjectStore()
  const { fetchTickets, tickets } = useTicketStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const project = id ? getProject(parseInt(id)) : null

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      if (id) {
        await fetchTickets(parseInt(id))
      }
      setIsLoading(false)
    }
    loadData()
  }, [id, fetchTickets])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Projet non trouvé</h3>
        <p className="mt-1 text-sm text-gray-500">
          Le projet que vous recherchez n'existe pas.
        </p>
        <div className="mt-6">
          <Link to="/projects" className="btn-primary">
            Retour aux projets
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête du projet */}
      <div className="card">
        <div className="card-content">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <FolderOpen className="h-8 w-8 icon-primary" />
                <div>
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  <p className="text-muted">Clé: {project.key}</p>
                </div>
              </div>
              {project.description && (
                <p className="text-muted mb-4">{project.description}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button 
                className="btn-outline"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm text-muted">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1 icon" />
              {project.members?.length || 0} membres
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 icon" />
              Créé le {new Date(project.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation du projet */}
      <div className="flex space-x-1 surface-2 p-1 rounded-lg">
        <Link
          to={`/projects/${id}`}
          className="flex items-center px-3 py-2 text-sm font-medium surface rounded-md shadow-sm"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Vue d'ensemble
        </Link>
        <Link
          to={`/projects/${id}/tickets`}
          className="flex items-center px-3 py-2 text-sm font-medium text-muted hover:text-gray-700"
        >
          <Ticket className="h-4 w-4 mr-2" />
          Tickets
        </Link>
        <Link
          to={`/projects/${id}/kanban`}
          className="flex items-center px-3 py-2 text-sm font-medium text-muted hover:text-gray-700"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Kanban
        </Link>
      </div>

      {/* Statistiques du projet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Ticket className="h-8 w-8 icon-info" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">Tickets ouverts</p>
              <p className="text-2xl font-bold">
                {tickets?.filter((t: any) => t.status !== 'Done').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 icon-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">Membres actifs</p>
              <p className="text-2xl font-bold">{project.members?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 icon-info" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">Tickets résolus</p>
              <p className="text-2xl font-bold">
                {tickets?.filter((t: any) => t.status === 'Done').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets récents */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Tickets récents</h3>
        </div>
        <div className="card-content">
          {tickets?.length > 0 ? (
            <div className="space-y-4">
              {tickets.slice(0, 5).map((ticket: any) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-sm font-medium hover:text-primary-600"
                    >
                      {ticket.title}
                    </Link>
                    <p className="text-xs text-muted mt-1">
                      {ticket.type} • {ticket.priority}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`chip ${
                      ticket.status === 'Done' ? 'chip-green' :
                      ticket.status === 'In Progress' ? 'chip-blue' :
                      'chip-gray'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Ticket className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun ticket</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par créer votre premier ticket.</p>
            </div>
          )}
        </div>
      </div>

      <ProjectSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        project={project}
      />
    </div>
  )
}

