'use client'
import { useState, useCallback } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/contexts/I18nContext'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const ITEMS = [
  { name: '酒量', emoji: '🍺' },
  { name: '舞技', emoji: '💃' },
  { name: '唱歌', emoji: '🎤' },
  { name: '撩人', emoji: '😘' },
  { name: '搞笑', emoji: '🤡' },
  { name: '酒品', emoji: '🍷' },
  { name: '廚藝', emoji: '👨‍🍳' },
  { name: '口才', emoji: '🗣️' },
  { name: '運動', emoji: '🏃' },
  { name: '顏值', emoji: '😎' },
]

export default function Bluffing() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [currentItem, setCurrentItem] = useState<typeof ITEMS[0] | null>(null)
  const [claimScore, setClaimScore] = useState(0)
  const [phase, setPhase] = useState<'waiting' | 'claiming' | 'voting'>('waiting')
  const [votes, setVotes] = useState<{ believe: number; doubt: number }>({ believe: 0, doubt: 0 })

  const players = contextPlayers.length > 0 ? contextPlayers : ['玩家1', '玩家2']
  const currentPlayer = players[(round - 1) % players.length]

  const startRound = useCallback(() => {
    const item = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    setCurrentItem(item)
    setClaimScore(0)
    setVotes({ believe: 0, doubt: 0 })
    setPhase('claiming')
    play('click')
  }, [play])

  const submitClaim = () => {
    setPhase('voting')
  }

  const vote = (believe: boolean) => {
    if (believe) setVotes(v => ({ ...v, believe: v.believe + 1 }))
    else setVotes(v => ({ ...v, doubt: v.doubt + 1 }))
  }

  const confirmVotes = () => {
    // 如果多數人相信，吹牛者得分；如果多數人質疑，吹牛者喝酒
    if (votes.believe >= votes.doubt) {
      setScores(s => ({ ...s, [currentPlayer]: (s[currentPlayer] || 0) + claimScore }))
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
      <GameRules rules="吹噓自己的能力！其他人投票是否相信！被拆穿就喝酒！" rulesKey="bluffing.rules" />

      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <m.div key="waiting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }} className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-white">{t('common.turnLabel', { n: round })}</h2>
            <p className="text-white/80">{currentPlayer} 的回合</p>
            <div className="text-white">{players.map(p => <span key={p} className="mx-2">{p}: {scores[p] || 0}分</span>)}</div>
            <button onClick={startRound} className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl text-white font-bold text-xl transition-colors">開始吹牛</button>
            {round > 1 && <button onClick={resetGame} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">重新開始</button>}
          </m.div>
        )}

        {phase === 'claiming' && currentItem && (
          <m.div key="claiming" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }} className="flex flex-col items-center gap-6">
            <div className="text-white/60">{currentPlayer} 請吹噓你的：</div>
            <div className="text-6xl">{currentItem.emoji}</div>
            <div className="text-3xl text-white font-bold">{currentItem.name}</div>
            <div className="text-white/60">你的{currentItem.name}有幾分？（1-10）</div>
            <div className="flex gap-2 flex-wrap justify-center">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} onClick={() => setClaimScore(n)} className={`w-12 h-12 rounded-xl font-bold text-xl transition-colors ${claimScore === n ? 'bg-accent-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>{n}</button>
              ))}
            </div>
            <button onClick={submitClaim} disabled={claimScore === 0} className="px-8 py-4 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 rounded-2xl text-white font-bold text-xl transition-colors mt-4">確認分數</button>
          </m.div>
        )}

        {phase === 'voting' && currentItem && (
          <m.div key="voting" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }} className="flex flex-col items-center gap-6">
            <div className="text-2xl text-white font-bold">{currentPlayer} 說他的{currentItem.name}有 {claimScore} 分</div>
            <div className="text-white/60">你們相信嗎？</div>
            <div className="flex gap-6">
              <button onClick={() => vote(true)} className="flex flex-col items-center gap-2 px-8 py-6 bg-green-500/20 hover:bg-green-500/40 border-2 border-green-500 rounded-2xl transition-colors">
                <span className="text-4xl">👍</span>
                <span className="text-green-400 font-bold">相信</span>
                <span className="text-white text-2xl">{votes.believe}</span>
              </button>
              <button onClick={() => vote(false)} className="flex flex-col items-center gap-2 px-8 py-6 bg-red-500/20 hover:bg-red-500/40 border-2 border-red-500 rounded-2xl transition-colors">
                <span className="text-4xl">🤔</span>
                <span className="text-red-400 font-bold">質疑</span>
                <span className="text-white text-2xl">{votes.doubt}</span>
              </button>
            </div>
            <button onClick={confirmVotes} className="px-8 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-bold transition-colors mt-4">確認結果</button>
            <CopyResultButton text={`吹功大法 ${resultText}`} />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
