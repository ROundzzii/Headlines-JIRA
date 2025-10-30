import React, { useEffect, useMemo, useState } from 'react'
import { formatBytes } from '../utils/fileValidation'
import { getGenericIconName, isPreviewableImage, isPreviewablePdf } from '../utils/mime'

type FilePreviewProps = {
  file: File
  onRemove?: () => void
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  const mime = file.type || 'application/octet-stream'
  const icon = useMemo(() => getGenericIconName(mime), [mime])
  const isImg = isPreviewableImage(mime)
  const isPdf = isPreviewablePdf(mime)

  useEffect(() => {
    if (isImg || isPdf) {
      const url = URL.createObjectURL(file)
      setObjectUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    return
  }, [file, isImg, isPdf])

  return (
    <div className="flex items-center gap-3 border rounded-md p-2">
      <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
        {isImg && objectUrl ? (
          <img src={objectUrl} alt={file.name} className="w-16 h-16 object-cover rounded" />
        ) : isPdf && objectUrl ? (
          <iframe title={file.name} src={objectUrl} className="w-16 h-16 rounded" />
        ) : (
          <span className="text-xs capitalize">{icon}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" title={file.name}>{file.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {mime || 'inconnu'} · {formatBytes(file.size)}
        </div>
      </div>
      {onRemove && (
        <button type="button" onClick={onRemove} className="text-sm text-red-600 hover:underline">
          Supprimer
        </button>
      )}
    </div>
  )
}

export default FilePreview


