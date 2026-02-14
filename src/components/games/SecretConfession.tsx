'use client'

import { useState, useCallback } from 'react'
import { m } from 'framer-motion'
import { Lock, RotateCcw, Send } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

const CONFESSION_PROMPTS = [
  '說出一個你從未告訴任何人的秘密',
  '承認一件你後悔做過的事',
  '說出你對在場某人的真實想法',
  '分享一個尷尬的糗事',
  '說出你最大的恐懼',
  '承認一個你說過的謊',
  '分享你最瘋狂的幻想',
  '說出你暗戀過的人的類型',
  '承認一件讓你感到羞愧的事',
  '分享你最不想被人知道的習慣',
  '說出你對工作/學業的真實感受',
  '承認一個你從未實現的承諾',
  '分享你最害怕被發現的事',
  '說出一件你假裝喜歡但其實討厭的事',
  '承認你曾經嫉妒過誰',
  '分享你最黑暗的想法',
  '說出你最想改變自己什麼',
  '承認你最常說的一個謊',
  '分享你最想對某人說卻沒說的話',
  '說出你覺得最對不起的人是誰',
]

/** G2.17-G2.18：禁忌告白 - 匿名告白，猜是誰說的 */
export default function SecretConfession() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 3 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null)
  const [usedPrompts, setUsedPrompts] = useState<Set<number>>(new Set())
  const [confessorIdx, setConfessorIdx] = useState(0)
  const [confessed, setConfessed] = useState(false)
  const [guessing, setGuessing] = useState(false)
  const [correctGuess, setCorrectGuess] = useState<boolean | null>(null)

  const confessor = players[confessorIdx]
  const otherPlayers = players.filter((_, i) => i !== confessorIdx)

  const getNextPrompt = useCallback(() => {
    const available = CONFESSION_PROMPTS.map((_, i) => i).filter(i => !usedPrompts.has(i))
    if (available.length === 0) {
      setUsedPrompts(new Set())
      return CONFESSION_PROMPTS[Math.floor(Math.random() * CONFESSION_PROMPTS.length)]
    }
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedPrompts(prev => new Set([...prev, idx]))
    return CONFESSION_PROMPTS[idx]
  }, [usedPrompts])

  const startRound = useCallback(() => {
    play('click')
    setCurrentPrompt(getNextPrompt())
    setConfessed(false)
    setGuessing(false)
    setCorrectGuess(null)
  }, [getNextPrompt, play])

  const makeConfession = useCallback(() => {
    play('correct')
    setConfessed(true)
    setGuessing(true)
  }, [play])

  const handleGuess = useCallback((correct: boolean) => {
    if (correct) {
      play('correct')
    } else {
      play('wrong')
    }
    setCorrectGuess(correct)
  }, [play])

  const nextRound = useCallback(() => {
    setConfessorIdx((confessorIdx + 1) % players.length)
    setCurrentPrompt(null)
    setConfessed(false)
    setGuessing(false)
    setCorrectGuess(null)
  }, [confessorIdx, players.length])

  const resetGame = useCallback(() => {
    setConfessorIdx(0)
    setCurrentPrompt(null)
    setUsedPrompts(new Set())
    setConfessed(false)
    setGuessing(false)
    setCorrectGuess(null)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={`告白者看題目，大聲說出告白。\n其他人猜是誰說的。\n猜錯的人喝酒！`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-6 h-6 text-rose-400" />
        <h2 className="text-xl font-bold text-white">禁忌告白</h2>
      </div>

      {!currentPrompt ? (
        <div className="text-center">
          <p className="text-white/70 mb-4">輪到 <span className="text-rose-400 font-bold">{confessor}</span> 告白</p>
          <m.button whileTap={{ scale: 0.96 }} onClick={startRound} className="px-8 py-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xl games-focus-ring">
            抽告白題目
          </m.button>
        </div>
      ) : !confessed ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <p className="text-white/50">只給 <span className="text-rose-400">{confessor}</span> 看</p>
          <m.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full p-6 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 text-center"
          >
            <p className="text-white text-lg">{currentPrompt}</p>
          </m.div>
          <m.button
            whileTap={{ scale: 0.96 }}
            onClick={makeConfession}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-rose-500 text-white font-bold games-focus-ring"
          >
            <Send className="w-5 h-5" /> 我說完了
          </m.button>
        </div>
      ) : correctGuess === null ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-md text-center">
          <p className="text-white/70">其他人猜猜看是誰說的？</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {otherPlayers.map(p => (
              <button key={p} className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 games-focus-ring">
                {p}
              </button>
            ))}
          </div>
          <p className="text-white/50 mt-4">有人猜對了嗎？</p>
          <div className="flex gap-3">
            <button onClick={() => handleGuess(true)} className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold games-focus-ring">有人猜對</button>
            <button onClick={() => handleGuess(false)} className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold games-focus-ring">沒人猜對</button>
          </div>
        </div>
      ) : (
        <m.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
          {correctGuess ? (
            <p className="text-emerald-400 font-bold text-xl">有人猜對了！猜錯的人喝酒！</p>
          ) : (
            <p className="text-red-400 font-bold text-xl">沒人猜對！大家都喝！</p>
          )}
          <p className="text-white/50 mt-2">告白者是：<span className="text-rose-400 font-bold">{confessor}</span></p>
          <div className="flex gap-3 mt-4 justify-center">
            <button onClick={nextRound} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">下一輪</button>
            <CopyResultButton text={`禁忌告白：${currentPrompt}\n告白者：${confessor}`} />
          </div>
        </m.div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
