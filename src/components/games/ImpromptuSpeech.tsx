'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { m } from 'framer-motion'
import { Mic, SkipForward } from 'lucide-react'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import { pickRandomImpromptuTopic } from '@/data/impromptu-speech'

const COUNTDOWN_SEC = 30

/** R2-170：即興演講 — 隨機抽題＋倒數計時，時間到或跳過則下一位/喝 */
export default function ImpromptuSpeech() {
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const [topic, setTopic] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [phase, setPhase] = useState<'idle' | 'speaking'>('idle')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    play('click')
    setTopic(pickRandomImpromptuTopic())
    setSecondsLeft(COUNTDOWN_SEC)
    setPhase('speaking')
  }, [play])

  const skip = useCallback(() => {
    play('click')
    setTopic(null)
    setSecondsLeft(null)
    setPhase('idle')
  }, [play])

  useEffect(() => {
    if (phase !== 'speaking' || secondsLeft == null) return
    if (secondsLeft <= 0) {
      play('wrong')
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
      setSecondsLeft(null)
      return
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s == null || s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = null
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [phase, secondsLeft, play])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="即興演講">
      <GameRules
        rules="抽到題目後開始計時（如 30 秒），時間內盡情發揮；時間到或選擇跳過則換下一位或喝一口。"
        rulesKey="impromptu-speech.rules"
      />
      <Mic className="w-12 h-12 text-primary-400 mb-4" />
      <p className="text-white/60 text-sm mb-4">即興演講</p>

      {phase === 'idle' && (
        <button
          type="button"
          onClick={start}
          className="btn-primary min-h-[48px] px-8 py-3 text-lg games-focus-ring"
        >
          抽題目
        </button>
      )}

      {phase === 'speaking' && topic && (
        <m.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reducedMotion ? { duration: 0 } : undefined}
          className="w-full max-w-lg text-center"
        >
          <p className="text-white font-medium text-lg mb-4 p-4 rounded-2xl bg-white/5 border border-primary-500/30">
            {topic}
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-3xl font-mono font-bold text-primary-300 tabular-nums">
              {secondsLeft != null ? secondsLeft : 0}
            </span>
            <span className="text-white/60">秒</span>
          </div>
          {secondsLeft === 0 && (
            <p className="text-red-300 font-medium mb-4">時間到！換下一位或喝一口</p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={start}
              className="btn-primary px-6 py-2 games-focus-ring inline-flex items-center gap-2"
            >
              下一題
            </button>
            <button
              type="button"
              onClick={skip}
              className="btn-secondary px-6 py-2 games-focus-ring inline-flex items-center gap-2"
            >
              <SkipForward className="w-4 h-4" />
              跳過／換人
            </button>
          </div>
        </m.div>
      )}
    </div>
  )
}
