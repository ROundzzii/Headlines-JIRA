import React, { useMemo } from 'react'
import { Paperclip, FileText } from 'lucide-react'
import { Attachment, CommentAttachment } from '../types'
import { isPreviewableImage, isPreviewablePdf } from '../utils/mime'
import { formatBytes } from '../utils/fileValidation'

export type AttachmentSource = 'ticket' | 'comment'

export interface AttachmentDisplay {
  id: string
  tempId?: string
  filename: string
  mimeType: string
  size: number
  url?: string
  previewUrl?: string
  isUploading?: boolean
  progress?: number
  error?: string
  source: AttachmentSource
  original: Attachment | CommentAttachment
}

const toDataUrl = (value?: string, mimeType?: string) => {
  if (!value) return undefined
  if (value.startsWith('data:')) return value
  if (mimeType && value.startsWith('blob:')) return value
  if (mimeType && value.startsWith('http')) return value
  if (mimeType && value.startsWith('https')) return value
  return value
}

const normalize = (
  source: AttachmentSource,
  attachment: Attachment | CommentAttachment
): AttachmentDisplay => {
  if (source === 'ticket') {
    const ticketAttachment = attachment as Attachment
    const url = ticketAttachment.file_path ? String(ticketAttachment.file_path) : undefined
    return {
      id: String(ticketAttachment.id ?? ticketAttachment.tempId ?? ticketAttachment.filename),
      tempId: ticketAttachment.tempId,
      filename: ticketAttachment.filename,
      mimeType: ticketAttachment.mime_type,
      size: ticketAttachment.file_size,
      url,
      previewUrl: url,
      isUploading: ticketAttachment.isUploading,
      progress: ticketAttachment.progress,
      error: ticketAttachment.error,
      source,
      original: attachment,
    }
  }

  const commentAttachment = attachment as CommentAttachment
  const url = toDataUrl(
    commentAttachment.file_path || commentAttachment.preview_url || commentAttachment.data,
    commentAttachment.mime_type
  )

  return {
    id: commentAttachment.id || commentAttachment.tempId || commentAttachment.filename,
    tempId: commentAttachment.tempId,
    filename: commentAttachment.filename,
    mimeType: commentAttachment.mime_type,
    size: commentAttachment.size,
    url,
    previewUrl: commentAttachment.preview_url || url,
    isUploading: commentAttachment.isUploading,
    progress: commentAttachment.progress,
    error: commentAttachment.error,
    source,
    original: attachment,
  }
}

export type AttachmentItemProps = {
  source: AttachmentSource
  attachment: Attachment | CommentAttachment
  onPreview?: (attachment: AttachmentDisplay) => void
  onRemove?: (attachment: AttachmentDisplay) => void
  className?: string
}

export const AttachmentItem: React.FC<AttachmentItemProps> = ({
  source,
  attachment,
  onPreview,
  onRemove,
  className = '',
}) => {
  const normalized = useMemo(() => normalize(source, attachment), [source, attachment])

  const { filename, mimeType, size, url, previewUrl, isUploading, progress, error } = normalized

  const isImage = mimeType ? isPreviewableImage(mimeType) : false
  const isPdf = mimeType ? isPreviewablePdf(mimeType) : false

  const handlePreview = () => {
    if (!url) return
    onPreview?.(normalized)
  }

  const handleRemove = () => {
    onRemove?.(normalized)
  }

  const downloadUrl = url ?? previewUrl

  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900/60 ${className}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePreview}
          className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-100 transition hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800"
          disabled={!url}
        >
          {isImage && previewUrl ? (
            <img src={previewUrl} alt={filename} className="h-full w-full object-cover" />
          ) : isPdf ? (
            <FileText className="h-6 w-6 text-red-500" />
          ) : (
            <Paperclip className="h-5 w-5 text-gray-500" />
          )}
        </button>
        <div className="min-w-[12rem] flex-1">
          <div className="truncate font-medium text-gray-900 dark:text-gray-100" title={filename}>
            {filename}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {mimeType || 'application/octet-stream'} · {formatBytes(size)}
          </div>
          {isUploading && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${Math.max(0, Math.min(100, progress ?? 0))}%` }}
              />
            </div>
          )}
          {error && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm font-medium text-red-600 transition hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Supprimer
          </button>
        )}
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={filename}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Télécharger
          </a>
        )}
      </div>
    </div>
  )
}

export default AttachmentItem


