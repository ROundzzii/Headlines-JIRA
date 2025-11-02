export interface DataUrlFile {
  name: string
  size: number
  type: string
  lastModified: number
  dataUrl: string
  base64: string
  extension: string
}

export const getFileExtension = (fileName: string): string => {
  const trimmed = fileName.trim()
  if (!trimmed) return ''
  const parts = trimmed.split('.')
  if (parts.length < 2) return ''
  return parts.pop()!.toLowerCase()
}

export const dataUrlToBase64 = (dataUrl: string): string => {
  const [, base64 = ''] = dataUrl.split(',', 2)
  return base64
}

export const readFileAsDataUrl = (file: File): Promise<DataUrlFile> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        dataUrl,
        base64: dataUrlToBase64(dataUrl),
        extension: getFileExtension(file.name),
      })
    }
    reader.onerror = () => {
      reject(reader.error ?? new Error('File reading failed'))
    }
    reader.readAsDataURL(file)
  })

export const readFilesAsDataUrls = async (files: FileList | File[]): Promise<DataUrlFile[]> => {
  const list: File[] = Array.isArray(files) ? files : Array.from(files)
  return Promise.all(list.map(readFileAsDataUrl))
}

export const truncateFileName = (name: string, maxLength = 48): string => {
  if (name.length <= maxLength) return name
  const extension = getFileExtension(name)
  const baseLength = extension ? maxLength - extension.length - 3 : maxLength - 3
  const base = name.slice(0, Math.max(baseLength, 1))
  return extension ? `${base}...${extension}` : `${base}...`
}



