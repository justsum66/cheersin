'use client'

import { useState, useRef, useEffect } from 'react'
import { m } from 'framer-motion'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DARE_LEVELS: Record<number, string> = { 1: '輕', 2: '輕', 3: '中', 4: '中', 5: '重', 6: '重' }
const DARES: Record<string, string[]> = {
  輕: ['學狗叫三聲', '做鬼臉 10 秒', '說一個自己的糗事', '唱一句歌', '誇獎左手邊的人'],
  中: ['大冒險一題（系統隨機）', '喝半杯', '跟右手邊的人猜拳輸的喝', '模仿一位在場的人', '說一個秘密'],
  重: ['喝一杯', '大冒險一題（系統隨機）', '下一輪免喝權給別人', '真心話一題（系統隨機）', '做 5 下開合跳'],
}

/** 大冒險骰：擲 1～6 對應懲罰等級，抽一題大冒險。 */
/** Phase 1 C1.1: 增強骰子滾動物理效果 */
/** GAME-093: Custom dare bank support */
export default function DareDice() {
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const [dice, setDice] = useState<number | null>(null)
  const [dare, setDare] = useState<string | null>(null)
  const [rolling, setRolling] = useState(false)
  const [rollingValue, setRollingValue] = useState(1)
  const rollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [customDare, setCustomDare] = useState('')
  const [customDares, setCustomDares] = useState<string[]>([])
  /** GAME-094: Re-roll tracking — allow one free re-roll per round */
  const [rerollUsed, setRerollUsed] = useState(false)
  const roll = () => {
    play('click')
    setDare(null)
    setRolling(true)
    setRerollUsed(false)
    const val = Math.floor(Math.random() * 6) + 1
    const level = DARE_LEVELS[val]
    /** GAME-093: Pull from custom dare bank first, then default */
    const defaultPool = DARES[level] ?? DARES['中']
    const pool = customDares.length > 0 ? [...customDares, ...defaultPool] : defaultPool
    const chosen = pool[Math.floor(Math.random() * pool.length)]
    const durationMs = reducedMotion ? 100 : 800

    // Phase 1 C1.1: 骰子快速滾動動畫
    if (!reducedMotion) {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)
      rollIntervalRef.current = setInterval(() => {
        setRollingValue(Math.floor(Math.random() * 6) + 1)
      }, 80)
    }

    if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current)
    rollTimeoutRef.current = setTimeout(() => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)
      rollTimeoutRef.current = null
      rollIntervalRef.current = null
      setDice(val)
      setRollingValue(val)
      setDare(chosen ?? null)
      setRolling(false)
      play('wrong')
    }, durationMs)
  }

  useEffect(() => {
    return () => {
      if (rollTimeoutRef.current) {
        clearTimeout(rollTimeoutRef.current)
        rollTimeoutRef.current = null
      }
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current)
        rollIntervalRef.current = null
      }
    }
  }, [])

  const level = dice !== null ? DARE_LEVELS[dice] : null

  /** GAME-094: Re-roll animation — re-rolls the dare only (keeps dice value) */
  const reroll = () => {
    if (rerollUsed || dice === null) return
    play('click')
    setRerollUsed(true)
    setRolling(true)
    const lv = DARE_LEVELS[dice]
    const defaultPool = DARES[lv] ?? DARES['中']
    const pool = customDares.length > 0 ? [...customDares, ...defaultPool] : defaultPool
    const chosen = pool[Math.floor(Math.random() * pool.length)]
    const durationMs = reducedMotion ? 100 : 500
    if (!reducedMotion) {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)
      rollIntervalRef.current = setInterval(() => {
        setRollingValue(Math.floor(Math.random() * 6) + 1)
      }, 80)
    }
    if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current)
    rollTimeoutRef.current = setTimeout(() => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)
      rollTimeoutRef.current = null
      rollIntervalRef.current = null
      setRollingValue(dice)
      setDare(chosen ?? null)
      setRolling(false)
      play('wrong')
    }, durationMs)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="大冒險骰">
      <GameRules rules={`擲 1～6 對應懲罰等級（輕／中／重），抽一題大冒險執行。\n可約定擲到誰就誰執行。`} />
      <p className="text-white/50 text-sm mb-2">擲骰決定等級，抽一題大冒險</p>

      {/* Phase 1 C1.1: 顯示滾動中的骰子數字 */}
      {rolling && (
        <m.div
          initial={{ scale: 0 }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-4 w-24 h-24 rounded-2xl bg-primary-500/30 border-2 border-primary-500 flex items-center justify-center"
        >
          <span className="text-5xl font-bold text-white">{rollingValue}</span>
        </m.div>
      )}

      <button type="button" onClick={roll} disabled={rolling} className="btn-primary btn-press-scale min-h-[48px] px-8 games-focus-ring disabled:opacity-50" data-testid="dare-dice-roll" aria-label={rolling ? '擲骰中' : '擲骰'}>
        {rolling ? '擲骰中…' : '擲骰'}
      </button>
      {dice !== null && dare && (
        <m.div
          initial={reducedMotion ? false : { scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={reducedMotion ? { duration: 0 } : undefined}
          className="mt-4 p-4 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-center"
          role="status"
          aria-live="polite"
          data-testid="dare-dice-result"
        >
          <p className="text-amber-300 font-bold">等級：{level}（{dice} 點）</p>
          <p className="text-white font-medium mt-2">{dare}</p>
          <CopyResultButton text={`大冒險骰：${level} － ${dare}`} label="複製結果" className="mt-2 games-focus-ring" />
          {/** GAME-094: Re-roll button with spin animation */}
          {!rerollUsed && (
            <button
              type="button"
              onClick={reroll}
              disabled={rolling}
              className="mt-2 px-4 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white/70 text-sm games-focus-ring hover:bg-white/20 disabled:opacity-50"
            >
              🔄 重抽一次（免費）
            </button>
          )}
          {rerollUsed && (
            <p className="mt-1 text-white/30 text-xs">已使用重抽機會</p>
          )}
        </m.div>
      )}
    </div>
  )
}
