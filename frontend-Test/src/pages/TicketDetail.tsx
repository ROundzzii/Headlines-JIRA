import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  MessageSquare, 
  Paperclip, 
  User
} from 'lucide-react'
import { ticketService } from '../services/ticketService'

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: ticket, isLoading } = useQuery(['ticket', id], async () => {
    if (!id) throw new Error('Ticket ID is required')
    return await ticketService.getTicket(parseInt(id))
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <div>
              <div className="card p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Ticket non trouvé</h3>
        <p className="mt-1 text-sm text-gray-500">
          Le ticket que vous recherchez n'existe pas.
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
      {/* Navigation */}
      <div className="flex items-center space-x-4">
        <Link
          to={`/projects/${ticket.project_id}`}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ticket.title}</h1>
          <p className="text-gray-500">#{ticket.id}</p>
        </div>
        <button className="btn-outline">
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
            </div>
            <div className="card-content">
              {ticket.description ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Aucune description fournie</p>
              )}
            </div>
          </div>

          {/* Commentaires */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Commentaires</h3>
            </div>
            <div className="card-content">
              {ticket.comments?.length > 0 ? (
                <div className="space-y-4">
                  {ticket.comments.map((comment: any) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {comment.author?.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.author?.full_name || 'Utilisateur inconnu'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Aucun commentaire</p>
                </div>
              )}
            </div>
          </div>

          {/* Pièces jointes */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Pièces jointes</h3>
            </div>
            <div className="card-content">
              {ticket.attachments?.length > 0 ? (
                <div className="space-y-2">
                  {ticket.attachments.map((attachment: any) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                          <p className="text-xs text-gray-500">
                            {(attachment.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button className="text-sm text-primary-600 hover:text-primary-700">
                        Télécharger
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Paperclip className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Aucune pièce jointe</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informations du ticket */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Détails</h3>
            </div>
            <div className="card-content space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Statut</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    ticket.status === 'done' ? 'bg-green-100 text-green-800' :
                    ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    ticket.status === 'review' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Priorité</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    ticket.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{ticket.type}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Créé par</label>
                <div className="mt-1 flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-700">
                      {ticket.creator?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-900">{ticket.creator?.full_name}</span>
                </div>
              </div>

              {ticket.assignee && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigné à</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-green-700">
                        {ticket.assignee.full_name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-900">{ticket.assignee.full_name}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Créé le</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(ticket.created_at).toLocaleString('fr-FR')}
                </p>
              </div>

              {ticket.updated_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Modifié le</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(ticket.updated_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}

              {ticket.tags?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tags</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {ticket.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Actions</h3>
            </div>
            <div className="card-content space-y-2">
              <button className="btn-outline w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Ajouter un commentaire
              </button>
              <button className="btn-outline w-full">
                <Paperclip className="h-4 w-4 mr-2" />
                Joindre un fichier
              </button>
              <button className="btn-outline w-full">
                <User className="h-4 w-4 mr-2" />
                Assigner à quelqu'un
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

