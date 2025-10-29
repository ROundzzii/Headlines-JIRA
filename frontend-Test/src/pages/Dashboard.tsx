import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FolderOpen, 
  Ticket, 
  Users, 
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useDashboardStore } from '../stores/dataStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { stats, isLoading, fetchStats } = useDashboardStore()

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted">Vue d'ensemble de vos projets et tickets</p>
        {user && (
          <p className="text-sm text-muted mt-1">
            👋 Bonjour {user.full_name} !
          </p>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderOpen className="h-8 w-8 icon-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">Projets actifs</p>
              <p className="text-2xl font-bold">{stats?.totalProjects ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Ticket className="h-8 w-8 icon-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">Tickets totaux</p>
              <p className="text-2xl font-bold">{stats?.totalTickets ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 icon-info" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">En cours</p>
              <p className="text-2xl font-bold">{stats?.ticketsByStatus['In Progress'] ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 icon-info" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">Terminés</p>
              <p className="text-2xl font-bold">{stats?.ticketsByStatus['Done'] ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Répartition par statut */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Répartition des tickets</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg surface-2">
              <div className="text-2xl font-bold text-muted">{stats?.ticketsByStatus['To Do'] ?? 0}</div>
              <div className="text-sm text-muted">À faire</div>
            </div>
            <div className="text-center p-4 rounded-lg surface-2">
              <div className="text-2xl font-bold">{stats?.ticketsByStatus['In Progress'] ?? 0}</div>
              <div className="text-sm text-muted">En cours</div>
            </div>
            <div className="text-center p-4 rounded-lg surface-2">
              <div className="text-2xl font-bold">{stats?.ticketsByStatus['Done'] ?? 0}</div>
              <div className="text-sm text-muted">Terminés</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets récents */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Tickets récents</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-default rounded-lg">
                <div className="flex-1">
                  <Link
                    to="/tickets/1"
                    className="text-sm font-medium hover:text-primary-600"
                  >
                    Implémenter authentification utilisateur
                  </Link>
                  <p className="text-xs text-muted mt-1">
                    Projet E-commerce • Task
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="chip chip-orange">high</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-default rounded-lg">
                <div className="flex-1">
                  <Link
                    to="/tickets/2"
                    className="text-sm font-medium hover:text-primary-600"
                  >
                    Design responsive pour mobile
                  </Link>
                  <p className="text-xs text-muted mt-1">
                    Application Mobile • Story
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="chip chip-yellow">medium</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Activité récente</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full surface-2 flex items-center justify-center">
                    <Clock className="h-4 w-4 icon-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Mode démo activé</p>
                  <p className="text-xs text-muted">Il y a quelques minutes</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full surface-2 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 icon-success" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Bienvenue dans JIRA-Headlines !</p>
                  <p className="text-xs text-muted">Explorez l'interface en mode démo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}