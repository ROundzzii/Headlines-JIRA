import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  MessageSquare, 
  Paperclip, 
  FileText,
  Send
} from 'lucide-react'
import { ticketService } from '../services/ticketService'
import EditTicketModal from '../components/EditTicketModal'
import { useNotificationStore } from '../stores/notificationStore'
import { useTicketStore } from '../stores/dataStore'
import FileUploader from '../components/FileUploader'
import { isPreviewableImage, isPreviewablePdf } from '../utils/mime'
import { useUpload } from '../hooks/useUpload'
import Modal from '../components/Modal'
import UserSelector from '../components/UserSelector'
import AssigneeBadge from '../components/AssigneeBadge'
import { useUserStore } from '../stores/dataStore'

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [newComment, setNewComment] = useState('')
  const { addNotification } = useNotificationStore()

  const { data: ticket, isLoading } = useQuery(['ticket', id], async () => {
    if (!id) throw new Error('Ticket ID is required')
    return await ticketService.getTicket(parseInt(id))
  })
  const queryClient = useQueryClient()

  const ticketId = useMemo(() => (ticket ? ticket.id : id ? parseInt(id) : undefined), [ticket, id])
  const { removeAttachment, addTempAttachment, updateAttachmentProgress, finalizeTempAttachment, failTempAttachment, setTicketAssignee } = useTicketStore()
  const { upload, errorMap, clearState, progressMap } = useUpload()
  const users = useUserStore(s => s.users)
  const fetchUsers = useUserStore(s => s.fetchUsers)
  const attachments = useTicketStore((s) =>
    ticketId
      ? (s.attachmentsByTicket[ticketId] ?? ticket?.attachments ?? [])
      : (ticket?.attachments ?? [])
  )
  const [uploaderApi, setUploaderApi] = useState<{ open: () => void } | null>(null)
  const [preview, setPreview] = useState<{ url: string; mime: string; name: string } | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [batchTempIds, setBatchTempIds] = useState<string[]>([])

  // Synchroniser la progression depuis le hook vers le store
  useEffect(() => {
    if (!ticketId) return
    Object.entries(progressMap).forEach(([tid, p]) => {
      updateAttachmentProgress(ticketId, tid, p)
    })
  }, [progressMap, ticketId, updateAttachmentProgress])

  useEffect(() => {
    if (!users.length) fetchUsers()
  }, [users.length, fetchUsers])

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
        <button 
          className="btn-outline"
          onClick={() => setIsEditModalOpen(true)}
        >
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
              <div className="mb-4">
                <FileUploader
                  onReady={(api) => setUploaderApi(api)}
                  onFilesSelected={async (files) => {
                    if (!ticketId) return
                    setBatchTempIds([])
                    const items = await upload(files, ticketId, {
                      onStart: ({ tempId, file, dataUrl }) => {
                        setBatchTempIds((prev) => [...prev, tempId])
                        addTempAttachment(ticketId, { tempId, name: file.name, size: file.size, type: file.type, dataUrl: dataUrl })
                      }
                    })
                    if (items.length) {
                      // finaliser ceux qui ont réussi
                      items.forEach((it) => finalizeTempAttachment(ticketId, it.tempId))
                      addNotification(`${items.length} fichier(s) ajouté(s)`, 'success')
                    }
                    // erreurs éventuelles
                    Object.entries(errorMap).forEach(([tid, msg]) => {
                      if (batchTempIds.includes(tid)) {
                        failTempAttachment(ticketId, tid, msg)
                        addNotification(msg, 'error')
                      }
                    })
                    clearState()
                  }}
                />
              </div>

              {attachments?.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((attachment: any) => {
                    const isData = typeof attachment.file_path === 'string' && attachment.file_path.startsWith('data:')
                    const showImg = isData && isPreviewableImage(attachment.mime_type)
                    const showPdf = isData && isPreviewablePdf(attachment.mime_type)
                    return (
                      <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                            <button
                              className="w-full h-full flex items-center justify-center"
                              onClick={() => {
                                if (isData && (showImg || showPdf)) {
                                  setPreview({ url: attachment.file_path, mime: attachment.mime_type, name: attachment.filename })
                                }
                              }}
                              title="Aperçu"
                            >
                              {showImg ? (
                                <img src={attachment.file_path} alt={attachment.filename} className="w-16 h-16 object-cover" />
                              ) : showPdf ? (
                                <FileText className="h-6 w-6 text-red-600" />
                              ) : (
                                <Paperclip className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                            <p className="text-xs text-gray-500">
                              {(attachment.file_size / 1024).toFixed(1)} KB
                            </p>
                            {attachment.isUploading && (
                              <div className="mt-2 h-2 w-40 bg-gray-200 rounded">
                                <div
                                  className="h-2 bg-blue-500 rounded"
                                  style={{ width: `${attachment.progress ?? 0}%` }}
                                />
                              </div>
                            )}
                            {attachment.error && (
                              <p className="text-xs text-red-600 mt-1">{attachment.error}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            className="text-sm text-red-600 hover:text-red-700"
                            onClick={() => {
                              if (!ticketId) return
                              removeAttachment(ticketId, attachment.id)
                              addNotification('Pièce jointe supprimée', 'info')
                            }}
                          >
                            Supprimer
                          </button>
                          {isData && (
                            <a
                              className="text-sm text-primary-600 hover:text-primary-700"
                              href={attachment.file_path}
                              download={attachment.filename}
                            >
                              Télécharger
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
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
                <div className="mt-2">
                  <AssigneeBadge user={ticket.creator} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Assigné à</label>
                <div className="mt-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 group"
                    onClick={() => setShowAssignModal(true)}
                    title="Changer l'assignation"
                  >
                    <AssigneeBadge user={ticket.assignee} />
                    <span className="text-xs text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Modifier
                    </span>
                  </button>
                </div>
              </div>

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
              <div className="space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="input w-full text-sm"
                  placeholder="Ajouter un commentaire..."
                  rows={3}
                />
                <button 
                  className="btn-outline w-full"
                  onClick={async () => {
                    if (newComment.trim()) {
                      addNotification('Commentaire ajouté (mode démo)', 'info')
                      setNewComment('')
                    }
                  }}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </button>
              </div>
              <button className="btn-outline w-full" onClick={() => uploaderApi?.open()}>
                <Paperclip className="h-4 w-4 mr-2" />
                Joindre un fichier
              </button>
              <button className="btn-outline w-full" onClick={() => setShowAssignModal(true)}>
                Assigner à quelqu'un
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditTicketModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        ticket={ticket || null}
      />

      <Modal
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.name || 'Aperçu'}
        size="xl"
      >
        {preview && (
          <div className="max-h-[75vh] overflow-auto">
            {isPreviewableImage(preview.mime) ? (
              <img src={preview.url} alt={preview.name} className="max-h-[70vh] w-auto mx-auto" />
            ) : isPreviewablePdf(preview.mime) ? (
              <iframe title={preview.name} src={preview.url} className="w-full h-[70vh]" />
            ) : (
              <div className="text-sm text-gray-600">Aucun aperçu disponible</div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assigner le ticket"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Assigné actuel</span>
            <AssigneeBadge user={ticket.assignee} />
          </div>
          <UserSelector
            value={ticket.assignee_id ?? null}
            onChange={async (userId) => {
              if (!ticketId) return
              try {
                const updated = await ticketService.assignTicket(ticketId, userId ?? users[0]?.id ?? 1)
                setTicketAssignee(ticketId, { userId: updated.assignee_id ?? null, user: updated.assignee })
                // Mettre à jour le cache React Query pour refléter immédiatement l'assigné
                queryClient.setQueryData(['ticket', id], (old: any) => ({ ...(old || {}), assignee_id: updated.assignee_id, assignee: updated.assignee, updated_at: updated.updated_at }))
                addNotification('Assignation mise à jour', 'success')
                setShowAssignModal(false)
              } catch (e) {
                addNotification("Erreur d'assignation", 'error')
              }
            }}
          />
        </div>
      </Modal>
    </div>
  )
}

