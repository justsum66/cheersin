'use client'

import * as React from 'react'
import Link from 'next/link'
import { m, AnimatePresence } from 'framer-motion'
import { User, Settings, LogOut, Crown } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { useSubscription } from '@/hooks/useSubscription'
import { useSupabase } from '@/hooks/useSupabase'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Avatar } from '@/components/ui/Avatar'

interface UserMenuProps {
  /** Custom className for the container */
  className?: string
}

/**
 * Task 1.1.3: User Menu Component
 * 懶載入的用戶選單組件，包含登入狀態和訂閱資訊顯示
 */
export function UserMenu({ className = '' }: UserMenuProps) {
  const { user } = useUser()
  const { tier } = useSubscription()
  const supabase = useSupabase()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  useFocusTrap(open, menuRef)

  const handleOutside = React.useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpen(false)
    }
  }, [])

  React.useEffect(() => {
    if (!open) return
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open, handleOutside])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSignOut = React.useCallback(() => {
    setOpen(false)
    supabase?.auth.signOut().then(() => {
      window.location.href = '/'
    }).catch(() => {})
  }, [supabase])

  /** 未登入：顯示登入連結 */
  if (!user) {
    return (
      <Link
        href="/profile"
        aria-label="登入或個人頁面"
        className={`icon-interact games-focus-ring rounded-full flex items-center gap-2 min-h-[48px] ${className}`}
      >
        <span className="min-h-[48px] min-w-[48px] w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 p-[1px] shadow-glow-secondary hover:shadow-glow-secondary inline-flex items-center justify-center">
          <span className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
            <User className="w-5 h-5 text-white" aria-hidden />
          </span>
        </span>
        <span className="text-sm font-medium text-white/90 hidden sm:inline">登入</span>
      </Link>
    )
  }

  const fallback = user.name?.charAt(0) ?? user.email?.charAt(0) ?? '?'

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="games-focus-ring rounded-full flex items-center gap-2 min-h-[48px] p-0.5"
        aria-label="用戶選單"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar
          src={user.avatarUrl}
          fallback={fallback}
          size="md"
          alt={user.name ?? user.email}
          className="ring-2 ring-white/10 hover:ring-primary-500/50 transition-[box-shadow]"
        />
        <span className="text-sm font-medium text-white/90 hidden sm:inline truncate max-w-[8rem] flex items-center gap-1.5">
          {user.name ?? user.email ?? '帳戶'}
          {/* Subscription badge with tier-specific colors */}
          {tier === 'premium' && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-[10px] font-bold text-cyan-300" aria-label="VIP 會員">
              <Crown className="w-3 h-3" /> VIP
            </span>
          )}
          {tier === 'basic' && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary-500/20 border border-primary-400/30 text-[10px] font-bold text-primary-300" aria-label="Pro 會員">
              <Crown className="w-3 h-3" /> Pro
            </span>
          )}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <m.div
            className="absolute right-0 top-full mt-1 w-56 py-2 rounded-xl bg-[#1a0a2e] border border-white/10 shadow-xl z-[60]"
            role="menu"
            aria-label="用戶選單"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <User className="w-4 h-4 text-white/60" aria-hidden />
              個人資料
            </Link>
            <Link
              href="/profile#settings"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <Settings className="w-4 h-4 text-white/60" aria-hidden />
              設定
            </Link>
            <div className="my-1 border-t border-white/10" aria-hidden />
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" aria-hidden />
              登出
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}