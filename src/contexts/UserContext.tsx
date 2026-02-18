'use client'

import { useEffect, type ReactNode } from 'react'
import { useSupabase } from '@/hooks/useSupabase'
import { useUserStore, type UserProfile } from '@/store/useUserStore'

/**
 * F180 UserContext - 用戶資訊全局共享
 * R2-003：狀態已遷至 useUserStore；此處僅保留 Provider 與 useUser() API，AuthSync 寫入 store
 */
export type { UserProfile }

function mapSupabaseUser(u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }): UserProfile {
  const meta = u.user_metadata ?? {}
  return {
    id: u.id,
    email: u.email ?? '',
    name: (meta.name as string) ?? (meta.full_name as string) ?? (meta.user_name as string),
    avatarUrl: (meta.avatar_url as string) ?? (meta.picture as string),
  }
}

/** C1：同步 Supabase Auth session 至 useUserStore */
function AuthSync() {
  const supabase = useSupabase()
  const setUser = useUserStore((s) => s.setUser)
  const setLoading = useUserStore((s) => s.setLoading)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ? mapSupabaseUser(session.user) : null)
        setLoading(false)
      })
      .catch(() => {
        // AUTH-ERR: Silent fail - user remains logged out
        setUser(null)
        setLoading(false)
      })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : null)
    })
    return () => subscription.unsubscribe()
  }, [supabase, setUser, setLoading])

  return null
}

export function UserProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthSync />
      {children}
    </>
  )
}

/** 相容既有 import；實際讀取 useUserStore */
export function useUser() {
  const user = useUserStore((s) => s.user)
  const isLoading = useUserStore((s) => s.isLoading)
  const setUser = useUserStore((s) => s.setUser)
  const setLoading = useUserStore((s) => s.setLoading)
  return { user, setUser, isLoading, setLoading }
}
