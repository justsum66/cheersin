'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from '../GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from '../GameRules'
import CopyResultButton from '../CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

const CHOICES: [string, string][] = [
  ['一輩子不喝酒', '一輩子不吃甜食'],
  ['永遠只能說真話', '永遠只能說謊話'],
  ['每天早起運動', '每天熬夜追劇'],
  ['只能用手機不能電腦', '只能用電腦不能手機'],
  ['一週不洗澡', '一週不換衣服'],
  ['失去味覺', '失去嗅覺'],
  ['跟討厭的人同桌吃飯', '跟討厭的人一起旅行'],
  ['一輩子單身', '一輩子窮'],
  ['只能喝啤酒', '只能喝烈酒'],
  ['公開社群帳號', '公開銀行餘額'],
]

/** 終極二選一：顯示兩難選擇，每人選 A 或 B，選少數的人喝。 */
export default function WouldYouRather() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [phase, setPhase] = useState<'idle' | 'choose' | 'result'>('idle')
  const [pair, setPair] = useState<[string, string] | null>(null)
  const [choices, setChoices] = useState<Record<number, 'A' | 'B'>>({})

  const startRound = useCallback(() => {
    play('click')
    const p = CHOICES[Math.floor(Math.random() * CHOICES.length)]
    setPair(p)
    setChoices({})
    setPhase('choose')
  }, [play])

  const setChoice = useCallback((playerIndex: number, c: 'A' | 'B') => {
    setChoices((prev) => ({ ...prev, [playerIndex]: c }))
  }, [])

  const countA = Object.values(choices).filter((c) => c === 'A').length
  const countB = Object.values(choices).filter((c) => c === 'B').length
  const minority: 'A' | 'B' | null = countA !== countB ? (countA < countB ? 'A' : 'B') : null

  const showResult = useCallback(() => {
    play('click')
    if (minority !== null && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
    setPhase('result')
  }, [play, minority])

  useEffect(() => {
    if (phase !== 'result') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') startRound() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, startRound])

  const allChosen = Object.keys(choices).length >= players.length

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="終極二選一">
      <GameRules
        rules={`每題兩個選項，二選一。\n每人選 A 或 B，選完後揭曉：選「少數」的那邊的人喝。\n若平手則都不喝，或重抽一題。`}
      />
      <p className="text-white/50 text-sm mb-2 text-center">終極二選一</p>

      {phase === 'idle' && (
        <motion.button
          type="button"
          className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold games-focus-ring"
          onClick={startRound}
          whileTap={{ scale: 0.98 }}
        >
          抽題
        </motion.button>
      )}

      {phase === 'choose' && pair && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md w-full">
          <p className="text-white/70 mb-4 font-medium">你會選哪一個？</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              type="button"
              className={`min-h-[48px] px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-colors games-focus-ring ${
                choices[0] === 'A' ? 'border-primary-500 bg-primary-500/20 text-white' : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'
              }`}
              onClick={() => {}}
            >
              A. {pair[0]}
            </button>
            <button
              type="button"
              className={`min-h-[48px] px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-colors games-focus-ring ${
                choices[0] === 'B' ? 'border-primary-500 bg-primary-500/20 text-white' : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'
              }`}
              onClick={() => {}}
            >
              B. {pair[1]}
            </button>
          </div>
          <p className="text-white/40 text-xs mb-2">每人輪流選 A 或 B（或由主持人代選）</p>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {players.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-white/70 text-sm">{name}</span>
                <button
                  type="button"
                  className={`min-h-[48px] min-w-[48px] px-3 rounded-lg text-sm games-focus-ring ${choices[i] === 'A' ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70'}`}
                  onClick={() => setChoice(i, 'A')}
                >
                  A
                </button>
                <button
                  type="button"
                  className={`min-h-[48px] min-w-[48px] px-3 rounded-lg text-sm games-focus-ring ${choices[i] === 'B' ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70'}`}
                  onClick={() => setChoice(i, 'B')}
                >
                  B
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            disabled={!allChosen}
            className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring disabled:opacity-50"
            onClick={showResult}
          >
            揭曉
          </button>
        </motion.div>
      )}

      {phase === 'result' && pair && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <p className="text-white/70 mb-2">A：{pair[0]}（{countA} 人）</p>
            <p className="text-white/70 mb-4">B：{pair[1]}（{countB} 人）</p>
            {minority ? (
              <p className="text-red-400 font-bold mb-4">選{minority}的人喝！</p>
            ) : (
              <p className="text-green-400 font-bold mb-4">平手，大家安全</p>
            )}
            <CopyResultButton
              text={minority ? `終極二選一：A ${pair[0]}（${countA}人）B ${pair[1]}（${countB}人）選${minority}的人喝` : `終極二選一：A ${pair[0]} B ${pair[1]} 平手大家安全`}
              className="mb-4 games-focus-ring"
            />
            <button
              type="button"
              className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
              onClick={startRound}
            >
              下一題
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
