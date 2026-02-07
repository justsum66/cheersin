'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, RefreshCw, MessageCircle } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const TRUTH_QUESTIONS = [
  { text: '你最尷尬的一次喝酒經驗是什麼？', category: '過去' },
  { text: '你對在場誰的第一印象最差？', category: '關係' },
  { text: '你偷偷暗戀過誰？', category: '感情' },
  { text: '你最害怕被發現的秘密是什麼？', category: '秘密' },
  { text: '你做過最瘋狂的事是什麼？', category: '冒險' },
  { text: '你對哪個朋友說過謊？', category: '關係' },
  { text: '你最不想讓父母知道的事是什麼？', category: '秘密' },
  { text: '你最想和誰交換人生一天？', category: '幻想' },
  { text: '你最近一次哭是因為什麼？', category: '情感' },
  { text: '你最羨慕在場誰的什麼？', category: '關係' },
  { text: '你覺得自己最大的缺點是什麼？', category: '自省' },
  { text: '你做過最後悔的決定是什麼？', category: '過去' },
  { text: '你偷偷做過什麼壞事？', category: '秘密' },
  { text: '你最想對誰道歉？', category: '關係' },
  { text: '你的人生目標是什麼？', category: '人生' },
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

export default function TruthWheel() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<typeof TRUTH_QUESTIONS[0] | null>(null)
  const [rotation, setRotation] = useState(0)
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set())
  const [history, setHistory] = useState<{ player: string; question: string }[]>([])
  const wheelRef = useRef<HTMLDivElement>(null)

  const spin = useCallback(() => {
    if (isSpinning) return
    play('click')
    setIsSpinning(true)
    setSelectedPlayer(null)
    setCurrentQuestion(null)

    const spinDegrees = 2000 + Math.random() * 2000
    const newRotation = rotation + spinDegrees
    setRotation(newRotation)

    setTimeout(() => {
      const segmentAngle = 360 / players.length
      const normalizedAngle = (newRotation % 360)
      const selectedIndex = Math.floor((360 - normalizedAngle) / segmentAngle) % players.length
      const player = players[selectedIndex]
      setSelectedPlayer(player)

      // 選擇問題
      const available = TRUTH_QUESTIONS.filter(q => !usedQuestions.has(q.text))
      if (available.length > 0) {
        const question = available[Math.floor(Math.random() * available.length)]
        setCurrentQuestion(question)
        setUsedQuestions(prev => new Set([...prev, question.text]))
        setHistory(prev => [...prev, { player, question: question.text }])
      }

      play('win')
      setIsSpinning(false)
    }, 4000)
  }, [isSpinning, rotation, players, usedQuestions, play])

  const resetGame = useCallback(() => {
    setIsSpinning(false)
    setSelectedPlayer(null)
    setCurrentQuestion(null)
    setRotation(0)
    setUsedQuestions(new Set())
    setHistory([])
  }, [])

  const segmentAngle = 360 / players.length

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="真心話轉盤">
      <GameRules
        rules="轉動轉盤選出回答者！\n被選中的人必須回答真心話問題，拒絕回答喝兩杯！"
        rulesKey="truth-wheel.rules"
      />

      {/* 轉盤 */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 mb-6">
        {/* 指針 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-6 h-6 bg-white rotate-45 shadow-lg" />
        </div>

        {/* 轉盤本體 */}
        <motion.div
          ref={wheelRef}
          className="w-full h-full rounded-full border-4 border-white/30 overflow-hidden shadow-2xl"
          style={{ transform: `rotate(${rotation}deg)` }}
          transition={reducedMotion ? { duration: 0 } : { duration: 4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {players.map((player, i) => {
            const colors = [
              'from-primary-500 to-primary-600',
              'from-secondary-500 to-secondary-600',
              'from-accent-500 to-accent-600',
              'from-pink-500 to-rose-500',
              'from-amber-500 to-orange-500',
              'from-emerald-500 to-green-500',
              'from-blue-500 to-indigo-500',
              'from-purple-500 to-violet-500',
            ]
            return (
              <div
                key={i}
                className={`absolute w-1/2 h-1/2 origin-bottom-right bg-gradient-to-br ${colors[i % colors.length]}`}
                style={{
                  transform: `rotate(${i * segmentAngle}deg) skewY(-${90 - segmentAngle}deg)`,
                }}
              >
                <span
                  className="absolute text-white font-bold text-xs sm:text-sm drop-shadow-md whitespace-nowrap"
                  style={{
                    transform: `skewY(${90 - segmentAngle}deg) rotate(${segmentAngle / 2}deg) translate(30px, 0)`,
                  }}
                >
                  {player}
                </span>
              </div>
            )
          })}
        </motion.div>

        {/* 中心圓 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center z-10">
          <MessageCircle className="w-6 h-6 text-primary-500" />
        </div>
      </div>

      {/* 結果 */}
      <AnimatePresence mode="wait">
        {selectedPlayer && currentQuestion && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -20 }}
            className="w-full max-w-md bg-gradient-to-br from-primary-900/40 to-secondary-900/40 rounded-2xl p-6 mb-6 border border-white/20"
          >
            <div className="text-center mb-4">
              <p className="text-white/50 text-sm mb-1">{currentQuestion.category}</p>
              <p className="text-primary-400 font-bold text-lg mb-2">
                {selectedPlayer} 請回答：
              </p>
              <h2 className="text-xl text-white">{currentQuestion.text}</h2>
            </div>
            <p className="text-white/40 text-sm text-center">
              拒絕回答要喝兩杯！
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 按鈕 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={spin}
          disabled={isSpinning}
          className="btn-primary px-8 py-3 text-lg games-focus-ring disabled:opacity-50 flex items-center gap-2"
        >
          <RotateCcw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
          {isSpinning ? '轉動中...' : '轉動轉盤'}
        </button>
        {selectedPlayer && (
          <CopyResultButton
            text={`真心話轉盤：\n${selectedPlayer} 被選中！\n問題：${currentQuestion?.text}`}
            label="複製"
          />
        )}
      </div>

      {/* 歷史記錄 */}
      {history.length > 0 && (
        <div className="mt-6 w-full max-w-md bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-white/50 text-xs mb-2">歷史記錄</p>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {history.slice(-5).reverse().map((record, i) => (
              <p key={i} className="text-sm text-white/70">
                <span className="text-primary-400">{record.player}</span>：{record.question.slice(0, 20)}...
              </p>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={resetGame}
        className="mt-4 px-4 py-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 games-focus-ring flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        重新開始
      </button>
    </div>
  )
}
