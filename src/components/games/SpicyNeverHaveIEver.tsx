'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, RotateCcw, Shuffle, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameReduceMotion } from './GameWrapper'
import CopyResultButton from './CopyResultButton'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

/** 18+ 辣味「我從來沒有」題庫 */
const SPICY_STATEMENTS = [
  '我從來沒有...跟陌生人一夜情',
  '我從來沒有...在公共場所親熱過',
  '我從來沒有...傳過裸照給別人',
  '我從來沒有...在辦公室發生過關係',
  '我從來沒有...同時跟兩個人交往',
  '我從來沒有...被另一半抓包出軌',
  '我從來沒有...為了上床而說謊',
  '我從來沒有...用過約會軟體',
  '我從來沒有...跟朋友的前任在一起',
  '我從來沒有...在車上做過',
  '我從來沒有...被人拒絕過表白',
  '我從來沒有...去過成人場所',
  '我從來沒有...看過成人影片',
  '我從來沒有...有過曖昧對象超過三個',
  '我從來沒有...跟比自己大十歲的人約會',
  '我從來沒有...做過讓自己後悔的親密行為',
  '我從來沒有...偷偷喜歡過朋友的另一半',
  '我從來沒有...因為寂寞而找人約',
  '我從來沒有...被劈腿過',
  '我從來沒有...劈腿過別人',
  '我從來沒有...跟前任復合過',
  '我從來沒有...撒謊說分手了其實沒有',
  '我從來沒有...在第一次約會就上床',
  '我從來沒有...有過露水姻緣',
  '我從來沒有...買過情趣用品',
  '我從來沒有...被發現在看限制級內容',
  '我從來沒有...因為對方有錢而交往',
  '我從來沒有...在旅行時有過艷遇',
  '我從來沒有...跟同事發生過關係',
  '我從來沒有...收過或送過裸照',
]

/** G1.19-G1.20：辣味我從來沒有 - 18+ 成人版 */
export default function SpicyNeverHaveIEver() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const reducedMotion = useGameReduceMotion()

  // 遊戲狀態
  const [currentStatement, setCurrentStatement] = useState<string | null>(null)
  const [usedStatements, setUsedStatements] = useState<Set<number>>(new Set())
  const [responses, setResponses] = useState<Record<string, boolean>>({})
  const [showResponses, setShowResponses] = useState(false)
  const [history, setHistory] = useState<{ statement: string; drinkers: string[] }[]>([])
  const [showWarning, setShowWarning] = useState(true)
  const [scores, setScores] = useState<Record<string, number>>({})

  // 取得下一題
  const getNextStatement = useCallback(() => {
    const available = SPICY_STATEMENTS.map((s, i) => i).filter(i => !usedStatements.has(i))
    
    if (available.length === 0) {
      setUsedStatements(new Set())
      const idx = Math.floor(Math.random() * SPICY_STATEMENTS.length)
      return SPICY_STATEMENTS[idx]
    }
    
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedStatements(prev => new Set([...prev, idx]))
    return SPICY_STATEMENTS[idx]
  }, [usedStatements])

  // 開始新一輪
  const startNewRound = useCallback(() => {
    play('click')
    const statement = getNextStatement()
    setCurrentStatement(statement)
    setResponses({})
    setShowResponses(false)
  }, [getNextStatement, play])

  // 玩家回應（做過/沒做過）
  const handleResponse = useCallback((player: string, hasDone: boolean) => {
    play('click')
    setResponses(prev => ({ ...prev, [player]: hasDone }))
  }, [play])

  // 揭曉結果
  const revealResponses = useCallback(() => {
    play('correct')
    setShowResponses(true)
    
    // 做過的人要喝
    const drinkers = Object.entries(responses).filter(([_, done]) => done).map(([player]) => player)
    
    // 更新分數（喝越多分越高）
    drinkers.forEach(player => {
      setScores(prev => ({ ...prev, [player]: (prev[player] || 0) + 1 }))
    })
    
    if (currentStatement) {
      setHistory(prev => [...prev, { statement: currentStatement, drinkers }])
    }
    
    if (typeof navigator !== 'undefined' && navigator.vibrate && drinkers.length > 0) {
      navigator.vibrate([100, 50, 100])
    }
  }, [responses, currentStatement, play])

  // 重置遊戲
  const resetGame = useCallback(() => {
    setCurrentStatement(null)
    setUsedStatements(new Set())
    setResponses({})
    setShowResponses(false)
    setHistory([])
    setScores({})
  }, [])

  const allResponded = Object.keys(responses).length === players.length
  const drinkers = Object.entries(responses).filter(([_, done]) => done).map(([player]) => player)

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
            做過的人要喝酒！
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
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="辣味我從來沒有">
      <GameRules rules={`成人版我從來沒有 🔥\n讀出題目後，做過的人要喝酒！\n誠實作答，不要害羞～`} />
      
      {/* 標題 */}
      <div className="flex items-center gap-2 mb-6">
        <Flame className="w-6 h-6 text-red-400" />
        <h2 className="text-xl font-bold text-red-400">18+ 辣味版</h2>
      </div>

      <AnimatePresence mode="wait">
        {!currentStatement ? (
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
              <Shuffle className="w-6 h-6" />
              抽一題
            </motion.button>
          </motion.div>
        ) : (
          /* 題目階段 */
          <motion.div
            key="statement"
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
              <p className="text-white text-xl font-medium">{currentStatement}</p>
            </motion.div>

            {/* 玩家回應區 */}
            {!showResponses && (
              <div className="w-full">
                <p className="text-white/50 text-sm text-center mb-4">各位玩家請回應</p>
                <div className="grid grid-cols-2 gap-3">
                  {players.map(player => (
                    <div key={player} className="flex flex-col items-center gap-2">
                      <span className="text-white/70 text-sm truncate max-w-full">{player}</span>
                      {responses[player] === undefined ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleResponse(player, true)}
                            className="p-3 rounded-xl bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 games-focus-ring"
                            aria-label={`${player} 做過`}
                          >
                            <ThumbsUp className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResponse(player, false)}
                            className="p-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 games-focus-ring"
                            aria-label={`${player} 沒做過`}
                          >
                            <ThumbsDown className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          responses[player] ? 'bg-pink-500/30 text-pink-400' : 'bg-white/10 text-white/50'
                        }`}>
                          {responses[player] ? '做過 👀' : '沒有'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 揭曉按鈕 */}
            {allResponded && !showResponses && (
              <motion.button
                type="button"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.96 }}
                onClick={revealResponses}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-accent-500 to-purple-500 text-white font-bold games-focus-ring"
              >
                揭曉結果！
              </motion.button>
            )}

            {/* 結果顯示 */}
            {showResponses && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                {drinkers.length > 0 ? (
                  <>
                    <p className="text-red-400 font-bold text-xl">
                      {drinkers.join('、')} 喝！
                    </p>
                    <p className="text-white/50 text-sm">做過的人都要喝一口</p>
                  </>
                ) : (
                  <p className="text-emerald-400 font-bold text-xl">大家都是純潔的～</p>
                )}

                <CopyResultButton text={`辣味我從來沒有：「${currentStatement}」${drinkers.length > 0 ? `- ${drinkers.join('、')}喝！` : '- 沒人做過'}`} />

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
          <p className="text-white/30 text-xs mb-1">喝酒排行 🍺</p>
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
