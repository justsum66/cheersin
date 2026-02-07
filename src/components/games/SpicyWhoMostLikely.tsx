'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, RotateCcw, Shuffle, AlertTriangle, Users } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameReduceMotion } from './GameWrapper'
import CopyResultButton from './CopyResultButton'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

/** 18+ 辣味「誰最可能」題庫 */
const SPICY_QUESTIONS = [
  '誰最可能有秘密交往對象？',
  '誰最可能在辦公室跟同事搞曖昧？',
  '誰最可能一夜情之後還約第二次？',
  '誰最可能用約會軟體找對象？',
  '誰最可能劈腿？',
  '誰最可能被劈腿還不知道？',
  '誰最可能跟前任復合？',
  '誰最可能醉酒後做出後悔的事？',
  '誰最可能有一個以上的砲友？',
  '誰最可能談辦公室戀情？',
  '誰最可能跟朋友的前任在一起？',
  '誰最可能為了上床而說謊？',
  '誰最可能有最多前任？',
  '誰最可能在第一次約會就上床？',
  '誰最可能有過三人行？',
  '誰最可能收過或送過裸照？',
  '誰最可能跟比自己大很多的人交往？',
  '誰最可能用錢維持關係？',
  '誰最可能被發現在看限制級內容？',
  '誰最可能去過夜店找艷遇？',
  '誰最可能有最奇怪的癖好？',
  '誰最可能偷偷喜歡在場某人？',
  '誰最可能被前任纏著不放？',
  '誰最可能是大家公認的情聖？',
  '誰最可能在感情中最善變？',
  '誰最可能為愛情做傻事？',
  '誰最可能撒謊自己是單身？',
  '誰最可能被人掛念著？',
  '誰最可能在旅行時發生艷遇？',
  '誰最可能私底下最悶騷？',
]

