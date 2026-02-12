'use client'

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGamesPlayers } from '../GamesContext'
import { useGameReduceMotion } from '../GameWrapper'
import { useGameSound } from '@/hooks/useGameSound'
import { usePunishment } from './PunishmentContext'
import GameRules from '../GameRules'
import CopyResultButton from '../CopyResultButton'
import PunishmentEffect from './PunishmentEffect'
import PunishmentLeaderboard from './PunishmentLeaderboard'
import PunishmentHistory from './PunishmentHistory'
import type { PunishmentItem } from './types'
import { PUNISHMENT_LEVEL_LABEL } from './types'
import { SUPER_PUNISHMENTS } from './presets'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']
const SPIN_DURATION_MS = 2800
const SEGMENT_COUNT = 12

const LEVEL_COLORS: Record<PunishmentItem['level'], string> = {
  light: 'rgba(74,222,128,0.9)',
  medium: 'rgba(250,204,21,0.9)',
  heavy: 'rgba(239,68,68,0.9)',
  super: 'rgba(168,85,247,0.9)',
  group: 'rgba(59,130,246,0.9)',
}

/** 懲罰轉盤：輸家轉動輪盤，隨機得到懲罰；支援等級、超級懲罰、豁免券、特效 */
export default function PunishmentWheel() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const punishment = usePunishment()
  const [phase, setPhase] = useState<'idle' | 'pick' | 'spin' | 'result'>('idle')
  const [loserIndex, setLoserIndex] = useState<number | null>(null)
  const [result, setResult] = useState<PunishmentItem | null>(null)
  const [effectActive, setEffectActive] = useState(false)
  const [useExemptionNext, setUseExemptionNext] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [customText, setCustomText] = useState('')
  const [customLevel, setCustomLevel] = useState<PunishmentItem['level']>('medium')
  /** 96-100 完成確認：玩家點「我完成了」才可進入下一輪 */
  const [resultConfirmed, setResultConfirmed] = useState(false)
  const rotationRef = useRef(0)
  const spinResultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** AUDIT #26：遊戲內「簡化動畫」即時反映 */
  const reducedMotion = useGameReduceMotion()

  /** Q3：全部｜只看非酒精（非酒精項目 id 以 na 開頭） */
  const rawItems = punishment?.items ?? []
  const items = punishment?.filterMode === 'nonAlcohol'
    ? rawItems.filter((i) => i.id.startsWith('na'))
    : rawItems
  const segmentItems = useMemo(() => {
    if (items.length === 0) return []
    const out: PunishmentItem[] = []
    for (let i = 0; i < SEGMENT_COUNT; i++) {
      out.push(items[i % items.length])
    }
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

  const superItems = SUPER_PUNISHMENTS

  const spin = useCallback(() => {
    if (loserIndex == null || segmentItems.length === 0 || !punishment) return
    play('click')
    setPhase('spin')
    setResult(null)
    const segmentAngle = 360 / SEGMENT_COUNT
    const winnerSegment = Math.floor(Math.random() * SEGMENT_COUNT)
    const fullTurns = 5 + Math.floor(Math.random() * 2)
    const toSegment = 360 - winnerSegment * segmentAngle - segmentAngle / 2
    const addDeg = 360 * fullTurns + toSegment
    const targetRot = rotationRef.current + addDeg
    rotationRef.current = targetRot
    const useSuper = punishment.shouldTriggerSuper(loserIndex) && superItems.length > 0
    const chosen = useSuper
      ? superItems[Math.floor(Math.random() * superItems.length)]
      : segmentItems[winnerSegment]
    const duration = reducedMotion ? 100 : SPIN_DURATION_MS
    if (spinResultTimeoutRef.current) clearTimeout(spinResultTimeoutRef.current)
    spinResultTimeoutRef.current = setTimeout(() => {
      spinResultTimeoutRef.current = null
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100])
      setResult(chosen)
      setResultConfirmed(false)
      setPhase('result')
      const playerName = players[loserIndex]
      const actuallyPunished = punishment.recordPunishment(loserIndex, playerName, chosen, false, useExemptionNext)
      setEffectActive(actuallyPunished)
      if (useSuper) punishment.resetFailCount(loserIndex)
    }, duration)
  }, [loserIndex, segmentItems, punishment, players, useExemptionNext, reducedMotion, play, superItems])

  useEffect(() => {
    return () => {
      if (spinResultTimeoutRef.current) {
        clearTimeout(spinResultTimeoutRef.current)
        spinResultTimeoutRef.current = null
      }
    }
  }, [])

  const handleEffectComplete = useCallback(() => {
    setEffectActive(false)
  }, [])

  const nextRound = useCallback(() => {
    setLoserIndex(null)
    setResult(null)
    setResultConfirmed(false)
    setPhase('idle')
  }, [])

  const confirmDone = useCallback(() => {
    setResultConfirmed(true)
  }, [])

  const addCustom = useCallback(() => {
    const t = customText.trim()
    if (!t || !punishment) return
    punishment.addCustomPunishment(t, customLevel)
    setCustomText('')
  }, [customText, customLevel, punishment])

  const triggerGroupPunishment = useCallback(() => {
    if (!punishment || items.length === 0) return
    const groupItem = items.find((i) => i.level === 'group') ?? items[0]
    punishment.recordPunishment(0, players[0], groupItem, true)
    setEffectActive(true)
  }, [punishment, items, players])

  const triggerSuper = loserIndex != null && punishment?.shouldTriggerSuper(loserIndex)

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4">
      <GameRules
        rules={`選出本輪「輸家」，轉動懲罰轉盤隨機得到懲罰。\n輕度：喝一口／喝飲料／伏地挺身；中度：乾杯／表演；重度：連喝三杯 + 表演。\n預設含非酒精選項，可自訂項目（喝飲料、做伏地挺身等）。累積失敗次數可觸發超級懲罰。有豁免券可跳過一次。`}
      />
      <p className="text-white/50 text-sm mb-2 text-center">懲罰轉盤</p>

      {/* Q3：全部｜只看非酒精篩選 */}
      {punishment && (
        <div className="flex gap-2 justify-center mb-4" role="group" aria-label="懲罰選項篩選">
          <button
            type="button"
            onClick={() => punishment.setFilterMode('all')}
            className={`min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl text-sm font-medium transition-colors games-focus-ring ${punishment.filterMode === 'all' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'}`}
            aria-pressed={punishment.filterMode === 'all'}
            aria-label="全部懲罰選項"
          >
            全部
          </button>
          <button
            type="button"
            onClick={() => punishment.setFilterMode('nonAlcohol')}
            className={`min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl text-sm font-medium transition-colors games-focus-ring ${punishment.filterMode === 'nonAlcohol' ? 'bg-accent-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'}`}
            aria-pressed={punishment.filterMode === 'nonAlcohol'}
            aria-label="只看非酒精選項"
          >
            只看非酒精
          </button>
        </div>
      )}

      {phase === 'idle' && (
        <>
          <p className="text-white/70 mb-4">選出本輪輸家</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {players.map((name, i) => (
              <button
                key={i}
                type="button"
                className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 hover:bg-primary-500/30 text-white text-sm font-medium games-focus-ring"
                onClick={() => {
                  play('click')
                  setLoserIndex(i)
                  setPhase('pick')
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === 'pick' && loserIndex != null && (
        <>
          <p className="text-white/70 mb-2">輸家：<span className="font-bold text-primary-300">{players[loserIndex]}</span></p>
          <label className="flex items-center gap-2 mb-4 text-white/70 text-sm">
            <input
              type="checkbox"
              checked={useExemptionNext}
              onChange={(e) => setUseExemptionNext(e.target.checked)}
              className="rounded"
            />
            使用豁免券跳過（有券時生效）
          </label>
          {triggerSuper && (
            <p className="text-red-400/90 text-sm mb-2">累積失敗達標，可觸發超級懲罰！</p>
          )}
          {/* A11Y-017：可 Tab 聚焦，Enter/Space 觸發轉盤 */}
          <button
            type="button"
            className="btn-primary min-h-[48px] min-w-[48px] px-8 py-3 rounded-xl games-focus-ring"
            onClick={spin}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); spin() } }}
            aria-label="轉動懲罰轉盤"
          >
            轉動轉盤
          </button>
        </>
      )}

      {phase === 'spin' && (
        <div className="w-full max-w-[280px] aspect-square rounded-full border-4 border-white/20 overflow-hidden bg-white/5 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-white" aria-hidden />
          <motion.div
            className="w-full h-full rounded-full"
            style={{ background: wheelGradient }}
            initial={{ rotate: 0 }}
            animate={{ rotate: rotationRef.current }}
            transition={{ duration: reducedMotion ? 0.1 : SPIN_DURATION_MS / 1000, ease: 'easeOut' }}
          />
        </div>
      )}

      {phase === 'result' && result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <p className="text-white/70 mb-1">懲罰：</p>
          <p className="text-xl font-bold text-red-300 mb-2">{result.text}</p>
          <p className="text-white/50 text-sm mb-4">{PUNISHMENT_LEVEL_LABEL[result.level]}</p>
          {loserIndex != null && (
            <CopyResultButton
              text={`懲罰轉盤：${players[loserIndex]} → ${result.text}`}
              className="mb-4"
            />
          )}
          {loserIndex != null && punishment?.shouldTriggerSuper(loserIndex) && (
            <p className="text-white/50 text-xs mb-2">已觸發超級懲罰，失敗次數已重置</p>
          )}
          {!resultConfirmed ? (
            <button
              type="button"
              className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white font-bold games-focus-ring"
              onClick={confirmDone}
            >
              我完成了
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl games-focus-ring"
              onClick={nextRound}
            >
              下一輪
            </button>
          )}
        </motion.div>
      )}

      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 text-white text-sm games-focus-ring"
          onClick={() => setShowLeaderboard((s) => !s)}
        >
          懲罰排行榜
        </button>
        <button
          type="button"
          className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-green-500/20 text-green-300 text-sm games-focus-ring"
          onClick={() => {
            players.forEach((_, i) => punishment?.addExemptionTicket(i, 1))
          }}
        >
          每人發 1 張豁免券
        </button>
        <button
          type="button"
          className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 text-white text-sm games-focus-ring"
          onClick={() => setShowHistory((s) => !s)}
        >
          懲罰歷史
        </button>
        <button
          type="button"
          className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-blue-500/30 text-blue-200 text-sm games-focus-ring"
          onClick={triggerGroupPunishment}
        >
          團體懲罰（全場喝）
        </button>
      </div>
      {showLeaderboard && (
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 max-w-xs">
          <PunishmentLeaderboard maxItems={10} />
        </div>
      )}
      {showHistory && (
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 max-w-md">
          <PunishmentHistory maxItems={20} />
        </div>
      )}
      <div className="mt-4 w-full max-w-md">
        <p className="text-white/50 text-xs mb-2">自訂懲罰</p>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="輸入懲罰內容"
            className="flex-1 min-h-[48px] px-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm"
          />
          <select
            value={customLevel}
            onChange={(e) => setCustomLevel(e.target.value as PunishmentItem['level'])}
            className="min-h-[48px] px-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
          >
            <option value="light">輕度</option>
            <option value="medium">中度</option>
            <option value="heavy">重度</option>
            <option value="super">超級</option>
            <option value="group">團體</option>
          </select>
          <button
            type="button"
            className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-lg bg-white/10 text-white text-sm games-focus-ring"
            onClick={addCustom}
          >
            新增
          </button>
        </div>
      </div>

      <PunishmentEffect
        active={effectActive}
        text={result?.text}
        onComplete={handleEffectComplete}
      />
    </div>
  )
}
