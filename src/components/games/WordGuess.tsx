'use client'

import { useState, useCallback } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { FileText, RefreshCw, Trophy, Lightbulb } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const RIDDLES = [
  { riddle: '什麼東西越洗越髒？', answer: '水', hint: '本身就是用來洗東西的' },
  { riddle: '什麼門不能進？', answer: '奪門/冠門', hint: '不是實體的門' },
  { riddle: '什麼書不能看？', answer: '秘書', hint: '這是一種職業' },
  { riddle: '什麼橋不能走？', answer: '鼻樑', hint: '在臉上' },
  { riddle: '什麼水不能喝？', answer: '薪水', hint: '每個月都期待收到' },
  { riddle: '什麼蛋不能吃？', answer: '混蛋/笨蛋', hint: '是罵人的話' },
  { riddle: '什麼山不能爬？', answer: '靠山', hint: '有權勢的人' },
  { riddle: '什麼針不能縫？', answer: '打針', hint: '在醫院會做的事' },
  { riddle: '什麼海沒有水？', answer: '辭海', hint: '是一本書' },
  { riddle: '什麼鏡不能照？', answer: '眼鏡', hint: '戴在臉上' },
  { riddle: '什麼路最難走？', answer: '歧路', hint: '人生的選擇' },
  { riddle: '什麼牛不會吃草？', answer: '蝸牛', hint: '背著殼的動物' },
  { riddle: '什麼瓜不能吃？', answer: '傻瓜', hint: '形容人的詞' },
  { riddle: '什麼船不能航行？', answer: '宇宙飛船', hint: '去太空的' },
  { riddle: '什麼手不能用？', answer: '對手', hint: '競爭的人' },
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

export default function WordGuess() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentRiddle, setCurrentRiddle] = useState<typeof RIDDLES[0] | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [scores, setScores] = useState<Record<number, number>>({})
  const [usedRiddles, setUsedRiddles] = useState<Set<string>>(new Set())
  const [gameStarted, setGameStarted] = useState(false)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)

  const nextRiddle = useCallback(() => {
    const available = RIDDLES.filter(r => !usedRiddles.has(r.riddle))
    if (available.length === 0) {
      setCurrentRiddle(null)
      return
    }
    const next = available[Math.floor(Math.random() * available.length)]
    setCurrentRiddle(next)
    setShowHint(false)
    setShowAnswer(false)
    setUserAnswer('')
    setResult(null)
    setUsedRiddles(prev => new Set([...prev, next.riddle]))
    play('click')
  }, [usedRiddles, play])

  const startGame = useCallback(() => {
    setGameStarted(true)
    nextRiddle()
  }, [nextRiddle])

  const checkAnswer = useCallback(() => {
    if (!currentRiddle || !userAnswer.trim()) return

    const correct = currentRiddle.answer.split('/').some(ans => 
      userAnswer.trim().toLowerCase().includes(ans.toLowerCase()) ||
      ans.toLowerCase().includes(userAnswer.trim().toLowerCase())
    )

    if (correct) {
      play('correct')
      const points = showHint ? 1 : 2
      setScores(prev => ({
        ...prev,
        [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) + points
      }))
      setResult('correct')
    } else {
      play('wrong')
      setResult('wrong')
    }
    setShowAnswer(true)
  }, [currentRiddle, userAnswer, showHint, currentPlayerIndex, play])

  const handleNext = useCallback(() => {
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    nextRiddle()
  }, [players.length, nextRiddle])

  const resetGame = useCallback(() => {
    setGameStarted(false)
    setCurrentRiddle(null)
    setShowHint(false)
    setShowAnswer(false)
    setUserAnswer('')
    setScores({})
    setUsedRiddles(new Set())
    setCurrentPlayerIndex(0)
    setResult(null)
  }, [])

  const leaderboard = Object.entries(scores)
    .map(([i, score]) => ({ index: Number(i), name: players[Number(i)], score }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)

  const isGameOver = usedRiddles.size >= RIDDLES.length && !currentRiddle
  const currentPlayer = players[currentPlayerIndex]

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="猜字謎">
      <GameRules
        rules="猜中文字謎！不用提示猜對得2分，用提示得1分！\n猜錯喝一口！"
        rulesKey="word-guess.rules"
      />

      {!gameStarted ? (
        <div className="text-center">
          <FileText className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <p className="text-white/70 mb-6">準備好猜字謎了嗎？</p>
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
            text={`猜字謎結果：\n${leaderboard.map((e, i) => `${i + 1}. ${e.name}: ${e.score} 分`).join('\n')}`}
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
            輪到 <span className="text-primary-400 font-medium">{currentPlayer}</span>
          </p>
          <p className="text-white/40 text-sm mb-4">
            剩餘 {RIDDLES.length - usedRiddles.size + 1} 題
          </p>

          <AnimatePresence mode="wait">
            {currentRiddle && (
              <m.div
                key={currentRiddle.riddle}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-gradient-to-br from-primary-900/40 to-secondary-900/40 rounded-2xl p-6 mb-6 border border-white/20"
              >
                <h2 className="text-xl font-bold text-white text-center mb-6">{currentRiddle.riddle}</h2>

                {showHint && !showAnswer && (
                  <div className="flex items-center gap-2 bg-amber-500/20 rounded-lg p-3 mb-4">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="text-amber-400 text-sm">{currentRiddle.hint}</p>
                  </div>
                )}

                {showAnswer ? (
                  <div className="text-center">
                    <div className={`rounded-lg p-4 mb-4 ${result === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <p className={result === 'correct' ? 'text-green-400' : 'text-red-400'}>
                        {result === 'correct' ? '答對了！' : '答錯了！喝一口！'}
                      </p>
                      <p className="text-white text-lg font-bold mt-2">
                        答案：{currentRiddle.answer}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full btn-primary py-3 games-focus-ring"
                    >
                      下一題
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="輸入答案..."
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 games-focus-ring mb-4"
                      onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                    />

                    <div className="flex gap-2">
                      {!showHint && (
                        <button
                          type="button"
                          onClick={() => setShowHint(true)}
                          className="flex-1 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 games-focus-ring min-h-[48px]"
                        >
                          顯示提示
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={checkAnswer}
                        disabled={!userAnswer.trim()}
                        className="flex-1 btn-primary py-2 games-focus-ring disabled:opacity-50"
                      >
                        確認答案
                      </button>
                    </div>
                  </>
                )}
              </m.div>
            )}
          </AnimatePresence>

          {leaderboard.length > 0 && (
            <div className="mt-4 w-full max-w-xs bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-white/50 text-xs mb-2 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> 得分排行
              </p>
              <ul className="space-y-1">
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <li key={entry.index} className="flex justify-between text-sm text-white/70">
                    <span>{i === 0 && '🧠 '}{entry.name}</span>
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
