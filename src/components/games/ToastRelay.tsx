'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { m } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { DrinkingAnimation } from './DrinkingAnimation'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']
/** G4.23 主題分類：動物/食物/明星等 */
const THEMES = ['酒類', '食物', '地名', '動物', '明星'] as const
/** R2-165：加速模式每輪少 1 秒，最少 3 秒 */
const BASE_SECONDS = 10
const MIN_SECONDS = 3

/** 乾杯接力：輪流說一個詞接龍，卡住或重複喝。R2-165 加速模式可選。 */
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
  const [speedMode, setSpeedMode] = useState(false)
  const [roundIndex, setRoundIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  /** R2-163：連環敬酒模式 — 被敬者立即敬下一位 */
  const [chainToastMode, setChainToastMode] = useState(false)
  const [chainToastActive, setChainToastActive] = useState(false)
  const [chainToasterIndex, setChainToasterIndex] = useState(0)
  const [chainToastDrinkResult, setChainToastDrinkResult] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isStartPending, setIsStartPending] = useState(false)
  const [isSubmitPending, setIsSubmitPending] = useState(false)
  const startCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const submitCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const speedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentPlayerIndexRef = useRef(currentPlayerIndex)
  currentPlayerIndexRef.current = currentPlayerIndex

  const secondsForRound = Math.max(MIN_SECONDS, BASE_SECONDS - roundIndex)

  useEffect(() => {
    return () => {
      if (startCooldownRef.current) clearTimeout(startCooldownRef.current)
      if (submitCooldownRef.current) clearTimeout(submitCooldownRef.current)
      if (speedTimerRef.current) clearInterval(speedTimerRef.current)
    }
  }, [])

  /** R2-165：加速模式倒數，時間到當前玩家輸（用 ref 取當前玩家避免閉包過期） */
  useEffect(() => {
    if (!speedMode || loser !== null || timeLeft === null) {
      if (speedTimerRef.current) clearInterval(speedTimerRef.current)
      speedTimerRef.current = null
      return
    }
    speedTimerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null || t <= 1) {
          if (speedTimerRef.current) clearInterval(speedTimerRef.current)
          speedTimerRef.current = null
          play('wrong')
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
          const idx = currentPlayerIndexRef.current
          setLoser(players[idx] ?? '')
          return null
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (speedTimerRef.current) clearInterval(speedTimerRef.current)
    }
  }, [speedMode, loser, timeLeft, players, play])

  /** G-ToastRelay-76 邊界：無玩家時不崩潰 */
  const currentPlayer = players.length > 0 ? players[currentPlayerIndex % players.length] : '—'
  const lastWord = chain.length > 0 ? chain[chain.length - 1] : null
  /** 中文接龍：取最後一字（支援 CJK 字元） */
  const lastChar = lastWord ? (Array.from(lastWord).pop() ?? lastWord.slice(-1)) : null

  const startRound = useCallback(() => {
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
    setRoundIndex(0)
    setTimeLeft(speedMode ? BASE_SECONDS : null)
    inputRef.current?.focus()
  }, [isStartPending, play, speedMode])

  /** R2-163：選擇被敬的人 → 顯示喝一口 → 該人成為下一位敬酒者 */
  const selectChainToastTarget = useCallback((targetIndex: number) => {
    play('click')
    const name = players[targetIndex]
    setChainToastDrinkResult(name)
    setChainToasterIndex(targetIndex)
  }, [players, play])

  const chainToastNext = useCallback(() => {
    play('click')
    setChainToastDrinkResult(null)
  }, [play])

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
    setRoundIndex((r) => r + 1)
    const nextTime = speedMode ? Math.max(MIN_SECONDS, BASE_SECONDS - (roundIndex + 1)) : null
    setTimeLeft(nextTime)
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  /** R2-163：連環敬酒模式進行中時顯示敬酒/喝一口 UI */
  if (chainToastActive) {
    const toasterName = players[chainToasterIndex] ?? '—'
    const otherIndices = players.map((_, i) => i).filter((i) => i !== chainToasterIndex)
    return (
      <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="連環敬酒">
        <GameRules rules="敬酒的人選一位，被敬的人喝一口後成為下一位敬酒者，依此類推。" rulesKey="toast-relay.chain-rules" />
        {chainToastDrinkResult ? (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="text-red-400 font-bold text-xl mb-4">{chainToastDrinkResult} 喝一口</p>
            {!reducedMotion && <DrinkingAnimation duration={1.2} className="my-3 mx-auto" />}
            <p className="text-white/60 text-sm mb-2">下一輪由 {toasterName} 敬酒</p>
            <button type="button" onClick={chainToastNext} className="btn-primary px-6 py-3 games-focus-ring">下一輪</button>
          </m.div>
        ) : (
          <div className="text-center">
            <p className="text-white/70 mb-2">{toasterName} 敬酒</p>
            <p className="text-white/50 text-sm mb-4">選擇要敬的人（被敬者喝一口後接棒敬下一位）</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {otherIndices.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectChainToastTarget(i)}
                  className="min-h-[48px] px-4 py-2 rounded-xl bg-white/10 hover:bg-primary-500/30 text-white font-medium games-focus-ring"
                >
                  {players[i]}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setChainToastActive(false)} className="mt-6 text-white/50 text-sm games-focus-ring">結束連環敬酒</button>
          </div>
        )}
      </div>
    )
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
      {/* R2-165：加速模式開關（僅在未開始時可切換） */}
      {chain.length === 0 && (
        <>
          <label className="flex items-center gap-2 mb-2 text-white/70 text-sm">
            <input type="checkbox" checked={speedMode} onChange={(e) => setSpeedMode(e.target.checked)} className="rounded games-focus-ring" />
            加速模式（每輪少 1 秒，超時喝）
          </label>
          {/* R2-163：連環敬酒模式 */}
          <label className="flex items-center gap-2 mb-2 text-white/70 text-sm">
            <input type="checkbox" checked={chainToastMode} onChange={(e) => setChainToastMode(e.target.checked)} className="rounded games-focus-ring" />
            連環敬酒（被敬者立即敬下一位）
          </label>
          {chainToastMode && (
            <button
              type="button"
              onClick={() => { play('click'); setChainToasterIndex(0); setChainToastDrinkResult(null); setChainToastActive(true) }}
              className="mb-4 min-h-[48px] px-6 py-2 rounded-xl bg-secondary-500 text-white font-medium games-focus-ring"
            >
              開始連環敬酒
            </button>
          )}
        </>
      )}
      {speedMode && timeLeft !== null && !loser && (
        <p className="text-amber-400 font-mono text-lg mb-1" role="timer" aria-live="polite">剩餘 {timeLeft} 秒</p>
      )}
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
          {/* 開始一輪：明確 CTA，smoke 測試與無障礙用（連環敬酒模式時不顯示） */}
          {chain.length === 0 && !chainToastMode && (
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
        <m.div
          initial={reducedMotion ? false : { scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24 }}
          className="mt-4 p-4 md:p-6 rounded-2xl bg-red-500/20 border border-red-500/50 text-center safe-area-px w-full max-w-md shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
          role="status"
          aria-live="assertive"
          data-testid="toast-relay-result"
        >
          <p className="text-red-400 font-bold text-xl md:text-2xl mb-3 games-result-text">{loser} 喝！</p>
          {!reducedMotion && <DrinkingAnimation duration={1.2} className="my-3 mx-auto" />}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <CopyResultButton text={`乾杯接力：${loser} 喝`} label="複製結果" className="games-focus-ring" />
            <button type="button" onClick={startRound} disabled={isStartPending} className="min-h-[48px] min-w-[48px] px-4 rounded-xl bg-white/10 text-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed games-focus-ring transition-transform" aria-label="再一輪">
              再一輪
            </button>
          </div>
        </m.div>
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
