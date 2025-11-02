import { useMemo, RefObject } from 'react'

export interface ActiveFormats {
  list: boolean
  orderedList: boolean
  bold: boolean
  italic: boolean
  code: boolean
}

/**
 * Hook pour détecter les formats actifs à la position du curseur dans le textarea
 */
export function useActiveFormats(
  textareaRef: RefObject<HTMLTextAreaElement>,
  content: string,
  selectionStart: number,
  selectionEnd: number
): ActiveFormats {
  return useMemo(() => {
    const textarea = textareaRef.current
    if (!textarea) {
      return { list: false, orderedList: false, bold: false, italic: false, code: false }
    }
    
    const { selectionStart: ss, selectionEnd: se, value } = textarea
    const selected = value.slice(ss, se)
    const lineStart = value.lastIndexOf('\n', ss - 1) + 1
    const line = value.slice(lineStart, ss)
    
    // Vérifier si dans une liste à puces
    const inList = /^(\s*)([-*+])\s+/.test(line)
    // Vérifier si dans une liste numérotée
    const inOrderedList = /^(\s*)(\d+[.)])\s+/.test(line)
    
    // Vérifier si le texte sélectionné est entièrement en gras (**texte** ou ***texte***)
    let bold = false
    if (selected) {
      // Vérifier si c'est ***texte*** (gras+italique)
      if (/^\*\*\*.*\*\*\*$/.test(selected)) {
        bold = true
      }
      // Vérifier si c'est **texte**
      else if (/^\*\*.*\*\*$/.test(selected)) {
        bold = true
      }
    }
    // Si pas de sélection, vérifier si le curseur est dans du texte en gras
    if (!bold && ss === se) {
      const before = value.slice(0, ss)
      const after = value.slice(se)
      
      // D'abord vérifier si on est dans ***texte*** (gras+italique)
      const tripleStart = before.lastIndexOf('***')
      if (tripleStart !== -1) {
        const between = before.slice(tripleStart + 3)
        const closingBeforeCursor = between.indexOf('***')
        if (closingBeforeCursor === -1) {
          const tripleEnd = after.indexOf('***', 0)
          if (tripleEnd !== -1) {
            bold = true
          }
        }
      }
      
      // Sinon chercher **texte**
      if (!bold) {
        const boldStart = before.lastIndexOf('**')
        if (boldStart !== -1 && (boldStart === 0 || before[boldStart - 1] !== '*')) {
          // Vérifier qu'il n'y a pas de ** fermant entre boldStart et le curseur
          const between = before.slice(boldStart + 2)
          const closingBeforeCursor = between.indexOf('**')
          if (closingBeforeCursor === -1) {
            // Pas de fermeture avant le curseur, chercher après
            const boldEnd = after.indexOf('**', 0)
            if (boldEnd !== -1 && (boldEnd >= after.length - 2 || after[boldEnd + 2] !== '*')) {
              bold = true
            }
          }
        }
      }
    }
    
    // Vérifier si le texte sélectionné est entièrement en italique (*texte* ou ***texte***)
    // On peut avoir *texte*, ***texte*** (gras+italique), ou même **gras*italique*
    let italic = false
    if (selected) {
      // Vérifier si c'est ***texte*** (gras+italique)
      if (/^\*\*\*.*\*\*\*$/.test(selected)) {
        italic = true
      }
      // Vérifier si c'est *texte* mais pas **texte**
      else if (/^\*.*\*$/.test(selected) && !/^\*\*.*\*\*$/.test(selected)) {
        italic = true
      }
    }
    // Si pas de sélection ou pas encore détecté, vérifier si le curseur est dans du texte en italique
    if (!italic && ss === se) {
      const before = value.slice(0, ss)
      const after = value.slice(se)
      
      // D'abord vérifier si on est dans ***texte*** (gras+italique)
      const tripleStart = before.lastIndexOf('***')
      if (tripleStart !== -1) {
        const between = before.slice(tripleStart + 3)
        const closingBeforeCursor = between.indexOf('***')
        if (closingBeforeCursor === -1) {
          const tripleEnd = after.indexOf('***', 0)
          if (tripleEnd !== -1) {
            italic = true
          }
        }
      }
      
      // Sinon chercher le dernier * avant le curseur qui n'est pas dans ** ou ***
      if (!italic) {
        let italicStart = -1
        let searchPos = before.length
        let found = before.lastIndexOf('*', searchPos - 1)
        while (found !== -1) {
          // Vérifier que ce n'est pas ** ou ***
          const charBefore = found > 0 ? before[found - 1] : ''
          const charAfter = found < before.length - 1 ? before[found + 1] : ''
          const charAfter2 = found < before.length - 2 ? before[found + 2] : ''
          if (charBefore !== '*' && charAfter !== '*' && !(charAfter === '*' && charAfter2 === '*')) {
            italicStart = found
            break
          }
          searchPos = found
          found = before.lastIndexOf('*', searchPos - 1)
        }
        
        if (italicStart !== -1) {
          // Vérifier qu'il n'y a pas de * fermant entre italicStart et le curseur (qui ne soit pas ** ou ***)
          const between = before.slice(italicStart + 1)
          let closingBeforeCursor = -1
          let searchPos2 = 0
          let found2 = between.indexOf('*', searchPos2)
          while (found2 !== -1) {
            // Vérifier que ce n'est pas ** ou ***
            const charAfterFound = found2 < between.length - 1 ? between[found2 + 1] : ''
            const charAfterFound2 = found2 < between.length - 2 ? between[found2 + 2] : ''
            if (charAfterFound !== '*' && !(charAfterFound === '*' && charAfterFound2 === '*')) {
              closingBeforeCursor = found2
              break
            }
            searchPos2 = found2 + 1
            found2 = between.indexOf('*', searchPos2)
          }
          
          if (closingBeforeCursor === -1) {
            // Pas de fermeture avant le curseur, chercher après
            const italicEnd = after.indexOf('*', 0)
            if (italicEnd !== -1) {
              // Vérifier que ce n'est pas ** ou ***
              const charAfterEnd = italicEnd < after.length - 1 ? after[italicEnd + 1] : ''
              const charAfterEnd2 = italicEnd < after.length - 2 ? after[italicEnd + 2] : ''
              if (charAfterEnd !== '*' && !(charAfterEnd === '*' && charAfterEnd2 === '*')) {
                italic = true
              }
            }
          }
        }
      }
    }
    
    // Vérifier si le texte sélectionné est entièrement en code (`code`)
    let code = selected && /^`.*`$/.test(selected)
    // Si pas de sélection, vérifier si le curseur est dans du code inline
    if (!code && ss === se) {
      const before = value.slice(0, ss)
      const after = value.slice(se)
      // Chercher le dernier ` avant le curseur
      const codeStart = before.lastIndexOf('`')
      if (codeStart !== -1) {
        // Vérifier qu'il n'y a pas de ` fermant entre codeStart et le curseur
        const between = before.slice(codeStart + 1)
        const closingBeforeCursor = between.indexOf('`')
        if (closingBeforeCursor === -1) {
          // Pas de fermeture avant le curseur, chercher après
          const codeEnd = after.indexOf('`', 0)
          if (codeEnd !== -1) {
            code = true
          }
        }
      }
    }
    
    return { list: inList, orderedList: inOrderedList, bold, italic, code }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, selectionStart, selectionEnd])
}

