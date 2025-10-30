import { useCallback, useMemo, useRef, useState } from 'react'
import { DEFAULT_ALLOWED_MIME_TYPES, DEFAULT_MAX_FILE_SIZE_BYTES, validateFile } from '../utils/fileValidation'

export type UploadItem = {
  tempId: string
  name: string
  size: number
  type: string
  lastModified: number
  ticketId?: number
  dataUrl?: string // optionnel pour preview/persistance locale
}

type UseUploadOptions = {
  simulateFailureRate?: number // 0..1 (ex: 0.05 => 5%)
  allowedMimeTypes?: readonly string[]
  maxBytes?: number
}

export function useUpload(options: UseUploadOptions = {}) {
  const simulateFailureRate = options.simulateFailureRate ?? 0.05
  const allowedMimeTypes = options.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES

  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  const [errorMap, setErrorMap] = useState<Record<string, string>>({})
  const controllers = useRef<Record<string, { cancel: () => void }>>({})

  const toDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
      reader.readAsDataURL(file)
    })

  const upload = useCallback(
    async (files: File[], ticketId?: number): Promise<UploadItem[]> => {
      const results: UploadItem[] = []
      await Promise.all(
        files.map(async (file, idx) => {
          const v = validateFile(file, { allowedMimeTypes, maxBytes })
          const tempId = `${Date.now()}-${idx}-${file.name}`
          if (!v.ok) {
            setErrorMap((m) => ({ ...m, [tempId]: v.error || 'Fichier invalide' }))
            return
          }

          let cancelled = false
          let progress = 0
          setProgressMap((m) => ({ ...m, [tempId]: progress }))

          const controller = {
            cancel: () => {
              cancelled = true
            },
          }
          controllers.current[tempId] = controller

          // Lecture dataUrl pour preview/persistance locale
          const dataUrl = await toDataUrl(file).catch(() => undefined)

          await new Promise<void>((resolve) => {
            const interval = setInterval(() => {
              if (cancelled) {
                clearInterval(interval)
                setErrorMap((m) => ({ ...m, [tempId]: 'Upload annulé' }))
                setProgressMap((m) => ({ ...m, [tempId]: 0 }))
                delete controllers.current[tempId]
                return resolve()
              }
              progress = Math.min(100, progress + Math.random() * 20 + 5)
              setProgressMap((m) => ({ ...m, [tempId]: Math.floor(progress) }))
              if (progress >= 100) {
                clearInterval(interval)
                resolve()
              }
            }, 200)
          })

          if (!cancelled) {
            const failed = Math.random() < simulateFailureRate
            if (failed) {
              setErrorMap((m) => ({ ...m, [tempId]: 'Échec réseau simulé' }))
              setProgressMap((m) => ({ ...m, [tempId]: 0 }))
            } else {
              results.push({
                tempId,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                ticketId,
                dataUrl,
              })
            }
          }

          delete controllers.current[tempId]
        })
      )

      return results
    },
    [allowedMimeTypes, maxBytes, simulateFailureRate]
  )

  const cancelUpload = useCallback((tempId: string) => {
    controllers.current[tempId]?.cancel()
  }, [])

  const clearState = useCallback(() => {
    setProgressMap({})
    setErrorMap({})
    controllers.current = {}
  }, [])

  return useMemo(
    () => ({ upload, progressMap, errorMap, cancelUpload, clearState }),
    [upload, progressMap, errorMap, cancelUpload, clearState]
  )
}

export type UseUploadReturn = ReturnType<typeof useUpload>


