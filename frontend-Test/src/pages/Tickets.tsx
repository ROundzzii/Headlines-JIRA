import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Ticket } from 'lucide-react'
import { useTicketStore } from '../stores/dataStore'

export default function Tickets() {
  const { tickets, isLoading, fetchTickets } = useTicketStore()

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do':
        return 'chip chip-gray'
      case 'In Progress':
        return 'chip chip-blue'
      case 'Done':
        return 'chip chip-green'
      default:
        return 'chip chip-gray'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'chip chip-orange'
      case 'Medium':
        return 'chip chip-yellow'
      case 'Low':
        return 'chip chip-green'
      default:
        return 'chip chip-gray'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-muted">Gérez vos tickets et tâches</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau ticket
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="card">
        <div className="card-content">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 icon-muted" />
                <input
                  type="text"
                  placeholder="Rechercher des tickets..."
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <button className="btn btn-outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Liste des tickets */}
      {tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="card hover:shadow-md transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-lg font-medium hover:text-primary-600"
                      >
                        {ticket.title}
                      </Link>
                      <span className="text-sm text-muted">
                        #{ticket.id}
                      </span>
                    </div>
                    
                    <p className="text-muted text-sm mb-3 line-clamp-2">
                      {ticket.description}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-muted">
                      <span>Type: {ticket.type}</span>
                      <span>•</span>
                      <span>Projet: {ticket.project_id}</span>
                      <span>•</span>
                      <span>
                        Créé le {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Ticket className="mx-auto h-12 w-12 icon-muted" />
          <h3 className="mt-2 text-sm font-medium">Aucun ticket</h3>
          <p className="mt-1 text-sm text-muted">
            Commencez par créer votre premier ticket.
          </p>
          <div className="mt-6">
            <button className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Créer un ticket
            </button>
          </div>
        </div>
      )}
    </div>
  )
}