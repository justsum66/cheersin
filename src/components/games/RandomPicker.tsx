'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGameStore } from '@/store/useGameStore'
import LuckyDraw from './LuckyDraw'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']
const SPIN_MS = 1200
/** R2-089：頭像輪轉減速 — 後段 interval 漸增模擬減速停止 */
const SPIN_INTERVAL_START = 60
const SPIN_INTERVAL_END = 180

/** 隨機選一位：抽選動畫；72 點擊任意處可提前停止。73 支援選 1～3 人。R2-089 輪轉減速。 */
export default function RandomPicker() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()

  // Phase 2: Game Mode Consolidation
  const { selectedMode } = useGameStore()

  if (selectedMode === 'draw-lots') {
    return <LuckyDraw />
  }

  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [pickCount, setPickCount] = useState<1 | 2 | 3>(1)
  const [picked, setPicked] = useState<string[] | null>(null)
  const [show, setShow] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [spinIndices, setSpinIndices] = useState<number[]>([])
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const showHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const targetIndicesRef = useRef<number[]>([])
  const reducedMotion = useGameReduceMotion()

  const stopSpin = useCallback(() => {
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current)
    if (spinIntervalRef.current) clearInterval(spinIntervalRef.current)
    spinTimeoutRef.current = null
    spinIntervalRef.current = null
    setSpinning(false)
    const indices = targetIndicesRef.current
    setPicked(indices.map((i) => players[i] ?? '').filter(Boolean))
    setSpinIndices(indices)
    setShow(true)
    play('win')
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
    if (showHideTimeoutRef.current) clearTimeout(showHideTimeoutRef.current)
    showHideTimeoutRef.current = setTimeout(() => {
      showHideTimeoutRef.current = null
      setShow(false)
    }, 3500)
  }, [players, play])

  const pick = useCallback(() => {
    play('click')
    const n = Math.min(pickCount, players.length)
    const indices = new Set<number>()
    while (indices.size < n) {
      indices.add(Math.floor(Math.random() * players.length))
    }
    const arr = [...indices]
    targetIndicesRef.current = arr
    setPicked(null)
    setShow(false)
    setSpinning(true)
    const spinMs = reducedMotion ? 200 : SPIN_MS
    let tick = 0
    const startTime = Date.now()
    const scheduleTick = () => {
      const elapsed = Date.now() - startTime
      if (elapsed >= spinMs) {
        spinTimeoutRef.current = null
        setSpinning(false)
        setPicked(arr.map((i) => players[i] ?? '').filter(Boolean))
        setSpinIndices(arr)
        play('win')
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
        setShow(true)
        if (showHideTimeoutRef.current) clearTimeout(showHideTimeoutRef.current)
        showHideTimeoutRef.current = setTimeout(() => {
          showHideTimeoutRef.current = null
          setShow(false)
        }, 3500)
        return
      }
      const progress = Math.min(1, elapsed / spinMs)
      const interval = reducedMotion
        ? 40
        : SPIN_INTERVAL_START + (SPIN_INTERVAL_END - SPIN_INTERVAL_START) * Math.pow(progress, 2)
      spinTimeoutRef.current = setTimeout(() => {
        tick++
        setSpinIndices(Array.from({ length: n }, (_, i) => (tick + i) % players.length))
        scheduleTick()
      }, interval)
    }
    scheduleTick()
  }, [players, pickCount, play, reducedMotion])

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current)
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current)
      if (showHideTimeoutRef.current) clearTimeout(showHideTimeoutRef.current)
      spinTimeoutRef.current = null
      spinIntervalRef.current = null
      showHideTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!show || !picked?.length) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShow(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show, picked])

  const copyList = useCallback(() => {
    const text = players.join('、')
    try {
      navigator.clipboard.writeText(text)
    } catch {
      /* ignore */
    }
  }, [players])

  return (
    <div
      className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px cursor-default"
      onClick={() => spinning && stopSpin()}
      role="main"
      aria-label="隨機選一位"
    >
      <GameRules rules={`隨機選出目前玩家名單中的 1～3 人。\n轉動中點擊畫面可提前停止。可用於決定誰喝、誰出題等。`} />
      {!spinning && (
        <div className="flex gap-2 mb-2" role="group" aria-label="選幾人">
          {([1, 2, 3] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={(e) => { e.stopPropagation(); setPickCount(n); }}
              className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors games-focus-ring ${pickCount === n ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            >
              選{n}人
            </button>
          ))}
        </div>
      )}
      <p className="text-white/50 text-sm mb-2 text-center">隨機選{pickCount}人{spinning && '（點擊任意處停止）'}</p>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); copyList(); }}
        className="min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-sm font-medium mb-2 hover:bg-white/20 games-focus-ring"
      >
        複製名單
      </button>
      {spinning && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center mb-4 min-h-[60px] flex flex-wrap gap-2 items-center justify-center"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          {spinIndices.map((idx, i) => (
            <m.span
              key={`${i}-${idx}-${spinIndices.length}`}
              initial={{ scale: 0.6, opacity: 0.3 }}
              animate={{ scale: [0.9, 1.15, 1], opacity: [0.6, 1, 1] }}
              transition={{ duration: 0.08, repeat: Infinity, repeatType: 'reverse' }}
              className="text-xl font-bold text-primary-300 drop-shadow-lg"
            >
              {players[idx]}
            </m.span>
          ))}
        </m.div>
      )}
      <AnimatePresence mode="wait">
        {show && picked && picked.length > 0 && !spinning && (
          <m.div
            initial={{ scale: 0.3, opacity: 0, y: -50 }}
            animate={{
              scale: [0.3, 1.2, 0.95, 1],
              opacity: 1,
              y: [-50, 0, 5, 0]
            }}
            transition={{
              duration: 0.8,
              times: [0, 0.5, 0.8, 1],
              ease: [0.68, -0.55, 0.265, 1.55]
            }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="text-center mb-4"
            role="status"
            aria-live="polite"
          >
            {/* Phase 1 C2.4: 選人結果彈跳呼吸動畫 */}
            <m.div
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block px-6 py-4 rounded-2xl bg-gradient-to-r from-primary-500/30 to-accent-500/30 border-2 border-primary-500/60 shadow-[0_0_30px_rgba(139,0,0,0.4)]"
            >
              <div className="flex flex-wrap gap-2 justify-center mb-2">
                {picked.map((name, i) => (
                  <m.p
                    key={i}
                    className="text-2xl font-bold text-primary-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.15 }}
                  >
                    {name}
                  </m.p>
                ))}
              </div>
            </m.div>
            <CopyResultButton text={`隨機選${picked.length}人：${picked.join('、')}`} />
          </m.div>
        )}
      </AnimatePresence>
      <m.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={(e) => { e.stopPropagation(); if (!spinning) pick(); }}
        disabled={spinning || players.length < pickCount}
        className="min-h-[48px] min-w-[120px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-lg games-focus-ring"
        aria-label={`抽${pickCount}位`}
      >
        {spinning ? '抽籤中…（點畫面停止）' : `抽${pickCount}位`}
      </m.button>
    </div>
  )
}
