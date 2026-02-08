'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']
/** G4.23 主題分類：動物/食物/明星等 */
const THEMES = ['酒類', '食物', '地名', '動物', '明星'] as const

/** 乾杯接力：輪流說一個詞接龍，卡住或重複喝。 */
export default function ToastRelay() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('酒類')
  const [chain, setChain] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [loser, setLoser] = useState<string | null>(null)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isStartPending, setIsStartPending] = useState(false)
  const [isSubmitPending, setIsSubmitPending] = useState(false)
  const startCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const submitCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (startCooldownRef.current) clearTimeout(startCooldownRef.current)
      if (submitCooldownRef.current) clearTimeout(submitCooldownRef.current)
    }
  }, [])

  /** G-ToastRelay-76 邊界：無玩家時不崩潰 */
  const currentPlayer = players.length > 0 ? players[currentPlayerIndex % players.length] : '—'
  const lastWord = chain.length > 0 ? chain[chain.length - 1] : null
  /** 中文接龍：取最後一字（支援 CJK 字元） */
  const lastChar = lastWord ? (Array.from(lastWord).pop() ?? lastWord.slice(-1)) : null

  const startRound = () => {
    if (isStartPending) return
    setIsStartPending(true)
    if (startCooldownRef.current) clearTimeout(startCooldownRef.current)
    startCooldownRef.current = setTimeout(() => {
      startCooldownRef.current = null
      setIsStartPending(false)
    }, 400)
    play('click')
    setChain([])
    setInput('')
    setLoser(null)
    setCurrentPlayerIndex(0)
    inputRef.current?.focus()
  }

  const submitWord = (e: React.FormEvent) => {
    e.preventDefault()
    const word = input.trim()
    if (!word) return
    const firstChar = Array.from(word)[0] ?? word[0]
    if (lastChar && firstChar !== lastChar) {
      play('wrong')
      setLoser(currentPlayer)
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
      return
    }
    if (chain.some((w) => w === word || w.toLowerCase() === word.toLowerCase())) {
      play('wrong')
      setLoser(currentPlayer)
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
      return
    }
    if (isSubmitPending) return
    setIsSubmitPending(true)
    if (submitCooldownRef.current) clearTimeout(submitCooldownRef.current)
    submitCooldownRef.current = setTimeout(() => {
      submitCooldownRef.current = null
      setIsSubmitPending(false)
    }, 400)
    play('click')
    setChain((prev) => [...prev, word])
    setInput('')
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="乾杯接力">
      <GameRules rules={`輪流說一個詞接龍，下一人要接上一個詞的最後一字；卡住或重複喝。\n可選主題（酒類/食物等）僅作提示。`} rulesKey="toast-relay.rules" />
      {/* G3D-ToastRelay-01：主題按鈕 3D 立體、選中態 */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 w-full max-w-lg justify-center" role="group" aria-label="主題">
        {THEMES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            aria-pressed={theme === t}
            className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium games-focus-ring transition-transform hover:scale-[1.02] active:scale-[0.98] ${theme === t ? 'bg-primary-500 text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            aria-label={`主題 ${t}`}
          >
            {t}
          </button>
        ))}
      </div>
      {/* G3D-ToastRelay-07 + P1-130：輪到誰玩家名排版、truncate、輪到你了醒目提示（脈動發光） */}
      <p className="text-white/70 text-base sm:text-lg md:text-xl mb-2 w-full max-w-xs text-center px-2 games-helper" aria-live="polite">
        輪到：<span className="tabular-nums truncate inline-block max-w-[10rem] sm:max-w-none align-bottom animate-pulse text-primary-300 font-bold shadow-[0_0_12px_rgb(139_0_0_/_0.5)]" title={currentPlayer}>{currentPlayer}</span>
      </p>
      {chain.length > 0 && (
        <p className="text-primary-300 font-bold text-lg sm:text-xl md:text-2xl mb-2 w-full max-w-xs text-center px-2 games-question" role="status" aria-live="polite">
          接「{lastChar}」
        </p>
      )}
      {!loser ? (
        <div className="w-full max-w-xs space-y-3">
          {/* 開始一輪：明確 CTA，smoke 測試與無障礙用 */}
          {chain.length === 0 && (
            <button
              type="button"
              onClick={startRound}
              disabled={isStartPending}
              data-testid="toast-master-start"
              aria-label="開始一輪"
              className="w-full min-h-[48px] px-4 py-2 rounded-xl bg-primary-500 text-white font-medium games-focus-ring hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-transform"
            >
              開始一輪
            </button>
          )}
          <form onSubmit={submitWord} className="space-y-2">
          {/* G3D-ToastRelay-02：輸入區 3D 輸入框或陰影層次 */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={lastChar ? `以「${lastChar}」開頭...` : '第一個詞...'}
            className="w-full min-h-[48px] px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 outline-none focus:border-primary-500 games-focus-ring games-input shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
            aria-label="接龍詞"
          />
          <button type="submit" disabled={!input.trim() || isSubmitPending} className="btn-primary w-full min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed games-focus-ring hover:scale-[1.02] active:scale-[0.98] transition-transform" data-testid="toast-relay-submit" aria-label="送出">
            送出
          </button>
        </form>
        </div>
      ) : (
        <motion.div
          initial={reducedMotion ? false : { scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24 }}
          className="mt-4 p-4 md:p-6 rounded-2xl bg-red-500/20 border border-red-500/50 text-center safe-area-px w-full max-w-md shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
          role="status"
          aria-live="assertive"
          data-testid="toast-relay-result"
        >
          <p className="text-red-400 font-bold text-xl md:text-2xl mb-3 games-result-text">{loser} 喝！</p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <CopyResultButton text={`乾杯接力：${loser} 喝`} label="複製結果" className="games-focus-ring" />
            <button type="button" onClick={startRound} disabled={isStartPending} className="min-h-[48px] min-w-[48px] px-4 rounded-xl bg-white/10 text-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed games-focus-ring transition-transform" aria-label="再一輪">
              再一輪
            </button>
          </div>
        </motion.div>
      )}
      {/* G3D-ToastRelay-04：本局歷史區接龍列表卡片化、間距 */}
      {chain.length > 0 && !loser && (
        <div className="mt-4 w-full max-w-xs space-y-2 p-3 rounded-xl bg-white/5 border border-white/10" role="region" aria-label="本局接龍歷史">
          <p className="text-white/50 text-xs mb-1">接龍：</p>
          <p className="text-white/80 text-sm break-all mb-2 max-h-20 overflow-y-auto overflow-x-hidden px-2 py-1.5 rounded-lg bg-white/5" aria-live="polite">{chain.join(' → ')}</p>
          <CopyResultButton text={chain.join(' → ')} label="複製本局歷史" className="min-h-[48px] min-w-[48px] games-focus-ring" />
        </div>
      )}
    </div>
  )
}
