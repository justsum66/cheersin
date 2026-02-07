'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const TWISTERS = [
  { text: '紅鯉魚與綠鯉魚與驢', difficulty: 'easy' },
  { text: '四是四，十是十，十四是十四，四十是四十', difficulty: 'medium' },
  { text: '吃葡萄不吐葡萄皮，不吃葡萄倒吐葡萄皮', difficulty: 'easy' },
  { text: '黑化肥會揮發，灰化肥會發黑', difficulty: 'medium' },
  { text: '八百標兵奔北坡，北坡炮兵並排跑', difficulty: 'hard' },
  { text: '牛郎戀劉娘，劉娘念牛郎', difficulty: 'easy' },
  { text: '石室詩士施氏，嗜獅，誓食十獅', difficulty: 'hard' },
  { text: '化肥會揮發黑灰會發黑揮發', difficulty: 'hard' },
  { text: '粉紅牆上畫鳳凰，鳳凰畫在粉紅牆', difficulty: 'medium' },
  { text: '扁擔長，板凳寬，扁擔要綁在板凳上', difficulty: 'medium' },
]

const DIFFICULTY_COLORS = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-red-500',
}

const DIFFICULTY_LABELS = {
  easy: '簡單',
  medium: '中等',
  hard: '困難',
}

export default function TongueChallenge() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [currentTwister, setCurrentTwister] = useState<typeof TWISTERS[0] | null>(null)
  const [phase, setPhase] = useState<'waiting' | 'challenge' | 'voting'>('waiting')
  const [votes, setVotes] = useState<{ success: number; fail: number }>({ success: 0, fail: 0 })

  const players = contextPlayers.length > 0 ? contextPlayers : ['玩家1', '玩家2']
  const currentPlayer = players[(round - 1) % players.length]

  const startRound = useCallback(() => {
    const twister = TWISTERS[Math.floor(Math.random() * TWISTERS.length)]
    setCurrentTwister(twister)
    setPhase('challenge')
    setVotes({ success: 0, fail: 0 })
    play('click')
  }, [play])

  const finishChallenge = () => {
    setPhase('voting')
  }

  const vote = (success: boolean) => {
    if (success) {
      setVotes(v => ({ ...v, success: v.success + 1 }))
    } else {
      setVotes(v => ({ ...v, fail: v.fail + 1 }))
    }
  }

  const confirmVotes = () => {
    if (votes.success > votes.fail) {
      setScores(s => ({ ...s, [currentPlayer]: (s[currentPlayer] || 0) + 1 }))
      play('correct')
    } else {
      play('wrong')
    }
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
      <GameRules rules="唸出繞口令！其他玩家投票判定成功或失敗！失敗喝酒！" rulesKey="tongue-challenge.rules" />

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
            <div className="text-white mt-4">
              {players.map(p => (
                <span key={p} className="mx-2">{p}: {scores[p] || 0}分</span>
              ))}
            </div>
            <button
              onClick={startRound}
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl text-white font-bold text-xl transition-colors"
            >
              開始挑戰
            </button>
            {round > 1 && (
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              >
                重新開始
              </button>
            )}
          </motion.div>
        )}

        {phase === 'challenge' && currentTwister && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="text-white/60">{currentPlayer} 請唸出：</div>
            <div className={`px-3 py-1 rounded-full text-white text-sm ${DIFFICULTY_COLORS[currentTwister.difficulty as keyof typeof DIFFICULTY_COLORS]}`}>
              {DIFFICULTY_LABELS[currentTwister.difficulty as keyof typeof DIFFICULTY_LABELS]}
            </div>
            <div className="text-3xl text-white font-bold text-center max-w-md leading-relaxed">
              {currentTwister.text}
            </div>
            <button
              onClick={finishChallenge}
              className="px-8 py-4 bg-accent-500 hover:bg-accent-600 rounded-2xl text-white font-bold text-xl transition-colors mt-4"
            >
              我唸完了！
            </button>
          </motion.div>
        )}

        {phase === 'voting' && (
          <motion.div
            key="voting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="text-2xl text-white font-bold">{currentPlayer} 唸得如何？</div>
            <div className="text-white/60">其他玩家投票！</div>
            <div className="flex gap-6">
              <button
                onClick={() => vote(true)}
                className="flex flex-col items-center gap-2 px-8 py-6 bg-green-500/20 hover:bg-green-500/40 border-2 border-green-500 rounded-2xl transition-colors"
              >
                <span className="text-4xl">✅</span>
                <span className="text-green-400 font-bold">成功</span>
                <span className="text-white text-2xl">{votes.success}</span>
              </button>
              <button
                onClick={() => vote(false)}
                className="flex flex-col items-center gap-2 px-8 py-6 bg-red-500/20 hover:bg-red-500/40 border-2 border-red-500 rounded-2xl transition-colors"
              >
                <span className="text-4xl">❌</span>
                <span className="text-red-400 font-bold">失敗</span>
                <span className="text-white text-2xl">{votes.fail}</span>
              </button>
            </div>
            <button
              onClick={confirmVotes}
              className="px-8 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-bold transition-colors mt-4"
            >
              確認結果
            </button>
            <CopyResultButton text={`口技挑戰 ${resultText}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
