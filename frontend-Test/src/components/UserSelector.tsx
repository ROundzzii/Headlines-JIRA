import React, { useEffect, useMemo, useRef, useState } from 'react'
import { User } from '../types'
import { useUserStore } from '../stores/dataStore'
import UserAvatar from './UserAvatar'

type Props = {
  value?: number | null
  onChange: (userId: number | null) => void
  allowNone?: boolean
  placeholder?: string
}

export const UserSelector: React.FC<Props> = ({ value, onChange, allowNone = true, placeholder = 'Rechercher un utilisateur...' }) => {
  const { users, isLoadingUsers, fetchUsers } = useUserStore()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => { if (!users.length) fetchUsers() }, [users.length, fetchUsers])

  // Debounce de la recherche pour éviter des recalculs trop fréquents
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 150)
    return () => clearTimeout(t)
  }, [query])

  const filtered = useMemo(() => {
    const q = debouncedQuery
    if (!q) return users
    return users.filter(u =>
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    )
  }, [users, debouncedQuery])

  const current = users.find(u => u.id === value || null)

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min((i < 0 ? -1 : i) + 1, (allowNone ? filtered.length : filtered.length) - 1))
      // scroll into view next tick
      requestAnimationFrame(() => {
        const container = listRef.current
        if (!container) return
        const item = container.querySelectorAll('[data-option="true"]')[Math.max(0, activeIndex + 1)] as HTMLElement | undefined
        item?.scrollIntoView({ block: 'nearest' })
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max((i < 0 ? 0 : i) - 1, 0))
      requestAnimationFrame(() => {
        const container = listRef.current
        if (!container) return
        const item = container.querySelectorAll('[data-option="true"]')[Math.max(0, activeIndex - 1)] as HTMLElement | undefined
        item?.scrollIntoView({ block: 'nearest' })
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const idx = activeIndex
      if (idx >= 0 && idx < filtered.length) {
        onChange(filtered[idx].id)
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  const highlight = (text: string, q: string) => {
    if (!q) return text
    const i = text.toLowerCase().indexOf(q)
    if (i === -1) return text
    const before = text.slice(0, i)
    const match = text.slice(i, i + q.length)
    const after = text.slice(i + q.length)
    return (
      <>
        {before}
        <mark className="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">{match}</mark>
        {after}
      </>
    )
  }

  return (
    <div className="relative">
      <button type="button" className="btn-outline w-full flex items-center justify-between" onClick={() => setOpen(v => !v)}>
        <span className="flex items-center gap-2">
          <UserAvatar user={current as User | undefined} size={18} />
          <span className="text-sm">{current ? current.full_name : 'Non assigné'}</span>
        </span>
        <span className="text-xs text-gray-500">{open ? 'Fermer' : 'Assigner'}</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
          <div className="p-2">
            <input
              className="input w-full"
              placeholder={placeholder}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1) }}
              autoFocus
              onKeyDown={onKeyDown}
            />
          </div>
          <div ref={listRef} className="max-h-64 overflow-auto">
            {allowNone && (
              <button
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${activeIndex === 0 ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                onMouseEnter={() => setActiveIndex(0)}
                onClick={() => { onChange(null); setOpen(false) }}
                data-option="true"
              >
                <UserAvatar size={18} />
                <span className="text-sm">Aucun</span>
              </button>
            )}
            {isLoadingUsers ? (
              <div className="px-3 py-3 flex items-center gap-2">
                <span className="inline-block h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Chargement…</span>
              </div>
            ) : filtered.length ? (
              filtered.map((u, idx) => {
                const pos = allowNone ? idx + 1 : idx
                const active = activeIndex === pos
                return (
                  <button
                    key={u.id}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${active ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                    onMouseEnter={() => setActiveIndex(pos)}
                    onClick={() => { onChange(u.id); setOpen(false) }}
                    data-option="true"
                  >
                    <UserAvatar user={u} size={18} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{highlight(u.full_name, debouncedQuery)}</div>
                      <div className="text-xs text-gray-500 truncate">{highlight(u.email, debouncedQuery)}</div>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">Aucun résultat</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserSelector


