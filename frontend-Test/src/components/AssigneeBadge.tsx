import React from 'react'
import { User } from '../types'
import UserAvatar from './UserAvatar'

export const AssigneeBadge: React.FC<{ user?: User; className?: string }>= ({ user, className = '' }) => {
  if (!user) {
    return (
      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs ${className}`}>
        <UserAvatar size={16} />
        <span>Non assigné</span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs ${className}`}>
      <UserAvatar user={user} size={16} />
      <span className="truncate max-w-[160px]">{user.full_name}</span>
    </div>
  )
}

export default AssigneeBadge


