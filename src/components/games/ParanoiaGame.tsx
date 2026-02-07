'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Eye, RotateCcw, HelpCircle } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

const PARANOIA_QUESTIONS = [
  '誰最可能在背後說人壞話？',
  '誰最可能當第三者？',
  '誰最可能喝醉後出糗？',
  '誰最可能偷看別人手機？',
  '誰最可能劈腿？',
  '誰最可能在床上很無趣？',
  '誰最可能當備胎？',
  '誰最可能暗戀在場的人？',
  '誰最可能有秘密帳號？',
  '誰最可能說謊？',
  '誰最可能假裝無辜？',
  '誰最可能有不可告人的秘密？',
  '誰最可能曾經偷偷哭過？',
  '誰最可能默默喜歡別人？',
  '誰最可能裝傻？',
  '誰最可能有雙重人格？',
  '誰最可能當綠茶婊/渣男？',
  '誰最可能假裝沒看到訊息？',
  '誰最可能偷看前任動態？',
  '誰最可能對曖昧對象最多？',
]

/** G2.15-G2.16：偏執遊戲 - 提問者只聽到名字，被選中的人決定是否喝酒揭曉問題 */
export default function ParanoiaGame() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 3 ? contextPlayers : DEFAULT_PLAYERS

  const [currentAskerIdx, setCurrentAskerIdx] = useState(0)
  const [currentQ, setCurrentQ] = useState<string | null>(null)
  const [usedQs, setUsedQs] = useState<Set<number>>(new Set())
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const currentAsker = players[currentAskerIdx]
  const otherPlayers = players.filter((_, i) => i !== currentAskerIdx)

  const getNextQ = useCallback(() => {
    const available = PARANOIA_QUESTIONS.map((_, i) => i).filter(i => !usedQs.has(i))
    if (available.length === 0) {
      setUsedQs(new Set())
      return PARANOIA_QUESTIONS[Math.floor(Math.random() * PARANOIA_QUESTIONS.length)]
    }
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedQs(prev => new Set([...prev, idx]))
    return PARANOIA_QUESTIONS[idx]
  }, [usedQs])

  const startRound = useCallback(() => {
    play('click')
    setCurrentQ(getNextQ())
    setSelectedPlayer(null)
    setRevealed(false)
  }, [getNextQ, play])

  const selectPlayer = useCallback((player: string) => {
    play('click')
    setSelectedPlayer(player)
  }, [play])

  const reveal = useCallback(() => {
    play('correct')
    setRevealed(true)
  }, [play])

  const nextRound = useCallback(() => {
    setCurrentAskerIdx((currentAskerIdx + 1) % players.length)
    setCurrentQ(null)
    setSelectedPlayer(null)
    setRevealed(false)
  }, [currentAskerIdx, players.length])

  const resetGame = useCallback(() => {
    setCurrentAskerIdx(0)
    setCurrentQ(null)
    setUsedQs(new Set())
    setSelectedPlayer(null)
    setRevealed(false)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={`提問者看問題，悄悄選一個人。\n被選中的人只知道被選中，不知道問題。\n被選中者可以選擇喝酒來揭曉問題！`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-bold text-white">偏執遊戲</h2>
      </div>

      {!currentQ ? (
        <div className="text-center">
          <p className="text-white/70 mb-4">輪到 <span className="text-indigo-400 font-bold">{currentAsker}</span> 提問</p>
          <motion.button whileTap={{ scale: 0.96 }} onClick={startRound} className="px-8 py-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-xl games-focus-ring">
            抽題目
          </motion.button>
        </div>
      ) : !selectedPlayer ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <p className="text-white/50">只給 <span className="text-indigo-400">{currentAsker}</span> 看</p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full p-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-center"
          >
            <p className="text-white text-lg">{currentQ}</p>
          </motion.div>
          <p className="text-white/50 mt-4">選一個人：</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {otherPlayers.map(p => (
              <button key={p} onClick={() => selectPlayer(p)} className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 games-focus-ring hover:bg-white/20">
                {p}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-md text-center">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-xl">
            <span className="text-indigo-400 font-bold">{currentAsker}</span>
            <span className="text-white/70"> 選了 </span>
            <span className="text-purple-400 font-bold">{selectedPlayer}</span>
          </motion.div>

          {!revealed ? (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-white/50 mb-4">
                <HelpCircle className="w-5 h-5" />
                <span>{selectedPlayer}，你想知道問題是什麼嗎？</span>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={reveal} className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold games-focus-ring">
                  喝酒揭曉！
                </button>
                <button onClick={nextRound} className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold games-focus-ring">
                  算了，下一輪
                </button>
              </div>
            </div>
          ) : (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-4">
              <p className="text-white/50 mb-2">問題是：</p>
              <p className="text-white text-lg p-4 rounded-xl bg-purple-500/20 border border-purple-500/30">{currentQ}</p>
              <div className="flex gap-3 mt-4 justify-center">
                <button onClick={nextRound} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">下一輪</button>
                <CopyResultButton text={`偏執遊戲：${currentQ}\n${currentAsker} 選了 ${selectedPlayer}`} />
              </div>
            </motion.div>
          )}
        </div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
