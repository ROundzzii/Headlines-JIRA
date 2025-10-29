import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Ticket, User } from 'lucide-react'
import { useDrag, useDrop } from 'react-dnd'
import { useTicketStore } from '../stores/dataStore'
import CreateTicketModal from '../components/CreateTicketModal'
import { useNotificationStore } from '../stores/notificationStore'

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
    case 'High':
      return 'border-l-red-500'
    case 'medium':
    case 'Medium':
      return 'border-l-yellow-500'
    case 'low':
    case 'Low':
      return 'border-l-green-500'
    default:
      return 'border-l-gray-500'
  }
}

interface TicketCardProps {
  ticket: any
}

function TicketCard({ ticket }: TicketCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'ticket',
    item: { id: ticket.id, currentStatus: ticket.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <div
      ref={drag}
      className={`card border-l-4 ${getPriorityColor(ticket.priority)} hover:shadow-md transition-all cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="card-content">
        <Link to={`/tickets/${ticket.id}`} className="block">
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
  )
}

interface ColumnProps {
  column: { id: string; title: string }
  tickets: any[]
}

function Column({ column, tickets }: ColumnProps) {
  const { updateTicketStatus } = useTicketStore()
  const { addNotification } = useNotificationStore()

  const [{ isOver }, drop] = useDrop({
    accept: 'ticket',
    drop: async (item: { id: number; currentStatus: string }) => {
      if (item.currentStatus !== column.id) {
        try {
          await updateTicketStatus(item.id, column.id)
          addNotification(`Ticket déplacé vers "${column.title}"`, 'success')
        } catch (error) {
          addNotification('Erreur lors du déplacement du ticket', 'error')
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  return (
    <div ref={drop} className="card">
      <div className={`card-header surface-2 ${isOver ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {column.title}
          </h3>
          <span className="chip chip-gray">
            {tickets.length}
          </span>
        </div>
      </div>
      
      <div className="card-content">
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
          
          {tickets.length === 0 && (
            <div className="text-center py-8 text-muted">
              <Ticket className="mx-auto h-8 w-8 mb-2 opacity-50 icon-muted" />
              <p className="text-sm">Aucun ticket</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function KanbanBoard() {
  const { tickets, isLoading, fetchTickets } = useTicketStore()
  const [isModalOpen, setIsModalOpen] = useState(false)

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
        <button 
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau ticket
        </button>
      </div>

      {/* Colonnes Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            tickets={getTicketsByStatus(column.id)}
          />
        ))}
      </div>

      
      <CreateTicketModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}