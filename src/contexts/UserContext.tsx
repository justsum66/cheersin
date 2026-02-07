'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useSupabase } from '@/hooks/useSupabase'

/**
 * F180 UserContext - 用戶資訊全局共享
 * C1：接 Supabase Auth，AuthSync 同步 session → user
 */
export interface UserProfile {
  id: string
  email: string
  name?: string
  avatarUrl?: string
}

interface UserContextValue {
  user: UserProfile | null
  setUser: (u: UserProfile | null) => void
  isLoading: boolean
  setLoading: (v: boolean) => void
}

const UserContext = createContext<UserContextValue | null>(null)

function mapSupabaseUser(u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }): UserProfile {
  const meta = u.user_metadata ?? {}
  return {
    id: u.id,
    email: u.email ?? '',
    name: (meta.name as string) ?? (meta.full_name as string) ?? (meta.user_name as string),
    avatarUrl: (meta.avatar_url as string) ?? (meta.picture as string),
  }
}

/** C1：同步 Supabase Auth session 至 UserContext */
function AuthSync() {
  const supabase = useSupabase()
  const { setUser, setLoading } = useUser()

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : null)
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
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [isLoading, setLoading] = useState(true)

  const setUser = useCallback((u: UserProfile | null) => {
    setUserState(u)
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, setLoading }}>
      <AuthSync />
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) {
    return {
      user: null,
      setUser: () => {},
      isLoading: false,
      setLoading: () => {},
    }
  }
  return ctx
}
