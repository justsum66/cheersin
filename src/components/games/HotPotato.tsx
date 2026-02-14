'use client'

import { useState, useRef, useEffect } from 'react'
import { m } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { DrinkingAnimation } from './DrinkingAnimation'
import { usePunishment } from './Punishments/PunishmentContext'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']
const MIN_SEC = 3
const MAX_SEC = 10

/** P1-129：圓形計時器半徑與線寬（視覺化倒數） */
const TIMER_R = 56
const TIMER_STROKE = 6

/** 熱土豆：隨機倒數 3～10 秒，0 秒時拿著的人喝。傳給下一位後重新倒數。 */
export default function HotPotato() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const punishment = usePunishment()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [holderIndex, setHolderIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  /** P1-129：本輪總秒數，用於圓形進度計算 */
  const [roundTotalSec, setRoundTotalSec] = useState(MAX_SEC)
  const [loser, setLoser] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRound = () => {
    play('click')
    setLoser(null)
    const sec = MIN_SEC + Math.floor(Math.random() * (MAX_SEC - MIN_SEC + 1))
    setRoundTotalSec(sec)
    setSecondsLeft(sec)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null) return null
        if (s <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return s === 1 ? 0 : null
        }
        return s - 1
      })
    }, 1000)
  }

  const passToNext = () => {
    play('click')
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setSecondsLeft(null)
    setHolderIndex((i) => (i + 1) % players.length)
  }

  useEffect(() => {
    if (secondsLeft !== 0) return
    const who = players[holderIndex]
    setLoser(who ?? null)
    setSecondsLeft(null)
    play('wrong')
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
  }, [secondsLeft, holderIndex, players, play])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!loser) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLoser(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loser])

  const holderName = players[holderIndex]

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="熱土豆">
      <GameRules rules={`隨機 3～10 秒倒數，傳給下一位；0 秒時拿著的人喝。\n點「傳給下一位」後重新開始倒數。`} />
      <p className="text-white/50 text-sm mb-2">倒數傳手機，0 秒時拿著的人喝</p>
      {/* P1-129：計時器視覺化 — 圓形進度條 + 數字，最後 3 秒變紅 */}
      {secondsLeft !== null && (
        <m.div
          className="mb-4 relative inline-flex items-center justify-center"
          animate={secondsLeft <= 3 ? {
            scale: [1, 1.05, 1],
            rotate: [0, -3, 3, 0]
          } : {}}
          transition={{ duration: 0.5, repeat: secondsLeft <= 3 ? Infinity : 0 }}
        >
          {/* 圓形進度：剩餘比例 = secondsLeft / roundTotalSec，stroke-dashoffset 從滿到空 */}
          {!reducedMotion && (
            <svg className="absolute w-[132px] h-[132px] -rotate-90" aria-hidden>
              <circle
                cx={TIMER_R + TIMER_STROKE}
                cy={TIMER_R + TIMER_STROKE}
                r={TIMER_R}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={TIMER_STROKE}
              />
              <circle
                cx={TIMER_R + TIMER_STROKE}
                cy={TIMER_R + TIMER_STROKE}
                r={TIMER_R}
                fill="none"
                stroke={secondsLeft <= 3 ? 'rgb(239, 68, 68)' : 'rgb(var(--primary))'}
                strokeWidth={TIMER_STROKE}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * TIMER_R}
                strokeDashoffset={2 * Math.PI * TIMER_R * (1 - secondsLeft / roundTotalSec)}
                className="transition-[stroke-dashoffset] duration-1000"
              />
            </svg>
          )}
          <m.p
            className={`relative z-10 text-6xl font-mono font-bold mb-2 ${
              secondsLeft <= 3 ? 'text-red-400' : 'text-primary-300'
            }`}
            role="status"
            aria-live="polite"
            animate={secondsLeft <= 3 ? {
              textShadow: [
                '0 0 0px rgba(239, 68, 68, 0)',
                '0 0 20px rgba(239, 68, 68, 0.8)',
                '0 0 40px rgba(239, 68, 68, 0.6)',
                '0 0 0px rgba(239, 68, 68, 0)'
              ]
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              filter: secondsLeft <= 3 ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))' : 'none'
            }}
          >
            {secondsLeft}
          </m.p>
          {secondsLeft <= 3 && (
            <m.p
              className="relative z-10 text-red-400 text-sm font-bold uppercase tracking-wider mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: [0.5, 1, 0.5], y: 0 }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              危險！
            </m.p>
          )}
        </m.div>
      )}
      <p className="text-white/70 text-lg mb-4" aria-live="polite">目前持有：{holderName}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {secondsLeft === null && (
          <button type="button" onClick={startRound} className="btn-primary min-h-[48px] px-6 games-focus-ring" data-testid="hot-potato-start" aria-label="開始倒數">
            開始倒數
          </button>
        )}
        {secondsLeft !== null && (
          <button type="button" onClick={passToNext} className="min-h-[48px] px-6 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white games-focus-ring" data-testid="hot-potato-pass" aria-label="傳給下一位">
            傳給下一位
          </button>
        )}
      </div>
      {loser && (
        <m.div
          initial={reducedMotion ? false : { scale: 0.3, rotate: -15, y: -50 }}
          animate={{ 
            scale: [0.3, 1.3, 0.95, 1],
            rotate: [-15, 10, -5, 0],
            y: [-50, 0, 5, 0]
          }}
          transition={reducedMotion ? { duration: 0 } : {
            duration: 0.8,
            times: [0, 0.5, 0.8, 1],
            ease: [0.68, -0.55, 0.265, 1.55]
          }}
          className="mt-4 p-6 rounded-2xl bg-red-500/20 border-2 border-red-500/50 text-center shadow-[0_0_40px_rgba(239,68,68,0.4)]"
          role="status"
          aria-live="assertive"
          data-testid="hot-potato-result"
        >
          {/* Phase 1 C4.1: 爆炸效果 */}
          <m.div
            animate={{
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <m.p 
              className="text-red-400 font-bold text-3xl mb-2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              💥 {loser} 喝！
            </m.p>
          </m.div>
          {!reducedMotion && <DrinkingAnimation duration={1.2} className="my-3 mx-auto" />}
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            <CopyResultButton text={`熱土豆：${loser} 喝`} label="複製結果" className="games-focus-ring" />
            {punishment && (
              <button
                type="button"
                onClick={() => {
                  const idx = players.indexOf(loser)
                  if (idx >= 0) punishment.requestWheel(idx, loser)
                }}
                className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-primary-500/30 hover:bg-primary-500/50 border border-primary-500/40 text-primary-200 text-sm font-medium games-focus-ring"
                aria-label="轉懲罰輪盤"
              >
                轉懲罰輪盤
              </button>
            )}
          </div>
        </m.div>
      )}
    </div>
  )
}
