'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from '../GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useTranslation } from '@/contexts/I18nContext'
import GameRules from '../GameRules'
import CopyResultButton from '../CopyResultButton'

/** WW-21：角色型別集中 */
export type WerewolfRole = 'wolf' | 'villager' | 'seer'

/** 預設玩家名稱；WW-25 可選 i18n */
function getDefaultPlayers(t: (key: string) => string): string[] {
  return Array.from({ length: 6 }, (_, i) => t('werewolf.defaultPlayer').replace('{{n}}', String(i + 1)))
}

/** 狼人殺簡化版：4-8 人，狼人 / 村民 / 預言家。夜晚狼刀、預言家查人；白天投票出局。WW-01～30 */
export default function WerewolfLite() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const defaultPlayers = useMemo(() => getDefaultPlayers(t), [t])
  const players = contextPlayers.length >= 4 && contextPlayers.length <= 8 ? contextPlayers : defaultPlayers.slice(0, 6)
  const [phase, setPhase] = useState<'idle' | 'night' | 'day' | 'vote' | 'result'>('idle')
  const [roles, setRoles] = useState<Record<number, WerewolfRole>>({})
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
    const r: Record<number, WerewolfRole> = {}
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

  const rulesText = t('werewolf.rules').replace('{{wolfCount}}', String(wolfCount))

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label={t('werewolf.title')}>
      <GameRules rules={rulesText} title={t('werewolf.rulesTitle')} />
      <p className="text-white/50 text-sm mb-2 text-center">{t('werewolf.title')}</p>

      {phase === 'idle' && (
        <motion.button
          type="button"
          className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold games-focus-ring games-touch-target"
          onClick={assignRoles}
          whileTap={{ scale: 0.98 }}
        >
          {t('werewolf.assignAndStart')}
        </motion.button>
      )}

      {phase === 'night' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <p className="text-white/70 mb-2">{t('werewolf.nightPrompt').replace('{{round}}', String(round))}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {aliveList.filter((i) => roles[i] !== 'wolf').map((i) => (
              <button
                key={i}
                type="button"
                className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/30 text-white text-sm games-focus-ring games-touch-target"
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
            <p className="text-red-400 font-bold mb-2">{t('werewolf.nightVictim').replace('{{name}}', players[nightTarget])}</p>
          )}
          <p className="text-white/70 mb-4">{t('werewolf.dayDiscuss')}</p>
          <button
            type="button"
            className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring games-touch-target"
            onClick={startVote}
          >
            {t('werewolf.startVote')}
          </button>
        </motion.div>
      )}

      {phase === 'vote' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <p className="text-white/70 mb-4">{t('werewolf.votePrompt')}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {aliveList.map((i) => (
              <button
                key={i}
                type="button"
                className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm games-focus-ring games-touch-target"
                onClick={() => castVoteOut(i)}
              >
                {players[i]}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {phase === 'result' && voteTarget != null && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <p className="text-white/80 mb-2">
              {t('werewolf.voteResult')
                .replace('{{name}}', players[voteTarget])
                .replace('{{role}}', roles[voteTarget] === 'wolf' ? t('werewolf.roleWolf') : t('werewolf.roleVillager'))}
            </p>
            <CopyResultButton
              text={t('werewolf.copyTemplate')
                .replace('{{name}}', players[voteTarget])
                .replace('{{role}}', roles[voteTarget] === 'wolf' ? t('werewolf.roleWolf') : t('werewolf.roleVillager'))
                .replace('{{suffix}}', gameOver ? (villagersWin ? t('werewolf.copySuffixVillagersWin') : t('werewolf.copySuffixWolvesWin')) : t('werewolf.copySuffixNext'))}
              label={t('games.copyResult')}
              className="mb-4 games-focus-ring"
            />
            {gameOver ? (
              <>
                <p className="text-lg font-bold mb-4">{villagersWin ? t('werewolf.villagersWin') : t('werewolf.wolvesWin')}</p>
                <motion.button
                  type="button"
                  className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring games-touch-target"
                  onClick={reset}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('werewolf.playAgain')}
                </motion.button>
              </>
            ) : (
              <motion.button
                type="button"
                className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring games-touch-target"
                onClick={nextRound}
                whileTap={{ scale: 0.98 }}
              >
                {t('werewolf.nextNight')}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
