import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Ticket, User } from 'lucide-react'
import { useTicketStore } from '../stores/dataStore'

export default function KanbanBoard() {
  const { tickets, isLoading, fetchTickets } = useTicketStore()

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const columns = [
    { id: 'To Do', title: 'À faire' },
    { id: 'In Progress', title: 'En cours' },
    { id: 'Done', title: 'Terminé' }
  ]

  const getTicketsByStatus = (status: string) => {
    return tickets.filter(ticket => ticket.status === status)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'border-l-red-500'
      case 'Medium':
        return 'border-l-yellow-500'
      case 'Low':
        return 'border-l-green-500'
      default:
        return 'border-l-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-4">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
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
          <h1 className="text-2xl font-bold">Tableau Kanban</h1>
          <p className="text-muted">Visualisez vos tickets par statut</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau ticket
        </button>
      </div>

      {/* Colonnes Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="card">
            <div className={`card-header surface-2`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {column.title}
                </h3>
                <span className="chip chip-gray">
                  {getTicketsByStatus(column.id).length}
                </span>
              </div>
            </div>
            
            <div className="card-content">
              <div className="space-y-3">
                {getTicketsByStatus(column.id).map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`card border-l-4 ${getPriorityColor(ticket.priority)} hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <div className="card-content">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="block"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium line-clamp-2">
                            {ticket.title}
                          </h4>
                          <span className="text-xs text-muted ml-2">
                            #{ticket.id}
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted mb-3 line-clamp-2">
                          {ticket.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted">
                          <div className="flex items-center">
                            <Ticket className="h-3 w-3 mr-1 icon" />
                            <span>{ticket.type}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1 icon" />
                            <span>Assigné</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
                
                {getTicketsByStatus(column.id).length === 0 && (
                  <div className="text-center py-8 text-muted">
                    <Ticket className="mx-auto h-8 w-8 mb-2 opacity-50 icon-muted" />
                    <p className="text-sm">Aucun ticket</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions pour le mode démo */}
      <div className="card">
        <div className="card-content">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full surface-2 flex items-center justify-center">
                <Ticket className="h-4 w-4 icon-info" />
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">
                Mode démo - Tableau Kanban
              </h3>
              <p className="text-sm text-muted mt-1">
                Dans le mode complet, vous pourrez glisser-déposer les tickets entre les colonnes 
                pour changer leur statut. Explorez les autres pages pour voir toutes les fonctionnalités !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}