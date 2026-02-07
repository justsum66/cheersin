'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']
const BPM_OPTIONS = [60, 90, 120] as const
/** 回合數選項：每輪幾拍 */
const BEAT_COUNT_OPTIONS = [3, 5, 7] as const

/** 酒令拳：跟節奏出拳，脫拍或猜錯喝。 */
export default function RhythmGuess() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [bpm, setBpm] = useState<number>(60)
  const [beatCount, setBeatCount] = useState<number>(5)
  const [phase, setPhase] = useState<'idle' | 'beat' | 'result'>('idle')
  const [beatIndex, setBeatIndex] = useState(0)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tapTimeRef = useRef<number[]>([])
  const [isStartPending, setIsStartPending] = useState(false)
  const [isNextPending, setIsNextPending] = useState(false)
  const startCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nextCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startRound = () => {
    if (isStartPending) return
    setIsStartPending(true)
    if (startCooldownRef.current) clearTimeout(startCooldownRef.current)
    startCooldownRef.current = setTimeout(() => {
      startCooldownRef.current = null
      setIsStartPending(false)
    }, 400)
    play('click')
    setPhase('beat')
    setBeatIndex(0)
    setResult(null)
    tapTimeRef.current = []
    if (intervalRef.current) clearInterval(intervalRef.current)
    const msPerBeat = 60000 / bpm
    const durationMs = reducedMotion ? 500 : msPerBeat
    intervalRef.current = setInterval(() => {
      setBeatIndex((i) => {
        if (i + 1 >= beatCount) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          setPhase('result')
          const taps = tapTimeRef.current
          const ok = taps.length >= beatCount - 1
          setResult(ok ? 'win' : 'lose')
          if (!ok) {
            play('wrong')
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
          } else play('win')
          return i
        }
        return i + 1
      })
    }, durationMs)
  }

  const handleTap = () => {
    if (phase !== 'beat') return
    play('click')
    tapTimeRef.current = [...tapTimeRef.current, Date.now()]
  }

  const nextPlayer = () => {
    if (isNextPending) return
    setIsNextPending(true)
    if (nextCooldownRef.current) clearTimeout(nextCooldownRef.current)
    nextCooldownRef.current = setTimeout(() => {
      nextCooldownRef.current = null
      setIsNextPending(false)
    }, 400)
    setResult(null)
    setPhase('idle')
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (startCooldownRef.current) clearTimeout(startCooldownRef.current)
      if (nextCooldownRef.current) clearTimeout(nextCooldownRef.current)
    }
  }, [])

  /** G-RhythmGuess-79：空狀態無玩家時不崩潰（邊界） */
  const currentPlayer = players.length > 0 ? players[currentPlayerIndex % players.length] : '—'

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="酒令拳">
      <GameRules rules={`跟節奏出拳（點擊），每輪可選 3/5/7 拍；脫拍或漏拍喝。\n可約定 BPM 或回合數。`} rulesKey="rhythm-guess.rules" />
      {phase === 'idle' && (
        <>
          {/* G3D-RhythmGuess-02/08：BPM/回合選項區 3D 或精緻選單 */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 w-full max-w-lg justify-center" role="group" aria-label="節拍 BPM">
            <label htmlFor="rhythm-guess-bpm" className="text-white/70 text-sm">BPM</label>
            <select
              id="rhythm-guess-bpm"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="min-h-[48px] min-w-[48px] px-3 rounded-xl bg-white/10 border border-white/20 text-white games-focus-ring shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
              data-testid="rhythm-guess-bpm"
              aria-label="節拍 BPM"
            >
              {BPM_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 w-full max-w-lg justify-center" role="group" aria-label="回合數">
            <span className="text-white/70 text-sm w-full text-center sm:w-auto">回合</span>
            {BEAT_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setBeatCount(n)}
                aria-pressed={beatCount === n}
                aria-label={`${n} 拍`}
                className={`min-h-[48px] min-w-[48px] rounded-xl text-sm font-medium games-focus-ring transition-transform hover:scale-[1.02] active:scale-[0.98] ${beatCount === n ? 'bg-primary-500 text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                data-testid={`rhythm-guess-beats-${n}`}
              >
                {n}
              </button>
            ))}
          </div>
        </>
      )}
      {/* G3D-RhythmGuess-03：拍點 x/總數、輪到誰排版精緻化 */}
      <p className="text-white/70 text-base sm:text-lg mb-4 max-w-full px-2 games-helper" aria-live="polite">輪到：<span className="tabular-nums truncate inline-block max-w-[14rem] sm:max-w-none align-bottom" title={currentPlayer}>{currentPlayer}</span></p>
      {phase === 'idle' && (
        <button
          type="button"
          onClick={startRound}
          disabled={isStartPending}
          className="btn-primary min-h-[48px] min-w-[48px] px-6 sm:px-8 disabled:opacity-60 disabled:cursor-not-allowed games-focus-ring hover:scale-[1.02] active:scale-[0.98] transition-transform"
          data-testid="rhythm-guess-start"
          aria-label="開始一輪"
        >
          開始節奏
        </button>
      )}
      {/* G3D-RhythmGuess-01：節奏按鈕 3D 立體、拍點按下動效 */}
      {phase === 'beat' && (
        <motion.button
          type="button"
          onClick={handleTap}
          className="min-h-[64px] min-w-[64px] sm:min-h-[80px] sm:min-w-[80px] rounded-full bg-primary-500 text-white text-xl sm:text-2xl font-bold games-focus-ring shadow-[0_6px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
          data-testid="rhythm-guess-tap"
          aria-label={`第 ${beatIndex + 1} 拍，共 ${beatCount} 拍，點擊`}
          whileTap={reducedMotion ? undefined : { scale: 0.95 }}
        >
          <span className="tabular-nums">{beatIndex + 1} / {beatCount}</span>
        </motion.button>
      )}
      {/* G3D-RhythmGuess-04/579：結果區贏/喝 3D 或動效強調 */}
      {phase === 'result' && result && (
        <motion.div
          initial={reducedMotion ? false : { scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24 }}
          className="mt-4 p-4 rounded-2xl text-center w-full max-w-md shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-white/10 bg-white/5"
          role="status"
          aria-live="assertive"
          data-testid="rhythm-guess-result"
        >
          <p className={`font-bold text-lg sm:text-xl games-result-text ${result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
            {result === 'win' ? '跟上了！' : '脫拍，喝！'}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 md:gap-4 mt-2">
            <CopyResultButton
              text={`酒令拳：${currentPlayer} ${result === 'win' ? '跟上' : '喝'}`}
              label="複製結果"
              className="games-focus-ring"
            />
            <button type="button" onClick={nextPlayer} disabled={isNextPending} className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 text-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed games-focus-ring transition-transform" aria-label="下一位">
              下一位
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
