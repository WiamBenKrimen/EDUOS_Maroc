'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'

interface SidebarChatLinkProps {
  variant?: 'op' | 'dir'
  collapsed?: boolean
  className?: string
}

export default function SidebarChatLink({ variant = 'op', collapsed = false, className }: SidebarChatLinkProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchUnread = () => {
      api.get<{ total: number }>('/chat/unread-count')
        .then(data => setUnreadCount(data.total))
        .catch(() => {})
    }
    fetchUnread()
    const timer = setInterval(fetchUnread, 15_000)

    const handleUnreadUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ count?: number }>
      if (typeof customEvent.detail?.count === 'number') {
        setUnreadCount(customEvent.detail.count)
      } else {
        fetchUnread()
      }
    }

    const handleChatState = (e: Event) => {
      const customEvent = e as CustomEvent<{ open?: boolean }>
      if (typeof customEvent.detail?.open === 'boolean') {
        setIsOpen(customEvent.detail.open)
      }
    }

    window.addEventListener('eduos:unread-count', handleUnreadUpdate)
    window.addEventListener('eduos:chat-state', handleChatState)

    return () => {
      clearInterval(timer)
      window.removeEventListener('eduos:unread-count', handleUnreadUpdate)
      window.removeEventListener('eduos:chat-state', handleChatState)
    }
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('eduos:toggle-chat'))
  }

  const baseClass = variant === 'dir' ? 'dir-nav-link' : 'op-nav-link'
  const iconClass = variant === 'dir' ? 'dir-nav-icon' : 'op-nav-icon'

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${baseClass}${isOpen ? ' active' : ''} ${className ?? ''}`}
      title="Chat Interne EDUOS"
      style={{
        width: '100%',
        textAlign: 'left',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <span className={iconClass}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <path d="M8 9h8"/>
          <path d="M8 13h5"/>
        </svg>
      </span>
      {!collapsed && <span>Chat Interne</span>}
      {unreadCount > 0 && (
        <span
          style={{
            marginLeft: 'auto',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            background: 'linear-gradient(135deg, #C9922A 0%, #E8A83A 100%)',
            color: '#FFFFFF',
            fontSize: '0.65rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 5px',
            boxShadow: '0 2px 6px rgba(201, 146, 42, 0.4)',
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
