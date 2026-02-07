'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, RotateCcw, Shuffle, AlertTriangle } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameReduceMotion } from './GameWrapper'
import CopyResultButton from './CopyResultButton'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2']

/** 18+ 辣味真心話題庫 */
const SPICY_TRUTHS = [
  '你最尷尬的約會經歷是什麼？',
  '你曾經偷偷喜歡過朋友的另一半嗎？',
  '你做過最瘋狂的一夜情故事？',
  '你有什麼不為人知的性癖好？',
  '你曾在什麼奇怪的地方做過？',
  '你的初夜發生在什麼地方？',
  '你做過最後悔的感情決定是什麼？',
  '你曾對另一半撒過最大的謊是什麼？',
  '你有沒有同時跟兩個人交往過？',
  '你最近一次自我滿足是什麼時候？',
  '描述你最糟糕的接吻經歷',
  '你有沒有在公共場所被抓包過？',
  '你曾經偷看過誰的私密照片？',
  '你有沒有跟同事或上司發生過關係？',
  '你曾經為了性而說謊嗎？',
  '你有沒有曖昧過已婚的人？',
  '你最想跟在場誰有更深入的了解？',
  '你曾經有過 3P 的念頭嗎？',
  '你有沒有買過成人用品？',
  '你曾在什麼情況下被撩到心動？',
]

/** 18+ 辣味大冒險題庫 */
const SPICY_DARES = [
  '對你左邊的人說一句最撩的情話',
  '模仿你做過最性感的動作',
  '讓在場最帥/美的人餵你喝一口酒',
  '解開一顆扣子或脫掉一件配飾',
  '用最性感的聲音念一段文字',
  '跟你對面的人深情對視 30 秒',
  '做出你認為最誘惑的表情',
  '跟你右邊的人擁抱 10 秒',
  '讓別人用一個詞形容你的身材',
  '示範你最拿手的撩人技巧',
  '讓在場的人投票你最性感的部位',
  '打電話給你前任說「我想你」',
  '讓你喜歡的人摸摸你的頭髮',
  '表演一段挑逗的舞蹈動作',
  '對鏡頭擺出三個性感姿勢',
  '讓別人猜你最敏感的部位',
  '跟選定的人玩親親蘋果',
  '用身體語言表達你現在的想法',
  '對在場最帥/美的人告白',
  '讓大家看你手機最後一張照片',
]

