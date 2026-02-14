'use client'

import { useState, useCallback } from 'react'
import { m } from 'framer-motion'
import { User } from 'lucide-react'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import { pickRandomImpersonation } from '@/data/impersonation'

/** R2-166：模仿大賽 — 抽名人/角色，表演給其他人猜 */
export default function Impersonation() {
  const { play } = useGameSound()
  const [topic, setTopic] = useState<string | null>(null)
  const [phase, setPhase] = useState<'draw' | 'acting' | 'revealed'>('draw')

  const draw = useCallback(() => {
    play('click')
    setTopic(pickRandomImpersonation())
    setPhase('draw')
  }, [play])

  const startActing = useCallback(() => {
    play('click')
    setPhase('acting')
  }, [play])

  const reveal = useCallback(() => {
    play('click')
    setPhase('revealed')
  }, [play])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="模仿大賽">
      <GameRules
        rules="抽到題目後用動作或聲音模仿，讓其他人猜；猜對換人抽題，猜錯可罰喝。"
        rulesKey="impersonation.rules"
      />
      <User className="w-12 h-12 text-primary-400 mb-4" />
      <p className="text-white/60 text-sm mb-4">模仿大賽</p>

      {!topic ? (
        <button type="button" onClick={draw} className="btn-primary min-h-[48px] px-8 py-3 text-lg games-focus-ring">
          抽題目
        </button>
      ) : (
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          {phase === 'draw' && (
            <>
              <p className="text-white/70 text-sm mb-2">你的題目（表演給大家猜）：</p>
              <p className="text-2xl font-bold text-primary-300 mb-6 p-6 rounded-2xl bg-white/5 border border-primary-500/30">
                {topic}
              </p>
              <button type="button" onClick={startActing} className="btn-primary min-h-[48px] px-6 py-3 games-focus-ring">
                開始表演
              </button>
            </>
          )}
          {phase === 'acting' && (
            <>
              <p className="text-white/70 text-sm mb-2">大家猜猜看～</p>
              <p className="text-2xl font-bold text-white/50 mb-6 p-6 rounded-2xl bg-white/5 border border-white/10">
                ？？？
              </p>
              <button type="button" onClick={reveal} className="btn-primary min-h-[48px] px-6 py-3 games-focus-ring">
                揭曉答案
              </button>
            </>
          )}
          {phase === 'revealed' && (
            <>
              <p className="text-2xl font-bold text-white mb-6 p-6 rounded-2xl bg-white/5 border border-white/20">
                {topic}
              </p>
              <button type="button" onClick={draw} className="btn-primary min-h-[48px] px-6 py-3 games-focus-ring">
                再抽一題
              </button>
            </>
          )}
        </m.div>
      )}
    </div>
  )
}
