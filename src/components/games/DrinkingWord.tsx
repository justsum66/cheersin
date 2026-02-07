'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Trophy } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const WORD_CHALLENGES = [
  { word: '酒', hint: '與飲料相關', points: 1 },
  { word: '乾杯', hint: '敬酒時說的話', points: 1 },
  { word: '醉', hint: '喝太多會...', points: 1 },
  { word: '香檳', hint: '慶祝時喝的', points: 2 },
  { word: '威士忌', hint: '西方烈酒', points: 2 },
  { word: '清酒', hint: '日本酒', points: 2 },
  { word: '紅酒', hint: '葡萄酒的一種', points: 1 },
  { word: '啤酒', hint: '最常見的酒', points: 1 },
  { word: '調酒師', hint: '做雞尾酒的人', points: 3 },
  { word: '宿醉', hint: '隔天的痛苦', points: 2 },
  { word: '品酒', hint: '欣賞酒的活動', points: 2 },
  { word: '醒酒器', hint: '紅酒用的器具', points: 3 },
  { word: '冰塊', hint: '調酒常用的', points: 1 },
  { word: '檸檬', hint: '龍舌蘭配的', points: 1 },
  { word: '酒杯', hint: '喝酒的容器', points: 1 },
  { word: '白蘭地', hint: '法國烈酒', points: 2 },
  { word: '伏特加', hint: '俄羅斯烈酒', points: 2 },
  { word: '龍舌蘭', hint: '墨西哥烈酒', points: 2 },
  { word: '雞尾酒', hint: '混合調製的酒', points: 2 },
  { word: '酒窖', hint: '存放酒的地方', points: 2 },
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

export default function DrinkingWord() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentChallenge, setCurrentChallenge] = useState<typeof WORD_CHALLENGES[0] | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [scores, setScores] = useState<Record<number, number>>({})
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())
  const [gameStarted, setGameStarted] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const nextChallenge = useCallback(() => {
    const available = WORD_CHALLENGES.filter(c => !usedWords.has(c.word))
    if (available.length === 0) {
      setCurrentChallenge(null)
      return
    }
    const next = available[Math.floor(Math.random() * available.length)]
    setCurrentChallenge(next)
    setShowHint(false)
    setShowAnswer(false)
    setUsedWords(prev => new Set([...prev, next.word]))
    play('click')
  }, [usedWords, play])

  const startGame = useCallback(() => {
    setGameStarted(true)
    nextChallenge()
  }, [nextChallenge])

  const handleCorrect = useCallback(() => {
    if (!currentChallenge) return
    play('correct')
    setScores(prev => ({
      ...prev,
      [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) + currentChallenge.points
    }))
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    nextChallenge()
  }, [currentChallenge, currentPlayerIndex, players.length, play, nextChallenge])

  const handleWrong = useCallback(() => {
    play('wrong')
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    nextChallenge()
  }, [players.length, play, nextChallenge])

  const handlePass = useCallback(() => {
    play('click')
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    nextChallenge()
  }, [players.length, play, nextChallenge])

  const resetGame = useCallback(() => {
    setGameStarted(false)
    setCurrentChallenge(null)
    setScores({})
    setUsedWords(new Set())
    setCurrentPlayerIndex(0)
    setShowHint(false)
    setShowAnswer(false)
  }, [])

  const leaderboard = Object.entries(scores)
    .map(([i, score]) => ({ index: Number(i), name: players[Number(i)], score }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)

  const isGameOver = usedWords.size >= WORD_CHALLENGES.length && !currentChallenge
  const currentPlayer = players[currentPlayerIndex]

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="酒令文字遊戲">
      <GameRules
        rules="輪流猜酒相關的詞語！猜對得分，猜錯或跳過喝一口！\n可以選擇顯示提示，答對越難的詞得分越高。"
        rulesKey="drinking-word.rules"
      />

      {!gameStarted ? (
        <div className="text-center">
          <p className="text-white/70 mb-6">準備好測試酒類知識了嗎？</p>
          <button
            type="button"
            onClick={startGame}
            className="btn-primary px-8 py-3 text-lg games-focus-ring"
          >
            開始遊戲
          </button>
        </div>
      ) : isGameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">遊戲結束！</h2>
          {leaderboard.length > 0 && (
            <div className="mb-6">
              <p className="text-primary-400 text-xl mb-2">
                <Trophy className="inline w-6 h-6 mr-2" />
                冠軍：{leaderboard[0].name} ({leaderboard[0].score} 分)
              </p>
            </div>
          )}
          <CopyResultButton
            text={`酒令文字遊戲結果：\n${leaderboard.map((e, i) => `${i + 1}. ${e.name}: ${e.score} 分`).join('\n')}`}
            label="複製結果"
          />
          <button
            type="button"
            onClick={resetGame}
            className="mt-4 btn-secondary px-6 py-2 games-focus-ring flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            再玩一次
          </button>
        </div>
      ) : (
        <>
          <p className="text-white/60 mb-4">
            輪到 <span className="text-primary-400 font-medium">{currentPlayer}</span>
          </p>
          <p className="text-white/40 text-sm mb-4">
            剩餘 {WORD_CHALLENGES.length - usedWords.size + 1} 題
          </p>

          <AnimatePresence mode="wait">
            {currentChallenge && (
              <motion.div
                key={currentChallenge.word}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                className="w-full max-w-md bg-gradient-to-br from-primary-900/40 to-secondary-900/40 rounded-2xl p-6 mb-6 border border-white/20"
              >
                <div className="text-center mb-4">
                  <p className="text-white/50 text-sm mb-2">猜這個詞：</p>
                  {showAnswer ? (
                    <h2 className="text-3xl font-bold text-primary-400">{currentChallenge.word}</h2>
                  ) : (
                    <h2 className="text-3xl font-bold text-white/30">
                      {'＿'.repeat(currentChallenge.word.length)}
                    </h2>
                  )}
                  <p className="text-amber-400 text-sm mt-2">
                    難度：{'⭐'.repeat(currentChallenge.points)}
                  </p>
                </div>

                {showHint && (
                  <p className="text-center text-white/70 text-sm bg-white/10 rounded-lg p-2 mb-4">
                    提示：{currentChallenge.hint}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 justify-center">
                  {!showHint && (
                    <button
                      type="button"
                      onClick={() => setShowHint(true)}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 games-focus-ring min-h-[48px]"
                    >
                      顯示提示
                    </button>
                  )}
                  {!showAnswer && (
                    <button
                      type="button"
                      onClick={() => setShowAnswer(true)}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 games-focus-ring min-h-[48px]"
                    >
                      揭曉答案
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={handleCorrect}
              className="px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 games-focus-ring min-h-[48px]"
            >
              答對 (+{currentChallenge?.points || 0}分)
            </button>
            <button
              type="button"
              onClick={handleWrong}
              className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 games-focus-ring min-h-[48px]"
            >
              答錯 (喝一口)
            </button>
            <button
              type="button"
              onClick={handlePass}
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 games-focus-ring min-h-[48px]"
            >
              跳過 (喝一口)
            </button>
          </div>

          {leaderboard.length > 0 && (
            <div className="mt-6 w-full max-w-xs bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-white/50 text-xs mb-2 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> 目前得分
              </p>
              <ul className="space-y-1">
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <li key={entry.index} className="flex justify-between text-sm text-white/70">
                    <span>{i === 0 && '👑 '}{entry.name}</span>
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
