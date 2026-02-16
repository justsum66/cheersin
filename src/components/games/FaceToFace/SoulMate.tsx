'use client'

/**
 * G2.11-G2.12：心有靈犀 - 兩人同時從選項中選一個，選一樣則安全，不一樣則喝
 */
import { useState, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useGamesPlayers } from '@/components/games/GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from '@/components/games/GameRules'
import CopyResultButton from '@/components/games/CopyResultButton'
import { DrinkingAnimation } from '@/components/games/DrinkingAnimation'
import { useGameReduceMotion } from '@/components/games/GameWrapper'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2']

const SOUL_MATE_QUESTIONS: { q: string; options: string[] }[] = [
  { q: '現在最想選哪個？', options: ['左', '右', '上', '下'] },
  { q: '最喜歡的顏色？', options: ['紅', '藍', '綠', '黑'] },
  { q: '最喜歡的季節？', options: ['春', '夏', '秋', '冬'] },
  { q: '最想去的國家？', options: ['日本', '歐洲', '美國', '海島'] },
  { q: '最喜歡的飲料？', options: ['咖啡', '茶', '果汁', '酒'] },
  { q: '週末最想做？', options: ['宅在家', '出門玩', '運動', '睡覺'] },
  { q: '最喜歡的動物？', options: ['狗', '貓', '兔', '鳥'] },
  { q: '壓力大時會？', options: ['吃', '睡', '運動', '追劇'] },
  { q: '選一個數字？', options: ['1', '3', '7', '9'] },
  { q: '最喜歡的甜點？', options: ['蛋糕', '冰淇淋', '巧克力', '布丁'] },
]

export default function SoulMate() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [phase, setPhase] = useState<'idle' | 'pick' | 'result'>('idle')
  const [currentQ, setCurrentQ] = useState<typeof SOUL_MATE_QUESTIONS[0] | null>(null)
  const [pickA, setPickA] = useState<number | null>(null)
  const [pickB, setPickB] = useState<number | null>(null)
  const [used, setUsed] = useState<Set<number>>(new Set())

  const getNextQ = useCallback(() => {
    const available = SOUL_MATE_QUESTIONS.map((_, i) => i).filter((i) => !used.has(i))
    const idx = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : Math.floor(Math.random() * SOUL_MATE_QUESTIONS.length)
    if (available.length <= 1) setUsed(new Set())
    else setUsed((prev) => new Set([...prev, idx]))
    return SOUL_MATE_QUESTIONS[idx]
  }, [used])

  const startRound = useCallback(() => {
    play('click')
    setCurrentQ(getNextQ())
    setPickA(null)
    setPickB(null)
    setPhase('pick')
  }, [getNextQ, play])

  const reveal = useCallback(() => {
    if (pickA === null || pickB === null) return
    play(pickA === pickB ? 'correct' : 'wrong')
    if (pickA !== pickB && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
    setPhase('result')
  }, [pickA, pickB, play])

  const canReveal = pickA !== null && pickB !== null
  const match = pickA !== null && pickB !== null && pickA === pickB

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="心有靈犀">
      <GameRules
        rules={`心有靈犀！兩人同時從選項中選一個（不讓對方看到），再一起揭曉。\n選到一樣則安全，不一樣則兩人各喝一杯。`}
      />
      <p className="text-white/50 text-sm mb-2 text-center flex items-center justify-center gap-1">
        <Heart className="w-4 h-4 text-pink-400" />
        心有靈犀
      </p>

      {phase === 'idle' && (
        <m.button
          type="button"
          className="min-h-[48px] px-8 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold games-focus-ring"
          onClick={startRound}
          whileTap={{ scale: 0.98 }}
        >
          開始
        </m.button>
      )}

      {phase === 'pick' && currentQ && (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">
          <p className="text-white/80 font-medium mb-4 text-center">{currentQ.q}</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-white/50 text-xs mb-2">{players[0]} 選</p>
              <div className="flex flex-wrap gap-2">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPickA(i)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-sm border games-focus-ring ${pickA === i ? 'bg-pink-500/30 border-pink-500 text-white' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15'
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/50 text-xs mb-2">{players[1]} 選</p>
              <div className="flex flex-wrap gap-2">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPickB(i)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-sm border games-focus-ring ${pickB === i ? 'bg-pink-500/30 border-pink-500 text-white' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15'
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={!canReveal}
            onClick={reveal}
            className="w-full min-h-[48px] rounded-xl bg-pink-500 text-white font-bold games-focus-ring disabled:opacity-50"
          >
            揭曉
          </button>
        </m.div>
      )}

      {phase === 'result' && currentQ && pickA !== null && pickB !== null && (
        <AnimatePresence>
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <p className="text-white/70 mb-1">
              {players[0]}：{currentQ.options[pickA]}
            </p>
            <p className="text-white/70 mb-4">
              {players[1]}：{currentQ.options[pickB]}
            </p>
            <p className={`text-lg font-bold mb-4 ${match ? 'text-green-400' : 'text-red-400'}`}>
              {match ? '心有靈犀！安全' : '不一樣，兩人各喝一杯'}
            </p>
            {!match && !reducedMotion && <DrinkingAnimation duration={1.2} className="my-3 mx-auto mb-4" />}
            <CopyResultButton
              text={`心有靈犀：${players[0]}「${currentQ.options[pickA]}」vs ${players[1]}「${currentQ.options[pickB]}」，${match ? '心有靈犀安全' : '不一樣兩人各喝一杯'}`}
              className="mb-4 games-focus-ring"
            />
            <button
              type="button"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-pink-500 text-white font-bold games-focus-ring"
              onClick={startRound}
            >
              下一題
            </button>
          </m.div>
        </AnimatePresence>
      )}
    </div>
  )
}
