import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { Bold, Code, Eye, EyeOff, FileText, Italic, Link as LinkIcon, List as ListIcon, ListOrdered, Quote, Send, Type, Image as ImageIcon } from 'lucide-react'
import { CommentAttachment, User } from '../types'
import {
  CommentAttachmentInput,
  useUserStore,
} from '../stores/dataStore'
import { useNotificationStore } from '../stores/notificationStore'
import {
  DEFAULT_ALLOWED_MIME_TYPES,
  DEFAULT_MAX_FILE_SIZE_BYTES,
} from '../utils/fileValidation'
import { extractMentions, markdownToHtml } from '../utils/markdown'
import FileUploader from './FileUploader'
import AttachmentItem, { AttachmentDisplay } from './AttachmentItem'
import { useUpload } from '../hooks/useUpload'
import MentionSelector from './MentionSelector'
import { useActiveFormats } from '../hooks/useCommentFormats'
import { useCommentDraft } from '../hooks/useCommentDraft'
import { useCommentKeyboard } from '../hooks/useCommentKeyboard'

const generateLocalId = () => `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`

export interface CommentEditorSubmitPayload {
  content: string
  mentions: number[]
  attachmentsToAdd: CommentAttachmentInput[]
  attachmentsToRemove: string[]
}

type CommentEditorProps = {
  mode?: 'create' | 'edit'
  initialValue?: string
  initialAttachments?: CommentAttachment[]
  onSubmit: (payload: CommentEditorSubmitPayload) => Promise<void> | void
  onCancel?: () => void
  isSubmitting?: boolean
  placeholder?: string
  submitLabel?: string
  cancelLabel?: string
  maxFiles?: number
  allowedMimeTypes?: readonly string[]
  maxBytes?: number
  className?: string
  autoFocus?: boolean
  currentUserId?: number
  ticketId?: number
}

const normalizeInitialAttachments = (attachments?: CommentAttachment[]): CommentAttachment[] =>
  (attachments ?? []).map(att => {
    const dataSource = att.data && att.data.startsWith('data:')
      ? att.data
      : att.file_path && att.file_path.startsWith('data:')
        ? att.file_path
        : att.preview_url ?? att.data ?? ''

    return {
      ...att,
      id: att.id || att.tempId || generateLocalId(),
      data: dataSource || att.data,
      file_path: att.file_path ?? dataSource ?? att.data,
      preview_url: att.preview_url ?? dataSource ?? att.data,
      isNew: Boolean(att.isNew),
      isUploading: Boolean(att.isUploading),
      progress: att.progress,
      error: att.error,
    }
  })

const buildAttachmentInput = (attachment: CommentAttachment): CommentAttachmentInput => ({
  filename: attachment.filename,
  mime_type: attachment.mime_type || 'application/octet-stream',
  size: attachment.size,
  data: attachment.data || attachment.file_path || attachment.preview_url || '',
  preview_url: attachment.preview_url || attachment.file_path,
  uploaded_at: attachment.uploaded_at,
  uploaded_by: attachment.uploaded_by,
})

