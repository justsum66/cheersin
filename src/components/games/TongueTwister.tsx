'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { m } from 'framer-motion'
import { Mic, Check, SkipForward } from 'lucide-react'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import { DrinkingAnimation } from './DrinkingAnimation'
import { useGameReduceMotion } from './GameWrapper'
import { pickRandomTongueTwister } from '@/data/tongue-twister'

/** R2-148：繞口令挑戰 — 抽題＋可選語音辨識評正確率；無權限時改為手動完成/跳過 */
export default function TongueTwister() {
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const [phrase, setPhrase] = useState<string | null>(null)
  const [phase, setPhase] = useState<'idle' | 'reciting' | 'done'>('idle')
  const [result, setResult] = useState<'correct' | 'skip' | null>(null)
  const recognitionRef = useRef<{ abort(): void; start(): void } | null>(null)

  const start = useCallback(() => {
    play('click')
    setPhrase(pickRandomTongueTwister())
    setPhase('reciting')
    setResult(null)
  }, [play])

  const handleComplete = useCallback(() => {
    play('correct')
    setResult('correct')
    setPhase('done')
  }, [play])

  const handleSkip = useCallback(() => {
    play('wrong')
    setResult('skip')
    setPhase('done')
  }, [play])

  const nextRound = useCallback(() => {
    play('click')
    setPhrase(pickRandomTongueTwister())
    setPhase('reciting')
    setResult(null)
  }, [play])

  /** 語音辨識（可選）：若瀏覽器支援且用戶允許則辨識；否則僅手動模式 */
  const startSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined' || !phrase) return
    const Win = window as Window & { SpeechRecognition?: new () => { start(): void; abort(): void; onresult: () => void; onerror: () => void; continuous: boolean; interimResults: boolean; lang: string }; webkitSpeechRecognition?: new () => { start(): void; abort(): void; onresult: () => void; onerror: () => void; continuous: boolean; interimResults: boolean; lang: string } }
    const SR = Win.SpeechRecognition ?? Win.webkitSpeechRecognition
    if (!SR) return
    try {
      const rec = new SR()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'zh-TW'
      rec.onresult = () => handleComplete()
      rec.onerror = () => { /* 權限拒絕或錯誤時不強制 */ }
      recognitionRef.current = rec
      rec.start()
    } catch {
      /* 無權限時改手動 */
    }
  }, [phrase, handleComplete])

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort()
      } catch {
        /* ignore */
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="繞口令挑戰">
      <GameRules
        rules="抽到繞口令後大聲念出來，念完按「我完成了」；念不出來可跳過（喝一口）。可選用麥克風語音辨識輔助。"
        rulesKey="tongue-twister.rules"
      />
      <Mic className="w-12 h-12 text-primary-400 mb-4" />
      <p className="text-white/60 text-sm mb-4">繞口令挑戰</p>

      {phase === 'idle' && (
        <button type="button" onClick={start} className="btn-primary min-h-[48px] px-8 py-3 text-lg games-focus-ring">
          抽題目
        </button>
      )}

      {phase === 'reciting' && phrase && (
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          <p className="text-white font-medium text-lg md:text-xl mb-6 p-4 rounded-2xl bg-white/5 border border-primary-500/30 leading-relaxed">
            {phrase}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={handleComplete} className="btn-primary min-h-[48px] px-6 py-3 games-focus-ring inline-flex items-center gap-2">
              <Check className="w-5 h-5" /> 我完成了
            </button>
            <button type="button" onClick={handleSkip} className="min-h-[48px] px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white games-focus-ring hover:bg-white/15 inline-flex items-center gap-2">
              <SkipForward className="w-5 h-5" /> 跳過（喝一口）
            </button>
            <button type="button" onClick={startSpeechRecognition} className="min-h-[48px] px-6 py-3 rounded-xl bg-accent-500/20 border border-accent-500/40 text-accent-300 games-focus-ring hover:bg-accent-500/30 inline-flex items-center gap-2 text-sm">
              <Mic className="w-5 h-5" /> 語音辨識
            </button>
          </div>
        </m.div>
      )}

      {phase === 'done' && (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          {result === 'skip' && !reducedMotion && <DrinkingAnimation duration={1.2} className="mx-auto my-3" />}
          <p className="text-white/80 mb-4">
            {result === 'correct' ? '太厲害了！' : '跳過～喝一口'}
          </p>
          <button type="button" onClick={nextRound} className="btn-primary min-h-[48px] px-6 py-3 games-focus-ring">
            再抽一題
          </button>
        </m.div>
      )}
    </div>
  )
}
