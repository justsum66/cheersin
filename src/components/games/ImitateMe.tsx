'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/contexts/I18nContext'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const IMITATIONS = [
  { emoji: '🐱', name: '貓咪', action: '學貓叫' },
  { emoji: '🐶', name: '狗狗', action: '學狗叫' },
  { emoji: '🐸', name: '青蛙', action: '學青蛙叫' },
  { emoji: '🦁', name: '獅子', action: '學獅子吼' },
  { emoji: '🐷', name: '豬', action: '學豬叫' },
  { emoji: '👶', name: '嬰兒', action: '學嬰兒哭' },
  { emoji: '🧙', name: '巫師', action: '唸咒語' },
  { emoji: '🤖', name: '機器人', action: '學機器人說話' },
  { emoji: '😱', name: '尖叫', action: '假裝驚嚇尖叫' },
  { emoji: '💃', name: '跳舞', action: '跳一段舞' },
  { emoji: '🎤', name: '歌手', action: '唱一段歌' },
  { emoji: '🤡', name: '小丑', action: '做鬼臉' },
]

export default function ImitateMe() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [current, setCurrent] = useState<typeof IMITATIONS[0] | null>(null)
  const [phase, setPhase] = useState<'waiting' | 'perform' | 'voting'>('waiting')
  const [votes, setVotes] = useState<{ good: number; bad: number }>({ good: 0, bad: 0 })

  const players = contextPlayers.length > 0 ? contextPlayers : ['玩家1', '玩家2']
  const currentPlayer = players[(round - 1) % players.length]

  const startRound = useCallback(() => {
    const item = IMITATIONS[Math.floor(Math.random() * IMITATIONS.length)]
    setCurrent(item)
    setPhase('perform')
    setVotes({ good: 0, bad: 0 })
    play('click')
  }, [play])

  const finishPerform = () => setPhase('voting')

  const vote = (good: boolean) => {
    if (good) setVotes(v => ({ ...v, good: v.good + 1 }))
    else setVotes(v => ({ ...v, bad: v.bad + 1 }))
  }

  const confirmVotes = () => {
    if (votes.good >= votes.bad) {
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
      <GameRules rules="模仿指定對象！其他玩家投票評分！不及格喝酒！" rulesKey="imitate-me.rules" />

      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <motion.div key="waiting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }} className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-white">{t('common.turnLabel', { n: round })}</h2>
            <p className="text-white/80">{currentPlayer} 的回合</p>
            <div className="text-white">{players.map(p => <span key={p} className="mx-2">{p}: {scores[p] || 0}分</span>)}</div>
            <button onClick={startRound} className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl text-white font-bold text-xl transition-colors">開始模仿</button>
            {round > 1 && <button onClick={resetGame} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">重新開始</button>}
          </motion.div>
        )}

        {phase === 'perform' && current && (
          <motion.div key="perform" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }} className="flex flex-col items-center gap-6">
            <div className="text-white/60">{currentPlayer} 請模仿：</div>
            <div className="text-8xl">{current.emoji}</div>
            <div className="text-3xl text-white font-bold">{current.action}</div>
            <button onClick={finishPerform} className="px-8 py-4 bg-accent-500 hover:bg-accent-600 rounded-2xl text-white font-bold text-xl transition-colors mt-4">我表演完了！</button>
          </motion.div>
        )}

        {phase === 'voting' && (
          <motion.div key="voting" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }} className="flex flex-col items-center gap-6">
            <div className="text-2xl text-white font-bold">{currentPlayer} 表演得如何？</div>
            <div className="flex gap-6">
              <button onClick={() => vote(true)} className="flex flex-col items-center gap-2 px-8 py-6 bg-green-500/20 hover:bg-green-500/40 border-2 border-green-500 rounded-2xl transition-colors">
                <span className="text-4xl">👍</span>
                <span className="text-green-400 font-bold">讚</span>
                <span className="text-white text-2xl">{votes.good}</span>
              </button>
              <button onClick={() => vote(false)} className="flex flex-col items-center gap-2 px-8 py-6 bg-red-500/20 hover:bg-red-500/40 border-2 border-red-500 rounded-2xl transition-colors">
                <span className="text-4xl">👎</span>
                <span className="text-red-400 font-bold">差</span>
                <span className="text-white text-2xl">{votes.bad}</span>
              </button>
            </div>
            <button onClick={confirmVotes} className="px-8 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-bold transition-colors mt-4">確認結果</button>
            <CopyResultButton text={`模仿我 ${resultText}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
