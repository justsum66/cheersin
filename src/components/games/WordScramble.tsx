'use client'
import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/contexts/I18nContext'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const WORDS = [
  { word: '咖啡', hint: '飲料' },
  { word: '電腦', hint: '科技' },
  { word: '音樂', hint: '藝術' },
  { word: '旅行', hint: '活動' },
  { word: '朋友', hint: '人際' },
  { word: '美食', hint: '料理' },
  { word: '愛情', hint: '情感' },
  { word: '夢想', hint: '追求' },
  { word: '快樂', hint: '情緒' },
  { word: '運動', hint: '活動' },
  { word: '派對', hint: '聚會' },
  { word: '啤酒', hint: '飲料' },
  { word: '威士忌', hint: '烈酒' },
  { word: '雞尾酒', hint: '調酒' },
]

function shuffleWord(word: string): string {
  const arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  const result = arr.join('')
  return result === word ? shuffleWord(word) : result
}

export default function WordScramble() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [currentWord, setCurrentWord] = useState<typeof WORDS[0] | null>(null)
  const [scrambled, setScrambled] = useState('')
  const [guess, setGuess] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [phase, setPhase] = useState<'waiting' | 'playing' | 'result'>('waiting')

  const players = contextPlayers.length > 0 ? contextPlayers : ['玩家1', '玩家2']
  const currentPlayer = players[(round - 1) % players.length]

  const startRound = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)]
    setCurrentWord(word)
    setScrambled(shuffleWord(word.word))
    setGuess('')
    setTimeLeft(15)
    setPhase('playing')
    play('click')
  }, [play])

  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft <= 0) {
      setPhase('result')
      setShowResult(true)
      play('wrong')
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [phase, timeLeft, play])

  const submitGuess = () => {
    if (!currentWord) return
    if (guess === currentWord.word) {
      setScores(s => ({ ...s, [currentPlayer]: (s[currentPlayer] || 0) + 1 }))
      play('correct')
    } else {
      play('wrong')
    }
    setPhase('result')
    setShowResult(true)
  }

  const nextRound = () => {
    setRound(r => r + 1)
    setShowResult(false)
    setPhase('waiting')
  }

  const resetGame = () => {
    setRound(1)
    setScores({})
    setPhase('waiting')
    setShowResult(false)
  }

  const resultText = players.map(p => `${p}: ${scores[p] || 0}分`).join('、')

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main">
      <GameRules rules="看到打亂的文字，限時猜出原本的詞！猜錯喝酒！" rulesKey="word-scramble.rules" />

      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <h2 className="text-2xl font-bold text-white">{t('common.turnLabel', { n: round })}</h2>
            <p className="text-white/80">{currentPlayer} 的回合</p>
            <button
              onClick={startRound}
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl text-white font-bold text-xl transition-colors"
            >
              開始挑戰
            </button>
          </motion.div>
        )}

        {phase === 'playing' && currentWord && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
            className="flex flex-col items-center gap-4 w-full max-w-md"
          >
            <div className="text-4xl font-bold text-accent-400">{timeLeft}秒</div>
            <div className="text-white/60 text-sm">提示：{currentWord.hint}</div>
            <div className="text-5xl font-bold text-white tracking-widest">{scrambled}</div>
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="輸入答案..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white text-center text-xl border border-white/20 focus:border-primary-400 outline-none"
              autoFocus
            />
            <button
              onClick={submitGuess}
              className="px-8 py-3 bg-accent-500 hover:bg-accent-600 rounded-xl text-white font-bold transition-colors"
            >
              確認答案
            </button>
          </motion.div>
        )}

        {phase === 'result' && showResult && currentWord && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <div className={`text-3xl font-bold ${guess === currentWord.word ? 'text-green-400' : 'text-red-400'}`}>
              {guess === currentWord.word ? '答對了！' : '答錯了！喝一口！'}
            </div>
            <div className="text-white/60">正確答案：{currentWord.word}</div>
            <div className="text-white mt-4">
              {players.map(p => (
                <span key={p} className="mx-2">{p}: {scores[p] || 0}分</span>
              ))}
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={nextRound}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-bold transition-colors"
              >
                下一回合
              </button>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors"
              >
                重新開始
              </button>
            </div>
            <CopyResultButton text={`文字重組 ${resultText}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
