'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const EMOTIONS = [
  { emoji: '😊', name: '開心', options: ['開心', '難過', '生氣', '驚訝'] },
  { emoji: '😢', name: '難過', options: ['開心', '難過', '尷尬', '害怕'] },
  { emoji: '😠', name: '生氣', options: ['生氣', '開心', '疲倦', '驚訝'] },
  { emoji: '😨', name: '害怕', options: ['害怕', '開心', '難過', '興奮'] },
  { emoji: '🤔', name: '疑惑', options: ['疑惑', '確定', '開心', '生氣'] },
  { emoji: '😴', name: '疲倦', options: ['疲倦', '興奮', '開心', '難過'] },
  { emoji: '🥳', name: '興奮', options: ['興奮', '無聊', '難過', '生氣'] },
  { emoji: '😳', name: '尷尬', options: ['尷尬', '自信', '開心', '生氣'] },
  { emoji: '😏', name: '得意', options: ['得意', '失落', '害怕', '驚訝'] },
  { emoji: '🤩', name: '崇拜', options: ['崇拜', '厭惡', '無聊', '害怕'] },
  { emoji: '😤', name: '不滿', options: ['不滿', '滿意', '開心', '驚訝'] },
  { emoji: '🥺', name: '委屈', options: ['委屈', '驕傲', '生氣', '開心'] },
]

export default function EmotionRead() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [currentEmotion, setCurrentEmotion] = useState<typeof EMOTIONS[0] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [phase, setPhase] = useState<'waiting' | 'playing' | 'result'>('waiting')

  const players = contextPlayers.length > 0 ? contextPlayers : ['玩家1', '玩家2']
  const currentPlayer = players[(round - 1) % players.length]

  const startRound = useCallback(() => {
    const emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)]
    const shuffledOptions = [...emotion.options].sort(() => Math.random() - 0.5)
    setCurrentEmotion({ ...emotion, options: shuffledOptions })
    setSelected(null)
    setPhase('playing')
    play('click')
  }, [play])

  const selectAnswer = (answer: string) => {
    if (!currentEmotion) return
    setSelected(answer)
    if (answer === currentEmotion.name) {
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
      <GameRules rules="看表情猜情緒！選錯的人喝酒！" rulesKey="emotion-read.rules" />

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
            <h2 className="text-2xl font-bold text-white">第 {round} 回合</h2>
            <p className="text-white/80">{currentPlayer} 的回合</p>
            <button
              onClick={startRound}
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl text-white font-bold text-xl transition-colors"
            >
              開始挑戰
            </button>
          </motion.div>
        )}

        {phase === 'playing' && currentEmotion && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="text-8xl">{currentEmotion.emoji}</div>
            <div className="text-white/60">這是什麼情緒？</div>
            <div className="grid grid-cols-2 gap-4">
              {currentEmotion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => selectAnswer(option)}
                  className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold text-lg transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'result' && currentEmotion && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="text-6xl">{currentEmotion.emoji}</div>
            <div className={`text-3xl font-bold ${selected === currentEmotion.name ? 'text-green-400' : 'text-red-400'}`}>
              {selected === currentEmotion.name ? '答對了！' : '答錯了！喝一口！'}
            </div>
            <div className="text-white/60">正確答案：{currentEmotion.name}</div>
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
            <CopyResultButton text={`表情讀心 ${resultText}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
