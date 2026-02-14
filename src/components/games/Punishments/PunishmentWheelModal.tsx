'use client'

/**
 * P0-005：從遊戲失敗流程觸發的懲罰輪盤 Modal — 指定輸家後轉動輪盤，記錄懲罰並關閉
 */

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { m } from 'framer-motion'
import { usePunishment } from './PunishmentContext'
import { useGameReduceMotion } from '../GameWrapper'
import { useGameSound } from '@/hooks/useGameSound'
import type { PunishmentItem } from './types'
import { PUNISHMENT_LEVEL_LABEL } from './types'
import { SUPER_PUNISHMENTS } from './presets'

const SPIN_DURATION_MS = 2800
const SEGMENT_COUNT = 12

const LEVEL_COLORS: Record<PunishmentItem['level'], string> = {
  light: 'rgba(74,222,128,0.9)',
  medium: 'rgba(250,204,21,0.9)',
  heavy: 'rgba(239,68,68,0.9)',
  super: 'rgba(168,85,247,0.9)',
  group: 'rgba(59,130,246,0.9)',
}

interface PunishmentWheelModalProps {
  playerIndex: number
  playerName: string
  onClose: () => void
}

export function PunishmentWheelModal({ playerIndex, playerName, onClose }: PunishmentWheelModalProps) {
  const punishment = usePunishment()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const [phase, setPhase] = useState<'pick' | 'spin' | 'result'>('pick')
  const [result, setResult] = useState<PunishmentItem | null>(null)
  const [useExemption, setUseExemption] = useState(false)
  const rotationRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const rawItems = punishment?.items ?? []
  const items = punishment?.filterMode === 'nonAlcohol'
    ? rawItems.filter((i) => i.id.startsWith('na'))
    : rawItems
  const segmentItems = useMemo(() => {
    if (items.length === 0) return []
    const out: PunishmentItem[] = []
    for (let i = 0; i < SEGMENT_COUNT; i++) out.push(items[i % items.length])
    return out
  }, [items])

  const wheelGradient = useMemo(() => {
    if (segmentItems.length === 0) return 'conic-gradient(#333 0deg 360deg)'
    const step = 360 / SEGMENT_COUNT
    const parts = segmentItems.map((item, i) => {
      const start = i * step
      const end = start + step
      const color = LEVEL_COLORS[item.level] ?? 'rgba(255,255,255,0.3)'
      return `${color} ${start}deg ${end}deg`
    })
    return `conic-gradient(${parts.join(', ')})`
  }, [segmentItems])

  const spin = useCallback(() => {
    if (segmentItems.length === 0 || !punishment) return
    play('click')
    setPhase('spin')
    setResult(null)
    const segmentAngle = 360 / SEGMENT_COUNT
    const winnerSegment = Math.floor(Math.random() * SEGMENT_COUNT)
    const fullTurns = 5 + Math.floor(Math.random() * 2)
    const toSegment = 360 - winnerSegment * segmentAngle - segmentAngle / 2
    const addDeg = 360 * fullTurns + toSegment
    rotationRef.current += addDeg
    const useSuper = punishment.shouldTriggerSuper(playerIndex) && SUPER_PUNISHMENTS.length > 0
    const chosen = useSuper
      ? SUPER_PUNISHMENTS[Math.floor(Math.random() * SUPER_PUNISHMENTS.length)]
      : segmentItems[winnerSegment]
    const duration = reducedMotion ? 100 : SPIN_DURATION_MS
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null
      play('wrong')
      setResult(chosen)
      setPhase('result')
      punishment.recordPunishment(playerIndex, playerName, chosen, false, useExemption)
      if (useSuper) punishment.resetFailCount(playerIndex)
    }, duration)
  }, [segmentItems, punishment, playerIndex, playerName, useExemption, reducedMotion, play])

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  /** A11Y-006：Esc 關閉懲罰輪盤 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleDone = useCallback(() => {
    onClose()
  }, [onClose])

  if (!punishment) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="懲罰輪盤"
    >
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-[#0a0a1a] border border-white/10 p-6 max-w-sm w-full shadow-xl"
      >
        <p className="text-white/70 text-sm mb-2 text-center">本輪輸家</p>
        <p className="text-lg font-bold text-primary-300 text-center mb-4">{playerName}</p>

        {phase === 'pick' && (
          <>
            <label className="flex items-center gap-2 mb-4 text-white/70 text-sm">
              <input
                type="checkbox"
                checked={useExemption}
                onChange={(e) => setUseExemption(e.target.checked)}
                className="rounded"
              />
              使用豁免券跳過
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 min-h-[48px] rounded-xl bg-white/10 text-white/80 games-focus-ring">
                取消
              </button>
              <button type="button" onClick={spin} className="flex-1 btn-primary min-h-[48px] rounded-xl games-focus-ring">
                轉動轉盤
              </button>
            </div>
          </>
        )}

        {phase === 'spin' && (
          <div className="w-full max-w-[240px] mx-auto aspect-square rounded-full border-4 border-white/20 overflow-hidden bg-white/5 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-white" aria-hidden />
            {/* R2-041：轉盤旋轉使用 spring 過渡，減速更自然 */}
            <m.div
              className="w-full h-full rounded-full"
              style={{ background: wheelGradient }}
              initial={{ rotate: 0 }}
              animate={{ rotate: rotationRef.current }}
              transition={reducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 25, damping: 22, mass: 1.2 }}
            />
          </div>
        )}

        {phase === 'result' && result && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="text-white/60 text-sm mb-1">懲罰</p>
            <p className="text-xl font-bold text-red-300 mb-1">{result.text}</p>
            <p className="text-white/50 text-xs mb-4">{PUNISHMENT_LEVEL_LABEL[result.level]}</p>
            <button type="button" onClick={handleDone} className="btn-primary w-full min-h-[48px] rounded-xl games-focus-ring">
              我完成了
            </button>
          </m.div>
        )}
      </m.div>
    </div>
  )
}
