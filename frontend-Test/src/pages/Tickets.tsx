import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Ticket } from 'lucide-react'
import { useTicketStore } from '../stores/dataStore'
import CreateTicketModal from '../components/CreateTicketModal'
import AssigneeBadge from '../components/AssigneeBadge'

export default function Tickets() {
  const { tickets, isLoading, fetchTickets } = useTicketStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Filtrage des tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchQuery === '' || 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority
    const matchesType = filterType === 'all' || ticket.type === filterType

    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

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
        <button 
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <button 
              className="btn btn-outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="card">
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Statut
                </label>
                <select 
                  className="input w-full"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tous</option>
                  <option value="To Do">À faire</option>
                  <option value="In Progress">En cours</option>
                  <option value="Done">Terminé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Priorité
                </label>
                <select 
                  className="input w-full"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">Tous</option>
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="critical">Critique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Type
                </label>
                <select 
                  className="input w-full"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tous</option>
                  <option value="task">Tâche</option>
                  <option value="bug">Bug</option>
                  <option value="feature">Fonctionnalité</option>
                  <option value="epic">Epic</option>
                </select>
              </div>
            </div>

            {(filterStatus !== 'all' || filterPriority !== 'all' || filterType !== 'all') && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setFilterStatus('all')
                    setFilterPriority('all')
                    setFilterType('all')
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Liste des tickets */}
      {filteredTickets.length > 0 ? (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
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
                    <AssigneeBadge user={ticket.assignee} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Ticket className="mx-auto h-12 w-12 icon-muted" />
          <h3 className="mt-2 text-sm font-medium">
            {tickets.length === 0 ? 'Aucun ticket' : 'Aucun ticket trouvé'}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {tickets.length === 0 
              ? 'Commencez par créer votre premier ticket.'
              : 'Essayez de modifier vos critères de recherche ou de filtrage.'}
          </p>
          <div className="mt-6">
            <button 
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un ticket
            </button>
          </div>
        </div>
      )}
      
      <CreateTicketModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}