export const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export const DEFAULT_ALLOWED_MIME_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/zip',
]

export interface FileValidationOptions {
  maxBytes?: number
  allowedMimeTypes?: readonly string[]
}

export interface FileValidationResult {
  ok: boolean
  error?: string
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES
  const allowed = options.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES

  if (file.size > maxBytes) {
    return {
      ok: false,
      error: `Fichier trop volumineux (${formatBytes(file.size)}). Limite: ${formatBytes(maxBytes)}`,
    }
  }

  if (allowed.length && !allowed.includes(file.type)) {
    return {
      ok: false,
      error: `Type de fichier non autorisé (${file.type || 'inconnu'})`,
    }
  }

  return { ok: true }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}


