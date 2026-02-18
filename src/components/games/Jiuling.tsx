'use client'

import { useState, useCallback } from 'react'
import { m } from 'framer-motion'
import { Wine, Shuffle } from 'lucide-react'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import { pickRandomJiuling, type JiulingItem } from '@/data/jiuling'
import { useGameReduceMotion } from './GameWrapper'

/** R2-176：酒令（划拳/行酒令數位化）— 隨機抽一則顯示，可再抽；簡易划拳對決 */
const FIST_OPTIONS = ['石頭', '剪刀', '布'] as const
type Fist = (typeof FIST_OPTIONS)[number]
const FIST_BEATS: Record<Fist, Fist> = { 石頭: '剪刀', 剪刀: '布', 布: '石頭' }

export default function Jiuling() {
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const [current, setCurrent] = useState<JiulingItem | null>(null)
  const [phase, setPhase] = useState<'idle' | 'show' | 'fist'>('idle')
  const [fistPlayer, setFistPlayer] = useState<Fist | null>(null)
  const [fistSystem, setFistSystem] = useState<Fist | null>(null)
  const [fistResult, setFistResult] = useState<'win' | 'lose' | 'draw' | null>(null)

  const draw = useCallback(() => {
    play('click')
    setCurrent(pickRandomJiuling())
    setPhase('show')
    setFistResult(null)
  }, [play])

  const startFist = useCallback(() => {
    play('click')
    setPhase('fist')
    setFistPlayer(null)
    setFistSystem(null)
    setFistResult(null)
  }, [play])

  const playFist = useCallback(
    (choice: Fist) => {
      if (fistPlayer != null) return
      play('click')
      const system: Fist = FIST_OPTIONS[Math.floor(Math.random() * 3)]
      setFistPlayer(choice)
      setFistSystem(system)
      const beats = FIST_BEATS[choice]
      if (choice === system) setFistResult('draw')
      else if (beats === system) setFistResult('win')
      else setFistResult('lose')
    },
    [fistPlayer, play]
  )

  const backToIdle = useCallback(() => {
    play('click')
    setPhase('idle')
    setCurrent(null)
    setFistResult(null)
  }, [play])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="酒令">
      <GameRules
        rules="抽一張酒令照著念或照做；也可用簡易划拳（石頭剪刀布）對決，輸的喝。"
        rulesKey="jiuling.rules"
      />
      <Wine className="w-12 h-12 text-primary-400 mb-4" />
      <p className="text-white/60 text-sm mb-4">酒令 · 划拳數位化</p>

      {phase === 'idle' && (
        <div className="flex flex-col gap-4">
          <button type="button" onClick={draw} className="btn-primary px-8 py-3 text-lg games-focus-ring inline-flex items-center gap-2">
            <Shuffle className="w-5 h-5" />
            抽酒令
          </button>
          <button type="button" onClick={startFist} className="btn-secondary px-8 py-3 games-focus-ring">
            划拳對決（石頭剪刀布）
          </button>
        </div>
      )}

      {phase === 'show' && current && (
        <m.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reducedMotion ? { duration: 0 } : undefined}
          className="text-center max-w-md w-full p-6 rounded-2xl bg-white/5 border border-primary-500/30"
        >
          <p className="text-2xl font-bold text-primary-300 mb-2">{current.text}</p>
          {current.hint && <p className="text-white/50 text-sm mb-4">{current.hint}</p>}
          <div className="flex gap-3 justify-center flex-wrap">
            <button type="button" onClick={draw} className="btn-primary px-6 py-2 games-focus-ring inline-flex items-center gap-2">
              <Shuffle className="w-4 h-4" />
              再抽一張
            </button>
            <button type="button" onClick={startFist} className="btn-secondary px-6 py-2 games-focus-ring">
              改划拳
            </button>
            <button type="button" onClick={backToIdle} className="text-white/50 text-sm games-focus-ring">
              返回
            </button>
          </div>
        </m.div>
      )}

      {phase === 'fist' && (
        <div className="text-center max-w-md w-full">
          {fistResult == null ? (
            <>
              <p className="text-white/60 text-sm mb-4">選一個</p>
              <div className="flex gap-3 justify-center flex-wrap">
                {FIST_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => playFist(f)}
                    className="min-h-[48px] px-6 py-2 rounded-xl bg-white/10 hover:bg-primary-500/30 text-white font-medium games-focus-ring"
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button type="button" onClick={backToIdle} className="mt-4 text-white/50 text-sm games-focus-ring">
                返回
              </button>
            </>
          ) : (
            <m.div
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : undefined}
              className="p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <p className="text-white/80">你：{fistPlayer} · 系統：{fistSystem}</p>
              <p className="text-xl font-bold mt-2">
                {fistResult === 'draw' && '平手！再來一次'}
                {fistResult === 'win' && '你贏！對方喝'}
                {fistResult === 'lose' && '你輸！你喝'}
              </p>
              <div className="flex gap-3 justify-center mt-4">
                <button type="button" onClick={startFist} className="btn-primary px-4 py-2 games-focus-ring">
                  再來一局
                </button>
                <button type="button" onClick={backToIdle} className="btn-secondary px-4 py-2 games-focus-ring">
                  返回
                </button>
              </div>
            </m.div>
          )}
        </div>
      )}
    </div>
  )
}
