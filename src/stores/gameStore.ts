/**
 * R2-003：Zustand 遊戲相關全局狀態（如當前房間 slug、遊戲篩選），供 /games 等頁使用
 */
import { create } from 'zustand'

interface GameState {
  /** 當前遊戲房 slug（若在房間模式） */
  currentRoomSlug: string | null
  setCurrentRoomSlug: (slug: string | null) => void
  /** 遊戲分類篩選標籤 */
  categoryFilter: string | null
  setCategoryFilter: (category: string | null) => void
}

export const useGameStore = create<GameState>((set) => ({
  currentRoomSlug: null,
  setCurrentRoomSlug: (currentRoomSlug) => set({ currentRoomSlug }),
  categoryFilter: null,
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
}))
