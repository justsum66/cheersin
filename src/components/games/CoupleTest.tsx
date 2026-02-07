'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, RotateCcw, Check, X } from 'lucide-react'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

/** G2.9 情侶默契題庫：生活、價值觀、回憶、習慣等 */
const COUPLE_QUESTIONS = [
  '另一半最喜歡的食物是？',
  '我們第一次約會去哪裡？',
  '另一半最討厭什麼？',
  '另一半的夢想是？',
  '另一半壓力大時會做什麼？',
  '另一半最好的朋友是誰？',
  '另一半最喜歡的電影類型？',
  '另一半最常聽什麼音樂？',
  '另一半最怕什麼？',
  '另一半睡覺習慣是？',
  '我們第一次說「我愛你」是何時？',
  '另一半最喜歡的季節？',
  '另一半最想去哪個國家？',
  '另一半最喜歡我什麼？',
  '另一半最討厭我什麼習慣？',
  '另一半理想的週末是？',
  '另一半最喜歡的顏色？',
  '另一半最引以為傲的事？',
  '另一半最難忘的回憶？',
  '另一半最想學的技能？',
  '另一半的生日願望通常是？',
  '另一半最喜歡的禮物類型？',
  '吵架後另一半通常先怎麼和好？',
  '另一半最喜歡的約會方式？',
  '另一半最在意的家人是誰？',
  '另一半小時候的夢想是？',
  '另一半最討厭被怎麼對待？',
  '另一半覺得我最可愛的瞬間？',
  '另一半最喜歡我們一起做的活動？',
  '另一半的雷區或地雷是什麼？',
  '另一半最常誇我什麼？',
  '另一半心目中理想的家庭樣子？',
  '另一半最喜歡的動物？',
  '另一半最想和我一起去的地方？',
  '另一半覺得我們哪裡最合拍？',
]

/** G2.9-G2.10：情侶默契測試 - 測試情侶間的了解程度 */
export default function CoupleTest() {
  const { play } = useGameSound()
  const [player1Name, setPlayer1Name] = useState('')
  const [player2Name, setPlayer2Name] = useState('')
  const [started, setStarted] = useState(false)
  const [currentQ, setCurrentQ] = useState<string | null>(null)
  const [usedQs, setUsedQs] = useState<Set<number>>(new Set())
  const [currentAnswerer, setCurrentAnswerer] = useState(0)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const [showResult, setShowResult] = useState(false)

  const getNextQ = useCallback(() => {
    const available = COUPLE_QUESTIONS.map((_, i) => i).filter(i => !usedQs.has(i))
    if (available.length === 0) return null
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedQs(prev => new Set([...prev, idx]))
    return COUPLE_QUESTIONS[idx]
  }, [usedQs])

  const startGame = useCallback(() => {
    if (!player1Name.trim() || !player2Name.trim()) return
    play('click')
    setStarted(true)
    setCurrentQ(getNextQ())
    setCurrentAnswerer(0)
  }, [player1Name, player2Name, getNextQ, play])

  const nextQuestion = useCallback(() => {
    play('click')
    const q = getNextQ()
    if (!q) {
      setShowResult(true)
    } else {
      setCurrentQ(q)
      setCurrentAnswerer(currentAnswerer === 0 ? 1 : 0)
    }
  }, [getNextQ, currentAnswerer, play])

  const markAnswer = useCallback((correct: boolean) => {
    if (correct) {
      play('correct')
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }))
    } else {
      play('wrong')
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }))
    }
    nextQuestion()
  }, [nextQuestion, play])

  const resetGame = useCallback(() => {
    setPlayer1Name('')
    setPlayer2Name('')
    setStarted(false)
    setCurrentQ(null)
    setUsedQs(new Set())
    setCurrentAnswerer(0)
    setScore({ correct: 0, wrong: 0 })
    setShowResult(false)
  }, [])

  const answererName = currentAnswerer === 0 ? player1Name : player2Name
  const totalQuestions = score.correct + score.wrong
  const compatibility = totalQuestions > 0 ? Math.round((score.correct / totalQuestions) * 100) : 0
  /** G2.10 配對邏輯：依默契指數回傳配對結果標籤 */
  const pairingLabel =
    compatibility >= 90 ? '靈魂伴侶'
    : compatibility >= 75 ? '默契十足'
    : compatibility >= 60 ? '還不錯'
    : compatibility >= 40 ? '還需磨合'
    : '多聊聊吧'

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={`測試你們有多了解對方！\n輪流回答關於另一半的問題。\n答錯喝酒！`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-6 h-6 text-pink-400" />
        <h2 className="text-xl font-bold text-white">情侶默契測試</h2>
      </div>

      {!started ? (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <input
            type="text"
            placeholder="輸入第一位的名字"
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 games-focus-ring"
          />
          <input
            type="text"
            placeholder="輸入第二位的名字"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 games-focus-ring"
          />
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={startGame}
            disabled={!player1Name.trim() || !player2Name.trim()}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold disabled:opacity-50 games-focus-ring"
          >
            開始測試！
          </motion.button>
        </div>
      ) : showResult ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <p className="text-4xl font-bold text-pink-400 mb-2">{compatibility}%</p>
          <p className="text-white/70 mb-1">默契指數</p>
          <p className="text-primary-300 font-medium mb-2">{pairingLabel}</p>
          <p className="text-white/50 mb-4">答對 {score.correct} / {totalQuestions} 題</p>
          {compatibility >= 80 && <p className="text-emerald-400">太棒了！你們超有默契 💕</p>}
          {compatibility >= 50 && compatibility < 80 && <p className="text-yellow-400">還不錯！繼續培養默契 💛</p>}
          {compatibility < 50 && <p className="text-red-400">需要更多了解對方喔 💔</p>}
          <div className="flex gap-3 mt-4 justify-center">
            <button onClick={resetGame} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">再玩一次</button>
            <CopyResultButton text={`情侶默契測試：${player1Name} ❤️ ${player2Name}\n默契指數：${compatibility}% · ${pairingLabel}\n答對 ${score.correct}/${totalQuestions} 題`} />
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          <p className="text-white/50">第 {totalQuestions + 1} 題</p>
          <p className="text-white/70">
            <span className="text-pink-400 font-bold">{answererName}</span> 來回答：
          </p>
          
          <motion.div
            key={currentQ}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-full p-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-red-500/20 border border-pink-500/30 text-center"
          >
            <p className="text-white text-xl">{currentQ}</p>
          </motion.div>

          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => markAnswer(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold games-focus-ring"
            >
              <Check className="w-5 h-5" /> 答對
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => markAnswer(false)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold games-focus-ring"
            >
              <X className="w-5 h-5" /> 答錯，喝！
            </motion.button>
          </div>
        </div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
