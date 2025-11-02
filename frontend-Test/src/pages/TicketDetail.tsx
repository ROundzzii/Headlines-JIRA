import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  MessageSquare,
  Paperclip,
} from 'lucide-react'
import { ticketService } from '../services/ticketService'
import EditTicketModal from '../components/EditTicketModal'
import { useNotificationStore } from '../stores/notificationStore'
import { useTicketStore, useCommentStore, useUserStore } from '../stores/dataStore'
import FileUploader from '../components/FileUploader'
import { isPreviewableImage, isPreviewablePdf } from '../utils/mime'
import { useUpload } from '../hooks/useUpload'
import Modal from '../components/Modal'
import UserSelector from '../components/UserSelector'
import AssigneeBadge from '../components/AssigneeBadge'
import CommentEditor, { CommentEditorSubmitPayload } from '../components/CommentEditor'
import CommentItem from '../components/CommentItem'
import { useAuthStore } from '../stores/authStore'
import { Attachment, Comment } from '../types'
import AttachmentItem, { AttachmentDisplay } from '../components/AttachmentItem'

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const { addNotification } = useNotificationStore()

  const { data: ticket, isLoading } = useQuery(['ticket', id], async () => {
    if (!id) throw new Error('Ticket ID is required')
    return await ticketService.getTicket(parseInt(id))
  })
  const queryClient = useQueryClient()

  const ticketId = useMemo(() => (ticket ? ticket.id : id ? parseInt(id) : undefined), [ticket, id])
  const currentUser = useAuthStore(state => state.user)
  const comments = useCommentStore(state => (ticketId ? state.commentsByTicket[ticketId] ?? [] : []))
  const addCommentToStore = useCommentStore(state => state.addComment)
  const updateCommentInStore = useCommentStore(state => state.updateComment)
  const deleteCommentFromStore = useCommentStore(state => state.deleteComment)
  const addCommentAttachments = useCommentStore(state => state.addCommentAttachments)
  const removeCommentAttachment = useCommentStore(state => state.removeCommentAttachment)
  const setCommentFlags = useCommentStore(state => state.setCommentFlags)
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
  const [preview, setPreview] = useState<AttachmentDisplay | null>(null)
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

  useEffect(() => {
    if (ticket) {
      useCommentStore.getState().hydrateFromTickets([ticket])
    }
  }, [ticket])

  const handlePreviewAttachment = useCallback((attachment: AttachmentDisplay) => {
    if (!attachment.previewUrl && !attachment.url) return
    setPreview(attachment)
  }, [])

  const handleStartEdit = useCallback((comment: Comment) => {
    if (!ticketId || (currentUser && comment.author_id !== currentUser.id)) return
    setEditingCommentId(comment.id)
    setCommentFlags(ticketId, comment.id, { is_editing: true, error: undefined })
  }, [ticketId, currentUser, setCommentFlags])

  const handleCancelEdit = useCallback((commentId: number) => {
    if (!ticketId) return
    setEditingCommentId(prev => (prev === commentId ? null : prev))
    setCommentFlags(ticketId, commentId, { is_editing: false, error: undefined })
  }, [ticketId, setCommentFlags])

  const handleCreateComment = useCallback(async (payload: CommentEditorSubmitPayload) => {
    if (!ticketId) return
    if (!currentUser) {
      addNotification('Vous devez être connecté pour ajouter un commentaire.', 'warning')
      return
    }

    addCommentToStore({
      ticketId,
      author: currentUser,
      content: payload.content,
      attachments: payload.attachmentsToAdd,
      mentions: payload.mentions,
    })

    queryClient.setQueryData(['ticket', id], (old: any) =>
      old ? { ...old, comments: useCommentStore.getState().commentsByTicket[ticketId] } : old
    )

    addNotification('Commentaire ajouté', 'success')
  }, [ticketId, currentUser, addCommentToStore, addNotification, queryClient, id])

  const handleUpdateComment = useCallback(async (commentId: number, payload: CommentEditorSubmitPayload) => {
    if (!ticketId) return

    setCommentFlags(ticketId, commentId, { is_saving: true })

    if (payload.attachmentsToRemove.length) {
      payload.attachmentsToRemove.forEach(attachmentId => {
        removeCommentAttachment(ticketId, commentId, attachmentId)
      })
    }

    if (payload.attachmentsToAdd.length) {
      addCommentAttachments(ticketId, commentId, payload.attachmentsToAdd)
    }

    updateCommentInStore({
      ticketId,
      commentId,
      content: payload.content,
      mentions: payload.mentions,
    })

    setCommentFlags(ticketId, commentId, { is_saving: false, is_editing: false })
    setEditingCommentId(null)

    queryClient.setQueryData(['ticket', id], (old: any) =>
      old ? { ...old, comments: useCommentStore.getState().commentsByTicket[ticketId] } : old
    )

    addNotification('Commentaire mis à jour', 'success')
  }, [ticketId, updateCommentInStore, addCommentAttachments, removeCommentAttachment, setCommentFlags, queryClient, id, addNotification])

  const handleDeleteComment = useCallback((comment: Comment) => {
    if (!ticketId) return
    if (currentUser && comment.author_id !== currentUser.id) return
    const confirmed = window.confirm('Supprimer ce commentaire ?')
    if (!confirmed) return

    setCommentFlags(ticketId, comment.id, { is_deleting: true })
    deleteCommentFromStore(ticketId, comment.id)
    setEditingCommentId(prev => (prev === comment.id ? null : prev))

    queryClient.setQueryData(['ticket', id], (old: any) =>
      old ? { ...old, comments: useCommentStore.getState().commentsByTicket[ticketId] } : old
    )

    addNotification('Commentaire supprimé', 'info')
  }, [ticketId, currentUser, setCommentFlags, deleteCommentFromStore, queryClient, id, addNotification])

  const handleQuoteComment = useCallback((comment: Comment) => {
    const firstLine = comment.content.split('\n')[0]
    const quotedText = `> @${comment.author.username} a écrit :\n> ${firstLine}\n> \n`
    
    // Stocker le texte de citation pour qu'il soit inséré dans l'éditeur
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('quote-comment', quotedText)
    }
    
    // Scroller vers l'éditeur de commentaire
    setTimeout(() => {
      const editor = document.querySelector('[data-comment-editor]') as HTMLElement
      if (editor) {
        editor.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const textarea = editor.querySelector('textarea') as HTMLTextAreaElement
        if (textarea) {
          textarea.focus()
        }
      }
    }, 150)
  }, [])

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
              <p className="text-sm text-gray-500">Suivez les échanges et mentionnez vos coéquipiers avec @nom.</p>
            </div>
            <div className="card-content space-y-4">
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map(comment => (
                    editingCommentId === comment.id ? (
                      <CommentEditor
                        key={comment.id}
                        mode="edit"
                        initialValue={comment.content}
                        initialAttachments={comment.attachments}
                        onSubmit={(payload) => handleUpdateComment(comment.id, payload)}
                        onCancel={() => handleCancelEdit(comment.id)}
                        isSubmitting={Boolean(comment.is_saving)}
                        className="border border-blue-200 dark:border-blue-700"
                        currentUserId={currentUser?.id ?? comment.author_id}
                        ticketId={ticketId}
                      />
                    ) : (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        currentUserId={currentUser?.id}
                        onEdit={handleStartEdit}
                        onDelete={handleDeleteComment}
                        onPreview={handlePreviewAttachment}
                        onQuote={handleQuoteComment}
                      />
                    )
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Aucun commentaire pour l’instant.</p>
                </div>
              )}

              <CommentEditor
                mode="create"
                onSubmit={handleCreateComment}
                placeholder="Ajouter un commentaire (Markdown, @mentions, pièces jointes)…"
                isSubmitting={false}
                autoFocus={comments.length === 0}
                currentUserId={currentUser?.id ?? undefined}
                ticketId={ticketId}
              />
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
                  {attachments.map((attachment: any) => (
                    <AttachmentItem
                      key={attachment.id ?? attachment.tempId ?? attachment.filename}
                      source="ticket"
                      attachment={attachment}
                      onPreview={handlePreviewAttachment}
                      onRemove={({ original }) => {
                        if (!ticketId) return
                        const attachmentId = (original as Attachment).id
                        removeAttachment(ticketId, attachmentId)
                        addNotification('Pièce jointe supprimée', 'info')
                      }}
                    />
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
        title={preview?.filename || 'Aperçu'}
        size="xl"
      >
        {preview && (
          <div className="max-h-[75vh] overflow-auto">
            {isPreviewableImage(preview.mimeType) ? (
              <img
                src={preview.previewUrl || preview.url}
                alt={preview.filename}
                className="max-h-[70vh] w-auto mx-auto"
              />
            ) : isPreviewablePdf(preview.mimeType) ? (
              <iframe
                title={preview.filename}
                src={preview.previewUrl || preview.url}
                className="w-full h-[70vh]"
              />
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

