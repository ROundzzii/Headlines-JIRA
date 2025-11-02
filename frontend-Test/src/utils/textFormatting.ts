/**
 * Fonctions utilitaires pour le formatage de texte dans l'éditeur de commentaires
 */

export interface FormatResult {
  newValue: string
  cursorStart: number
  cursorEnd: number
}

/**
 * Enveloppe la sélection avec un préfixe et un suffixe
 */
export function wrapSelection(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix?: string,
  placeholderText = 'texte'
): FormatResult {
  const currentValue = textarea.value || ''
  const start = Math.max(0, Math.min(textarea.selectionStart, currentValue.length))
  const end = Math.max(start, Math.min(textarea.selectionEnd, currentValue.length))
  const selected = currentValue.slice(start, end) || placeholderText
  const next = `${currentValue.slice(0, start)}${prefix}${selected}${suffix ?? prefix}${currentValue.slice(end)}`
  
  return {
    newValue: next,
    cursorStart: start + prefix.length,
    cursorEnd: start + prefix.length + selected.length
  }
}

/**
 * Applique le format de liste à puces
 */
export function applyListFormat(textarea: HTMLTextAreaElement): FormatResult | null {
  const currentValue = textarea.value || ''
  
  // Si le textarea est vide, insérer simplement "- "
  if (!currentValue || currentValue.trim().length === 0) {
    return {
      newValue: '- ',
      cursorStart: 2,
      cursorEnd: 2
    }
  }
  
  const selectionStart = Math.max(0, Math.min(textarea.selectionStart, currentValue.length))
  const selectionEnd = Math.max(selectionStart, Math.min(textarea.selectionEnd, currentValue.length))
  
  // Si une sélection existe, traiter toutes les lignes de la sélection
  // Sinon, traiter uniquement la ligne courante
  let lineStart: number
  let lineEnd: number
  
  if (selectionStart !== selectionEnd) {
    // Sélection multiple : traiter toutes les lignes sélectionnées
    lineStart = currentValue.lastIndexOf('\n', selectionStart - 1) + 1
    lineEnd = currentValue.indexOf('\n', selectionEnd)
    if (lineEnd === -1) lineEnd = currentValue.length
  } else {
    // Pas de sélection : traiter uniquement la ligne courante
    lineStart = currentValue.lastIndexOf('\n', selectionStart - 1) + 1
    lineEnd = currentValue.indexOf('\n', selectionStart)
    if (lineEnd === -1) lineEnd = currentValue.length
  }
  
  // Extraire la ou les lignes concernées
  const lineContent = currentValue.slice(lineStart, lineEnd)
  
  // Appliquer le format liste à chaque ligne
  const lines = lineContent.split(/\r?\n/).map((line) => {
    // Préserver les espaces d'indentation au début
    const indentMatch = line.match(/^(\s*)/)
    const indent = indentMatch ? indentMatch[1] : ''
    const trimmed = line.trim()
    
    if (!trimmed) return line // Ligne vide, on la préserve telle quelle
    
    // Si la ligne commence déjà par "- ", on la laisse telle quelle
    if (trimmed.startsWith('- ')) {
      return line
    }
    // Sinon, on ajoute "- " après l'indentation
    return `${indent}- ${trimmed}`
  })
  const formatted = lines.join('\n')
  
  // Calculer le décalage pour ajuster la position du curseur
  const firstLineOriginal = lineContent.split(/\r?\n/)[0]
  const firstLineFormatted = formatted.split(/\r?\n/)[0]
  const offset = firstLineFormatted.length - firstLineOriginal.length
  
  // Construire le nouveau contenu complet
  const next = `${currentValue.slice(0, lineStart)}${formatted}${currentValue.slice(lineEnd)}`
  
  return {
    newValue: next,
    cursorStart: selectionStart + offset,
    cursorEnd: selectionEnd + offset
  }
}

/**
 * Applique le format de liste numérotée
 */
export function applyOrderedListFormat(textarea: HTMLTextAreaElement): FormatResult | null {
  const currentValue = textarea.value || ''
  
  // Si le textarea est vide, insérer simplement "1. "
  if (!currentValue || currentValue.trim().length === 0) {
    return {
      newValue: '1. ',
      cursorStart: 3,
      cursorEnd: 3
    }
  }
  
  const selectionStart = Math.max(0, Math.min(textarea.selectionStart, currentValue.length))
  const selectionEnd = Math.max(selectionStart, Math.min(textarea.selectionEnd, currentValue.length))
  
  // Si une sélection existe, traiter toutes les lignes de la sélection
  // Sinon, traiter uniquement la ligne courante
  let lineStart: number
  let lineEnd: number
  
  if (selectionStart !== selectionEnd) {
    // Sélection multiple : traiter toutes les lignes sélectionnées
    lineStart = currentValue.lastIndexOf('\n', selectionStart - 1) + 1
    lineEnd = currentValue.indexOf('\n', selectionEnd)
    if (lineEnd === -1) lineEnd = currentValue.length
  } else {
    // Pas de sélection : traiter uniquement la ligne courante
    lineStart = currentValue.lastIndexOf('\n', selectionStart - 1) + 1
    lineEnd = currentValue.indexOf('\n', selectionStart)
    if (lineEnd === -1) lineEnd = currentValue.length
  }
  
  // Extraire la ou les lignes concernées
  const lineContent = currentValue.slice(lineStart, lineEnd)
  
  // Appliquer le format liste numérotée à chaque ligne
  let lineNumber = 1
  const orderedMatch = lineContent.match(/^(\s*)(\d+)([.)])\s+/)
  if (orderedMatch) {
    lineNumber = parseInt(orderedMatch[2], 10)
  }
  
  const lines = lineContent.split(/\r?\n/).map((line) => {
    // Préserver les espaces d'indentation au début
    const indentMatch = line.match(/^(\s*)/)
    const indent = indentMatch ? indentMatch[1] : ''
    const trimmed = line.trim()
    
    if (!trimmed) return line // Ligne vide, on la préserve telle quelle
    
    // Vérifier si c'est déjà une liste numérotée
    const existingMatch = trimmed.match(/^(\d+)([.)])\s+(.*)$/)
    if (existingMatch) {
      return `${indent}${lineNumber}${existingMatch[2]} ${existingMatch[3]}`
    }
    // Si la ligne commence déjà par un numéro, on la préserve
    if (/^\d+[.)]\s+/.test(trimmed)) {
      return line
    }
    // Sinon, on ajoute le numéro après l'indentation
    return `${indent}${lineNumber++}. ${trimmed}`
  })
  const formatted = lines.join('\n')
  
  // Calculer le décalage pour ajuster la position du curseur
  const firstLineOriginal = lineContent.split(/\r?\n/)[0]
  const firstLineFormatted = formatted.split(/\r?\n/)[0]
  const offset = firstLineFormatted.length - firstLineOriginal.length
  
  // Construire le nouveau contenu complet
  const next = `${currentValue.slice(0, lineStart)}${formatted}${currentValue.slice(lineEnd)}`
  
  return {
    newValue: next,
    cursorStart: selectionStart + offset,
    cursorEnd: selectionEnd + offset
  }
}

