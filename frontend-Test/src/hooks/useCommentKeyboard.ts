import { useCallback, RefObject } from 'react'
import { wrapSelection as wrapSelectionUtil, applyListFormat, applyOrderedListFormat } from '../utils/textFormatting'

interface UseCommentKeyboardParams {
  textareaRef: RefObject<HTMLTextAreaElement>
  setContent: (value: string | ((prev: string) => string)) => void
  updateMentionState: () => void
  setSelectionStart: (value: number) => void
  setSelectionEnd: (value: number) => void
}

/**
 * Hook pour gérer les raccourcis clavier dans l'éditeur de commentaires
 */
export function useCommentKeyboard({
  textareaRef,
  setContent,
  updateMentionState,
  setSelectionStart,
  setSelectionEnd
}: UseCommentKeyboardParams) {
  const wrapSelection = useCallback((prefix: string, suffix?: string, placeholderText = 'texte') => {
    const textarea = textareaRef.current
    if (!textarea) {
      // Si le textarea n'existe pas, insérer le texte formaté directement
      const formatted = `${prefix}${placeholderText}${suffix ?? prefix}`
      setContent(formatted)
      return
    }
    
    const result = wrapSelectionUtil(textarea, prefix, suffix, placeholderText)
    setContent(result.newValue)
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(result.cursorStart, result.cursorEnd)
      }
    })
  }, [textareaRef, setContent])

  const handleApplyListFormat = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const result = applyListFormat(textarea)
    if (!result) return
    
    setContent(result.newValue)
    requestAnimationFrame(() => {
      if (!textareaRef.current) return
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(result.cursorStart, result.cursorEnd)
      setSelectionStart(result.cursorStart)
      setSelectionEnd(result.cursorEnd)
    })
  }, [textareaRef, setContent, setSelectionStart, setSelectionEnd])

  const handleApplyOrderedListFormat = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const result = applyOrderedListFormat(textarea)
    if (!result) return
    
    setContent(result.newValue)
    requestAnimationFrame(() => {
      if (!textareaRef.current) return
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(result.cursorStart, result.cursorEnd)
      setSelectionStart(result.cursorStart)
      setSelectionEnd(result.cursorEnd)
    })
  }, [textareaRef, setContent, setSelectionStart, setSelectionEnd])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget
    const { selectionStart, selectionEnd, value } = textarea

    const setValueAndCaret = (nextValue: string, caret: number) => {
      setContent(nextValue)
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(caret, caret)
          updateMentionState()
        }
      })
    }

    // Raccourcis clavier (Ctrl/Cmd + ...)
    const isCtrlOrCmd = event.ctrlKey || event.metaKey
    if (isCtrlOrCmd && !event.shiftKey && event.key === 'b') {
      event.preventDefault()
      wrapSelection('**', '**')
      return
    }
    if (isCtrlOrCmd && !event.shiftKey && event.key === 'i') {
      event.preventDefault()
      wrapSelection('*', '*')
      return
    }
    if (isCtrlOrCmd && !event.shiftKey && event.key === 'k') {
      event.preventDefault()
      wrapSelection('[', '](https://)')
      return
    }
    if (isCtrlOrCmd && event.shiftKey && (event.key === 'X' || event.key === 'x')) {
      event.preventDefault()
      wrapSelection('`', '`')
      return
    }
    if (isCtrlOrCmd && event.shiftKey && event.key === '*') {
      event.preventDefault()
      handleApplyListFormat()
      return
    }
    if (isCtrlOrCmd && event.shiftKey && event.key === '&') {
      event.preventDefault()
      handleApplyOrderedListFormat()
      return
    }

    if (event.key === 'Enter') {
      if (selectionStart !== selectionEnd) return

      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
      const line = value.slice(lineStart, selectionStart)
      const unorderedMatch = line.match(/^(\s*)([-*+])\s+/)
      const orderedMatch = line.match(/^(\s*)(\d+)([.)])\s+/)

      if (unorderedMatch || orderedMatch) {
        event.preventDefault()

        const indent = unorderedMatch ? unorderedMatch[1] : orderedMatch![1]
        const markerLength = unorderedMatch ? unorderedMatch[0].length : orderedMatch![0].length
        const contentAfterMarker = line.slice(markerLength).trim()

        // Si la ligne est vide après le marqueur, sortir de la liste
        if (!contentAfterMarker) {
          const before = value.slice(0, lineStart)
          const after = value.slice(selectionEnd)
          const nextValue = `${before}\n${after}`
          setValueAndCaret(nextValue, lineStart + 1)
          return
        }

        let insertMarker: string
        if (orderedMatch) {
          const nextNumber = Number(orderedMatch[2]) + 1
          insertMarker = `${nextNumber}${orderedMatch[3]}`
        } else {
          insertMarker = unorderedMatch![2]
        }

        const insert = `\n${indent}${insertMarker} `
        const before = value.slice(0, selectionStart)
        const after = value.slice(selectionEnd)
        const nextValue = `${before}${insert}${after}`
        setValueAndCaret(nextValue, selectionStart + insert.length)
        return
      }
    }

    if (event.key === 'Tab') {
      event.preventDefault()

      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
      const indentMatch = value.slice(lineStart, selectionStart).match(/^\s*/)
      const indent = indentMatch ? indentMatch[0] : ''
      let nextIndent = indent

      if (event.shiftKey) {
        const removeCount = indent.endsWith('  ')
          ? 2
          : indent.endsWith('\t')
            ? 1
            : Math.min(2, indent.length)
        nextIndent = indent.slice(0, indent.length - removeCount)
      } else {
        nextIndent = `${indent}  `
      }

      const before = value.slice(0, lineStart)
      const after = value.slice(selectionEnd)
      const currentLineRest = value.slice(lineStart + indent.length, selectionEnd)
      const nextValue = `${before}${nextIndent}${currentLineRest}${after}`
      const caretDelta = nextIndent.length - indent.length
      setValueAndCaret(nextValue, selectionStart + caretDelta)
      return
    }
  }, [wrapSelection, handleApplyListFormat, handleApplyOrderedListFormat, textareaRef, setContent, updateMentionState])

  return {
    handleKeyDown,
    wrapSelection,
    applyListFormat: handleApplyListFormat,
    applyOrderedListFormat: handleApplyOrderedListFormat
  }
}

