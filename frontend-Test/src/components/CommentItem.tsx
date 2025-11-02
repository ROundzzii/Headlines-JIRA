import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Comment } from '../types'
import { markdownToHtml } from '../utils/markdown'
import UserAvatar from './UserAvatar'
import { Edit, Trash2, Loader2, Reply } from 'lucide-react'
import AttachmentItem, { AttachmentDisplay } from './AttachmentItem'

type CommentItemProps = {
  comment: Comment
  currentUserId?: number
  onEdit?: (comment: Comment) => void
  onDelete?: (comment: Comment) => void
  onPreview?: (attachment: AttachmentDisplay) => void
  onQuote?: (comment: Comment) => void
}

const formatTimestamp = (value?: string) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return formatDistanceToNow(date, { addSuffix: true, locale: fr })
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  onPreview,
  onQuote,
}) => {
  const createdLabel = formatTimestamp(comment.created_at)
  const updatedLabel = comment.updated_at ? formatTimestamp(comment.updated_at) : null
  const isOwnComment = currentUserId ? comment.author_id === currentUserId : false
  const showActions = (isOwnComment || currentUserId === undefined) && (!!onEdit || !!onDelete || !!onQuote)
  const attachments = comment.attachments ?? []

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar user={comment.author} size={36} />
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {comment.author.full_name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {createdLabel && <span>{createdLabel}</span>}
              {updatedLabel && updatedLabel !== createdLabel && (
                <span className="ml-2 italic">· Modifié {updatedLabel}</span>
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2 text-sm">
            {comment.is_saving && (
              <span className="flex items-center gap-1 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
              </span>
            )}
            {comment.is_deleting && (
              <span className="flex items-center gap-1 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Suppression…
              </span>
            )}
            {!comment.is_deleting && !comment.is_saving && onQuote && (
              <button
                type="button"
                className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => onQuote(comment)}
              >
                <span className="flex items-center gap-1"><Reply className="h-3.5 w-3.5" /> Citer</span>
              </button>
            )}
            {!comment.is_deleting && onEdit && (
              <button
                type="button"
                className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => onEdit(comment)}
              >
                <span className="flex items-center gap-1"><Edit className="h-3.5 w-3.5" /> Modifier</span>
              </button>
            )}
            {!comment.is_saving && onDelete && (
              <button
                type="button"
                className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-900/30"
                onClick={() => onDelete(comment)}
              >
                <span className="flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" /> Supprimer</span>
              </button>
            )}
          </div>
        )}
      </header>

      <div className="comment-content prose prose-sm mt-3 max-w-none text-gray-800 dark:prose-invert dark:text-gray-200">
        {comment.content ? (
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(comment.content) }} />
        ) : (
          <div className="italic text-gray-500 dark:text-gray-400">(contenu vide)</div>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          {attachments.map(att => (
            <AttachmentItem
              key={att.id || att.tempId || att.filename}
              source="comment"
              attachment={att}
              onPreview={onPreview}
            />
          ))}
        </div>
      )}

      {comment.error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200">
          {comment.error}
        </div>
      )}
    </article>
  )
}

export default CommentItem

