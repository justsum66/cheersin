'use client'

import { m } from 'framer-motion'
import { Plus, Users, Shuffle } from 'lucide-react'

import { Button } from '@/components/ui/Button'

interface GamesFabProps {
  activeGame: string | null
  fabOpen: boolean
  setFabOpen: (open: boolean) => void
  createRoomSectionRef: React.RefObject<HTMLDivElement | null>
  handleRandomGame: () => void
  gamesWithCategory: { id: string; name: string }[]
}

export function GamesFab({
  activeGame,
  fabOpen,
  setFabOpen,
  createRoomSectionRef,
  handleRandomGame,
  gamesWithCategory
}: GamesFabProps) {
  if (activeGame) {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 z-30 md:hidden flex flex-col items-end gap-2">
      <m.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        type="button"
        onClick={() => { 
          createRoomSectionRef.current?.scrollIntoView({ behavior: 'smooth' }); 
          setFabOpen(false) 
        }}
        className="min-h-[48px] px-4 py-2 rounded-full bg-primary-500/90 hover:bg-primary-500 text-white text-sm font-medium shadow-lg flex items-center gap-2"
        aria-label="捲動至建立房間"
      >
        <Users className="w-4 h-4" /> 創建房間
      </m.button>
      <m.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        type="button"
        onClick={handleRandomGame}
        disabled={gamesWithCategory.length === 0}
        className="min-h-[48px] px-4 py-2 rounded-full bg-white/90 hover:bg-white text-[#0a0a1a] text-sm font-medium shadow-lg flex items-center gap-2 disabled:opacity-50"
        aria-label="隨機選一個遊戲"
      >
        <Shuffle className="w-4 h-4" /> 隨機來一個
      </m.button>
      <m.button
        type="button"
        onClick={() => setFabOpen(!fabOpen)}
        className="min-h-[56px] min-w-[56px] rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg flex items-center justify-center games-focus-ring"
        aria-label={fabOpen ? '關閉快捷選單' : '開啟快捷選單'}
        aria-expanded={fabOpen}
      >
        <Plus className={`w-6 h-6 transition-transform ${fabOpen ? 'rotate-45' : ''}`} />
      </m.button>
    </div>
  )
}