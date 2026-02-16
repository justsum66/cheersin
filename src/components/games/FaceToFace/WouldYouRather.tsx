'use client'

import { useState, useCallback, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from '../GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from '../GameRules'
import CopyResultButton from '../CopyResultButton'
import { useGameStore } from '@/store/useGameStore'
import CoupleTest from '../CoupleTest'
import { getQuestionsByCategory, type WouldYouRatherItem } from '@/lib/would-you-rather'
import { Loader2, AlertTriangle } from 'lucide-react'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

/** 終極二選一：顯示兩難選擇，每人選 A 或 B，選少數的人喝。R2-155：18+ 題庫需 Pro。 */
export function StandardWouldYouRather() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  // Phase 2: Game Mode Consolidation
  const { selectedMode } = useGameStore()

  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [phase, setPhase] = useState<'idle' | 'choose' | 'result'>('idle')
  const [pair, setPair] = useState<WouldYouRatherItem | null>(null)
  const [choices, setChoices] = useState<Record<number, 'A' | 'B'>>({})

  const [pool, setPool] = useState<WouldYouRatherItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const category = selectedMode === 'spicy' ? 'adult' : 'normal'
        const data = await getQuestionsByCategory(category)
        setPool(data)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [selectedMode])

  const startRound = useCallback(() => {
    play('click')
    if (pool.length === 0) return
    const p = pool[Math.floor(Math.random() * pool.length)]
    setPair(p)
    setChoices({})
    setPhase('choose')
  }, [play, pool])

  const setChoice = useCallback((playerIndex: number, c: 'A' | 'B') => {
    setChoices((prev) => ({ ...prev, [playerIndex]: c }))
  }, [])

  const countA = Object.values(choices).filter((c) => c === 'A').length
  const countB = Object.values(choices).filter((c) => c === 'B').length
  const minority: 'A' | 'B' | null = countA !== countB ? (countA < countB ? 'A' : 'B') : null

  const showResult = useCallback(() => {
    play('click')
    if (minority !== null && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
    setPhase('result')
  }, [play, minority])

  useEffect(() => {
    if (phase !== 'result') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') startRound() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, startRound])

  const allChosen = Object.keys(choices).length >= players.length

  const [showWarning, setShowWarning] = useState(true)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
        <p className="text-white/50">載入題目中...</p>
      </div>
    )
  }

  if (selectedMode === 'spicy' && showWarning) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px">
        <m.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6 max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">18+ 成人內容警告</h2>
          <p className="text-white/70">
            此遊戲包含成人向內容，僅限 18 歲以上玩家參與。
          </p>
          <button
            type="button"
            onClick={() => setShowWarning(false)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold games-focus-ring"
          >
            我已滿 18 歲，繼續
          </button>
        </m.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="終極二選一">
      <GameRules
        rules={`每題兩個選項，二選一。\n每人選 A 或 B，選完後揭曉：選「少數」的那邊的人喝。\n若平手則都不喝，或重抽一題。`}
      />
      <p className="text-white/50 text-sm mb-2 text-center">終極二選一</p>

      {phase === 'idle' && (
        <m.button
          type="button"
          className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold games-focus-ring"
          onClick={startRound}
          whileTap={{ scale: 0.98 }}
        >
          抽題
        </m.button>
      )}

      {phase === 'choose' && pair && (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md w-full">
          <p className="text-white/70 mb-4 font-medium">你會選哪一個？</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              type="button"
              className={`min-h-[48px] px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-colors games-focus-ring ${choices[0] === 'A' ? 'border-primary-500 bg-primary-500/20 text-white' : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              onClick={() => { }}
            >
              A. {pair.a}
            </button>
            <button
              type="button"
              className={`min-h-[48px] px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-colors games-focus-ring ${choices[0] === 'B' ? 'border-primary-500 bg-primary-500/20 text-white' : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              onClick={() => { }}
            >
              B. {pair.b}
            </button>
          </div>
          <p className="text-white/40 text-xs mb-2">每人輪流選 A 或 B（或由主持人代選）</p>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {players.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-white/70 text-sm">{name}</span>
                <button
                  type="button"
                  className={`min-h-[48px] min-w-[48px] px-3 rounded-lg text-sm games-focus-ring ${choices[i] === 'A' ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70'}`}
                  onClick={() => setChoice(i, 'A')}
                >
                  A
                </button>
                <button
                  type="button"
                  className={`min-h-[48px] min-w-[48px] px-3 rounded-lg text-sm games-focus-ring ${choices[i] === 'B' ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70'}`}
                  onClick={() => setChoice(i, 'B')}
                >
                  B
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            disabled={!allChosen}
            className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring disabled:opacity-50"
            onClick={showResult}
          >
            揭曉
          </button>
        </m.div>
      )}

      {phase === 'result' && pair && (
        <AnimatePresence>
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <p className="text-white/70 mb-2">A：{pair.a}（{countA} 人）</p>
            <p className="text-white/70 mb-4">B：{pair.b}（{countB} 人）</p>
            {minority ? (
              <p className="text-red-400 font-bold mb-4">選{minority}的人喝！</p>
            ) : (
              <p className="text-green-400 font-bold mb-4">平手，大家安全</p>
            )}
            <CopyResultButton
              text={minority ? `終極二選一：A ${pair.a}（${countA}人）B ${pair.b}（${countB}人）選${minority}的人喝` : `終極二選一：A ${pair.a} B ${pair.b} 平手大家安全`}
              className="mb-4 games-focus-ring"
            />
            <button
              type="button"
              className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
              onClick={startRound}
            >
              下一題
            </button>
          </m.div>
        </AnimatePresence>
      )}
    </div>
  )
}

export default function WouldYouRather() {
  const { selectedMode } = useGameStore()

  if (selectedMode === 'couples') {
    return <CoupleTest />
  }

  return <StandardWouldYouRather />
}
