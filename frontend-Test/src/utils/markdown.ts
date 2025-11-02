const MENTION_REGEX = /@([a-zA-Z0-9._-]+)/g

const escapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, char => escapeMap[char])

const sanitizeUrl = (raw: string): string => {
  const trimmed = raw.trim()
  if (!trimmed) return '#'

  if (/^(https?:|mailto:)/i.test(trimmed)) {
    return trimmed
  }

  try {
    const url = new URL(trimmed, 'http://localhost')
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:') {
      return url.href
    }
  } catch {
    // ignore invalid url
  }

  return '#'
}

const highlightMentions = (value: string): string =>
  value.replace(MENTION_REGEX, (_match, username) => `<span class="mention">@${username}</span>`)

const applyInlineFormatting = (raw: string): string => {
  let output = raw

  output = output.replace(/`([^`]+)`/g, (_match, code) => `<code>${code}</code>`)

  output = output.replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, label, url) => {
    const safeUrl = sanitizeUrl(url)
    return `<a href="${safeUrl}" target="_blank" rel="noreferrer noopener">${label}</a>`
  })

  output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  output = output.replace(/__([^_]+)__/g, '<strong>$1</strong>')

  output = output.replace(/(^|\s)\*([^*]+)\*(?=\s|$)/g, '$1<em>$2</em>')
  output = output.replace(/(^|\s)_([^_]+)_(?=\s|$)/g, '$1<em>$2</em>')

  output = output.replace(/~~([^~]+)~~/g, '<del>$1</del>')

  output = output.replace(/(^|\s)(https?:\/\/[^\s<]+)/g, (_match, prefix, url) => {
    const safeUrl = sanitizeUrl(url)
    return `${prefix}<a href="${safeUrl}" target="_blank" rel="noreferrer noopener">${url}</a>`
  })

  output = highlightMentions(output)

  return output
}

interface ListItem {
  level: number
  type: 'ul' | 'ol'
  content: string
}

const groupListItemsByLevel = (items: ListItem[]): string => {
  if (items.length === 0) return ''

  const stack: Array<{ type: 'ul' | 'ol'; buffer: string[] }> = []

  items.forEach(item => {
    // Fermer les niveaux plus profonds que l'item actuel
    while (stack.length > 0 && item.level < stack.length) {
      const completed = stack.pop()!
      const html = `<${completed.type}>${completed.buffer.join('')}</${completed.type}>`
      if (stack.length > 0) {
        stack[stack.length - 1].buffer.push(html)
      }
    }

    // Créer les niveaux manquants
    while (item.level >= stack.length) {
      stack.push({ type: item.type, buffer: [] })
    }

    // Ajouter l'item au niveau approprié
    const current = stack[stack.length - 1]
    current.buffer.push(item.content)
  })

  // Fermer toutes les listes restantes
  while (stack.length > 1) {
    const completed = stack.pop()!
    const html = `<${completed.type}>${completed.buffer.join('')}</${completed.type}>`
    stack[stack.length - 1].buffer.push(html)
  }

  if (stack.length === 0) return ''
  
  const root = stack[0]
  return `<${root.type}>${root.buffer.join('')}</${root.type}>`
}

export const markdownToHtml = (markdown: string): string => {
  if (!markdown.trim()) {
    return ''
  }

  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const htmlParts: string[] = []
  let listStack: ListItem[] = []
  let inCodeBlock = false
  let codeLanguage = ''
  let codeBuffer: string[] = []

  const flushListStack = () => {
    if (listStack.length) {
      const html = groupListItemsByLevel(listStack)
      if (html) {
        htmlParts.push(html)
      }
      listStack = []
    }
  }

  const flushCodeBlock = () => {
    if (!codeBuffer.length) return
    const languageAttr = codeLanguage ? ` data-language="${escapeHtml(codeLanguage)}"` : ''
    htmlParts.push(
      `<pre><code${languageAttr}>${codeBuffer
        .map(line => escapeHtml(line))
        .join('\n')}</code></pre>`
    )
    codeBuffer = []
    codeLanguage = ''
  }

  lines.forEach(rawLine => {
    const line = rawLine.replace(/\s+$/g, '')
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock()
        inCodeBlock = false
      } else {
        flushListStack()
        inCodeBlock = true
        codeLanguage = trimmed.slice(3).trim()
      }
      return
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine)
      return
    }

    if (!trimmed) {
      flushListStack()
      htmlParts.push('<br />')
      return
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      flushListStack()
      const level = Math.min(headingMatch[1].length, 6)
      const content = applyInlineFormatting(escapeHtml(headingMatch[2]))
      htmlParts.push(`<h${level}>${content}</h${level}>`)
      return
    }

    if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmed)) {
      flushListStack()
      htmlParts.push('<hr />')
      return
    }

    if (trimmed.startsWith('>')) {
      flushListStack()
      const content = trimmed.replace(/^>\s?/, '')
      htmlParts.push(`<blockquote>${applyInlineFormatting(escapeHtml(content))}</blockquote>`)
      return
    }

    const unorderedMatch = line.match(/^(\s*)([-*+])\s+(.*)$/)
    const orderedMatch = line.match(/^(\s*)(\d+)([.)])\s+(.*)$/)

    if (unorderedMatch) {
      const [, indent, , content] = unorderedMatch
      const level = Math.floor(indent.length / 2)
      listStack.push({
        level,
        type: 'ul',
        content: `<li>${applyInlineFormatting(escapeHtml(content))}</li>`,
      })
      return
    }

    if (orderedMatch) {
      const [, indent, , , content] = orderedMatch
      const level = Math.floor(indent.length / 2)
      listStack.push({
        level,
        type: 'ol',
        content: `<li>${applyInlineFormatting(escapeHtml(content))}</li>`,
      })
      return
    }

    flushListStack()
    htmlParts.push(`<p>${applyInlineFormatting(escapeHtml(line))}</p>`)
  })

  if (inCodeBlock) {
    flushCodeBlock()
  }

  flushListStack()

  return htmlParts.join('')
}

export const extractMentions = (markdown: string): string[] => {
  const matches = markdown.match(MENTION_REGEX)
  if (!matches) return []
  return Array.from(new Set(matches.map(match => match.replace('@', ''))))
}

export const stripMarkdown = (markdown: string): string =>
  markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(^|\s)\*([^*]+)\*(?=\s|$)/g, '$2')
    .replace(/(^|\s)_([^_]+)_(?=\s|$)/g, '$2')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '$1')
    .replace(MENTION_REGEX, '@$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\r?\n+/g, ' ')
    .trim()

export { MENTION_REGEX }
