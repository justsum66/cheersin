'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from '../GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from '../GameRules'
import CopyResultButton from '../CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4', '玩家 5']
/** 詞組：平民詞 / 臥底詞（臥底拿到不同的詞） */
const WORD_PAIRS: [string, string][] = [
  ['香蕉', '蘋果'],
  ['牛奶', '豆漿'],
  ['老師', '學生'],
  ['警察', '小偷'],
  ['西瓜', '冬瓜'],
  ['包子', '餃子'],
  ['鳳梨', '菠蘿'],
  ['玫瑰', '月季'],
  ['蝴蝶', '蜜蜂'],
  ['可樂', '雪碧'],
]

/** 誰是臥底：分配詞語、輪流描述、投票、揭曉。平民找出臥底或臥底存活則臥底贏。 */
export default function WhoIsUndercover() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 3 ? contextPlayers : DEFAULT_PLAYERS
  const [phase, setPhase] = useState<'idle' | 'assign' | 'describe' | 'vote' | 'reveal'>('idle')
  const [words, setWords] = useState<Record<number, string>>({})
  const [undercoverIndex, setUndercoverIndex] = useState<number | null>(null)
  const [currentSpeaker, setCurrentSpeaker] = useState(0)
  const [votes, setVotes] = useState<Record<number, number>>({})
  const [roundWordPair, setRoundWordPair] = useState<[string, string] | null>(null)

  const startGame = useCallback(() => {
    play('click')
    const pair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)]
    const undercover = Math.floor(Math.random() * players.length)
    const assign: Record<number, string> = {}
    for (let i = 0; i < players.length; i++) {
      assign[i] = i === undercover ? pair[1] : pair[0]
    }
    setRoundWordPair(pair)
    setWords(assign)
    setUndercoverIndex(undercover)
    setVotes({})
    setCurrentSpeaker(0)
    setPhase('assign')
  }, [players.length, play])

  const goDescribe = useCallback(() => { play('click'); setPhase('describe') }, [play])
  const nextSpeaker = useCallback(() => {
    setCurrentSpeaker((i) => (i + 1) % players.length)
  }, [players.length])
  const goVote = useCallback(() => {
    setVotes({})
    setPhase('vote')
  }, [])
  const castVote = useCallback((targetIndex: number) => {
    play('click')
    setVotes((prev) => ({ ...prev, [currentSpeaker]: targetIndex }))
    setCurrentSpeaker((i) => {
      const next = i + 1
      return next >= players.length ? 0 : next
    })
  }, [currentSpeaker, players.length, play])
  const finishVoting = useCallback(() => {
    const voteCount: Record<number, number> = {}
    Object.values(votes).forEach((target) => {
      voteCount[target] = (voteCount[target] ?? 0) + 1
    })
    const maxVotes = Math.max(...Object.values(voteCount), 0)
    const outIndex = Object.entries(voteCount).find(([, n]) => n === maxVotes)?.[0]
    play('win')
    if (outIndex != null && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
    setPhase('reveal')
    if (outIndex != null) setCurrentSpeaker(Number(outIndex))
  }, [votes, play])
  const reveal = useCallback(() => {
    setPhase('idle')
  }, [])

  const voteCounts = useMemo(() => {
    const c: Record<number, number> = {}
    Object.values(votes).forEach((t) => { c[t] = (c[t] ?? 0) + 1 })
    return c
  }, [votes])
  const allVoted = Object.keys(votes).length >= players.length
  const outIsUndercover = phase === 'reveal' && undercoverIndex !== null && currentSpeaker === undercoverIndex

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="誰是臥底">
      <GameRules
        rules={`1. 系統隨機分配詞語，臥底拿到與其他人不同的詞。\n2. 每人輪流用一句話描述自己的詞（不直接說出）。\n3. 描述後投票選出「最像臥底」的人，得票最高者出局。\n4. 若出局者是臥底則平民勝；否則繼續下一輪或臥底勝。`}
      />
      <p className="text-white/50 text-sm mb-2 text-center">誰是臥底</p>

      {phase === 'idle' && (
        <motion.button
          type="button"
          className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold games-focus-ring"
          onClick={startGame}
          whileTap={{ scale: 0.98 }}
        >
          開始遊戲
        </motion.button>
      )}

      {phase === 'assign' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <p className="text-white/70 mb-4">詞語已分配，請記住自己的詞，不要讓別人看到。</p>
          <button
            type="button"
            className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold games-focus-ring"
            onClick={goDescribe}
          >
            開始描述
          </button>
        </motion.div>
      )}

      {phase === 'describe' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <p className="text-white/70 mb-2">輪到 <span className="font-bold text-primary-300">{players[currentSpeaker]}</span> 描述自己的詞（一句話，不直接說出詞）</p>
          <div className="flex gap-2 justify-center flex-wrap mt-4">
            <button
              type="button"
              className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 text-white text-sm games-focus-ring"
              onClick={nextSpeaker}
            >
              下一位
            </button>
            <button
              type="button"
              className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-secondary-500 text-white text-sm games-focus-ring"
              onClick={goVote}
            >
              開始投票
            </button>
          </div>
        </motion.div>
      )}

      {phase === 'vote' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <p className="text-white/70 mb-2">輪到 <span className="font-bold text-primary-300">{players[currentSpeaker]}</span> 投票（選出你認為的臥底）</p>
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {players.map((name, i) => (
              <button
                key={i}
                type="button"
                className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm games-focus-ring"
                onClick={() => castVote(i)}
              >
                {name}
              </button>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-2">已投票：{Object.keys(votes).length} / {players.length}</p>
          {allVoted && (
            <button
              type="button"
              className="mt-4 min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
              onClick={finishVoting}
            >
              揭曉
            </button>
          )}
        </motion.div>
      )}

      {phase === 'reveal' && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <p className="text-white/70 mb-1">本輪出局：<span className="font-bold">{players[currentSpeaker]}</span></p>
            <p className="text-lg font-bold mb-4">
              {outIsUndercover ? (
                <span className="text-green-400">是臥底！平民勝！</span>
              ) : (
                <span className="text-red-400">不是臥底，出局者喝！</span>
              )}
            </p>
            {roundWordPair && (
              <p className="text-white/50 text-sm mb-4">本輪詞語：平民「{roundWordPair[0]}」／臥底「{roundWordPair[1]}」</p>
            )}
            <CopyResultButton
              text={`誰是臥底：本輪出局 ${players[currentSpeaker]}，${outIsUndercover ? '是臥底，平民勝' : '不是臥底，出局者喝'}`}
              className="mb-4 games-focus-ring"
            />
            <button
              type="button"
              className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
              onClick={reveal}
            >
              再來一局
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
