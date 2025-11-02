import React, { useEffect, useMemo, useRef, useState } from 'react'
import { User } from '../types'
import { useUserStore } from '../stores/dataStore'
import UserAvatar from './UserAvatar'

type MentionSelectorProps = {
  query: string
  visible: boolean
  onSelect: (user: User) => void
  onClose: () => void
  maxResults?: number
}

export const MentionSelector: React.FC<MentionSelectorProps> = ({
  query,
  visible,
  onSelect,
  onClose,
  maxResults = 8,
}) => {
  const { users, isLoadingUsers, fetchUsers } = useUserStore()
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement | null>(null)

  const normalizedQuery = query.trim().toLowerCase()

  useEffect(() => {
    if (visible && !users.length) {
      fetchUsers()
    }
  }, [visible, users.length, fetchUsers])

  useEffect(() => {
    if (!visible) return
    setActiveIndex(0)
  }, [normalizedQuery, visible])

  const filtered = useMemo(() => {
    if (!users.length) return [] as User[]
    if (!normalizedQuery) return users.slice(0, maxResults)
    const q = normalizedQuery
    return users
      .filter(user =>
        user.full_name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q)
      )
      .slice(0, maxResults)
  }, [users, normalizedQuery, maxResults])

  useEffect(() => {
    if (!visible) return

    const handler = (event: KeyboardEvent) => {
      if (!filtered.length) {
        if (event.key === 'Escape') {
          onClose()
          event.preventDefault()
        }
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex(index => Math.min(index + 1, filtered.length - 1))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex(index => Math.max(index - 1, 0))
      } else if (event.key === 'Enter') {
        event.preventDefault()
        const user = filtered[activeIndex]
        if (user) {
          onSelect(user)
          onClose()
        }
      } else if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [visible, filtered, activeIndex, onSelect, onClose])

  useEffect(() => {
    if (!visible || !listRef.current) return
    const item = listRef.current.querySelectorAll('[data-mention-option="true"]')[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, visible, filtered.length])

  if (!visible) return null

  return (
    <div className="absolute left-0 right-0 z-40 mt-2 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-100 px-3 py-2 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Mentions
      </div>
      <div ref={listRef} className="max-h-56 overflow-y-auto">
        {isLoadingUsers ? (
          <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
            Chargement…
          </div>
        ) : filtered.length ? (
          filtered.map((user, index) => {
            const active = index === activeIndex
            return (
              <button
                key={user.id}
                type="button"
                data-mention-option="true"
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${active ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  onSelect(user)
                  onClose()
                }}
              >
                <UserAvatar user={user} size={24} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{user.full_name}</div>
                  <div className="truncate text-xs text-gray-500">
                    @{user.username} · {user.email}
                  </div>
                </div>
              </button>
            )
          })
        ) : (
          <div className="px-3 py-3 text-sm text-gray-500">Aucun résultat pour “{query}”</div>
        )}
      </div>
    </div>
  )
}

export default MentionSelector

