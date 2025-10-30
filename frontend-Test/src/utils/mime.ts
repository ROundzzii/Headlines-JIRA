export function isPreviewableImage(mime: string): boolean {
  return mime.startsWith('image/') && mime !== 'image/svg+xml'
}

export function isPreviewablePdf(mime: string): boolean {
  return mime === 'application/pdf'
}

export function getGenericIconName(mime: string): 'image' | 'pdf' | 'zip' | 'text' | 'file' {
  if (isPreviewableImage(mime)) return 'image'
  if (isPreviewablePdf(mime)) return 'pdf'
  if (mime === 'application/zip' || mime === 'application/x-zip-compressed') return 'zip'
  if (mime.startsWith('text/')) return 'text'
  return 'file'
}


