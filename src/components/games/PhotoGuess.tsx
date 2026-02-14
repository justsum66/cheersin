'use client'

import { useState, useCallback } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Image, RefreshCw, Trophy, Eye, EyeOff } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const EMOJI_PUZZLES = [
  { emojis: '🍎🍐🍊🍋🍇', answer: '水果', hint: '可以吃的植物果實' },
  { emojis: '🐶🐱🐭🐹🐰', answer: '寵物', hint: '家裡養的動物' },
  { emojis: '☀️🌙⭐🌈☁️', answer: '天空', hint: '抬頭看得到的' },
  { emojis: '🎸🎹🎺🎻🥁', answer: '樂器', hint: '用來演奏音樂的' },
  { emojis: '🚗🚕🚌🚎🏎️', answer: '汽車', hint: '路上跑的交通工具' },
  { emojis: '🍔🍟🌭🍕🌮', answer: '速食', hint: '快餐店賣的食物' },
  { emojis: '⚽🏀🏈⚾🎾', answer: '球類運動', hint: '用球來玩的運動' },
  { emojis: '👻🎃🦇🕷️🕸️', answer: '萬聖節', hint: '10月31日的節日' },
  { emojis: '🎄🎅🎁⛄🦌', answer: '聖誕節', hint: '12月25日的節日' },
  { emojis: '💍👰🤵💒🎂', answer: '婚禮', hint: '兩個人結婚的儀式' },
  { emojis: '🛫🛬🧳🗺️📸', answer: '旅行', hint: '去別的地方玩' },
  { emojis: '📚📖✏️📝🎓', answer: '學習/上學', hint: '學生每天做的事' },
  { emojis: '🍳🥘🍲🥗🍜', answer: '做飯/料理', hint: '廚房裡做的事' },
  { emojis: '💼👔💻📊📈', answer: '上班/工作', hint: '成年人白天做的事' },
  { emojis: '🏠🛋️📺🛏️🚿', answer: '家/居家', hint: '住的地方' },
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

export default function PhotoGuess() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentPuzzle, setCurrentPuzzle] = useState<typeof EMOJI_PUZZLES[0] | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [scores, setScores] = useState<Record<number, number>>({})
  const [usedPuzzles, setUsedPuzzles] = useState<Set<string>>(new Set())
  const [gameStarted, setGameStarted] = useState(false)
  const [revealedCount, setRevealedCount] = useState(1)

  const nextPuzzle = useCallback(() => {
    const available = EMOJI_PUZZLES.filter(p => !usedPuzzles.has(p.answer))
    if (available.length === 0) {
      setCurrentPuzzle(null)
      return
    }
    const next = available[Math.floor(Math.random() * available.length)]
    setCurrentPuzzle(next)
    setShowHint(false)
    setShowAnswer(false)
    setRevealedCount(1)
    setUsedPuzzles(prev => new Set([...prev, next.answer]))
    play('click')
  }, [usedPuzzles, play])

  const startGame = useCallback(() => {
    setGameStarted(true)
    nextPuzzle()
  }, [nextPuzzle])

  const revealMore = useCallback(() => {
    if (currentPuzzle && revealedCount < currentPuzzle.emojis.split('').filter(c => c !== ' ').length) {
      setRevealedCount(prev => prev + 1)
      play('click')
    }
  }, [currentPuzzle, revealedCount, play])

  const handleCorrect = useCallback(() => {
    if (!currentPuzzle) return
    play('correct')
    const emojiCount = currentPuzzle.emojis.split('').filter(c => c !== ' ').length / 2 // 每個emoji是2個字符
    const points = Math.max(1, emojiCount - revealedCount + 1)
    setScores(prev => ({
      ...prev,
      [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) + points
    }))
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    nextPuzzle()
  }, [currentPuzzle, revealedCount, currentPlayerIndex, players.length, play, nextPuzzle])

  const handleWrong = useCallback(() => {
    play('wrong')
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    nextPuzzle()
  }, [players.length, play, nextPuzzle])

  const resetGame = useCallback(() => {
    setGameStarted(false)
    setCurrentPuzzle(null)
    setScores({})
    setUsedPuzzles(new Set())
    setCurrentPlayerIndex(0)
    setShowHint(false)
    setShowAnswer(false)
    setRevealedCount(1)
  }, [])

  const leaderboard = Object.entries(scores)
    .map(([i, score]) => ({ index: Number(i), name: players[Number(i)], score }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)

  const isGameOver = usedPuzzles.size >= EMOJI_PUZZLES.length && !currentPuzzle
  const currentPlayer = players[currentPlayerIndex]

  const getRevealedEmojis = () => {
    if (!currentPuzzle) return ''
    const emojis = [...currentPuzzle.emojis]
    // 每個emoji佔2個字符
    const emojiArray: string[] = []
    for (let i = 0; i < emojis.length; i += 2) {
      emojiArray.push(emojis[i] + (emojis[i + 1] || ''))
    }
    return emojiArray.map((e, i) => i < revealedCount ? e : '❓').join('')
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="看圖猜謎">
      <GameRules
        rules="看 Emoji 組合猜答案！揭示越少 Emoji 猜對分數越高！\n猜錯或放棄喝一口！"
        rulesKey="photo-guess.rules"
      />

      {!gameStarted ? (
        <div className="text-center">
          {/* decorative icon: Lucide Image is SVG, no alt; a11y 以 aria-hidden 標示 */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image className="w-16 h-16 text-primary-400 mx-auto mb-4" aria-hidden />
          <p className="text-white/70 mb-6">準備好看圖猜謎了嗎？</p>
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
            text={`看圖猜謎結果：\n${leaderboard.map((e, i) => `${i + 1}. ${e.name}: ${e.score} 分`).join('\n')}`}
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
          <p className="text-white/60 mb-2">
            輪到 <span className="text-primary-400 font-medium">{currentPlayer}</span> 猜
          </p>
          <p className="text-white/40 text-sm mb-4">
            剩餘 {EMOJI_PUZZLES.length - usedPuzzles.size + 1} 題
          </p>

          <AnimatePresence mode="wait">
            {currentPuzzle && (
              <m.div
                key={currentPuzzle.answer}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                className="w-full max-w-md bg-gradient-to-br from-primary-900/40 to-secondary-900/40 rounded-2xl p-6 mb-6 border border-white/20"
              >
                <div className="text-center mb-6">
                  <p className="text-5xl mb-4 tracking-wider">{getRevealedEmojis()}</p>
                  <p className="text-white/50 text-sm">
                    已揭示 {revealedCount} / {currentPuzzle.emojis.length / 2} 個
                  </p>
                </div>

                {showAnswer && (
                  <div className="text-center mb-4 bg-white/10 rounded-lg p-3">
                    <p className="text-primary-400 text-xl font-bold">{currentPuzzle.answer}</p>
                  </div>
                )}

                {showHint && !showAnswer && (
                  <p className="text-center text-white/70 text-sm bg-white/10 rounded-lg p-3 mb-4">
                    提示：{currentPuzzle.hint}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={revealMore}
                    disabled={revealedCount >= currentPuzzle.emojis.length / 2}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 games-focus-ring min-h-[48px] flex items-center gap-2 disabled:opacity-50"
                  >
                    <Eye className="w-4 h-4" />
                    揭示更多
                  </button>
                  {!showHint && !showAnswer && (
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
                      className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 games-focus-ring min-h-[48px] flex items-center gap-2"
                    >
                      <EyeOff className="w-4 h-4" />
                      揭曉答案
                    </button>
                  )}
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={handleCorrect}
              className="px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 games-focus-ring min-h-[48px]"
            >
              猜對了！
            </button>
            <button
              type="button"
              onClick={handleWrong}
              className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 games-focus-ring min-h-[48px]"
            >
              猜錯/放棄 (喝一口)
            </button>
          </div>

          {leaderboard.length > 0 && (
            <div className="mt-6 w-full max-w-xs bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-white/50 text-xs mb-2 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> 得分排行
              </p>
              <ul className="space-y-1">
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <li key={entry.index} className="flex justify-between text-sm text-white/70">
                    <span>{i === 0 && '🏆 '}{entry.name}</span>
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
