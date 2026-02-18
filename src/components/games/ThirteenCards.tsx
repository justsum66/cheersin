'use client'

import { useState, useCallback, useMemo } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Layers, RotateCcw } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import { createDeck, shuffleDeck, rankLabel, suitSymbol, rowPoint, type Card } from '@/lib/deck'

/** 246–250：十三張比大小：每人 13 張排 3/5/5 墩，與系統比大小，輸的墩數對應喝酒口數 */
function rowScore(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + rowPoint(c.rank), 0)
}

export default function ThirteenCards() {
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const [deck, setDeck] = useState<Card[]>(() => shuffleDeck(createDeck()))
  const [playerHand, setPlayerHand] = useState<Card[]>([])
  const [systemHand, setSystemHand] = useState<Card[]>([])
  const [phase, setPhase] = useState<'idle' | 'dealt' | 'result'>('idle')
  const [drinks, setDrinks] = useState(0)

  const deal = useCallback(() => {
    play('click')
    const shuffled = shuffleDeck(createDeck())
    const p = shuffled.slice(0, 13)
    const s = shuffled.slice(13, 26)
    setDeck(shuffled.slice(26))
    setPlayerHand(p)
    setSystemHand(s)
    setPhase('dealt')
  }, [play])

  const playerFront = useMemo(() => playerHand.slice(0, 3), [playerHand])
  const playerMid = useMemo(() => playerHand.slice(3, 8), [playerHand])
  const playerBack = useMemo(() => playerHand.slice(8, 13), [playerHand])
  const systemFront = useMemo(() => systemHand.slice(0, 3), [systemHand])
  const systemMid = useMemo(() => systemHand.slice(3, 8), [systemHand])
  const systemBack = useMemo(() => systemHand.slice(8, 13), [systemHand])

  const compare = useCallback(() => {
    if (playerHand.length !== 13 || systemHand.length !== 13) return
    play('click')
    let lost = 0
    if (rowScore(systemFront) > rowScore(playerFront)) lost++
    if (rowScore(systemMid) > rowScore(playerMid)) lost++
    if (rowScore(systemBack) > rowScore(playerBack)) lost++
    setDrinks(lost)
    setPhase('result')
    play(lost === 0 ? 'win' : 'wrong')
    if (lost > 0 && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100])
  }, [playerHand, systemHand, systemFront, systemMid, systemBack, playerFront, playerMid, playerBack, play])

  const reset = useCallback(() => {
    setPlayerHand([])
    setSystemHand([])
    setPhase('idle')
    setDrinks(0)
  }, [])

  const renderRow = (cards: Card[], label: string, baseDelay = 0) => (
    <div className="flex flex-wrap justify-center gap-1">
      {cards.map((c, i) => (
        <m.span
          key={`${c.suit}-${c.rank}-${i}`}
          initial={reducedMotion ? false : { x: -80, y: -20, opacity: 0, scale: 0.5 }}
          animate={reducedMotion ? false : { x: 0, y: 0, opacity: 1, scale: 1 }}
          transition={reducedMotion ? { duration: 0 } : { delay: baseDelay + i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
          className="inline-flex items-center justify-center w-9 h-12 rounded-md bg-white/10 border border-white/20 text-white text-sm font-mono"
          title={`${rankLabel(c.rank)} ${c.suit}`}
        >
          {rankLabel(c.rank)}{suitSymbol(c.suit)}
        </m.span>
      ))}
      <span className="text-white/40 text-xs self-center ml-1">({label})</span>
    </div>
  )

  const rowHints = {
    front: '前墩：3 張，點數總和比大小',
    mid: '中墩：5 張，點數總和比大小',
    back: '後墩：5 張，點數總和比大小',
  }

  if (phase === 'idle') {
    return (
      <div className="h-full flex flex-col items-center justify-center py-4 px-4">
        <GameRules rules="十三張：每人發 13 張，排成 3 張／5 張／5 張三墩，與系統比大小。每墩點數高者贏，輸幾墩喝幾口。" />
        <button
          type="button"
          onClick={deal}
          className="mt-6 min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold flex items-center gap-2"
        >
          <Layers className="w-5 h-5" />
          發牌
        </button>
      </div>
    )
  }

  if (phase === 'dealt') {
    return (
      <div className="h-full flex flex-col items-center py-4 px-4 overflow-y-auto">
        <GameRules rules="十三張：上 3 張、中 5 張、下 5 張與系統比點數總和，點數高者贏該墩。" />
        <p className="text-white/50 text-sm mb-2">你的牌（3 / 5 / 5）</p>
        <div className="space-y-3 mb-4">
          {renderRow(playerFront, '前墩', 0)}
          <p className="text-white/30 text-[10px] -mt-1">{rowHints.front}</p>
          {renderRow(playerMid, '中墩', 0.4)}
          <p className="text-white/30 text-[10px] -mt-1">{rowHints.mid}</p>
          {renderRow(playerBack, '後墩', 0.9)}
          <p className="text-white/30 text-[10px] -mt-1">{rowHints.back}</p>
        </div>
        <p className="text-white/40 text-xs mb-2">系統牌</p>
        <div className="space-y-3 mb-6 opacity-80">
          {renderRow(systemFront, '', 1.5)}
          {renderRow(systemMid, '', 1.9)}
          {renderRow(systemBack, '', 2.4)}
        </div>
        <button
          type="button"
          onClick={compare}
          className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold"
        >
          比大小
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-center py-4 px-4">
      <AnimatePresence>
        <m.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={reducedMotion ? false : { opacity: 1, scale: 1 }}
          className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <p className="text-primary-400 font-bold text-lg mb-2">比完囉！</p>
          <p className="text-white/80 mb-2">你輸了 {drinks} 墩 → 喝 {drinks} 口</p>
          <p className="text-white/40 text-sm mb-3">前墩：你 {rowScore(playerFront)} vs 系統 {rowScore(systemFront)} · 中墩：你 {rowScore(playerMid)} vs 系統 {rowScore(systemMid)} · 後墩：你 {rowScore(playerBack)} vs 系統 {rowScore(systemBack)}</p>
          <CopyResultButton text={`十三張：輸 ${drinks} 墩 → 喝 ${drinks} 口`} />
        </m.div>
      </AnimatePresence>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-[48px] px-6 py-2 rounded-xl bg-white/10 text-white/80 flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        再玩一局
      </button>
    </div>
  )
}
