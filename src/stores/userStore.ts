/**
 * R2-003：Zustand 全局用戶狀態，與 UserContext 並存；Provider 可改為同步 Auth 到此 store
 */
import { create } from 'zustand'

export interface UserProfile {
  id: string
  email: string
  name?: string
  avatarUrl?: string
}

interface UserState {
  user: UserProfile | null
  isLoading: boolean
  setUser: (u: UserProfile | null) => void
  setLoading: (v: boolean) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}))
