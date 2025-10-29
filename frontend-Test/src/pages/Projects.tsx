import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FolderOpen, Users, Calendar } from 'lucide-react'
import { useProjectStore } from '../stores/dataStore'

export default function Projects() {
  const { projects, isLoading, fetchProjects } = useProjectStore()

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Projets</h1>
          <p className="text-muted">Gérez vos projets et équipes</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau projet
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-lg surface-2 flex items-center justify-center mr-3">
                      <FolderOpen className="h-5 w-5 icon-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{project.name}</h3>
                      <p className="text-sm text-muted">{project.key}</p>
                    </div>
                  </div>
                </div>

                <p className="text-muted text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex items-center justify-between text-sm text-muted mb-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 icon" />
                    <span>3 membres</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 icon" />
                    <span>
                      {new Date(project.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/projects/${project.id}`}
                    className="btn btn-outline flex-1"
                  >
                    Voir le projet
                  </Link>
                  <Link
                    to={`/projects/${project.id}/kanban`}
                    className="btn btn-primary flex-1"
                  >
                    Kanban
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun projet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer votre premier projet.
          </p>
          <div className="mt-6">
            <button className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Créer un projet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}