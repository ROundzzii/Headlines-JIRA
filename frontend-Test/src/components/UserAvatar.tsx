import React from 'react'
import { User } from '../types'

function stringToColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 40%)`
}

export const UserAvatar: React.FC<{ user?: User; size?: number; className?: string }>= ({ user, size = 24, className = '' }) => {
  const name = user?.full_name || 'Non assigné'
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || 'NA'
  const bg = user ? stringToColor(user.email || user.username) : '#9ca3af'

  const fontSize = Math.max(10, Math.floor(size * 0.45))
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full text-white font-semibold select-none ${className}`}
      style={{ width: size, height: size, backgroundColor: bg, fontSize, lineHeight: 1 }}
      title={name}
    >
      {initials}
    </div>
  )
}

export default UserAvatar


