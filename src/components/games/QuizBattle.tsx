'use client'
import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/contexts/I18nContext'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const QUESTIONS = [
  { q: '台灣最高峰是？', options: ['玉山', '雪山', '合歡山', '阿里山'], answer: '玉山' },
  { q: '威士忌來自哪個國家？', options: ['蘇格蘭', '法國', '義大利', '德國'], answer: '蘇格蘭' },
  { q: '紅酒主要用什麼葡萄？', options: ['紅葡萄', '綠葡萄', '黑葡萄', '白葡萄'], answer: '紅葡萄' },
  { q: '啤酒的主要成分是？', options: ['麥芽', '米', '玉米', '小麥'], answer: '麥芽' },
  { q: '調酒師英文叫什麼？', options: ['Bartender', 'Chef', 'Waiter', 'Server'], answer: 'Bartender' },
  { q: '香檳來自哪個國家？', options: ['法國', '義大利', '西班牙', '德國'], answer: '法國' },
  { q: '清酒來自哪個國家？', options: ['日本', '韓國', '中國', '泰國'], answer: '日本' },
  { q: 'Mojito 的主酒是？', options: ['蘭姆酒', '伏特加', '琴酒', '龍舌蘭'], answer: '蘭姆酒' },
  { q: '世界上人口最多的國家？', options: ['印度', '中國', '美國', '印尼'], answer: '印度' },
  { q: '太陽系最大的行星？', options: ['木星', '土星', '天王星', '海王星'], answer: '木星' },
]

export default function QuizBattle() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [current, setCurrent] = useState<typeof QUESTIONS[0] | null>(null)
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [phase, setPhase] = useState<'waiting' | 'playing' | 'result'>('waiting')

  const players = contextPlayers.length > 0 ? contextPlayers : ['玩家1', '玩家2']
  const currentPlayer = players[(round - 1) % players.length]

  const startRound = useCallback(() => {
    const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
    setCurrent(q)
    setShuffledOptions([...q.options].sort(() => Math.random() - 0.5))
    setSelected(null)
    setTimeLeft(10)
    setPhase('playing')
    play('click')
  }, [play])

  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft <= 0) {
      play('wrong')
      setPhase('result')
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [phase, timeLeft, play])

  const selectAnswer = (ans: string) => {
    if (!current) return
    setSelected(ans)
    if (ans === current.answer) {
      setScores(s => ({ ...s, [currentPlayer]: (s[currentPlayer] || 0) + 1 }))
      play('correct')
    } else {
      play('wrong')
    }
    setPhase('result')
  }

  const nextRound = () => {
    setRound(r => r + 1)
    setPhase('waiting')
  }

  const resetGame = () => {
    setRound(1)
    setScores({})
    setPhase('waiting')
  }

  const resultText = players.map(p => `${p}: ${scores[p] || 0}分`).join('、')

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main">
      <GameRules rules="限時回答問題！答錯或超時喝酒！" rulesKey="quiz-battle.rules" />

      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <motion.div key="waiting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }} className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-white">{t('common.turnLabel', { n: round })}</h2>
            <p className="text-white/80">{currentPlayer} 的回合</p>
            <button onClick={startRound} className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl text-white font-bold text-xl transition-colors">開始答題</button>
          </motion.div>
        )}

        {phase === 'playing' && current && (
          <motion.div key="playing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }} className="flex flex-col items-center gap-4 w-full max-w-md">
            <div className="text-4xl font-bold text-accent-400">{timeLeft}秒</div>
            <div className="text-2xl text-white font-bold text-center">{current.q}</div>
            <div className="grid grid-cols-2 gap-4 w-full">
              {shuffledOptions.map(opt => (
                <button key={opt} onClick={() => selectAnswer(opt)} className="px-4 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold text-lg transition-colors">{opt}</button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'result' && current && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }} className="flex flex-col items-center gap-4">
            <div className={`text-3xl font-bold ${selected === current.answer ? 'text-green-400' : 'text-red-400'}`}>
              {selected === current.answer ? '答對了！' : selected ? '答錯了！喝一口！' : '時間到！喝一口！'}
            </div>
            <div className="text-white/60">正確答案：{current.answer}</div>
            <div className="text-white mt-4">{players.map(p => <span key={p} className="mx-2">{p}: {scores[p] || 0}分</span>)}</div>
            <div className="flex gap-4 mt-4">
              <button onClick={nextRound} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-bold transition-colors">下一回合</button>
              <button onClick={resetGame} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors">重新開始</button>
            </div>
            <CopyResultButton text={`知識對決 ${resultText}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
