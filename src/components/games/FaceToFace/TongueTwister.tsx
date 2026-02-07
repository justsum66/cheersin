'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from '../GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from '../GameRules'
import CopyResultButton from '../CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

const TWISTERS: string[] = [
  '吃葡萄不吐葡萄皮，不吃葡萄倒吐葡萄皮',
  '四是四，十是十，十四是十四，四十是四十',
  '黑化肥發灰會揮發，灰化肥揮發會發黑',
  '紅鳳凰粉鳳凰，紅粉鳳凰花鳳凰',
  '劉奶奶喝牛奶',
  '班幹部管班幹部',
  '八百標兵奔北坡',
  '酒桌喝酒不喝多，喝多上桌酒桌喝',
  '喝酒不開車，開車不喝酒',
  '啤酒杯裡裝啤酒，酒杯啤酒杯杯有',
]

/** 語速挑戰：繞口令，失敗者喝酒。每人輪流念，念錯或卡住則喝。 */
export default function TongueTwister() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [phase, setPhase] = useState<'idle' | 'challenge' | 'result'>('idle')
  const [twister, setTwister] = useState('')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [failed, setFailed] = useState<number | null>(null)

  const startRound = useCallback(() => {
    play('click')
    const t = TWISTERS[Math.floor(Math.random() * TWISTERS.length)]
    setTwister(t)
    setFailed(null)
    setCurrentPlayerIndex(0)
    setPhase('challenge')
  }, [play])

  const pass = useCallback(() => {
    play('correct')
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
  }, [players.length, play])
  const fail = useCallback(() => {
    play('wrong')
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
    setFailed(currentPlayerIndex)
    setPhase('result')
  }, [currentPlayerIndex, play])
  const nextRound = useCallback(() => setPhase('idle'), [])

  useEffect(() => {
    if (phase !== 'result') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') nextRound() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, nextRound])

  const currentName = players[currentPlayerIndex]

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4">
      <GameRules
        rules={`每人輪流念螢幕上的繞口令，念三遍不卡、不錯即過關。\n念錯、卡住、或放棄的人喝。\n可加快速度增加難度。`}
      />
      <p className="text-white/50 text-sm mb-2 text-center">語速挑戰</p>

      {phase === 'idle' && (
        <motion.button
          type="button"
          className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold"
          onClick={startRound}
          whileTap={{ scale: 0.98 }}
        >
          抽繞口令
        </motion.button>
      )}

      {phase === 'challenge' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md w-full">
          <p className="text-white/70 mb-2">輪到 <span className="font-bold text-primary-300">{currentName}</span></p>
          <p className="text-xl md:text-2xl font-bold text-primary-200 mb-6 leading-relaxed px-2">{twister}</p>
          <p className="text-white/40 text-xs mb-4">念三遍不卡即過關</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              type="button"
              className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-green-500/80 hover:bg-green-500 text-white font-bold"
              onClick={pass}
            >
              過關
            </button>
            <button
              type="button"
              className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-bold"
              onClick={fail}
            >
              失敗（喝）
            </button>
          </div>
        </motion.div>
      )}

      {phase === 'result' && failed != null && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <p className="text-red-400 font-bold text-lg mb-2">{players[failed]} 失敗，喝！</p>
            <p className="text-white/50 text-sm mb-4">繞口令：{twister}</p>
            <CopyResultButton
              text={`語速挑戰：${players[failed]} 失敗喝。繞口令：${twister}`}
              className="mb-4"
            />
            <button
              type="button"
              className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold"
              onClick={nextRound}
            >
              下一題
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
