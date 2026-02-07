'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from '../GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from '../GameRules'
import CopyResultButton from '../CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4', '玩家 5', '玩家 6']
type Role = 'wolf' | 'villager' | 'seer'

/** 狼人殺簡化版：4-8 人，狼人 / 村民 / 預言家。夜晚狼刀、預言家查人；白天投票出局。 */
export default function WerewolfLite() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 4 && contextPlayers.length <= 8 ? contextPlayers : DEFAULT_PLAYERS.slice(0, 6)
  const [phase, setPhase] = useState<'idle' | 'night' | 'day' | 'vote' | 'result'>('idle')
  const [roles, setRoles] = useState<Record<number, Role>>({})
  const [alive, setAlive] = useState<Set<number>>(new Set())
  const [nightTarget, setNightTarget] = useState<number | null>(null)
  const [voteTarget, setVoteTarget] = useState<number | null>(null)
  const [round, setRound] = useState(0)

  const n = players.length
  const wolfCount = n <= 5 ? 1 : 2
  const hasSeer = n >= 6

  const assignRoles = useCallback(() => {
    play('click')
    const indices = Array.from({ length: n }, (_, i) => i)
    for (let k = indices.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [indices[k], indices[j]] = [indices[j], indices[k]]
    }
    const r: Record<number, Role> = {}
    for (let i = 0; i < wolfCount; i++) r[indices[i]] = 'wolf'
    if (hasSeer) r[indices[wolfCount]] = 'seer'
    for (let i = wolfCount + (hasSeer ? 1 : 0); i < n; i++) r[indices[i]] = 'villager'
    setRoles(r)
    setAlive(new Set(indices))
    setNightTarget(null)
    setVoteTarget(null)
    setRound(1)
    setPhase('night')
  }, [n, wolfCount, hasSeer, play])

  const killAtNight = useCallback((target: number) => {
    play('wrong')
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
    setNightTarget(target)
    setPhase('day')
    setAlive((prev) => {
      const next = new Set(prev)
      next.delete(target)
      return next
    })
  }, [play])
  const startVote = useCallback(() => { play('click'); setPhase('vote') }, [play])
  const castVoteOut = useCallback((target: number) => {
    play('wrong')
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
    setVoteTarget(target)
    setAlive((prev) => {
      const next = new Set(prev)
      next.delete(target)
      return next
    })
    setPhase('result')
  }, [play])
  const nextRound = useCallback(() => {
    const wolvesLeft = alive.size > 0 && Array.from(alive).some((i) => roles[i] === 'wolf')
    const villagersWin = !wolvesLeft
    if (villagersWin || alive.size <= 2) {
      setPhase('idle')
      return
    }
    setRound((r) => r + 1)
    setNightTarget(null)
    setVoteTarget(null)
    setPhase('night')
  }, [alive, roles])
  const reset = useCallback(() => setPhase('idle'), [])

  const aliveList = useMemo(() => Array.from(alive), [alive])
  const wolvesAlive = aliveList.filter((i) => roles[i] === 'wolf').length
  const gameOver = aliveList.length <= 2 || wolvesAlive === 0
  const villagersWin = wolvesAlive === 0

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="狼人殺簡化版">
      <GameRules
        rules={`4-8 人。角色：狼人（${wolfCount} 人）、預言家（1 人，6 人以上才有）、其餘村民。\n夜晚：狼人刀一人出局。\n白天：討論後投票，得票最高者出局。\n狼人全出局則村民勝；村民≤狼人則狼人勝。`}
      />
      <p className="text-white/50 text-sm mb-2 text-center">狼人殺簡化版</p>

      {phase === 'idle' && (
        <motion.button
          type="button"
          className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold games-focus-ring"
          onClick={assignRoles}
          whileTap={{ scale: 0.98 }}
        >
          分配角色並開始
        </motion.button>
      )}

      {phase === 'night' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <p className="text-white/70 mb-2">第 {round} 晚 — 狼人請睜眼，選擇要刀的對象</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {aliveList.filter((i) => roles[i] !== 'wolf').map((i) => (
              <button
                key={i}
                type="button"
                className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/30 text-white text-sm games-focus-ring"
                onClick={() => killAtNight(i)}
              >
                {players[i]}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {phase === 'day' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          {nightTarget != null && (
            <p className="text-red-400 font-bold mb-2">昨晚出局：{players[nightTarget]}（請喝一杯）</p>
          )}
          <p className="text-white/70 mb-4">白天討論後投票</p>
          <button
            type="button"
            className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
            onClick={startVote}
          >
            開始投票
          </button>
        </motion.div>
      )}

      {phase === 'vote' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <p className="text-white/70 mb-4">投票選出要出局的人</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {aliveList.map((i) => (
              <button
                key={i}
                type="button"
                className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm games-focus-ring"
                onClick={() => castVoteOut(i)}
              >
                {players[i]}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {phase === 'result' && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            {voteTarget != null && (
              <p className="text-white/80 mb-2">投票出局：<span className="font-bold">{players[voteTarget]}</span>（{roles[voteTarget] === 'wolf' ? '狼人' : '村民'}，請喝）</p>
            )}
            {voteTarget != null && (
              <CopyResultButton
                text={`狼人殺簡化版：投票出局 ${players[voteTarget]}（${roles[voteTarget] === 'wolf' ? '狼人' : '村民'}）${gameOver ? (villagersWin ? '，村民勝' : '，狼人勝') : '，下一夜'}`}
                className="mb-4 games-focus-ring"
              />
            )}
            {gameOver ? (
              <>
                <p className="text-lg font-bold mb-4">{villagersWin ? '村民勝！' : '狼人勝！'}</p>
                <button
                  type="button"
                  className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
                  onClick={reset}
                >
                  再來一局
                </button>
              </>
            ) : (
              <button
                type="button"
                className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
                onClick={nextRound}
              >
                下一夜
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