/** G1.21-G1.22：辣味誰最可能 - 18+ 成人版 */
export default function SpicyWhoMostLikely() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const reducedMotion = useGameReduceMotion()

  // 遊戲狀態
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set())
  const [votes, setVotes] = useState<Record<string, string>>({}) // voter -> votee
  const [showResults, setShowResults] = useState(false)
  const [history, setHistory] = useState<{ question: string; winner: string; count: number }[]>([])
  const [showWarning, setShowWarning] = useState(true)
  const [scores, setScores] = useState<Record<string, number>>({})

  // 取得下一題
  const getNextQuestion = useCallback(() => {
    const available = SPICY_QUESTIONS.map((q, i) => i).filter(i => !usedQuestions.has(i))
    
    if (available.length === 0) {
      setUsedQuestions(new Set())
      const idx = Math.floor(Math.random() * SPICY_QUESTIONS.length)
      return SPICY_QUESTIONS[idx]
    }
    
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedQuestions(prev => new Set([...prev, idx]))
    return SPICY_QUESTIONS[idx]
  }, [usedQuestions])

  // 開始新一輪
  const startNewRound = useCallback(() => {
    play('click')
    const question = getNextQuestion()
    setCurrentQuestion(question)
    setVotes({})
    setShowResults(false)
  }, [getNextQuestion, play])

  // 玩家投票
  const handleVote = useCallback((voter: string, votee: string) => {
    play('click')
    setVotes(prev => ({ ...prev, [voter]: votee }))
  }, [play])

  // 揭曉結果
  const revealResults = useCallback(() => {
    play('correct')
    setShowResults(true)
    
    // 計算票數
    const voteCounts: Record<string, number> = {}
    Object.values(votes).forEach(votee => {
      voteCounts[votee] = (voteCounts[votee] || 0) + 1
    })
    
    // 找出最高票
    const maxVotes = Math.max(...Object.values(voteCounts), 0)
    const winners = Object.entries(voteCounts).filter(([_, count]) => count === maxVotes)
    
    // 更新分數
    winners.forEach(([player]) => {
      setScores(prev => ({ ...prev, [player]: (prev[player] || 0) + 1 }))
    })
    
    if (currentQuestion && winners.length > 0) {
      setHistory(prev => [...prev, { question: currentQuestion, winner: winners[0][0], count: maxVotes }])
    }
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  }, [votes, currentQuestion, play])

  // 重置遊戲
  const resetGame = useCallback(() => {
    setCurrentQuestion(null)
    setUsedQuestions(new Set())
    setVotes({})
    setShowResults(false)
    setHistory([])
    setScores({})
  }, [])

  const allVoted = Object.keys(votes).length === players.length
  
  // 計算票數
  const voteCounts: Record<string, number> = {}
  Object.values(votes).forEach(votee => {
    voteCounts[votee] = (voteCounts[votee] || 0) + 1
  })
  const maxVotes = Math.max(...Object.values(voteCounts), 0)
  const winners = Object.entries(voteCounts).filter(([_, count]) => count === maxVotes).map(([player]) => player)

  // 18+ 警告
  if (showWarning) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6 max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">18+ 成人內容警告</h2>
          <p className="text-white/70">
            此遊戲包含成人向內容，僅限 18 歲以上玩家參與。
            被最多人指的人要喝酒！
          </p>
          <button
            type="button"
            onClick={() => setShowWarning(false)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold games-focus-ring"
          >
            我已滿 18 歲，繼續
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="辣味誰最可能">
      <GameRules rules={`成人版誰最可能 🔥\n讀出問題後，大家同時指向覺得最符合的人。\n被最多人指的人喝酒！`} />
      
      {/* 標題 */}
      <div className="flex items-center gap-2 mb-6">
        <Flame className="w-6 h-6 text-red-400" />
        <h2 className="text-xl font-bold text-red-400">18+ 辣味版</h2>
      </div>

      <AnimatePresence mode="wait">
        {!currentQuestion ? (
          /* 開始按鈕 */
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-white/50 text-center">準備好了嗎？<br />點擊開始抽題</p>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={startNewRound}
              className="flex items-center gap-2 px-8 py-6 rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 text-white font-bold text-xl shadow-lg games-focus-ring"
            >
              <Users className="w-6 h-6" />
              抽一題
            </motion.button>
          </motion.div>
        ) : (
          /* 題目階段 */
          <motion.div
            key="question"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 w-full max-w-md"
          >
            {/* 題目卡片 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full p-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-red-500/20 border border-pink-500/30 text-center"
            >
              <p className="text-white text-xl font-medium">{currentQuestion}</p>
            </motion.div>

            {/* 玩家投票區 */}
            {!showResults && (
              <div className="w-full">
                <p className="text-white/50 text-sm text-center mb-4">每位玩家選擇一個人</p>
                <div className="space-y-4">
                  {players.map(voter => (
                    <div key={voter} className="flex flex-col gap-2">
                      <span className="text-white/70 text-sm">{voter} 投給：</span>
                      <div className="flex flex-wrap gap-2">
                        {players.map(votee => (
                          <button
                            key={votee}
                            type="button"
                            onClick={() => handleVote(voter, votee)}
                            disabled={votes[voter] !== undefined}
                            className={`px-4 py-2 rounded-xl text-sm transition-colors games-focus-ring ${
                              votes[voter] === votee
                                ? 'bg-pink-500 text-white'
                                : votes[voter] !== undefined
                                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            {votee}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 揭曉按鈕 */}
            {allVoted && !showResults && (
              <motion.button
                type="button"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.96 }}
                onClick={revealResults}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-accent-500 to-purple-500 text-white font-bold games-focus-ring"
              >
                揭曉結果！
              </motion.button>
            )}

            {/* 結果顯示 */}
            {showResults && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                {/* 票數統計 */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {players.map(player => (
                    <div
                      key={player}
                      className={`px-4 py-2 rounded-xl ${
                        winners.includes(player)
                          ? 'bg-red-500/30 text-red-400 border border-red-500'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {player}: {voteCounts[player] || 0} 票
                      {winners.includes(player) && ' 👑'}
                    </div>
                  ))}
                </div>

                {winners.length > 0 && (
                  <p className="text-red-400 font-bold text-xl">
                    {winners.join('、')} 喝！({maxVotes} 票)
                  </p>
                )}

                <CopyResultButton text={`辣味誰最可能：「${currentQuestion}」- ${winners.join('、')}以 ${maxVotes} 票勝出，喝！`} />

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={startNewRound}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold games-focus-ring"
                >
                  <Shuffle className="w-5 h-5" />
                  下一題
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 分數排行 */}
      {Object.keys(scores).length > 0 && (
        <div className="absolute bottom-4 left-4">
          <p className="text-white/30 text-xs mb-1">被指排行 👆</p>
          <div className="space-y-0.5">
            {Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([player, score], i) => (
              <div key={player} className="text-xs text-white/40">
                {i === 0 ? '👑' : i === 1 ? '🥈' : '🥉'} {player}: {score}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 重置按鈕 */}
      <button
        type="button"
        onClick={resetGame}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/50 games-focus-ring"
        aria-label="重新開始"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