/** G1.17-G1.18：辣味真心話大冒險 - 18+ 成人版 */
export default function SpicyTruthOrDare() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const reducedMotion = useGameReduceMotion()

  // 遊戲狀態
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [choice, setChoice] = useState<'truth' | 'dare' | null>(null)
  const [question, setQuestion] = useState<string | null>(null)
  const [usedTruths, setUsedTruths] = useState<Set<number>>(new Set())
  const [usedDares, setUsedDares] = useState<Set<number>>(new Set())
  const [history, setHistory] = useState<{ player: string; type: 'truth' | 'dare'; question: string }[]>([])
  const [showWarning, setShowWarning] = useState(true)

  const currentPlayer = players[currentPlayerIndex]

  // 取得隨機題目
  const getRandomQuestion = useCallback((type: 'truth' | 'dare') => {
    const questions = type === 'truth' ? SPICY_TRUTHS : SPICY_DARES
    const used = type === 'truth' ? usedTruths : usedDares
    
    const available = questions.map((q, i) => i).filter(i => !used.has(i))
    
    if (available.length === 0) {
      // 重置已用題目
      if (type === 'truth') setUsedTruths(new Set())
      else setUsedDares(new Set())
      return questions[Math.floor(Math.random() * questions.length)]
    }
    
    const idx = available[Math.floor(Math.random() * available.length)]
    if (type === 'truth') setUsedTruths(prev => new Set([...prev, idx]))
    else setUsedDares(prev => new Set([...prev, idx]))
    
    return questions[idx]
  }, [usedTruths, usedDares])

  // 選擇真心話或大冒險
  const handleChoice = useCallback((type: 'truth' | 'dare') => {
    play('click')
    setChoice(type)
    const q = getRandomQuestion(type)
    setQuestion(q)
    setHistory(prev => [...prev, { player: currentPlayer, type, question: q }])
  }, [getRandomQuestion, currentPlayer, play])

  // 下一位
  const nextPlayer = useCallback(() => {
    play('click')
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
    setChoice(null)
    setQuestion(null)
  }, [currentPlayerIndex, players.length, play])

  // 換一題
  const changeQuestion = useCallback(() => {
    if (!choice) return
    play('click')
    const q = getRandomQuestion(choice)
    setQuestion(q)
    // 更新歷史最後一條
    setHistory(prev => {
      const newHistory = [...prev]
      if (newHistory.length > 0) {
        newHistory[newHistory.length - 1] = { ...newHistory[newHistory.length - 1], question: q }
      }
      return newHistory
    })
  }, [choice, getRandomQuestion, play])

  // 重置遊戲
  const resetGame = useCallback(() => {
    setCurrentPlayerIndex(0)
    setChoice(null)
    setQuestion(null)
    setUsedTruths(new Set())
    setUsedDares(new Set())
    setHistory([])
  }, [])

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
            請確保所有參與者都是成年人且自願參加。
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowWarning(false)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold games-focus-ring"
            >
              我已滿 18 歲，繼續
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="辣味真心話大冒險">
      <GameRules rules={`成人版真心話大冒險 🔥\n選擇真心話回答私密問題，或選擇大冒險執行挑戰。\n不願意執行可以喝酒代替！`} />
      
      {/* 標題 */}
      <div className="flex items-center gap-2 mb-6">
        <Flame className="w-6 h-6 text-red-400" />
        <h2 className="text-xl font-bold text-red-400">18+ 辣味版</h2>
      </div>

      {/* 輪到誰 */}
      <p className="text-white/70 text-lg mb-6">
        輪到 <span className="text-primary-400 font-bold">{currentPlayer}</span>
      </p>

      <AnimatePresence mode="wait">
        {!choice ? (
          /* 選擇階段 */
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-white/50">選擇你的命運...</p>
            <div className="flex gap-4">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => handleChoice('truth')}
                className="min-w-[140px] px-8 py-6 rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 text-white font-bold text-xl shadow-lg games-focus-ring"
              >
                🔥 真心話
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => handleChoice('dare')}
                className="min-w-[140px] px-8 py-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl shadow-lg games-focus-ring"
              >
                💋 大冒險
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* 問題/挑戰階段 */
          <motion.div
            key="question"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 max-w-md"
          >
            <div className={`px-4 py-2 rounded-full ${
              choice === 'truth' ? 'bg-pink-500/20 text-pink-400' : 'bg-purple-500/20 text-purple-400'
            }`}>
              {choice === 'truth' ? '🔥 真心話' : '💋 大冒險'}
            </div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-6 rounded-2xl bg-white/10 border border-white/20 text-center"
            >
              <p className="text-white text-xl font-medium">{question}</p>
            </motion.div>

            <div className="flex gap-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={changeQuestion}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 games-focus-ring"
              >
                <Shuffle className="w-4 h-4" />
                換一題
              </motion.button>
            </div>

            <p className="text-white/40 text-sm">不想做？喝一杯代替！</p>

            <CopyResultButton text={`辣味${choice === 'truth' ? '真心話' : '大冒險'}：${currentPlayer} 的題目是「${question}」`} />

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={nextPlayer}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold games-focus-ring"
            >
              下一位
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 重置按鈕 */}
      <button
        type="button"
        onClick={resetGame}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/50 games-focus-ring"
        aria-label="重新開始"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* 歷史紀錄 */}
      {history.length > 0 && (
        <div className="absolute bottom-4 left-4 max-w-[200px]">
          <p className="text-white/30 text-xs mb-1">最近</p>
          <div className="space-y-1">
            {history.slice(-3).map((h, i) => (
              <div key={i} className="text-xs text-white/40 truncate">
                {h.player}: {h.type === 'truth' ? '🔥' : '💋'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
