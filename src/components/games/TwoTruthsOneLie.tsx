'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileQuestion, RotateCcw, Check, Eye, EyeOff, ChevronRight, ChevronLeft } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameReduceMotion } from './GameWrapper'
import CopyResultButton from './CopyResultButton'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

interface Statement {
  text: string
  isLie: boolean
}

type GamePhase = 'input' | 'guess' | 'reveal'

/** G1.15-G1.16：兩真一假遊戲 - 說兩個真話一個假話，其他人猜哪個是假的 */
export default function TwoTruthsOneLie() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const reducedMotion = useGameReduceMotion()

  // 遊戲狀態
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [phase, setPhase] = useState<GamePhase>('input')
  const [statements, setStatements] = useState<Statement[]>([
    { text: '', isLie: false },
    { text: '', isLie: false },
    { text: '', isLie: true }, // 預設第三個是假話
  ])
  const [selectedLieIndex, setSelectedLieIndex] = useState<number | null>(null)
  const [showStatements, setShowStatements] = useState(false)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [guessers, setGuessers] = useState<{ player: string; guess: number; correct: boolean }[]>([])

  const currentPlayer = players[currentPlayerIndex]
  const actualLieIndex = statements.findIndex(s => s.isLie)

  // 下一位玩家
  const nextPlayer = useCallback(() => {
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
    setPhase('input')
    setStatements([
      { text: '', isLie: false },
      { text: '', isLie: false },
      { text: '', isLie: true },
    ])
    setSelectedLieIndex(null)
    setShowStatements(false)
    setGuessers([])
  }, [currentPlayerIndex, players.length])

  // 重置遊戲
  const resetGame = useCallback(() => {
    setCurrentPlayerIndex(0)
    setPhase('input')
    setStatements([
      { text: '', isLie: false },
      { text: '', isLie: false },
      { text: '', isLie: true },
    ])
    setSelectedLieIndex(null)
    setShowStatements(false)
    setScores({})
    setGuessers([])
  }, [])

  // 更新陳述
  const updateStatement = useCallback((index: number, text: string) => {
    setStatements(prev => prev.map((s, i) => i === index ? { ...s, text } : s))
  }, [])

  // 設定哪個是假話
  const setLieIndex = useCallback((index: number) => {
    setStatements(prev => prev.map((s, i) => ({ ...s, isLie: i === index })))
  }, [])

  // 開始猜測
  const startGuessing = useCallback(() => {
    if (statements.some(s => !s.text.trim())) return
    play('click')
    // 隨機打亂順序顯示
    const shuffled = [...statements].sort(() => Math.random() - 0.5)
    setStatements(shuffled)
    setPhase('guess')
  }, [statements, play])

  // 提交猜測
  const submitGuess = useCallback((guesserName: string, guessIndex: number) => {
    const correct = guessIndex === statements.findIndex(s => s.isLie)
    play(correct ? 'correct' : 'wrong')
    
    setGuessers(prev => [...prev, { player: guesserName, guess: guessIndex, correct }])
    
    if (correct) {
      setScores(prev => ({ ...prev, [guesserName]: (prev[guesserName] || 0) + 1 }))
    }
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(correct ? [100] : [100, 50, 100])
    }
  }, [statements, play])

  // 揭曉答案
  const revealAnswer = useCallback(() => {
    play('click')
    setPhase('reveal')
  }, [play])

  // 渲染輸入階段
  const renderInputPhase = () => (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <div className="flex items-center gap-2 text-primary-400">
        <FileQuestion className="w-6 h-6" />
        <h2 className="text-xl font-bold">{currentPlayer} 的回合</h2>
      </div>
      
      <p className="text-white/50 text-sm text-center">
        輸入兩個真實的事（關於你自己）和一個假話
      </p>

      <div className="w-full space-y-4">
        {statements.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={s.text}
              onChange={(e) => updateStatement(i, e.target.value)}
              placeholder={`陳述 ${i + 1}...`}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary-400 games-focus-ring"
            />
            <button
              type="button"
              onClick={() => setLieIndex(i)}
              className={`px-4 py-3 rounded-xl transition-colors games-focus-ring ${
                s.isLie
                  ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                  : 'bg-white/10 text-white/50 border border-white/20 hover:bg-white/20'
              }`}
              aria-label={s.isLie ? '這是假話' : '設為假話'}
              title={s.isLie ? '這是假話' : '設為假話'}
            >
              {s.isLie ? '假' : '真'}
            </button>
          </div>
        ))}
      </div>

      <p className="text-white/40 text-xs">點擊右側按鈕標記哪個是假話</p>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={startGuessing}
        disabled={statements.some(s => !s.text.trim())}
        className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed games-focus-ring"
      >
        開始猜測
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </div>
  )

  // 渲染猜測階段
  const renderGuessPhase = () => {
    const otherPlayers = players.filter(p => p !== currentPlayer)
    const currentGuesser = otherPlayers.find(p => !guessers.some(g => g.player === p))
    
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white">
          {currentPlayer} 說了三件事
        </h2>
        
        {/* 隱藏/顯示切換（給出題者看） */}
        <button
          type="button"
          onClick={() => setShowStatements(!showStatements)}
          className="flex items-center gap-2 text-white/50 text-sm hover:text-white/70"
        >
          {showStatements ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showStatements ? '隱藏陳述' : '顯示陳述（出題者用）'}
        </button>

        {/* 陳述列表 */}
        <div className="w-full space-y-3">
          {statements.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-4 rounded-xl border ${
                showStatements && s.isLie
                  ? 'bg-red-500/20 border-red-500/50'
                  : 'bg-white/10 border-white/20'
              }`}
            >
              <span className="absolute -left-3 -top-3 w-7 h-7 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-white pl-2">{s.text}</p>
              {showStatements && s.isLie && (
                <span className="absolute -right-2 -top-2 px-2 py-0.5 rounded bg-red-500 text-white text-xs font-bold">
                  假話
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* 猜測區 */}
        {currentGuesser ? (
          <div className="w-full mt-4">
            <p className="text-white/70 text-center mb-4">
              <span className="text-primary-400 font-bold">{currentGuesser}</span> 猜哪個是假話？
            </p>
            <div className="flex gap-3 justify-center">
              {[0, 1, 2].map(i => (
                <motion.button
                  key={i}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => submitGuess(currentGuesser, i)}
                  className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold text-2xl games-focus-ring"
                >
                  {i + 1}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={revealAnswer}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-accent-500 to-purple-500 text-white font-bold text-lg games-focus-ring"
          >
            揭曉答案
            <Eye className="w-5 h-5" />
          </motion.button>
        )}

        {/* 猜測紀錄 */}
        {guessers.length > 0 && (
          <div className="w-full">
            <h3 className="text-white/50 text-sm mb-2">猜測紀錄</h3>
            <div className="flex flex-wrap gap-2">
              {guessers.map((g, i) => (
                <span
                  key={i}
                  className={`px-3 py-1 rounded-full text-sm ${
                    g.correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {g.player} 猜 {g.guess + 1} {g.correct ? '✓' : '✗'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 渲染揭曉階段
  const renderRevealPhase = () => {
    const wrongGuessers = guessers.filter(g => !g.correct)
    
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-2">答案揭曉！</h2>
          <p className="text-white/70">
            假話是第 <span className="text-red-400 font-bold text-xl">{actualLieIndex + 1}</span> 個
          </p>
        </motion.div>

        {/* 陳述列表（標記答案） */}
        <div className="w-full space-y-3">
          {statements.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className={`relative p-4 rounded-xl border ${
                s.isLie
                  ? 'bg-red-500/30 border-red-500'
                  : 'bg-emerald-500/20 border-emerald-500/50'
              }`}
            >
              <span className={`absolute -left-3 -top-3 w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center ${
                s.isLie ? 'bg-red-500' : 'bg-emerald-500'
              }`}>
                {i + 1}
              </span>
              <p className="text-white pl-2">{s.text}</p>
              <span className={`absolute -right-2 -top-2 px-2 py-0.5 rounded text-white text-xs font-bold ${
                s.isLie ? 'bg-red-500' : 'bg-emerald-500'
              }`}>
                {s.isLie ? '假話' : '真話'}
              </span>
            </motion.div>
          ))}
        </div>

        {/* 懲罰 */}
        {wrongGuessers.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <p className="text-red-400 font-bold text-lg">
              {wrongGuessers.map(g => g.player).join('、')} 猜錯了，喝！
            </p>
          </motion.div>
        )}

        <CopyResultButton text={`兩真一假：${currentPlayer} 的假話是「${statements[actualLieIndex]?.text}」。${wrongGuessers.length > 0 ? `${wrongGuessers.map(g => g.player).join('、')}猜錯，喝！` : '全員猜對！'}`} />

        {/* 分數 */}
        {Object.keys(scores).length > 0 && (
          <div className="w-full">
            <h3 className="text-white/50 text-sm mb-2">目前分數</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([player, score]) => (
                <span key={player} className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm">
                  {player}: {score} 分
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={nextPlayer}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold games-focus-ring"
          >
            下一位
            <ChevronRight className="w-5 h-5" />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={resetGame}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold games-focus-ring"
          >
            <RotateCcw className="w-5 h-5" />
            重新開始
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="兩真一假遊戲">
      <GameRules rules={`每人輪流說三件關於自己的事：兩件真的、一件假的。\n其他人猜哪個是假話，猜錯的人喝！`} />
      
      <AnimatePresence mode="wait">
        {phase === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex justify-center"
          >
            {renderInputPhase()}
          </motion.div>
        )}
        {phase === 'guess' && (
          <motion.div
            key="guess"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex justify-center"
          >
            {renderGuessPhase()}
          </motion.div>
        )}
        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex justify-center"
          >
            {renderRevealPhase()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