export const CommentEditor: React.FC<CommentEditorProps> = ({
  mode = 'create',
  initialValue = '',
  initialAttachments = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  placeholder = 'Rédiger un commentaire (Markdown supporté)…',
  submitLabel,
  cancelLabel = 'Annuler',
  maxFiles = 5,
  allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES,
  maxBytes = DEFAULT_MAX_FILE_SIZE_BYTES,
  className = '',
  autoFocus = false,
  currentUserId,
  ticketId,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const uploaderApiRef = useRef<{ open: () => void } | null>(null)
  const [content, setContent] = useState(initialValue)
  const [attachments, setAttachments] = useState<CommentAttachment[]>(() => normalizeInitialAttachments(initialAttachments))
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<string | null>(null)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionVisible, setMentionVisible] = useState(false)
  const [mentionStart, setMentionStart] = useState<number | null>(null)
  const [showPreview, setShowPreview] = useState(mode === 'edit')
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const { upload, progressMap, errorMap, cancelUpload, clearState } = useUpload({ simulateFailureRate: 0 })
  const prevInitialAttachmentsRef = useRef<string>('')

  const { users, fetchUsers } = useUserStore()
  const { addNotification } = useNotificationStore()
  const MAX_COMMENT_LENGTH = 5000

  const { hasDraft, loadDraft: loadDraftFromHook, clearDraft } = useCommentDraft(mode, ticketId, initialValue, content)

  const loadDraft = useCallback(() => {
    const draft = loadDraftFromHook()
    if (draft) {
      setContent(draft)
      addNotification('Brouillon récupéré', 'success')
      requestAnimationFrame(() => {
        textareaRef.current?.focus()
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(draft.length, draft.length)
        }
      })
    }
  }, [loadDraftFromHook, addNotification])

  useEffect(() => {
    setContent(initialValue)
  }, [initialValue])

  useEffect(() => {
    const attachmentsKey = JSON.stringify(initialAttachments.map(a => a.id || a.tempId || a.filename))
    if (attachmentsKey !== prevInitialAttachmentsRef.current) {
      prevInitialAttachmentsRef.current = attachmentsKey
      setAttachments(normalizeInitialAttachments(initialAttachments))
      setRemovedAttachmentIds(new Set())
    }
  }, [initialAttachments])

  useEffect(() => {
    if (!Object.keys(progressMap).length && !Object.keys(errorMap).length) return
    setAttachments(prev =>
      prev.map(att => {
        if (!att.tempId) return att
        const progress = progressMap[att.tempId]
        const error = errorMap[att.tempId]
        if (progress === undefined && !error) return att
        return {
          ...att,
          progress: progress !== undefined ? progress : att.progress,
          isUploading: progress !== undefined ? progress < 100 : att.isUploading,
          error: error ?? att.error,
        }
      })
    )
  }, [progressMap, errorMap])

  useEffect(() => {
    const hasPending = attachments.some(att => att.isUploading)
    if (!hasPending && (Object.keys(progressMap).length || Object.keys(errorMap).length)) {
      clearState()
    }
  }, [attachments, progressMap, errorMap, clearState])

  useEffect(() => {
    if (mentionVisible && !users.length) {
      fetchUsers()
    }
  }, [mentionVisible, users.length, fetchUsers])

  // Auto-save brouillon en mode création et vérification des citations
  useEffect(() => {
    if (mode !== 'create' || !ticketId) return

    // Vérifier si une citation est en attente
    if (typeof window !== 'undefined') {
      const quoteText = sessionStorage.getItem('quote-comment')
      if (quoteText) {
        sessionStorage.removeItem('quote-comment')
        setContent(prev => prev ? `${quoteText}${prev}` : quoteText)
        requestAnimationFrame(() => {
          textareaRef.current?.focus()
          if (textareaRef.current) {
            const newPosition = quoteText.length
            textareaRef.current.setSelectionRange(newPosition, newPosition)
          }
        })
        return
      }
    }

    // Le chargement initial du brouillon est géré par useCommentDraft dans un useEffect séparé
    const savedDraft = loadDraftFromHook()
    if (savedDraft && !initialValue) {
      setContent(savedDraft)
    }

    // Vérifier périodiquement s'il y a une nouvelle citation
    const checkQuoteInterval = setInterval(() => {
      if (typeof window !== 'undefined' && mode === 'create' && ticketId) {
        const quoteText = sessionStorage.getItem('quote-comment')
        if (quoteText) {
          sessionStorage.removeItem('quote-comment')
          setContent(prev => prev ? `${quoteText}${prev}` : quoteText)
          requestAnimationFrame(() => {
            textareaRef.current?.focus()
            if (textareaRef.current) {
              const newPosition = quoteText.length
              textareaRef.current.setSelectionRange(newPosition, newPosition)
            }
          })
        }
      }
    }, 200) // Vérifier toutes les 200ms

    return () => {
      clearInterval(checkQuoteInterval)
    }
  }, [mode, ticketId, initialValue, loadDraftFromHook])

  // Auto-save est géré par useCommentDraft

  const mentionUsersByUsername = useMemo(() => {
    const map = new Map<string, User>()
    users.forEach(user => {
      map.set(user.username.toLowerCase(), user)
    })
    return map
  }, [users])

  const hasUploadingAttachments = useMemo(
    () => attachments.some(att => att.isUploading),
    [attachments]
  )

  const activeFormats = useActiveFormats(textareaRef, content, selectionStart, selectionEnd)

  const updateMentionState = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    const { selectionStart } = textarea
    const textUntilCursor = textarea.value.slice(0, selectionStart)
    const match = textUntilCursor.match(/@([a-zA-Z0-9._-]*)$/)

    if (match) {
      setMentionQuery(match[1])
      setMentionVisible(true)
      setMentionStart(selectionStart - match[0].length)
    } else {
      setMentionVisible(false)
      setMentionQuery('')
      setMentionStart(null)
    }
  }, [])

  const { handleKeyDown, wrapSelection, applyListFormat, applyOrderedListFormat } = useCommentKeyboard({
    textareaRef,
    setContent,
    updateMentionState,
    setSelectionStart,
    setSelectionEnd
  })

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
  }

  const handleSelectionChange = () => {
    const textarea = textareaRef.current
    if (textarea) {
      setSelectionStart(textarea.selectionStart)
      setSelectionEnd(textarea.selectionEnd)
    }
    updateMentionState()
  }

  const togglePreview = () => {
    setShowPreview(value => !value)
  }

  const handleMentionSelect = (user: User) => {
    const textarea = textareaRef.current
    if (!textarea || mentionStart === null) return

    const before = content.slice(0, mentionStart)
    const after = content.slice(textarea.selectionStart)
    const insertion = `@${user.username} `
    const nextValue = `${before}${insertion}${after}`

    setContent(nextValue)
    setMentionVisible(false)
    setMentionQuery('')
    setMentionStart(null)

    requestAnimationFrame(() => {
      const position = before.length + insertion.length
      textarea.focus()
      textarea.setSelectionRange(position, position)
    })
  }

  const handleOpenFileDialog = () => {
    uploaderApiRef.current?.open()
  }

  const handleFilesSelected = async (files: File[]) => {
    if (!files.length) return

    const activeCount = attachments.filter(att => !removedAttachmentIds.has(String(att.id))).length
    if (activeCount + files.length > maxFiles) {
      setErrors(`Nombre maximal de fichiers atteint (${maxFiles}).`)
      return
    }

    setErrors(null)

    const results = await upload(files, undefined, {
      onStart: ({ tempId, file, dataUrl }) => {
        const now = new Date().toISOString()
        setAttachments(prev => [
          ...prev,
          {
            id: tempId,
            tempId,
            filename: file.name,
            mime_type: file.type || 'application/octet-stream',
            size: file.size,
            data: dataUrl ?? '',
            file_path: dataUrl ?? '',
            preview_url: dataUrl ?? '',
            uploaded_by: currentUserId ?? 0,
            uploaded_at: now,
            isUploading: true,
            progress: 0,
            error: undefined,
            isNew: true,
          } as CommentAttachment,
        ])
      },
    })

    setAttachments(prev =>
      prev.map(att => {
        if (!att.tempId) return att
        const match = results.find(item => item.tempId === att.tempId)
        if (!match) return att
        const dataUrl = match.dataUrl ?? att.data
        return {
          ...att,
          data: dataUrl ?? att.data,
          file_path: dataUrl ?? att.file_path,
          preview_url: dataUrl ?? att.preview_url,
          isUploading: false,
          progress: 100,
          error: undefined,
          isNew: true,
        }
      })
    )
  }

  const handleRemoveAttachment = (attachmentDisplay: AttachmentDisplay) => {
    const original = attachmentDisplay.original as CommentAttachment
    const identifier = original.id || original.tempId || attachmentDisplay.id

    setAttachments(prev =>
      prev.filter(att => (att.id || att.tempId || att.filename) !== identifier)
    )

    if (!original.isNew && original.id) {
      setRemovedAttachmentIds(prev => {
        const next = new Set(prev)
        next.add(String(original.id))
        return next
      })
    }

    if (original.tempId) {
      cancelUpload(original.tempId)
    }
  }

  const resetEditor = () => {
    setContent('')
    setAttachments([])
    setRemovedAttachmentIds(new Set())
    setMentionVisible(false)
    setMentionQuery('')
    setMentionStart(null)
    setShowPreview(false)
    if (mode === 'create' && ticketId) {
      clearDraft()
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!content.trim()) {
      setErrors('Le commentaire ne peut pas être vide.')
      return
    }
    if (content.length > MAX_COMMENT_LENGTH) {
      setErrors(`Le commentaire ne peut pas dépasser ${MAX_COMMENT_LENGTH} caractères.`)
      return
    }

    const mentionNames = extractMentions(content)
    const mentionIds = Array.from(
      new Set(
        mentionNames
          .map(name => mentionUsersByUsername.get(name.toLowerCase())?.id)
          .filter((id): id is number => typeof id === 'number')
      )
    )

    const attachmentsToAdd = attachments
      .filter(att => att.isNew && !att.isUploading && !att.error && !removedAttachmentIds.has(String(att.id)))
      .map(buildAttachmentInput)

    const payload: CommentEditorSubmitPayload = {
      content: content.trim(),
      mentions: mentionIds,
      attachmentsToAdd,
      attachmentsToRemove: Array.from(removedAttachmentIds),
    }

    try {
      await onSubmit(payload)
      setErrors(null)
      if (mode === 'create') {
        resetEditor()
      }
    } catch (error) {
      setErrors(error instanceof Error ? error.message : 'Une erreur est survenue lors de l’enregistrement du commentaire.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={clsx('rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900', className)} data-comment-editor>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Type className="h-4 w-4" />
          {mode === 'create' ? 'Nouveau commentaire' : 'Modifier le commentaire'}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePreview}
            className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {showPreview ? (
              <span className="flex items-center gap-1"><EyeOff className="h-3 w-3" /> Masquer la prévisualisation</span>
            ) : (
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Prévisualiser</span>
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800" onClick={() => textareaRef.current?.focus()}>
        <div className="flex flex-wrap items-center gap-2 border-b border-dashed border-gray-200 pb-2 dark:border-gray-700">
          <button
            type="button"
            className={`rounded-md p-1.5 transition focus:outline-none focus:ring-2 focus:ring-blue-400/40 ${
              activeFormats.bold
                ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => wrapSelection('**', '**')}
            title="Gras (Ctrl+B)"
            disabled={isSubmitting}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`rounded-md p-1.5 transition focus:outline-none focus:ring-2 focus:ring-blue-400/40 ${
              activeFormats.italic
                ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => wrapSelection('*', '*')}
            title="Italique (Ctrl+I)"
            disabled={isSubmitting}
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`rounded-md p-1.5 transition focus:outline-none focus:ring-2 focus:ring-blue-400/40 ${
              activeFormats.code
                ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => wrapSelection('`', '`')}
            title="Code inline (Ctrl+Shift+X)"
            disabled={isSubmitting}
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`rounded-md p-1.5 transition focus:outline-none focus:ring-2 focus:ring-blue-400/40 ${
              activeFormats.list
                ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={applyListFormat}
            title="Liste à puces (Ctrl+Shift+8)"
            disabled={isSubmitting}
          >
            <ListIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`rounded-md p-1.5 transition focus:outline-none focus:ring-2 focus:ring-blue-400/40 ${
              activeFormats.orderedList
                ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={applyOrderedListFormat}
            title="Liste numérotée (Ctrl+Shift+7)"
            disabled={isSubmitting}
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400/40 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => wrapSelection('> ', '', 'citation')}
            title="Citation"
            disabled={isSubmitting}
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400/40 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => wrapSelection('[', `](https://)`)}
            title="Lien (Ctrl+K)"
            disabled={isSubmitting}
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          <div className="ml-auto flex items-center gap-2">
            {hasDraft && (
              <button
                type="button"
                onClick={loadDraft}
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                disabled={isSubmitting}
                title="Récupérer le brouillon"
              >
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> Brouillon
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenFileDialog}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              disabled={isSubmitting}
            >
              <span className="flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5" /> Joindre
              </span>
            </button>
          </div>
        </div>

        <div className="relative mt-2">
          <textarea
            ref={textareaRef}
            className={`h-32 w-full resize-none rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none focus:border-blue-400 focus:ring-0 ${
              isSubmitting
                ? 'opacity-60 cursor-not-allowed text-gray-500 dark:text-gray-400'
                : 'text-gray-800 dark:text-gray-100'
            }`}
            placeholder={placeholder}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onKeyUp={handleSelectionChange}
            onClick={handleSelectionChange}
            onFocus={handleSelectionChange}
            autoFocus={autoFocus}
            disabled={isSubmitting}
          />
          <MentionSelector
            query={mentionQuery}
            visible={mentionVisible}
            onSelect={handleMentionSelect}
            onClose={() => {
              setMentionVisible(false)
              setMentionQuery('')
            }}
          />
        </div>

        <div className="flex justify-end mt-1">
          <div className={`text-xs ${content.length > MAX_COMMENT_LENGTH ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {content.length} / {MAX_COMMENT_LENGTH}
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="comment-content prose prose-sm mt-3 rounded-md border border-gray-200 bg-white p-3 text-sm leading-relaxed dark:border-gray-700 dark:bg-gray-900 dark:prose-invert">
          {content.trim() ? (
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
          ) : (
            <div className="text-gray-400">Aucun contenu à prévisualiser pour le moment.</div>
          )}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          {attachments.map(att => (
            <AttachmentItem
              key={att.id || att.tempId || att.filename}
              source="comment"
              attachment={att}
              onRemove={handleRemoveAttachment}
            />
          ))}
        </div>
      )}

      <FileUploader
        onFilesSelected={handleFilesSelected}
        multiple
        disabled={isSubmitting}
        maxBytes={maxBytes}
        allowedMimeTypes={allowedMimeTypes}
        className="mt-3"
        onReady={api => {
          uploaderApiRef.current = api
        }}
      />

      {errors && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200">
          {errors.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            disabled={isSubmitting}
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          disabled={isSubmitting || hasUploadingAttachments || content.length > MAX_COMMENT_LENGTH}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
              En cours…
            </span>
          ) : hasUploadingAttachments ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
              Téléversement…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              {submitLabel ?? (mode === 'create' ? 'Publier' : 'Mettre à jour')}
            </span>
          )}
        </button>
      </div>
    </form>
  )
}

export default CommentEditor

