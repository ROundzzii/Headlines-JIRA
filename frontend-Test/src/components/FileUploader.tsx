import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_ALLOWED_MIME_TYPES, DEFAULT_MAX_FILE_SIZE_BYTES, validateFile } from '../utils/fileValidation'

type FileUploaderProps = {
  onFilesSelected: (files: File[]) => void
  multiple?: boolean
  disabled?: boolean
  maxBytes?: number
  allowedMimeTypes?: readonly string[]
  className?: string
  onReady?: (api: { open: () => void }) => void
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  multiple = true,
  disabled = false,
  maxBytes = DEFAULT_MAX_FILE_SIZE_BYTES,
  allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES,
  className = '',
  onReady,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || disabled) return
      const files = Array.from(fileList)
      const ok: File[] = []
      const errs: string[] = []
      files.forEach((f) => {
        const res = validateFile(f, { maxBytes, allowedMimeTypes })
        if (res.ok) ok.push(f)
        else if (res.error) errs.push(`${f.name}: ${res.error}`)
      })
      setErrors(errs)
      if (ok.length) onFilesSelected(ok)
    },
    [allowedMimeTypes, disabled, maxBytes, onFilesSelected]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (disabled) return
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [disabled, handleFiles]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const onDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const onClick = useCallback(() => {
    if (disabled) return
    inputRef.current?.click()
  }, [disabled])

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // reset pour permettre de resélectionner les mêmes fichiers
    e.currentTarget.value = ''
  }, [handleFiles])

  const onReadyRef = useRef(onReady)
  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    if (!onReadyRef.current) return
    const api = { open: () => { if (!disabled) inputRef.current?.click() } }
    onReadyRef.current(api)
  }, [disabled])

  return (
    <div className={className}>
      <div
        className={[
          'border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors',
          disabled ? 'opacity-60 cursor-not-allowed' : '',
          isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600',
        ].join(' ')}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={onClick}
        role="button"
        aria-disabled={disabled}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }}
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Glissez-déposez des fichiers ici, ou cliquez pour sélectionner
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Types autorisés: {allowedMimeTypes.join(', ')} — Taille max: {(maxBytes / (1024 * 1024)).toFixed(0)} Mo
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          onChange={onChange}
          accept={allowedMimeTypes.join(',')}
          aria-hidden
        />
      </div>

      {errors.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-red-600 dark:text-red-400">
          {errors.map((er, i) => (
            <li key={i}>{er}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FileUploader


