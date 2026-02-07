'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, RefreshCw, Trophy, Timer } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const STARTING_WORDS = [
  '蘋果', '香蕉', '電腦', '手機', '飛機', '汽車', '音樂', '電影',
  '美食', '旅行', '學校', '公司', '朋友', '家庭', '運動', '遊戲',
  '書本', '網路', '咖啡', '茶葉', '巧克力', '蛋糕', '披薩', '漢堡'
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']
const TIME_LIMIT = 10

export default function WordChain() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState('')
  const [wordHistory, setWordHistory] = useState<string[]>([])
  const [scores, setScores] = useState<Record<number, number>>({})
  const [gameStarted, setGameStarted] = useState(false)
  const [timer, setTimer] = useState(TIME_LIMIT)
  const [isRunning, setIsRunning] = useState(false)
  const [inputWord, setInputWord] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRunning(false)
  }, [])

  const handleTimeout = useCallback(() => {
    stopTimer()
    play('wrong')
    setFeedback({ type: 'error', message: `${players[currentPlayerIndex]} 超時！喝一口！` })
    setScores(prev => ({
      ...prev,
      [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) - 1
    }))
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    setTimer(TIME_LIMIT)
    setTimeout(() => setFeedback(null), 2000)
  }, [currentPlayerIndex, players, play, stopTimer])

  const startTimer = useCallback(() => {
    setIsRunning(true)
    setTimer(TIME_LIMIT)
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          handleTimeout()
          return TIME_LIMIT
        }
        return prev - 1
      })
    }, 1000)
  }, [handleTimeout])

  const startGame = useCallback(() => {
    const startWord = STARTING_WORDS[Math.floor(Math.random() * STARTING_WORDS.length)]
    setCurrentWord(startWord)
    setWordHistory([startWord])
    setGameStarted(true)
    setScores({})
    setCurrentPlayerIndex(0)
    startTimer()
    play('click')
  }, [startTimer, play])

  const submitWord = useCallback(() => {
    const word = inputWord.trim()
    if (!word) return

    // 檢查是否以當前詞的最後一個字開頭
    const lastChar = currentWord.charAt(currentWord.length - 1)
    const firstChar = word.charAt(0)

    if (firstChar !== lastChar) {
      play('wrong')
      setFeedback({ type: 'error', message: `必須以「${lastChar}」開頭！` })
      setTimeout(() => setFeedback(null), 2000)
      return
    }

    // 檢查是否已用過
    if (wordHistory.includes(word)) {
      play('wrong')
      setFeedback({ type: 'error', message: '這個詞已經用過了！' })
      setTimeout(() => setFeedback(null), 2000)
      return
    }

    // 成功接龍
    stopTimer()
    play('correct')
    const bonus = timer > 7 ? 2 : timer > 4 ? 1 : 0
    setScores(prev => ({
      ...prev,
      [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) + 1 + bonus
    }))
    setFeedback({ type: 'success', message: bonus > 0 ? `+${1 + bonus} 分！快速接龍獎勵！` : '+1 分！' })
    setCurrentWord(word)
    setWordHistory(prev => [...prev, word])
    setInputWord('')
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    
    setTimeout(() => {
      setFeedback(null)
      startTimer()
    }, 1000)
  }, [inputWord, currentWord, wordHistory, timer, currentPlayerIndex, players.length, play, stopTimer, startTimer])

  const handlePass = useCallback(() => {
    stopTimer()
    play('wrong')
    setFeedback({ type: 'error', message: `${players[currentPlayerIndex]} 跳過！喝一口！` })
    setScores(prev => ({
      ...prev,
      [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) - 1
    }))
    setInputWord('')
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    
    setTimeout(() => {
      setFeedback(null)
      startTimer()
    }, 1500)
  }, [currentPlayerIndex, players, play, stopTimer, startTimer])

  const resetGame = useCallback(() => {
    stopTimer()
    setGameStarted(false)
    setCurrentWord('')
    setWordHistory([])
    setScores({})
    setCurrentPlayerIndex(0)
    setInputWord('')
    setFeedback(null)
    setTimer(TIME_LIMIT)
  }, [stopTimer])

  useEffect(() => {
    return () => stopTimer()
  }, [stopTimer])

  useEffect(() => {
    if (gameStarted && inputRef.current) {
      inputRef.current.focus()
    }
  }, [gameStarted, currentPlayerIndex])

  const leaderboard = Object.entries(scores)
    .map(([i, score]) => ({ index: Number(i), name: players[Number(i)], score }))
    .sort((a, b) => b.score - a.score)

  const currentPlayer = players[currentPlayerIndex]
  const lastChar = currentWord.charAt(currentWord.length - 1)

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="文字接龍">
      <GameRules
        rules="輪流用上一個詞的最後一個字開頭接新詞！\n接不出來或超時喝一口！越快接龍分數越高！"
        rulesKey="word-chain.rules"
      />

      {!gameStarted ? (
        <div className="text-center">
          <Link2 className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <p className="text-white/70 mb-6">準備好文字接龍了嗎？</p>
          <button
            type="button"
            onClick={startGame}
            className="btn-primary px-8 py-3 text-lg games-focus-ring"
          >
            開始遊戲
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between w-full max-w-md mb-4">
            <p className="text-white/60">
              輪到 <span className="text-primary-400 font-medium">{currentPlayer}</span>
            </p>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timer <= 3 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/70'}`}>
              <Timer className="w-4 h-4" />
              <span className="font-bold tabular-nums">{timer}秒</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentWord}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-gradient-to-br from-primary-900/40 to-secondary-900/40 rounded-2xl p-6 mb-4 border border-white/20"
            >
              <div className="text-center mb-4">
                <p className="text-white/50 text-sm mb-2">當前詞語</p>
                <h2 className="text-3xl font-bold text-primary-400">{currentWord}</h2>
                <p className="text-white/60 mt-2">
                  請用「<span className="text-amber-400 font-bold">{lastChar}</span>」開頭接龍
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); submitWord(); }} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  placeholder={`輸入「${lastChar}」開頭的詞...`}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 games-focus-ring min-h-[48px]"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="px-4 py-3 rounded-lg bg-primary-500 text-white hover:bg-primary-600 games-focus-ring min-h-[48px]"
                >
                  送出
                </button>
              </form>

              <button
                type="button"
                onClick={handlePass}
                className="w-full mt-3 px-4 py-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 games-focus-ring min-h-[48px]"
              >
                跳過 (喝一口)
              </button>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mb-4 px-4 py-2 rounded-lg ${feedback.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
              >
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>

          {wordHistory.length > 1 && (
            <div className="w-full max-w-md bg-white/5 rounded-xl p-3 border border-white/10 mb-4">
              <p className="text-white/50 text-xs mb-2">接龍記錄 ({wordHistory.length} 個詞)</p>
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                {wordHistory.slice(-10).map((word, i) => (
                  <span key={i} className="px-2 py-1 bg-white/10 rounded text-sm text-white/70">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <CopyResultButton
              text={`文字接龍結果：\n接龍：${wordHistory.join(' → ')}\n得分：\n${leaderboard.map((e, i) => `${i + 1}. ${e.name}: ${e.score} 分`).join('\n')}`}
              label="複製結果"
            />
            <button
              type="button"
              onClick={resetGame}
              className="px-4 py-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 games-focus-ring flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              重新開始
            </button>
          </div>

          {leaderboard.length > 0 && (
            <div className="mt-4 w-full max-w-xs bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-white/50 text-xs mb-2 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> 得分排行
              </p>
              <ul className="space-y-1">
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <li key={entry.index} className="flex justify-between text-sm text-white/70">
                    <span>{i === 0 && entry.score > 0 && '👑 '}{entry.name}</span>
                    <span>{entry.score} 分</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
