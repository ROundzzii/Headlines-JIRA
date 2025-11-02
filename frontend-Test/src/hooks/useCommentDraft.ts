import { useState, useEffect, useCallback, useMemo } from 'react'

/**
 * Hook pour gérer les brouillons de commentaires dans localStorage
 */
export function useCommentDraft(
  mode: 'create' | 'edit',
  ticketId: number | undefined,
  initialValue: string,
  content: string
) {
  const [draftKey, setDraftKey] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'create' && ticketId) {
      setDraftKey(`comment-draft-${ticketId}`)
    } else {
      setDraftKey(null)
    }
  }, [mode, ticketId])

  // Vérifier si un brouillon existe
  const hasDraft = useMemo(() => {
    if (!draftKey) return false
    if (typeof window === 'undefined') return false
    const savedDraft = localStorage.getItem(draftKey)
    return !!savedDraft && savedDraft !== initialValue
  }, [draftKey, initialValue])

  // Charger le brouillon
  const loadDraft = useCallback(() => {
    if (!draftKey) return ''
    if (typeof window === 'undefined') return ''
    const savedDraft = localStorage.getItem(draftKey)
    return savedDraft || ''
  }, [draftKey])

  // Auto-save du brouillon toutes les 30 secondes
  useEffect(() => {
    if (mode !== 'create' || !draftKey || !content) return

    const timeoutId = setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(draftKey, content)
      }
    }, 30000) // 30 secondes

    return () => clearTimeout(timeoutId)
  }, [content, mode, draftKey])

  // Supprimer le brouillon
  const clearDraft = useCallback(() => {
    if (!draftKey) return
    if (typeof window === 'undefined') return
    localStorage.removeItem(draftKey)
  }, [draftKey])

  return {
    hasDraft,
    loadDraft,
    clearDraft
  }
}

